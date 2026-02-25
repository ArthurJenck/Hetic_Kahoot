// ============================================================
// Serveur WebSocket - Point d'entree
// A IMPLEMENTER : remplir les cas du switch avec la logique
// ============================================================

import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import type { ClientMessage } from '../../packages/shared-types'
import { QuizRoom } from './QuizRoom'
import { send, generateQuizCode, generateID } from './utils'

const PORT = 3001

// ---- Stockage global des salles ----
/** Map des salles : code du quiz -> QuizRoom */
const rooms = new Map<string, QuizRoom>()

/** Map inverse pour retrouver la salle d'un joueur : WebSocket -> { room, playerId, sessionToken } */
const clientRoomMap = new Map<WebSocket, { room: QuizRoom; playerId: string; sessionToken: string }>()

/** Map pour retrouver la salle du host : WebSocket -> QuizRoom */
const hostRoomMap = new Map<WebSocket, QuizRoom>()

/** Map session token joueur -> { room, playerId } pour la reconnexion */
const sessionTokenMap = new Map<string, { room: QuizRoom; playerId: string }>()

/** Map session token host -> QuizRoom pour la reconnexion */
const hostSessionTokenMap = new Map<string, QuizRoom>()

// ---- Helpers de synchronisation d'etat lors d'une reconnexion ----

/** Envoie l'etat courant de la room a un joueur qui vient de se reconnecter */
function syncPlayerState(ws: WebSocket, room: QuizRoom, player: { id: string; name: string }): void {
  switch (room.phase) {
    case 'lobby':
      send(ws, { type: 'joined', playerId: player.id, players: Array.from(room.players.values()).filter(p => !p.disconnected).map(p => p.name) });
      break;
    case 'question': {
      const q = room.questions[room.currentQuestionIndex];
      const { correctIndex: _ci, ...question } = q;
      send(ws, { type: 'question', question, index: room.currentQuestionIndex, total: room.questions.length });
      send(ws, { type: 'tick', remaining: room.remaining });
      if (room.paused) send(ws, { type: 'paused' });
      break;
    }
    case 'results':
      if (room.lastResults) {
        send(ws, { type: 'results', ...room.lastResults });
      }
      break;
    case 'leaderboard': {
      const rankings = Array.from(room.players.entries())
        .map(([id, p]) => ({ name: p.name, score: room.scores.get(id) ?? 0 }))
        .sort((a, b) => b.score - a.score);
      send(ws, { type: 'leaderboard', rankings });
      break;
    }
    case 'ended':
      send(ws, { type: 'ended' });
      break;
  }
}

/** Envoie l'etat courant de la room au host qui vient de se reconnecter */
function syncHostState(ws: WebSocket, room: QuizRoom, sessionToken: string): void {
  send(ws, { type: 'sync', phase: room.phase, data: { quizCode: room.code, sessionToken } });
  switch (room.phase) {
    case 'lobby':
      send(ws, { type: 'joined', playerId: '', players: Array.from(room.players.values()).filter(p => !p.disconnected).map(p => p.name) });
      break;
    case 'question': {
      const q = room.questions[room.currentQuestionIndex];
      const { correctIndex: _ci, ...question } = q;
      send(ws, { type: 'question', question, index: room.currentQuestionIndex, total: room.questions.length });
      send(ws, { type: 'tick', remaining: room.remaining });
      break;
    }
    case 'results':
      if (room.lastResults) {
        send(ws, { type: 'results', ...room.lastResults });
      }
      break;
    case 'leaderboard': {
      const rankings = Array.from(room.players.entries())
        .map(([id, p]) => ({ name: p.name, score: room.scores.get(id) ?? 0 }))
        .sort((a, b) => b.score - a.score);
      send(ws, { type: 'leaderboard', rankings });
      break;
    }
  }
}

// ---- Creation du serveur HTTP + WebSocket ----
const httpServer = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Quiz WebSocket Server is running')
})

