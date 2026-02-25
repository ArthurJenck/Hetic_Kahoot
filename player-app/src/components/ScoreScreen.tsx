// ============================================================
// ScoreScreen - Classement avec position du joueur
// A IMPLEMENTER : leaderboard avec mise en surbrillance
// ============================================================

import { cn } from '@sglara/cn'

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
 * - Un titre "Classement" (classe .leaderboard-title) V
 * - La liste ordonnee des joueurs (classe .leaderboard) V
 * - Chaque joueur est dans un .leaderboard-item V
 *   Si c'est le joueur actuel, ajouter aussi la classe .is-me V
 * - Afficher pour chaque joueur : V
 *   - Son rang (1, 2, 3...) dans .leaderboard-rank V
 *   - Son nom dans .leaderboard-name V
 *   - Son score dans .leaderboard-score V
 *
 * Classes CSS disponibles : .score-screen, .leaderboard-title, .leaderboard,
 * .leaderboard-item, .is-me, .leaderboard-rank, .leaderboard-name, .leaderboard-score
 */
function ScoreScreen({ rankings, playerName }: ScoreScreenProps) {
  return (
    <div className="phase-container score-screen">
      <h2 className="leaderboard-title">Classement</h2>
      <ul className="leaderboard">
        {rankings.map((ranking, i) => (
          <li
            key={ranking.name}
            className={cn(
              'leaderboard-item',
              ranking.name === playerName && 'is-me',
            )}
          >
            <span className="leaderboard-rank">{i + 1}</span>
            <span className="leaderboard-name">{ranking.name}</span>
            <span className="leaderboard-score">{ranking.score}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ScoreScreen
