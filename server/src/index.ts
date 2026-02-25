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

/** Map inverse pour retrouver la salle d'un joueur : WebSocket -> { room, playerId } */
const clientRoomMap = new Map<WebSocket, { room: QuizRoom; playerId: string }>()

/** Map pour retrouver la salle du host : WebSocket -> QuizRoom */
const hostRoomMap = new Map<WebSocket, QuizRoom>()

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
        // Appeler room.addPlayer(message.name, ws)
        const id = room.addPlayer(message.name, ws);
        // Stocker l'association ws -> { room, playerId } dans clientRoomMap
        clientRoomMap.set(ws, { room: room, playerId: id});
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
        // Generer un code unique avec generateQuizCode()
        const quizCode = generateQuizCode(); 
        // Creer une nouvelle QuizRoom (id = Date.now().toString(), code)
        const newQuizRoom = new QuizRoom(generateID(), quizCode);
        // Assigner hostWs, title, questions sur la room
        newQuizRoom.hostWs = ws;
        newQuizRoom.title = message.title;
        newQuizRoom.questions = message.questions;
        // Stocker la room dans rooms (cle = code)
        rooms.set(quizCode, newQuizRoom);
        // Stocker l'association host ws -> room dans hostRoomMap
        hostRoomMap.set(ws, newQuizRoom);
        // Envoyer un message sync au host : { type: 'sync', phase: 'lobby', data: { quizCode: code } }
        send(ws, { type : 'sync', phase: 'lobby', data: { quizCode: quizCode } });
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
        // Appeler room.end()
        room.end();
        // Supprimer la room de rooms
        rooms.delete(room.code);
        // Nettoyer hostRoomMap et clientRoomMap
        hostRoomMap.delete(ws);
        for (const player of room.players.values()) {
          clientRoomMap.delete(player.ws);
        }
        break
      }

      default: {
        send(ws, { type: 'error', message: `Type de message inconnu` })
      }
    }
  })

  // --- Gestion de la deconnexion ---
  ws.on('close', () => {
    console.log('[Server] Connexion fermee')

    // Nettoyer clientRoomMap si c'etait un joueur
    clientRoomMap.delete(ws);
    // Nettoyer hostRoomMap si c'etait un host
    hostRoomMap.delete(ws);
  })

  ws.on('error', (err: Error) => {
    console.error('[Server] Erreur WebSocket:', err.message)
  })
})

// ---- Demarrage du serveur ----
httpServer.listen(PORT, () => {
  console.log(`[Server] Serveur WebSocket demarre sur ws://localhost:${PORT}`)
})
