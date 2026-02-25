// ============================================================
// Host App - Composant principal
// A IMPLEMENTER : gestion des messages et routage par phase
// ============================================================

import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import { useHostSounds } from './hooks/useHostSounds'
import type { QuizPhase, QuizQuestion, ServerMessage } from '@shared/index'
import CreateQuiz from './components/CreateQuiz'
import Lobby from './components/Lobby'
import QuestionView from './components/QuestionView'
import Results from './components/Results'
import Leaderboard from './components/Leaderboard'
import useQuizStore from './stores/quizStore'

const WS_URL = `ws://${window.location.hostname}:3001`

function App() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL)
  const { play, stop, stopAll, playCountdown } = useHostSounds()
  const { sessionId, setSessionId } = useQuizStore()

  // --- Etats de l'application ---
  const [phase, setPhase] = useState<QuizPhase | 'create'>('create')
  const [quizCode, setQuizCode] = useState('')
  const [players, setPlayers] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Omit<
    QuizQuestion,
    'correctIndex'
  > | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionTotal, setQuestionTotal] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [answerCount, setAnswerCount] = useState(0)
  const [correctIndex, setCorrectIndex] = useState(-1)
  const [distribution, setDistribution] = useState<number[]>([])
  const [rankings, setRankings] = useState<{ name: string; score: number }[]>(
    [],
  )

  // --- Traitement des messages du serveur ---
  useEffect(() => {
    if (!lastMessage) return

    // TODO: Traiter chaque type de message du serveur
    // Utiliser un switch sur lastMessage.type

    switch (lastMessage.type) {
      case 'sync': {
        if (lastMessage.phase === 'lobby') play('lobby')

        const data = lastMessage.data as { quizCode?: string; sessionId?: string }
        if (data.quizCode) setQuizCode(data.quizCode)
        if (data.sessionId) setSessionId(data.sessionId)
        setPhase(lastMessage.phase)
        break
      }

      case 'joined': {
        setPlayers(lastMessage.players)
        break
      }

      case 'question': {
        stopAll()
        play('getReady')
        playCountdown(lastMessage.question.timerSec)

        setCurrentQuestion(lastMessage.question)
        setQuestionIndex(lastMessage.index)
        setQuestionTotal(lastMessage.total)
        setRemaining(lastMessage.question.timerSec)
        setAnswerCount(0)
        setPhase('question')
        break
      }

      case 'tick': {
        setRemaining(lastMessage.remaining)
        break
      }

      case 'results': {
        stopAll()

        setCorrectIndex(lastMessage.correctIndex)
        setDistribution(lastMessage.distribution)
        let total = 0
        for (const count of lastMessage.distribution) {
          total = total + count
        }
        setAnswerCount(total)
        setPhase('results')
        break
      }

      case 'leaderboard': {
        play('leaderboard')

        setRankings(lastMessage.rankings)
        setPhase('leaderboard')
        break
      }

      case 'ended': {
        play('leaderboard')

        setPhase('ended')
        setSessionId('')
        break
      }

      case 'error': {
        console.error(lastMessage.message)
        break
      }
    }
  }, [lastMessage])

  // --- Reconnexion automatique si on avait une session ---
  useEffect(() => {
    if (status === 'connected' && sessionId) {
      console.log('[Host] Reconnexion avec sessionId:', sessionId)
      sendMessage({ type: 'reconnect', sessionId })
    }
  }, [status])

  // --- Handlers ---

  /** Appele quand le host soumet le formulaire de creation */
  const handleCreateQuiz = (title: string, questions: QuizQuestion[]) => {
    sendMessage({ type: 'host:create', title, questions })
  }

  /** Appele quand le host clique sur "Demarrer" dans le lobby */
  const handleStart = () => {
    sendMessage({ type: 'host:start' })
  }

  /** Appele quand le host clique sur "Question suivante" */
  const handleNext = () => {
    sendMessage({ type: 'host:next' })
  }

  // --- Rendu par phase ---
  const renderPhase = () => {
    switch (phase) {
      case 'create':
        return <CreateQuiz onSubmit={handleCreateQuiz} />

      case 'lobby':
        return (
          <Lobby quizCode={quizCode} players={players} onStart={handleStart} />
        )

      case 'question':
        return currentQuestion ? (
          <QuestionView
            question={currentQuestion}
            index={questionIndex}
            total={questionTotal}
            remaining={remaining}
            answerCount={answerCount}
            totalPlayers={players.length}
          />
        ) : null

      case 'results':
        return currentQuestion ? (
          <Results
            correctIndex={correctIndex}
            distribution={distribution}
            choices={currentQuestion.choices}
            onNext={handleNext}
          />
        ) : null

      case 'leaderboard':
        return <Leaderboard rankings={rankings} />

      case 'ended':
        return (
          <div className="phase-container">
            <h1>Quiz termine !</h1>
            <button className="btn-primary" onClick={() => setPhase('create')}>
              Creer un nouveau quiz
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h2>Quiz Host</h2>
        <span className={`status-badge status-${status}`}>
          {status === 'connected'
            ? 'Connecte'
            : status === 'connecting'
              ? 'Connexion...'
              : 'Deconnecte'}
        </span>
      </header>
      <main className="app-main">{renderPhase()}</main>
    </div>
  )
}

export default App
