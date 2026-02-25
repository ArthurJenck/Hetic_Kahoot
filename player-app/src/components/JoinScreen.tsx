// ============================================================
// JoinScreen - Formulaire pour rejoindre un quiz
// A IMPLEMENTER : champs code et nom, bouton rejoindre
// ============================================================

import { useState } from 'react'

interface JoinScreenProps {
  /** Callback appele quand le joueur soumet le formulaire */
  onJoin: (code: string, name: string) => void
  /** Message d'erreur optionnel (ex: "Code invalide") */
  error?: string
}

/**
 * Composant formulaire pour rejoindre un quiz existant.
 *
 * Ce qu'il faut implementer :
 * - Un champ pour le code du quiz (6 caracteres, majuscules) V
 *   avec la classe .code-input pour le style monospace V
 * - Un champ pour le pseudo du joueur V
 * - Un bouton "Rejoindre" (classe .btn-primary) V
 * - Afficher le message d'erreur s'il existe (classe .error-message) V
 * - Valider que les deux champs ne sont pas vides avant d'appeler onJoin V
 *
 * Classes CSS disponibles : .join-form, .form-group, .code-input,
 * .error-message, .btn-primary
 */
function JoinScreen({ onJoin, error }: JoinScreenProps) {
  const [quizCode, setQuizCode] = useState<string | undefined>(undefined)
  const [nick, setNick] = useState<string | undefined>(undefined)
  const [errorToDisplay, setErrorToDisplay] = useState<string | undefined>(
    error,
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!quizCode || !nick) {
      setErrorToDisplay('Veuillez remplir tous les champs.')
      return
    }

    onJoin(quizCode, nick)
  }

  return (
    <form className="join-form form-group" onSubmit={handleSubmit}>
      <h1>Rejoindre un Quiz</h1>
      {errorToDisplay && <p className="error-message">{errorToDisplay}</p>}
      <input
        className="code-input"
        type="text"
        name="quizCode"
        id="quizCode"
        minLength={6}
        maxLength={6}
        onChange={(e) => setQuizCode(e.target.value.toLocaleUpperCase())}
      />
      <input
        type="text"
        name="nick"
        id="nick"
        maxLength={16}
        onChange={(e) => setNick(e.target.value)}
      />
      <button type="submit" className="btn-primary">
        Rejoindre
      </button>
    </form>
  )
}

export default JoinScreen
