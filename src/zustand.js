import { create } from 'zustand'


export const useAuth = create((set) => ({
  isAuthenticated: false,
  vkToken: null,
  vkUser: null, // { id, first_name, last_name, sex, bdate, photo_200 }

  setAuth: ({ vkToken, vkUser }) =>
    set({ isAuthenticated: true, vkToken, vkUser }),

  clearAuth: () =>
    set({ isAuthenticated: false, vkToken: null, vkUser: null }),
}))


/**
 * Strip protocol from domain so endpoints can safely use `https://${domain}/...`
 */
function normalizeDomain(d) {
  if (!d) return d
  return d.replace(/^https?:\/\//, '').replace(/\/+$/, '')
}

export const useCompany = create((set) => ({
  domain: normalizeDomain(import.meta.env.VITE_BACKEND_DOMAIN),
  setCompany: (newDomain) => set(() => ({ domain: normalizeDomain(newDomain) }))
}))

export const useParams = create((set) => ({
  company: null,
  branch: null,
  table: null,
  delivery: null,

  setCompany: (company) => set(() => ({ company })),

  // ✅ Set branch only
  setBranch: (branch) => set(() => ({ branch })),

  // ✅ Set table only
  setTable: (table) => set(() => ({ table })),

  setDelivery: (delivery) => set(() => ({ delivery })),
  removeDelivery: () => set(() => ({ delivery: null })),
  resetParams: () => set(() => ({ branch: null, table: null, delivery: null }))
}));


export const useClient = create((set) => ({
  client: null,

  setClient: (newClient) =>
    set({ client: newClient }),

  addCoins: (amount) =>
    set((state) => {
      if (!state.client) return state

      return {
        client: {
          ...state.client,
          coins_balance: (state.client.coins_balance || 0) + amount
        }
      }
    }),

  removeCoins: (amount) =>
    set((state) => {
      if (!state.client) return state

      return {
        client: {
          ...state.client,
          coins_balance: Math.max(
            0,
            (state.client.coins_balance || 0) - amount
          )
        }
      }
    }),

  setIsJoinedCommunity: (value) =>
    set((state) => {
      if (!state.client) return state

      return {
        client: {
          ...state.client,
          is_joined_community: value
        }
      }
    }),

  setIsAllowedMessageFromCommunity: (value) =>
    set((state) => {
      if (!state.client) return state

      return {
        client: {
          ...state.client,
          is_allowed_message: value
        }
      }
    }),

  setIsStoryUploaded: (value) =>
    set((state) => {
      if (!state.client) return state

      return {
        client: {
          ...state.client,
          is_story_uploaded: value
        }
      }
    }),

  setBirthDate: (newBirthDate) =>
    set((state) => {
      if (!state.client) return state

      return {
        client: {
          ...state.client,
          birth_date: newBirthDate
        }
      }
    })
}))


export const useInventory = create((set) => ({
  items: [],

  setInventory: (newItems) => set({ items: newItems }),

  addItem: (newItem) =>
    set((state) => ({
      items: [...state.items, newItem],
    })),

  activateItem: (newItem) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === newItem.id ? newItem : item
      ),
    })),

  deactivateItem: (item) => set((state) => ({
    items: state.items.map((i) =>
      i.id === item.id ? { ...i, status: 'expired' } : i
    ),
  })),
}));


export const useSuperPrize = create((set) => ({
  superPrizes: [],
  setSuperPrize: (newSuperPrize) => set(() => ({ superPrizes: newSuperPrize })),

  addSuperPrize: (newSuperPrize) =>
    set((state) => ({
      superPrizes: [...state.superPrizes, newSuperPrize],
    })),

  activateSuperPrize: (id) =>
    set((state) => ({
      superPrizes: state.superPrizes.filter(
        (item) => item.id !== id
      )
    }))
}))


export const useCatalog = create((set) => ({
  items: [],
  setCatalog: (newCatalog) => set({ items: newCatalog }),
}))

export const useQuest = create((set) => ({
  items: [],

  setQuests: (newItems) => set(() => ({ items: newItems })),

  setComplete: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, completed: true }
          : item
      )
    }
    ))
}))

export const useActiveQuest = create((set) => ({
  activeQuest: null,

  setActiveQuest: (newActiveQuest) => set({ activeQuest: newActiveQuest }),

  removeActiveQuest: () => set({ activeQuest: null }),
}))

const initialState = {
  start: null,
  duration: "00:03:00",
  cards: [],
  revealed: [],
  matches: 0,
  moves: 0,
  isBusy: false,
};

export const usePlay = create((set) => ({
  play: initialState,

  setCards: (cards) => set((state) => ({ play: { ...state.play, cards } })),
  setRevealed: (revealed) => set((state) => ({ play: { ...state.play, revealed } })),
  setMatches: (matches) => set((state) => ({ play: { ...state.play, matches } })),
  setMoves: (moves) => set((state) => ({ play: { ...state.play, moves } })),
  setIsBusy: (isBusy) => set((state) => ({ play: { ...state.play, isBusy } })),
  setStart: (start) => set((state) => ({ play: { ...state.play, start } })),
  resetGame: () => set(() => ({ play: { ...initialState } })),
}));







