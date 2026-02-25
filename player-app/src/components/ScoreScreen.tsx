// ============================================================
// ScoreScreen - Classement avec position du joueur
// A IMPLEMENTER : leaderboard avec mise en surbrillance
// ============================================================

interface ScoreScreenProps {
  /** Classement trie par score decroissant */
  rankings: { name: string; score: number }[]
  /** Nom du joueur actuel (pour le mettre en surbrillance) */
  playerName: string
}

/**
 * Composant affichant le classement avec la position du joueur en surbrillance.
 *
 * Ce qu'il faut implementer :
 * - Un titre "Classement" (classe .leaderboard-title)
 * - La liste ordonnee des joueurs (classe .leaderboard)
 * - Chaque joueur est dans un .leaderboard-item
 *   Si c'est le joueur actuel, ajouter aussi la classe .is-me
 * - Afficher pour chaque joueur :
 *   - Son rang (1, 2, 3...) dans .leaderboard-rank
 *   - Son nom dans .leaderboard-name
 *   - Son score dans .leaderboard-score
 *
 * Classes CSS disponibles : .score-screen, .leaderboard-title, .leaderboard,
 * .leaderboard-item, .is-me, .leaderboard-rank, .leaderboard-name, .leaderboard-score
 */
function ScoreScreen({ rankings, playerName }: ScoreScreenProps) {
  return (
    <div className="phase-container score-screen">
      {/* TODO: Titre "Classement" avec .leaderboard-title */}
      <div className="leaderboard">
        {/* TODO: Pour chaque joueur dans rankings, afficher un .leaderboard-item */}
        {/* TODO: Ajouter la classe .is-me si ranking.name === playerName */}
        {/* TODO: Afficher rang, nom et score */}
      </div>
    </div>
  )
}

export default ScoreScreen
