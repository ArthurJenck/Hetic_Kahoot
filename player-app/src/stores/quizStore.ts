import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface QuizStore {
  sessionId: string
  setSessionId: (id: string) => void
}

const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      sessionId: '',
      setSessionId: (id) => set({ sessionId: id }),
    }),
    {
      name: 'quiz-player-session',
      partialize: (state) => ({ sessionId: state.sessionId }),
    }
  )
)

export default useQuizStore