const wss = new WebSocketServer({ server: httpServer })

console.log(`[Server] Demarrage sur le port ${PORT}...`)

// ---- Gestion des connexions WebSocket ----
wss.on('connection', (ws: WebSocket) => {
  console.log('[Server] Nouvelle connexion WebSocket')

  ws.on('message', (raw: Buffer) => {
    // --- Parsing du message JSON ---
    let message: ClientMessage
    try {
      message = JSON.parse(raw.toString()) as ClientMessage
    } catch {
      send(ws, { type: 'error', message: 'Message JSON invalide' })
      return
    }

    console.log('[Server] Message recu:', message.type)

    // --- Routage par type de message ---
    switch (message.type) {
      // ============================================================
      // Un joueur veut rejoindre un quiz
      // ============================================================
      case 'join': {
        // Empecher un double-join si ce ws est deja reconnu (race condition reconnect + join)
        if (clientRoomMap.has(ws)) {
          return;
        }
        // Recuperer la salle avec message.quizCode depuis la map rooms
        const quizCode = message.quizCode;
        if (!quizCode) {
          send(ws, { type: 'error', message: 'Room code ne peut pas être vide'});
          return;
        };
        // Si la salle n'existe pas, envoyer une erreur
        if (!rooms.has(quizCode)) {
          send(ws, { type: 'error', message: 'Pas de salle avec ce code'});
          return;
        };
        const room = rooms.get(quizCode);
        // Si la salle n'est pas en phase 'lobby', envoyer une erreur
        if (room?.phase != 'lobby') {
          send(ws, { type: 'error', message: 'La salle a déjà commencé'});
          return;
        };
        const { id, sessionToken } = room.addPlayer(message.name, ws);
        clientRoomMap.set(ws, { room, playerId: id, sessionToken });
        sessionTokenMap.set(sessionToken, { room, playerId: id });
        // Envoyer le token de session uniquement au nouveau joueur
        send(ws, { type: 'session', sessionToken });
        break
      }

      // ============================================================
      // Un joueur envoie sa reponse
      // ============================================================
      case 'answer': {
        // Recuperer le { room, playerId } depuis clientRoomMap
        const player = clientRoomMap.get(ws);
        // Si non trouve, envoyer une erreur
        if (!player) {
          send(ws, { type: 'error', message: 'Le joueur est introuvable'})
          return;
        }
        // Appeler room.handleAnswer(playerId, message.choiceIndex)
        player.room.handleAnswer(player.playerId, message.choiceIndex);
        break
      }

      // ============================================================
      // Le host cree un nouveau quiz
      // ============================================================
      case 'host:create': {
        const quizCode = generateQuizCode();
        const newQuizRoom = new QuizRoom(generateID(), quizCode);
        newQuizRoom.hostWs = ws;
        newQuizRoom.title = message.title;
        newQuizRoom.questions = message.questions;
        // Generer et stocker le token de session du host
        const hostSessionToken = generateID();
        newQuizRoom.hostSessionToken = hostSessionToken;
        rooms.set(quizCode, newQuizRoom);
        hostRoomMap.set(ws, newQuizRoom);
        hostSessionTokenMap.set(hostSessionToken, newQuizRoom);
        // Inclure le sessionToken dans le sync pour que le host le sauvegarde
        send(ws, { type: 'sync', phase: 'lobby', data: { quizCode, sessionToken: hostSessionToken } });
        console.log(`[Server] Quiz cree avec le code: ${quizCode}`);
        break
      }

      // ============================================================
      // Le host demarre le quiz
      // ============================================================
      case 'host:start': {
        // Recuperer la room depuis hostRoomMap
        const room = hostRoomMap.get(ws);
        // Si non trouvee, envoyer une erreur
        if(!room) {
          send(ws, { type: 'error', message: 'Salle non trouvé'});
          return;
        };
        // Appeler room.start()
        room.start();
        break
      }

      // ============================================================
      // Le host passe a la question suivante
      // ============================================================
      case 'host:next': {
        // Recuperer la room depuis hostRoomMap
        const room = hostRoomMap.get(ws);
        // Si non trouvee, envoyer une erreur
        if(!room) {
          send(ws, { type: 'error', message: 'Salle non trouvé'});
          return;
        };
        // Appeler room.nextQuestion()
        room.nextQuestion();
        break
      }

      // ============================================================
      // Le host termine le quiz
      // ============================================================
      case 'host:end': {
        // Recuperer la room depuis hostRoomMap
        const room = hostRoomMap.get(ws);
        // Si non trouvee, envoyer une erreur
        if(!room) {
          send(ws, { type: 'error', message: 'Salle non trouvé'});
          return;
        };
        room.end();
        rooms.delete(room.code);
        hostRoomMap.delete(ws);
        hostSessionTokenMap.delete(room.hostSessionToken);
        for (const player of room.players.values()) {
          if (player.graceTimer) clearTimeout(player.graceTimer);
          if (player.ws) clientRoomMap.delete(player.ws);
          sessionTokenMap.delete(player.sessionToken);
        }
        break
      }

      // ============================================================
      // Un joueur veut se reconnecter avec son token de session
      // ============================================================
      case 'reconnect': {
        const info = sessionTokenMap.get(message.sessionToken);
        if (!info) {
          send(ws, { type: 'error', message: 'Session invalide ou expiree' });
          return;
        }
        const { room, playerId } = info;
        const player = room.reconnectPlayer(message.sessionToken, ws);
        if (!player) {
          send(ws, { type: 'error', message: 'Joueur introuvable' });
          sessionTokenMap.delete(message.sessionToken);
          return;
        }
        clientRoomMap.set(ws, { room, playerId, sessionToken: message.sessionToken });
        console.log(`[Server] Joueur ${player.name} reconnecte`);
        syncPlayerState(ws, room, player);
        break;
      }

      // ============================================================
      // Le host veut se reconnecter avec son token de session
      // ============================================================
      case 'host:reconnect': {
        const room = hostSessionTokenMap.get(message.sessionToken);
        if (!room) {
          send(ws, { type: 'error', message: 'Session host invalide ou expiree' });
          return;
        }
        room.hostWs = ws;
        hostRoomMap.set(ws, room);
        console.log(`[Server] Host reconnecte sur le quiz ${room.code}`);
        syncHostState(ws, room, message.sessionToken);
        if (room.paused) {
          room.resumeQuiz();
        }
        break;
      }

      default: {
        send(ws, { type: 'error', message: `Type de message inconnu` })
      }
    }
  })

  // --- Gestion de la deconnexion ---
  ws.on('close', () => {
    console.log('[Server] Connexion fermee')

    const playerInfo = clientRoomMap.get(ws);
    if (playerInfo) {
      clientRoomMap.delete(ws);
      const { room, playerId, sessionToken } = playerInfo;
      console.log(`[Server] Joueur deconnecte (grace 30s)`);
      room.disconnectPlayer(playerId, () => {
        sessionTokenMap.delete(sessionToken);
        console.log(`[Server] Joueur supprime apres expiration de la grace`);
      });
    }

    const hostRoom = hostRoomMap.get(ws);
    if (hostRoom) {
      hostRoomMap.delete(ws);
      hostRoom.hostWs = null;
      console.log(`[Server] Host deconnecte, quiz mis en pause`);
      hostRoom.pauseQuiz();
    }
  })

  ws.on('error', (err: Error) => {
    console.error('[Server] Erreur WebSocket:', err.message)
  })
})

// ---- Demarrage du serveur ----
httpServer.listen(PORT, () => {
  console.log(`[Server] Serveur WebSocket demarre sur ws://localhost:${PORT}`)
})
