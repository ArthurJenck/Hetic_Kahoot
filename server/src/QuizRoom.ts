// ============================================================
// QuizRoom - Logique d'une salle de quiz
// A IMPLEMENTER : remplir le corps de chaque methode
// ============================================================

import WebSocket, { CLOSED } from 'ws'
import type { QuizQuestion, QuizPhase, ServerMessage } from '../../packages/shared-types'
import { send, broadcast, generateID } from './utils'
import { ClientRequest } from 'http'

/** Represente un joueur connecte */
interface Player {
  id: string
  name: string
  ws: WebSocket
}

export class QuizRoom {
  /** Identifiant unique de la salle */
  readonly id: string

  /** Code a 6 caracteres que les joueurs utilisent pour rejoindre */
  readonly code: string

  /** Phase actuelle du quiz */
  phase: QuizPhase = 'lobby'

  /** WebSocket du host (presentateur) */
  hostWs: WebSocket | null = null

  /** Map des joueurs : playerId -> Player */
  players: Map<string, Player> = new Map()

  /** Liste des questions du quiz */
  questions: QuizQuestion[] = []

  /** Titre du quiz */
  title: string = ''

  /** Index de la question en cours (0-based) */
  currentQuestionIndex: number = -1

  /** Map des reponses pour la question en cours : playerId -> choiceIndex */
  answers: Map<string, number> = new Map()

  /** Map des scores cumules : playerId -> score total */
  scores: Map<string, number> = new Map()

  /** Timer ID pour le compte a rebours (pour pouvoir l'annuler) */
  timerId: ReturnType<typeof setInterval> | null = null

  /** Temps restant pour la question en cours */
  remaining: number = 0

  constructor(id: string, code: string) {
    this.id = id
    this.code = code
  }

  /**
   * Ajoute un joueur a la salle.
   * - Creer un objet Player avec un ID unique
   * - L'ajouter a this.players
   * - Initialiser son score a 0 dans this.scores
   * - Envoyer un message 'joined' a TOUS les clients (host + players)
   *   avec la liste des noms de joueurs
   * @returns l'ID du joueur cree
   */
  addPlayer(name: string, ws: WebSocket): string {
    // Generer un ID unique (ex: crypto.randomUUID() ou Math.random())
    const id = generateID();
    // Creer le Player et l'ajouter a this.players
    const newPlayer: Player = {
      id: id,
      name: name,
      ws: ws
    };

    this.players.set(id, newPlayer);
    // Initialiser le score a 0
    this.scores.set(id, 0); 
    // Envoyer 'joined' a tous les clients
    this.broadcastToAll({type: 'joined', playerId: id, players: Array.from(this.players.values()).map(p => p.name)});
    // Retourner l'ID du joueur
    return id;
  }

  /**
   * Demarre le quiz.
   * - Verifier qu'on est en phase 'lobby'
   * - Verifier qu'il y a au moins 1 joueur
   * - Passer a la premiere question en appelant nextQuestion()
   */
  start(): void {
    // Verifier la phase et le nombre de joueurs
    if (this.phase != 'lobby' || this.players.size < 1) {
      return;
    }
    // Appeler nextQuestion()
    this.nextQuestion();
  }

