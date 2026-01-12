import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useRequestStore = create(
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
        const { currentRequest, collections } = get();
        const id =
          currentRequest.id === "new" ? crypto.randomUUID() : currentRequest.id;
        const newRequest = { ...currentRequest, id };

        const existingIndex = collections.findIndex((r) => r.id === id);
        let newCollections;
        if (existingIndex >= 0) {
          newCollections = [...collections];
          newCollections[existingIndex] = newRequest;
        } else {
          newCollections = [newRequest, ...collections];
        }

        set({ collections: newCollections, currentRequest: newRequest });
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
    }
  )
);
