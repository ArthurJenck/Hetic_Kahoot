// ============================================================
// AnswerScreen - Boutons de reponse colores
// A IMPLEMENTER : question, timer, 4 boutons colores
// ============================================================

import { useState } from 'react'
import type { QuizQuestion } from '@shared/index'

interface AnswerScreenProps {
  /** La question en cours (sans correctIndex) */
  question: Omit<QuizQuestion, 'correctIndex'>
  /** Temps restant en secondes */
  remaining: number
  /** Callback quand le joueur clique sur un choix */
  onAnswer: (choiceIndex: number) => void
  /** Si true, le joueur a deja repondu */
  hasAnswered: boolean
}

/**
 * Composant affichant la question et les boutons de reponse colores.
 *
 * Ce qu'il faut implementer :
 * - Le temps restant (classe .answer-timer)
 *   Ajouter la classe .warning si remaining <= 10, .danger si remaining <= 3
 * - Le texte de la question (classe .answer-question)
 * - 4 boutons colores dans une grille (classes .answer-grid, .answer-btn)
 *   Les couleurs sont gerees automatiquement par :nth-child dans le CSS
 * - Tous les boutons sont desactives (disabled) si hasAnswered est true
 * - Optionnel : ajouter la classe .selected au bouton choisi
 * - Si le joueur a repondu, afficher "Reponse envoyee !" (classe .answered-message)
 *
 * Classes CSS disponibles : .answer-screen, .answer-timer, .warning, .danger,
 * .answer-question, .answer-grid, .answer-btn, .selected, .answered-message
 */
function AnswerScreen({ question, remaining, onAnswer, hasAnswered }: AnswerScreenProps) {
  // TODO: State optionnel pour stocker l'index du choix selectionne

  const handleClick = (index: number) => {
    // TODO: Appeler onAnswer(index)
    // TODO: Optionnel : sauvegarder l'index selectionne pour le style .selected
  }

  return (
    <div className="answer-screen">
      {/* TODO: Timer avec .answer-timer (+ .warning / .danger selon remaining) */}
      {/* TODO: Texte de la question avec .answer-question */}
      {/* TODO: Grille de 4 boutons avec .answer-grid et .answer-btn */}
      {/* TODO: Message "Reponse envoyee !" si hasAnswered */}
    </div>
  )
}

export default AnswerScreen
