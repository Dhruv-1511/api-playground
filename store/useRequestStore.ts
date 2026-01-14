import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface KeyValueItem {
  key: string
  value: string
  enabled: boolean
}

interface Request {
  id: string
  name: string
  method: string
  url: string
  params: KeyValueItem[]
  headers: KeyValueItem[]
  body: string
  bodyType: string
}

interface Response {
  data: unknown
  status: number | string
  statusText: string
  headers: Record<string, string>
  time: number
  size: number
  error?: boolean
}

interface HistoryItem extends Request {
  response: Response
  timestamp: number
}

interface RequestState {
  currentRequest: Request
  currentResponse: Response | null
  collections: Request[]
  history: HistoryItem[]
  setCurrentRequest: (request: Request) => void
  updateCurrentRequest: (updates: Partial<Request>) => void
  setCurrentResponse: (response: Response | null) => void
  saveRequest: () => void
  deleteRequest: (id: string) => void
  addToHistory: (req: Request, response: Response) => void
}

export const useRequestStore = create<RequestState>()(
  persist(
    (set, get) => ({
      currentRequest: {
        id: "new",
        name: "Untitled Request",
        method: "GET",
        url: "",
        params: [{ key: "", value: "", enabled: true }],
        headers: [{ key: "", value: "", enabled: true }],
        body: "",
        bodyType: "json",
      },
      currentResponse: null,
      collections: [
        {
          id: "sample-1",
          name: "Get Users Sample",
          method: "GET",
          url: "{{BASE_URL}}/users",
          params: [{ key: "", value: "", enabled: true }],
          headers: [{ key: "", value: "", enabled: true }],
          body: "",
          bodyType: "json",
        },
      ],
      history: [],

      setCurrentRequest: (request) => set({ currentRequest: request }),

      updateCurrentRequest: (updates) =>
        set((state) => ({
          currentRequest: { ...state.currentRequest, ...updates },
        })),

      setCurrentResponse: (response) => set({ currentResponse: response }),

      saveRequest: () => {
        const { currentRequest, collections } = get()
        const id =
          currentRequest.id === "new" ? crypto.randomUUID() : currentRequest.id
        const newRequest = { ...currentRequest, id }

        const existingIndex = collections.findIndex((r) => r.id === id)
        let newCollections
        if (existingIndex >= 0) {
          newCollections = [...collections]
          newCollections[existingIndex] = newRequest
        } else {
          newCollections = [newRequest, ...collections]
        }

        set({ collections: newCollections, currentRequest: newRequest })
      },

      deleteRequest: (id) =>
        set((state) => ({
          collections: state.collections.filter((r) => r.id !== id),
        })),

      addToHistory: (req, response) =>
        set((state) => ({
          history: [
            { ...req, response, timestamp: Date.now() },
            ...state.history,
          ].slice(0, 50),
        })),
    }),
    {
      name: "api-playground-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentRequest: state.currentRequest,
        collections: state.collections,
        history: state.history,
      }),
    }
  )
)
