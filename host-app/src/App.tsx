// ============================================================
// Host App - Composant principal
// A IMPLEMENTER : gestion des messages et routage par phase
// ============================================================

import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import type { QuizPhase, QuizQuestion, ServerMessage } from '@shared/index'
import CreateQuiz from './components/CreateQuiz'
import Lobby from './components/Lobby'
import QuestionView from './components/QuestionView'
import Results from './components/Results'
import Leaderboard from './components/Leaderboard'

const WS_URL = 'ws://localhost:3001'

function App() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL)

  // --- Etats de l'application ---
  const [phase, setPhase] = useState<QuizPhase | 'create'>('create')
  const [quizCode, setQuizCode] = useState('')
  const [players, setPlayers] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Omit<QuizQuestion, 'correctIndex'> | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionTotal, setQuestionTotal] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [answerCount, setAnswerCount] = useState(0)
  const [correctIndex, setCorrectIndex] = useState(-1)
  const [distribution, setDistribution] = useState<number[]>([])
  const [rankings, setRankings] = useState<{ name: string; score: number }[]>([])

  // --- Traitement des messages du serveur ---
  useEffect(() => {
    if (!lastMessage) return

    // TODO: Traiter chaque type de message du serveur
    // Utiliser un switch sur lastMessage.type

    switch (lastMessage.type) {
      case 'sync': {
        // TODO: Quand le serveur envoie un sync (apres host:create),
        // extraire le quizCode de lastMessage.data et mettre a jour l'etat
        // Changer la phase vers lastMessage.phase
        break
      }

      case 'joined': {
        // TODO: Mettre a jour la liste des joueurs avec lastMessage.players
        break
      }

      case 'question': {
        // TODO: Mettre a jour currentQuestion, questionIndex, questionTotal
        // TODO: Initialiser remaining avec la duree du timer de la question
        // TODO: Reinitialiser answerCount a 0
        // TODO: Changer la phase en 'question'
        break
      }

      case 'tick': {
        // TODO: Mettre a jour remaining avec lastMessage.remaining
        break
      }

      case 'results': {
        // TODO: Mettre a jour correctIndex, distribution
        // TODO: Calculer answerCount (somme de distribution)
        // TODO: Changer la phase en 'results'
        break
      }

      case 'leaderboard': {
        // TODO: Mettre a jour rankings avec lastMessage.rankings
        // TODO: Changer la phase en 'leaderboard'
        break
      }

      case 'ended': {
        // TODO: Changer la phase en 'ended'
        break
      }

      case 'error': {
        // TODO: Afficher l'erreur (console.error ou alert)
        break
      }
    }
  }, [lastMessage])

  // --- Handlers ---

  /** Appele quand le host soumet le formulaire de creation */
  const handleCreateQuiz = (title: string, questions: QuizQuestion[]) => {
    // TODO: Envoyer un message 'host:create' au serveur avec sendMessage
  }

  /** Appele quand le host clique sur "Demarrer" dans le lobby */
  const handleStart = () => {
    // TODO: Envoyer un message 'host:start' au serveur
  }

  /** Appele quand le host clique sur "Question suivante" */
  const handleNext = () => {
    // TODO: Envoyer un message 'host:next' au serveur
  }

  // --- Rendu par phase ---
  const renderPhase = () => {
    switch (phase) {
      case 'create':
        return <CreateQuiz onSubmit={handleCreateQuiz} />

      case 'lobby':
        return (
          <Lobby
            quizCode={quizCode}
            players={players}
            onStart={handleStart}
          />
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
          {status === 'connected' ? 'Connecte' : status === 'connecting' ? 'Connexion...' : 'Deconnecte'}
        </span>
      </header>
      <main className="app-main">
        {renderPhase()}
      </main>
    </div>
  )
}

export default App
