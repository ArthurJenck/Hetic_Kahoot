// ============================================================
// CreateQuiz - Formulaire de creation d'un quiz
// A IMPLEMENTER : construire le formulaire dynamique
// ============================================================

import { useState } from 'react'
import type { QuizQuestion } from '@shared/index'

interface CreateQuizProps {
  /** Callback appele quand le formulaire est soumis */
  onSubmit: (title: string, questions: QuizQuestion[]) => void
}

/**
 * Composant formulaire pour creer un nouveau quiz.
 *
 * Ce qu'il faut implementer :
 * - Un champ pour le titre du quiz
 * - Une liste dynamique de questions (pouvoir en ajouter/supprimer)
 * - Pour chaque question :
 *   - Un champ texte pour la question
 *   - 4 champs texte pour les choix de reponse
 *   - Un selecteur (radio) pour la bonne reponse (correctIndex)
 *   - Un champ pour la duree du timer en secondes
 * - Un bouton pour ajouter une question
 * - Un bouton pour soumettre le formulaire
 *
 * Astuce : utilisez un state pour stocker un tableau de questions
 * et generez un id unique pour chaque question (ex: crypto.randomUUID())
 *
 * Classes CSS disponibles : .create-form, .form-group, .question-card,
 * .question-card-header, .choices-inputs, .choice-input-group,
 * .btn-add-question, .btn-remove, .btn-primary
 */
function CreateQuiz({ onSubmit }: CreateQuizProps) {
  // TODO: State pour le titre
  // TODO: State pour la liste des questions

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Valider que le titre n'est pas vide
    // TODO: Valider qu'il y a au moins 1 question
    // TODO: Valider que chaque question a un texte et 4 choix non-vides
    // TODO: Appeler onSubmit(title, questions)
  }

  return (
    <div className="phase-container">
      <h1>Creer un Quiz</h1>
      <form className="create-form" onSubmit={handleSubmit}>
        {/* TODO: Champ titre */}
        {/* TODO: Liste des questions avec .question-card */}
        {/* TODO: Bouton ajouter une question */}
        {/* TODO: Bouton soumettre */}
      </form>
    </div>
  )
}

export default CreateQuiz