  /**
   * Passe a la question suivante.
   * - Annuler le timer precedent s'il existe
   * - Incrementer currentQuestionIndex
   * - Si on a depasse la derniere question, appeler broadcastLeaderboard() et return
   * - Vider la map answers
   * - Passer en phase 'question'
   * - Appeler broadcastQuestion()
   * - Demarrer le timer (setInterval toutes les secondes)
   *   qui decremente remaining et envoie un 'tick' a tous
   *   Quand remaining atteint 0, appeler timeUp()
   */
  nextQuestion(): void {
    // Annuler le timer existant (clearInterval)
    if (this.timerId) {
      clearInterval(this.timerId);
    };
    // Incrementer l'index
    this.currentQuestionIndex++;
    // Verifier si le quiz est termine
    if (this.currentQuestionIndex >= this.questions.length) {
      this.broadcastLeaderboard();
      return;
    };
    // Reinitialiser answers
    this.answers = new Map();
    // Changer la phase
    this.phase = 'question';
    // Envoyer la question
    this.broadcastQuestion();
    // Demarrer le compte a rebours
    this.remaining = this.questions[this.currentQuestionIndex].timerSec;
    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * Traite la reponse d'un joueur.
   * - Verifier qu'on est en phase 'question'
   * - Verifier que le joueur n'a pas deja repondu
   * - Enregistrer la reponse dans this.answers
   * - Si la reponse est correcte, calculer et ajouter les points :
   *   score = 1000 + Math.round(500 * (this.remaining / question.timerSec))
   * - Si tous les joueurs ont repondu, appeler timeUp() immediatement
   */
  handleAnswer(playerId: string, choiceIndex: number): void {
    // Verifier la phase
    if (this.phase != 'question') {
      return;
    };
    // Verifier que le joueur n'a pas deja repondu
    if (this.answers.has(playerId)) {
      return;
    }
    // Enregistrer la reponse
    this.answers.set(playerId, choiceIndex);
    // Calculer le score si correct
    const question = this.questions[this.currentQuestionIndex];
    if (question.correctIndex === choiceIndex) {
      const score = 1000 + Math.round(500 * (this.remaining / question.timerSec));
      const currentScore = this.scores.get(playerId) ?? 0;

      this.scores.set(playerId, currentScore + score);
    }
    // Si tout le monde a repondu, terminer la question
    if (this.answers.size === this.players.size) {
      this.timeUp();
    }
  }

  /**
   * Appelee toutes les secondes par le timer.
   * - Decrementer this.remaining
   * - Envoyer un 'tick' a tous les clients avec le temps restant
   * - Si remaining <= 0, appeler timeUp()
   */
  private tick(): void {
    // Decrementer remaining
    this.remaining--;
    // Envoyer 'tick' a tous
    this.broadcastToAll({type:'tick', remaining:this.remaining});
    // Si temps ecoule, appeler timeUp()
    if (this.remaining <= 0) {
      this.timeUp();
    }
  }

  /**
   * Appelee quand le temps est ecoule (ou que tout le monde a repondu).
   * - Annuler le timer
   * - Passer en phase 'results'
   * - Appeler broadcastResults()
   */
  private timeUp(): void {
    // Annuler le timer
    if (this.timerId) {
      clearInterval(this.timerId);
    };
    // Changer la phase
    this.phase = 'results';
    // Envoyer les resultats
    this.broadcastResults();
  }

  /**
   * Retourne la liste de tous les WebSocket des joueurs.
   * Utile pour broadcast.
   */
  private getPlayerWsList(): WebSocket[] {
    // Extraire les ws de this.players.values()
    const Sockets = Array.from(this.players.values()).map(player => player.ws);
    return Sockets;
  }

  /**
   * Envoie un message a tous les clients : host + tous les joueurs.
   */
  private broadcastToAll(message: ServerMessage): void {
    // Envoyer au host si connecte
    if (this.hostWs) {
      send(this.hostWs, message)
    }
    // Envoyer a tous les joueurs via broadcast()
    broadcast(this.getPlayerWsList(), message);
  }

  /**
   * Envoie la question en cours a tous les clients.
   * IMPORTANT : ne pas envoyer correctIndex aux clients !
   * Le message 'question' contient : question (sans correctIndex), index, total
   */
  private broadcastQuestion(): void {
    // Recuperer la question courante
    const currentQuestion = this.questions[this.currentQuestionIndex];
    // Creer l'objet question SANS correctIndex (utiliser destructuring)
    const { correctIndex, ...toSendQuestion } = currentQuestion;
    // Envoyer a tous via broadcastToAll()
    this.broadcastToAll({type: 'question', question: toSendQuestion, index: this.currentQuestionIndex, total: this.questions.length})
  }

  /**
   * Envoie les resultats de la question en cours.
   * - correctIndex : l'index de la bonne reponse
   * - distribution : tableau du nombre de reponses par choix [0, 5, 2, 1]
   * - scores : objet { nomJoueur: scoreTotal } pour tous les joueurs
   */
  private broadcastResults(): void {
    // Recuperer la question courante
    const currentQuestion = this.questions[this.currentQuestionIndex];
    // Calculer la distribution des reponses
    const distribution = new Array(currentQuestion.choices.length).fill(0);

    for (const choiceIndex of this.answers.values()) {
      distribution[choiceIndex]++;
    }
    // Construire l'objet scores { nom: score }
    const scores: Record<string, number> = {};
    for (const [playerId, player] of this.players) {
      scores[player.name] = this.scores.get(playerId) ?? 0;
    } 
    
    // Envoyer 'results' a tous
    this.broadcastToAll({type: 'results', correctIndex: currentQuestion.correctIndex,  distribution: distribution, scores: scores});
  }

  /**
   * Envoie le classement final.
   * - Trier les joueurs par score decroissant
   * - Envoyer un message 'leaderboard' avec rankings: { name, score }[]
   * - Passer en phase 'leaderboard'
   */
  broadcastLeaderboard(): void {
    // Construire le tableau rankings trie par score decroissant
    const rankings = Array.from(this.players.entries())
      .map(([playerId, player]) => ({
        name: player.name,
        score: this.scores.get(playerId) ?? 0
      }))
        .sort((a, b) => b.score - a.score);
    // Changer la phase
    this.phase = 'leaderboard';
    // Envoyer 'leaderboard' a tous
    this.broadcastToAll({type: 'leaderboard', rankings : rankings});
  }

  /**
   * Termine le quiz.
   * - Annuler le timer
   * - Passer en phase 'ended'
   * - Envoyer 'ended' a tous les clients
   */
  end(): void {
    // Annuler le timer
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    // Changer la phase
    this.phase = 'ended';
    // Envoyer 'ended' a tous
    this.broadcastToAll({ type: 'ended'});
  }
}
