# Quiz App - WebSocket en temps reel

Un quiz interactif en temps reel inspire de Kahoot, construit avec WebSocket, React et TypeScript.

## Prerequis

- **Node.js >= 18**
- **npm** (inclus avec Node.js)

## Structure du projet

```
quiz-app/
├── packages/
│   └── shared-types/       # Types TypeScript partages (COMPLET)
├── server/                  # Serveur WebSocket Node.js
│   └── src/
│       ├── utils.ts         # Utilitaires d'envoi WS (COMPLET)
│       ├── QuizRoom.ts      # Logique d'une salle de quiz (A IMPLEMENTER)
│       └── index.ts         # Point d'entree du serveur (A IMPLEMENTER)
├── host-app/                # Application React pour le presentateur
│   └── src/
│       ├── hooks/
│       │   └── useWebSocket.ts   # Hook WebSocket (COMPLET)
│       ├── App.tsx               # Routeur principal (A IMPLEMENTER)
│       ├── App.css               # Styles (COMPLET)
│       └── components/           # Composants UI (A IMPLEMENTER)
│           ├── CreateQuiz.tsx
│           ├── Lobby.tsx
│           ├── QuestionView.tsx
│           ├── Results.tsx
│           └── Leaderboard.tsx
└── player-app/              # Application React pour les joueurs
    └── src/
        ├── hooks/
        │   └── useWebSocket.ts   # Hook WebSocket (COMPLET)
        ├── App.tsx               # Routeur principal (A IMPLEMENTER)
        ├── App.css               # Styles (COMPLET)
        └── components/           # Composants UI (A IMPLEMENTER)
            ├── JoinScreen.tsx
            ├── WaitingLobby.tsx
            ├── AnswerScreen.tsx
            ├── FeedbackScreen.tsx
            └── ScoreScreen.tsx
```

## Ce qui est COMPLET (fourni)

- **Types partages** (`packages/shared-types/`) : toutes les interfaces et types pour les messages WebSocket
- **Utilitaires serveur** (`server/src/utils.ts`) : fonctions `send()`, `broadcast()`, `generateQuizCode()`
- **Hook useWebSocket** (`host-app/src/hooks/useWebSocket.ts` et `player-app/src/hooks/useWebSocket.ts`) : hook React complet avec auto-reconnexion
- **CSS** (`host-app/src/App.css` et `player-app/src/App.css`) : styles complets avec theme sombre
- **Configuration** : tous les fichiers `package.json`, `tsconfig.json`, `vite.config.ts`

## Ce qui est A IMPLEMENTER

Chaque fichier a implementer contient des squelettes types avec des commentaires `TODO` expliquant ce qu'il faut faire.

### Serveur (`server/`)
- `QuizRoom.ts` : la logique metier d'une salle de quiz (demarrage, questions, reponses, scores)
- `index.ts` : le routage des messages WebSocket vers les bonnes methodes

### Host App (`host-app/`)
- `App.tsx` : gestion de l'etat et routage par phase
- `CreateQuiz.tsx` : formulaire de creation de quiz
- `Lobby.tsx` : salle d'attente avec code et liste des joueurs
- `QuestionView.tsx` : affichage de la question en cours
- `Results.tsx` : barres animees des resultats
- `Leaderboard.tsx` : classement des joueurs

### Player App (`player-app/`)
- `App.tsx` : gestion de l'etat et routage par phase
- `JoinScreen.tsx` : formulaire pour rejoindre un quiz
- `WaitingLobby.tsx` : ecran d'attente
- `AnswerScreen.tsx` : boutons de reponse colores
- `FeedbackScreen.tsx` : retour correct/incorrect
- `ScoreScreen.tsx` : classement avec position du joueur

## Installation

```bash
# 1. Installer les dependances du serveur
cd server
npm install

# 2. Installer les dependances du host-app
cd ../host-app
npm install

# 3. Installer les dependances du player-app
cd ../player-app
npm install
```

## Demarrage

Ouvrez **3 terminaux** :

```bash
# Terminal 1 - Serveur WebSocket (port 3001)
cd server
npm run dev

# Terminal 2 - Host App (port 5173)
cd host-app
npm run dev

# Terminal 3 - Player App (port 5174)
cd player-app
npm run dev
```

## Repartition de l'equipe (3 personnes)

### Personne 1 : Serveur (`server/`)
- Implementer `QuizRoom.ts` : toute la logique metier
- Implementer `index.ts` : le routage des messages
- **Points cles** : gestion du timer, calcul des scores, cycle de vie d'une partie

### Personne 2 : Host App (`host-app/`)
- Implementer `App.tsx` : traitement des messages serveur et gestion des phases
- Implementer les 5 composants dans `components/`
- **Points cles** : formulaire dynamique, affichage du code quiz, barres animees

### Personne 3 : Player App (`player-app/`)
- Implementer `App.tsx` : traitement des messages serveur et gestion des phases
- Implementer les 5 composants dans `components/`
- **Points cles** : formulaire de connexion, boutons colores, retour visuel

## Flux de communication

```
Host App                    Serveur                     Player App
   |                          |                            |
   |-- host:create ---------->|                            |
   |<-- sync (lobby) --------|                            |
   |                          |<------ join --------------|
   |<-- joined ---------------|------- joined ----------->|
   |-- host:start ----------->|                            |
   |<-- question -------------|------- question ---------->|
   |                          |<------ answer ------------|
   |<-- tick -----------------|------- tick -------------->|
   |<-- results ---------------|------- results ---------->|
   |-- host:next ------------->|                            |
   |<-- question -------------|------- question ---------->|
   |   ...                    |   ...                      |
   |-- host:end -------------->|                            |
   |<-- ended -----------------|------- ended ------------>|
```

## Calcul des scores (suggestion)

- Reponse correcte : 1000 points de base
- Bonus de rapidite : jusqu'a +500 points selon le temps restant
- Formule : `score = 1000 + Math.round(500 * (remaining / timerSec))`
