// ============================================================
// FeedbackScreen - Retour correct/incorrect
// A IMPLEMENTER : icone et score
// ============================================================

import { cn } from '@sglara/cn'

interface FeedbackScreenProps {
  /** Si true, le joueur a repondu correctement */
  correct: boolean
  /** Score total actuel du joueur */
  score: number
}

/**
 * Composant affichant le retour apres une question (correct ou incorrect).
 *
 * Ce qu'il faut implementer :
 * - Un conteneur avec la classe .feedback et .correct ou .incorrect selon le resultat V
 * - Une icone grande (classe .feedback-icon) V
 *   Le CSS ajoute automatiquement un check ou un X via ::after V
 * - Un texte "Bonne reponse !" ou "Mauvaise reponse" (classe .feedback-text) V
 * - Le score total du joueur (classe .feedback-score) : "Score : 1500 pts" V
 *
 * Classes CSS disponibles : .feedback-container, .feedback, .correct, .incorrect,
 * .feedback-icon, .feedback-text, .feedback-score
 */
function FeedbackScreen({ correct, score }: FeedbackScreenProps) {
  return (
    <div className="phase-container feedback-container">
      <div className={cn('feedback', correct ? 'correct' : 'incorrect')}>
        <div className="feedback-icon" />
        <h2 className="feedback-text">
          {correct ? 'Bonne réponse' : 'Mauvaise réponse...'}
        </h2>
        <p className="feedback-score">Score : {score} pts</p>
      </div>
    </div>
  )
}

export default FeedbackScreen
