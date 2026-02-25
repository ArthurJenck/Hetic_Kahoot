// ============================================================
// WaitingLobby - Ecran d'attente pour les joueurs
// A IMPLEMENTER : message d'attente et liste des joueurs
// ============================================================

interface WaitingLobbyProps {
  /** Liste des noms de joueurs connectes */
  players: string[]
}

/**
 * Composant ecran d'attente affiche cote joueur apres avoir rejoint.
 *
 * Ce qu'il faut implementer :
 * - Un message "En attente du host..." (classe .waiting-message) V
 * - Le nombre de joueurs connectes V
 * - La liste des joueurs (puces avec classe .player-chip dans un .player-list) V
 *
 * Classes CSS disponibles : .waiting-container, .waiting-message,
 * .player-list, .player-chip
 */
function WaitingLobby({ players }: WaitingLobbyProps) {
  return (
    <div className="phase-container waiting-container">
      <p className="waiting-message">En attende de l'hôte...</p>
      <p>Joueurs connectés : {players.length}</p>
      <ul className="player-list">
        {players.map((player, i) => (
          <li key={`player-${i}`} className="player-chip">
            {player}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default WaitingLobby
