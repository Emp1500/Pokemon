import { create } from 'zustand';
import { Pokemon, PokemonType } from '@/types/pokemon';

interface FilterState {
  types: PokemonType[];
  generations: number[];
  searchQuery: string;
  sortBy: 'id' | 'name' | 'stats';
  sortOrder: 'asc' | 'desc';
}

interface PokemonStore {
  // State
  allPokemon: Pokemon[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAllPokemon: (pokemon: Pokemon[]) => void;
  addPokemon: (pokemon: Pokemon[]) => void;
  setSearchQuery: (query: string) => void;
  toggleType: (type: PokemonType) => void;
  toggleGeneration: (gen: number) => void;
  clearFilters: () => void;
  setSortBy: (sortBy: FilterState['sortBy']) => void;
  toggleSortOrder: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed selectors
  filteredPokemon: () => Pokemon[];
  getPokemonById: (id: number) => Pokemon | undefined;
}

export const usePokemonStore = create<PokemonStore>((set, get) => ({
  // Initial state
  allPokemon: [],
  filters: {
    types: [],
    generations: [],
    searchQuery: '',
    sortBy: 'id',
    sortOrder: 'asc',
  },
  isLoading: false,
  error: null,

  // Actions
  setAllPokemon: (pokemon) => set({ allPokemon: pokemon }),

  addPokemon: (pokemon) =>
    set((state) => ({
      allPokemon: [...state.allPokemon, ...pokemon],
    })),

  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  toggleType: (type) =>
    set((state) => {
      const types = state.filters.types.includes(type)
        ? state.filters.types.filter((t) => t !== type)
        : [...state.filters.types, type];
      return { filters: { ...state.filters, types } };
    }),

  toggleGeneration: (gen) =>
    set((state) => {
      const generations = state.filters.generations.includes(gen)
        ? state.filters.generations.filter((g) => g !== gen)
        : [...state.filters.generations, gen];
      return { filters: { ...state.filters, generations } };
    }),

  clearFilters: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        types: [],
        generations: [],
        searchQuery: '',
      },
    })),

  setSortBy: (sortBy) =>
    set((state) => ({
      filters: { ...state.filters, sortBy },
    })),

  toggleSortOrder: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        sortOrder: state.filters.sortOrder === 'asc' ? 'desc' : 'asc',
      },
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  // Computed selectors
  filteredPokemon: () => {
    const { allPokemon, filters } = get();
    let results = [...allPokemon];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      
      // Check if searching by number (#025 or 25)
      const numberMatch = query.match(/^#?(\d+)$/);
      if (numberMatch) {
        const id = parseInt(numberMatch[1]);
        results = results.filter((p) => p.id === id);
      } else {
        // Text search
        results = results.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.types.some((t) => t.toLowerCase().includes(query)) ||
            p.abilities.some((a) => a.toLowerCase().includes(query))
        );
      }
    }

    // Apply type filter (OR logic - show Pokemon that have ANY of the selected types)
    if (filters.types.length > 0) {
      results = results.filter((p) =>
        p.types.some((t) => filters.types.includes(t))
      );
    }

    // Apply generation filter (OR logic)
    if (filters.generations.length > 0) {
      results = results.filter((p) =>
        p.generation && filters.generations.includes(p.generation)
      );
    }

    // Apply sort
    results.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stats':
          const aTotal = Object.values(a.stats).reduce((sum, val) => sum + val, 0);
          const bTotal = Object.values(b.stats).reduce((sum, val) => sum + val, 0);
          comparison = aTotal - bTotal;
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return results;
  },

  getPokemonById: (id) => {
    const { allPokemon } = get();
    return allPokemon.find((p) => p.id === id);
  },
}));
