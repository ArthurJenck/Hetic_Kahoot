// ============================================================
// FeedbackScreen - Retour correct/incorrect
// A IMPLEMENTER : icone et score
// ============================================================

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
 * - Un conteneur avec la classe .feedback et .correct ou .incorrect selon le resultat
 * - Une icone grande (classe .feedback-icon)
 *   Le CSS ajoute automatiquement un check ou un X via ::after
 * - Un texte "Bonne reponse !" ou "Mauvaise reponse" (classe .feedback-text)
 * - Le score total du joueur (classe .feedback-score) : "Score : 1500 pts"
 *
 * Classes CSS disponibles : .feedback-container, .feedback, .correct, .incorrect,
 * .feedback-icon, .feedback-text, .feedback-score
 */
function FeedbackScreen({ correct, score }: FeedbackScreenProps) {
  return (
    <div className="phase-container feedback-container">
      {/* TODO: Conteneur .feedback avec .correct ou .incorrect */}
      {/* TODO: Icone .feedback-icon */}
      {/* TODO: Texte "Bonne reponse !" ou "Mauvaise reponse" */}
      {/* TODO: Score "Score : {score} pts" */}
    </div>
  )
}

export default FeedbackScreen
