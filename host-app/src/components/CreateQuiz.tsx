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
  const [title, setTitle] = useState("")
  const [questions, setQuestions] = useState([
    {
      id: crypto.randomUUID(),
      text: "",
      choices: ["", "", "", ""],
      correctIndex: 0,
      timerSec: 20,
    }
  ])

  function addQuestion() {
    const newQuestion = {
      id: crypto.randomUUID(),
      text: "",
      choices: ["", "", "", ""],
      correctIndex: 0,
      timerSec: 20,
    }
    setQuestions([...questions, newQuestion])
  }

  function removeQuestion(index: number) {
    const newQuestions = [...questions]
    newQuestions.splice(index, 1)
    setQuestions(newQuestions)
  }

  function updateText(index: number, text: string) {
    const newQuestions = [...questions]
    newQuestions[index].text = text
    setQuestions(newQuestions)
  }

  function updateChoice(qIndex: number, cIndex: number, value: string) {
    const newQuestions = [...questions]
    newQuestions[qIndex].choices[cIndex] = value
    setQuestions(newQuestions)
  }

  function updateCorrectIndex(qIndex: number, correctIndex: number) {
    const newQuestions = [...questions]
    newQuestions[qIndex].correctIndex = correctIndex
    setQuestions(newQuestions)
  }

  function updateTimer(qIndex: number, timerSec: number) {
    const newQuestions = [...questions]
    newQuestions[qIndex].timerSec = timerSec
    setQuestions(newQuestions)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(title, questions)
  }

  return (
    <div className="phase-container">
      <h1>Creer un Quiz</h1>
      <form className="create-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Titre du quiz</label>
          <input
            type="text"
            placeholder="Ex: Culture generale"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {questions.map((question, qIndex) => (
          <div key={question.id} className="question-card">
            <div className="question-card-header">
              <h3>Question {qIndex + 1}</h3>
              {questions.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => removeQuestion(qIndex)}>
                  Supprimer
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Question</label>
              <input
                type="text"
                placeholder="Posez votre question..."
                value={question.text}
                onChange={(e) => updateText(qIndex, e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Choix (selectionnez la bonne reponse)</label>
              <div className="choices-inputs">
                {question.choices.map((choice, cIndex) => (
                  <div key={cIndex} className="choice-input-group">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correctIndex === cIndex}
                      onChange={() => updateCorrectIndex(qIndex, cIndex)}
                    />
                    <input
                      type="text"
                      placeholder={`Choix ${cIndex + 1}`}
                      value={choice}
                      onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Duree du timer (secondes)</label>
              <select
                value={question.timerSec}
                onChange={(e) => updateTimer(qIndex, Number(e.target.value))}
              >
                <option value={10}>10s</option>
                <option value={20}>20s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            </div>
          </div>
        ))}

        <button type="button" className="btn-add-question" onClick={addQuestion}>
          + Ajouter une question
        </button>

        <div className="form-group">
          <button type="submit" className="btn-primary">
            Creer le quiz
          </button>
        </div>

      </form>
    </div>
  )
}

export default CreateQuiz