export const useInventoryCooldown = create((set) => ({
  inventoryCooldown: null,
  setInventoryCooldown: (newInventoryCooldown) => set(() => ({ inventoryCooldown: newInventoryCooldown })),
  unsetInventoryCooldown: () => set((state) => ({
    inventoryCooldown: {
      ...state.inventoryCooldown,
      is_active: false
    }
  })),
  resetInventoryCooldown: () => set(() => ({ inventoryCooldown: null }))
}))

export const useQuestCooldown = create((set) => ({
  questCooldown: null,
  setQuestCooldown: (newQuestCooldown) => set({ questCooldown: newQuestCooldown }),

  unsetQuestCooldown: () => set((state) => ({
    questCooldown: {
      ...state.questCooldown,
      is_active: false,
    },
  })),

  resetQuestCooldown: () => set({ questCooldown: null })
}))

export const useCatalogCooldown = create((set) => ({
  catalogCooldown: null,
  setCatalogCooldown: (newCatalogCooldown) => set(() => ({ catalogCooldown: newCatalogCooldown })),
  unsetCatalogCooldown: () => set((state) => ({
    catalogCooldown: {
      ...state.catalogCooldown,
      is_active: false,
    },
  })),
  resetCatalogCooldown: () => set(() => ({ catalogCooldown: null }))
}))

export const useGameCooldown = create((set) => ({
  gameCooldown: null,
  setGameCooldown: (newGameCooldown) => set({ gameCooldown: newGameCooldown }),
  unsetGameCooldown: () => set((state) => ({
    gameCooldown: {
      ...state.gameCooldown,
      is_active: false,
    },
  })),
  resetGameCooldown: () => set({ gameCooldown: null }),
}))


export const useGroup = create((set) => ({
  group: null,
  setGroup: (newGroup) => set({ group: newGroup }),
  resetGroup: () => set(() => ({ group: null }))
}))


export const useModal = create((set, get) => ({
  queues: {},

  pushModal: ({ pageId, modal }) =>
    set((state) => {
      const queue = state.queues[pageId] || []
      return {
        queues: {
          ...state.queues,
          [pageId]: [...queue, modal],
        },
      }
    }),

  popModal: ({ pageId }) =>
    set((state) => {
      const queue = state.queues[pageId] || []
      if (!queue.length) return state

      const newQueue = queue.slice(1)
      const newQueues = { ...state.queues }

      if (newQueue.length) {
        newQueues[pageId] = newQueue
      } else {
        delete newQueues[pageId]
      }

      return { queues: newQueues }
    }),

  replaceModal: ({ pageId, modal }) =>
    set((state) => {
      const queue = state.queues[pageId] || []
      return {
        queues: {
          ...state.queues,
          [pageId]: [modal, ...queue.slice(1)],
        },
      }
    }),

  clearQueue: ({ pageId }) =>
    set((state) => {
      const newQueues = { ...state.queues }
      delete newQueues[pageId]
      return { queues: newQueues }
    }),

  closeModalByType: ({ pageId, type }) =>
    set((state) => {
      const queue = state.queues[pageId] || []
      const filtered = queue.filter((m) => m.type !== type)

      const newQueues = { ...state.queues }
      if (filtered.length) {
        newQueues[pageId] = filtered
      } else {
        delete newQueues[pageId]
      }

      return { queues: newQueues }
    }),

  resetModal: () => ({ queues: {} }),
}))


export const useView = create((set) => ({
  view: "intro", // ✅ initialState
  setView: (newView) => set({ view: newView }),
  resetView: () => set({ view: "intro" }),
}));


export const useBranch = create((set) => ({
  branch: null,
  setBranch: (branch) => set({ branch: branch }),
  resetBranch: () => set(() => ({ branch: null }))
}))

export const useHasShownPostStory = create((set) => ({
  hasShownPostStory: false,
  setHasShownPostStory: (value) => set({ hasShownPostStory: value }),
}));

export const useLogo = create((set) => ({
  logotype: '/LevelUpLogo.png',
  coin: '/LevCoin.png',
  card: '/images/bred.jpg',

  setLogo: ({ logotype, coin, card }) => set({ logotype: logotype, coin: coin, card: card })
}))

export const useEmployee = create((set) => ({
  employees: [],
  setEmployees: (employees) => set({ employees: employees })
}))


export const usePromotions = create((set) => ({
  promotions: [],
  setPromotions: (promotions) => set({ promotions: promotions })
}))

export const useBirthday = create((set) => ({
  birthdayStatus: null,     // { is_birthday_mode, already_claimed }
  isNavLocked: false,       // true если зашли по birthday=true ссылке

  setBirthdayStatus: (status) => set({ birthdayStatus: status }),
  setNavLocked: (locked) => set({ isNavLocked: locked }),
  resetBirthday: () => set({ birthdayStatus: null, isNavLocked: false }),
}))
