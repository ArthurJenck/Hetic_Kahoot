// ============================================================
// Utilitaires WebSocket - Ce fichier est COMPLET
// ============================================================

import WebSocket from 'ws'
import type { ServerMessage } from '../../packages/shared-types'

/**
 * Envoie un message a un seul client WebSocket.
 * Verifie que la connexion est ouverte avant d'envoyer.
 */
export function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

/**
 * Envoie un message a tous les clients d'une collection.
 * Le message est serialise une seule fois pour optimiser les performances.
 */
export function broadcast(clients: Iterable<WebSocket>, message: ServerMessage): void {
  const data = JSON.stringify(message)
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  }
}

/**
 * Genere un code de quiz aleatoire de 6 caracteres alphanumeriques majuscules.
 * Exemple : "A3F9K2"
 */
export function generateQuizCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
