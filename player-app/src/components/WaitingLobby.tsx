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
 * - Un message "En attente du host..." (classe .waiting-message)
 * - Le nombre de joueurs connectes
 * - La liste des joueurs (puces avec classe .player-chip dans un .player-list)
 *
 * Classes CSS disponibles : .waiting-container, .waiting-message,
 * .player-list, .player-chip
 */
function WaitingLobby({ players }: WaitingLobbyProps) {
  return (
    <div className="phase-container waiting-container">
      {/* TODO: Message "En attente du host..." avec .waiting-message */}
      {/* TODO: Nombre de joueurs */}
      {/* TODO: Liste des joueurs avec .player-list et .player-chip */}
    </div>
  )
}

export default WaitingLobby
