// ============================================================
// AnswerScreen - Boutons de reponse colores
// A IMPLEMENTER : question, timer, 4 boutons colores
// ============================================================

import { useState } from 'react'
import type { QuizQuestion } from '@shared/index'
import { cn } from '@sglara/cn'

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
 * - Le temps restant (classe .answer-timer) V
 *   Ajouter la classe .warning si remaining <= 10, .danger si remaining <= 3 V
 * - Le texte de la question (classe .answer-question) V
 * - 4 boutons colores dans une grille (classes .answer-grid, .answer-btn) V
 *   Les couleurs sont gerees automatiquement par :nth-child dans le CSS V
 * - Tous les boutons sont desactives (disabled) si hasAnswered est true V
 * - Optionnel : ajouter la classe .selected au bouton choisi V
 * - Si le joueur a repondu, afficher "Reponse envoyee !" (classe .answered-message) V
 *
 * Classes CSS disponibles : .answer-screen, .answer-timer, .warning, .danger,
 * .answer-question, .answer-grid, .answer-btn, .selected, .answered-message
 */
function AnswerScreen({
  question,
  remaining,
  onAnswer,
  hasAnswered,
}: AnswerScreenProps) {
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined)

  const handleClick = (index: number) => {
    if (hasAnswered) return

    onAnswer(index)
    setSelectedId(index)
  }

  return (
    <div className="answer-screen">
      <div className="answer-timer-bar">
        <div
          className={cn(
            'answer-timer-fill',
            remaining <= 10 && 'warning',
            remaining <= 3 && 'danger',
          )}
          style={{ transform: `scaleX(${remaining / question.timerSec})` }}
        />
      </div>

      <p
        className={cn(
          'answer-timer',
          remaining <= 10 && 'warning',
          remaining <= 3 && 'danger',
        )}
      >
        {remaining}s
      </p>

      <h2 className="answer-question">{question.text}</h2>
      <div className="answer-grid">
        {question.choices.map((choice, i) => (
          <button
            key={`choice-${i}`}
            className={cn('answer-btn', i === selectedId && 'selected')}
            onClick={() => handleClick(i)}
            disabled={hasAnswered}
          >
            {choice}
          </button>
        ))}
      </div>

      {hasAnswered && <p className="answered-message">Réponse envoyée !</p>}
    </div>
  )
}

export default AnswerScreen
