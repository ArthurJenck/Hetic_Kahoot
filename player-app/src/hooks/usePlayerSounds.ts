import { Howl } from 'howler'
import { useRef, useCallback, useEffect } from 'react'

import lobbyUrl from '@sounds/lobby.mp3'
import getReadyUrl from '@sounds/get-ready.mp3'
import countdown10Url from '@sounds/countdown-10s.mp3'
import countdown20Url from '@sounds/countdown-20s.mp3'
import countdown30Url from '@sounds/countdown-30s.mp3'
import countdown60Url from '@sounds/countdown-60s.mp3'
import leaderboardUrl from '@sounds/leaderboard.mp3'
import correctUrl from '@sounds/correct.mp3'
import incorrectUrl from '@sounds/incorrect.mp3'
import answerSentUrl from '@sounds/answer-sent.mp3'

const SOUND_CONFIG = {
  lobby: { src: lobbyUrl, loop: true, volume: 0.5 },
  getReady: { src: getReadyUrl, loop: false, volume: 0.7 },
  countdown10: { src: countdown10Url, loop: false, volume: 0.6 },
  countdown20: { src: countdown20Url, loop: false, volume: 0.6 },
  countdown30: { src: countdown30Url, loop: false, volume: 0.6 },
  countdown60: { src: countdown60Url, loop: false, volume: 0.6 },
  leaderboard: { src: leaderboardUrl, loop: false, volume: 0.6 },
  correct: { src: correctUrl, loop: false, volume: 0.8 },
  incorrect: { src: incorrectUrl, loop: false, volume: 0.8 },
  answerSent: { src: answerSentUrl, loop: false, volume: 0.7 },
} as const

type SoundName = keyof typeof SOUND_CONFIG

const COUNTDOWN_MAP: Record<number, SoundName> = {
  10: 'countdown10',
  20: 'countdown20',
  30: 'countdown30',
  60: 'countdown60',
}

export function usePlayerSounds() {
  const howls = useRef<Map<SoundName, Howl>>(new Map())

  const getHowl = useCallback((name: SoundName): Howl => {
    if (!howls.current.has(name)) {
      const config = SOUND_CONFIG[name]
      howls.current.set(
        name,
        new Howl({
          src: [config.src],
          loop: config.loop,
          volume: config.volume,
        }),
      )
    }
    return howls.current.get(name)!
  }, [])

  const play = useCallback(
    (name: SoundName) => {
      getHowl(name).play()
    },
    [getHowl],
  )

  const stop = useCallback((name: SoundName) => {
    howls.current.get(name)?.stop()
  }, [])

  const stopAll = useCallback(() => {
    howls.current.forEach((h: Howl) => h.stop())
  }, [])

  const playCountdown = useCallback(
    (timerSec: number) => {
      const name = COUNTDOWN_MAP[timerSec]
      if (name) play(name)
    },
    [play],
  )

  useEffect(() => {
    return () => {
      howls.current.forEach((h: Howl) => h.unload())
    }
  }, [])

  return { play, stop, stopAll, playCountdown }
}
