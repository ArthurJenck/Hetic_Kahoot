// ============================================================
// Leaderboard - Classement des joueurs
// A IMPLEMENTER : liste triee avec scores
// ============================================================

interface LeaderboardProps {
  /** Classement trie par score decroissant */
  rankings: { name: string; score: number }[]
}

/**
 * Composant affichant le classement des joueurs.
 *
 * Ce qu'il faut implementer :
 * - Un titre "Classement" (classe .leaderboard-title)
 * - Une liste ordonnee des joueurs (classe .leaderboard)
 * - Chaque joueur affiche (classe .leaderboard-item) :
 *   - Son rang (1, 2, 3...) dans .leaderboard-rank
 *   - Son nom dans .leaderboard-name
 *   - Son score dans .leaderboard-score
 * - Les 3 premiers ont des styles speciaux via :nth-child (deja dans le CSS)
 *
 * Note : les rankings sont deja tries par score decroissant
 */
function Leaderboard({ rankings }: LeaderboardProps) {
  return (
    <div className="phase-container">
      <h2 className="leaderboard-title">Classement</h2>
      <div className="leaderboard">
        {rankings.map((player, i) => (
          <div key={i} className="leaderboard-item">
            <span className="leaderboard-rank">{i + 1}</span>
            <span className="leaderboard-name">{player.name}</span>
            <span className="leaderboard-score">{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Leaderboard
