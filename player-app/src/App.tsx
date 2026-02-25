// ============================================================
// Player App - Composant principal
// A IMPLEMENTER : gestion des messages et routage par phase
// ============================================================

import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import { usePlayerSounds } from './hooks/usePlayerSounds'
import type { QuizPhase, QuizQuestion } from '@shared/index'
import JoinScreen from './components/JoinScreen'
import WaitingLobby from './components/WaitingLobby'
import AnswerScreen from './components/AnswerScreen'
import FeedbackScreen from './components/FeedbackScreen'
import ScoreScreen from './components/ScoreScreen'

const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`

function App() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL)
  const { play, stopAll, playCountdown } = usePlayerSounds()

  // --- Etats de l'application ---
  const [phase, setPhase] = useState<QuizPhase | 'join' | 'feedback'>('join')
  const [playerName, setPlayerName] = useState('')
  const [players, setPlayers] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Omit<
    QuizQuestion,
    'correctIndex'
  > | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [lastAnswerId, setLastAnswerId] = useState<number | undefined>(
    undefined,
  )
  const [hasAnswered, setHasAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [rankings, setRankings] = useState<{ name: string; score: number }[]>(
    [],
  )
  const [error, setError] = useState<string | undefined>(undefined)

  // --- Traitement des messages du serveur ---
  useEffect(() => {
    if (!lastMessage) return

    switch (lastMessage.type) {
      case 'joined': {
        stopAll()
        play('lobby')
        setPlayers(lastMessage.players)
        setPhase('lobby')
        setError(undefined)
        break
      }

      case 'question': {
        stopAll()
        play('getReady')
        playCountdown(lastMessage.question.timerSec)
        setCurrentQuestion(lastMessage.question)
        setRemaining(lastMessage.question.timerSec)
        setHasAnswered(false)
        setPhase('question')
        break
      }

      case 'tick': {
        setRemaining(lastMessage.remaining)
        break
      }

      case 'results': {
        setLastCorrect(lastAnswerId === lastMessage.correctIndex)
        setScore(lastMessage.scores[playerName])
        setPhase('feedback')
        break
      }

      case 'leaderboard': {
        stopAll()
        play('leaderboard')
        setRankings(lastMessage.rankings)
        setPhase('leaderboard')
        break
      }

      case 'ended': {
        setPhase('ended')
        break
      }

      case 'error': {
        setError(lastMessage.message)
        break
      }
    }
  }, [lastMessage])

  // --- Handlers ---

  /** Appele quand le joueur soumet le formulaire de connexion */
  const handleJoin = (code: string, name: string) => {
    setPlayerName(name)
    sendMessage({ type: 'join', quizCode: code, name })
  }

  /** Appele quand le joueur clique sur un choix de reponse */
  const handleAnswer = (choiceIndex: number) => {
    if (hasAnswered || !currentQuestion) return

    setLastAnswerId(choiceIndex)
    setHasAnswered(true)
    sendMessage({ type: 'answer', questionId: currentQuestion.id, choiceIndex })
  }

  // --- Rendu par phase ---
  const renderPhase = () => {
    switch (phase) {
      case 'join':
        return <JoinScreen onJoin={handleJoin} error={error} />

      case 'lobby':
        return <WaitingLobby players={players} />

      case 'question':
        return currentQuestion ? (
          <AnswerScreen
            question={currentQuestion}
            remaining={remaining}
            onAnswer={handleAnswer}
            hasAnswered={hasAnswered}
          />
        ) : null

      case 'feedback':
        return <FeedbackScreen correct={lastCorrect} score={score} />

      case 'results':
        // Pendant 'results' on reste sur FeedbackScreen
        return <FeedbackScreen correct={lastCorrect} score={score} />

      case 'leaderboard':
        return <ScoreScreen rankings={rankings} playerName={playerName} />

      case 'ended':
        return (
          <div className="phase-container">
            <h1>Quiz terminé !</h1>
            <p className="ended-message">Merci d'avoir participé !</p>
            <button className="btn-primary" onClick={() => setPhase('join')}>
              Rejoindre un autre quiz
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
        <h2>Quiz Player</h2>
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
