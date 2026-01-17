# Quick Start Guide: Pokemon Search & Filter Implementation

## Overview
This guide provides a quick implementation path for adding all Pokemon with search and filter functionality to your existing Pokemon dashboard.

---

## Recommended Approach: Hybrid Strategy

Based on your current architecture, here's the optimal implementation path:

### Why Hybrid?
1. **Fast Initial Load**: Gen 1 Pokemon (151) load instantly from static data
2. **Scalable**: Other generations load on-demand
3. **Best UX**: Users see content immediately, rest loads in background
4. **SEO Friendly**: Static data improves search engine indexing

---

## Implementation Steps

### Step 1: Install Dependencies (5 minutes)

```bash
npm install zustand
npm install fuse.js  # For fuzzy search
npm install react-window  # For virtual scrolling
npm install @tanstack/react-query  # For data fetching
```

### Step 2: Create Data Service (30 minutes)

Create `lib/pokemonService.ts`:

```typescript
import { Pokemon } from '@/types/pokemon';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const CACHE_KEY = 'pokemon_cache_v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export class PokemonService {
  private cache: Map<number, Pokemon> = new Map();

  async fetchPokemon(id: number): Promise<Pokemon> {
    // Check memory cache
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    // Check localStorage
    const cached = this.getCachedPokemon(id);
    if (cached) {
      this.cache.set(id, cached);
      return cached;
    }

    // Fetch from API
    const pokemon = await this.fetchFromAPI(id);
    this.cache.set(id, pokemon);
    this.cachePokemon(id, pokemon);

    return pokemon;
  }

  async fetchRange(start: number, end: number): Promise<Pokemon[]> {
    const promises = [];
    for (let i = start; i <= end; i++) {
      promises.push(this.fetchPokemon(i));
    }
    return Promise.all(promises);
  }

  private async fetchFromAPI(id: number): Promise<Pokemon> {
    const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
    const data = await response.json();

    // Transform API response to your Pokemon interface
    return {
      id: data.id,
      name: data.name,
      type: data.types[0].type.name,
      types: data.types.map((t: any) => t.type.name),
      height: data.height / 10, // Convert to meters
      weight: data.weight / 10, // Convert to kg
      abilities: data.abilities.map((a: any) => a.ability.name),
      stats: {
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        spAtk: data.stats[3].base_stat,
        spDef: data.stats[4].base_stat,
        speed: data.stats[5].base_stat,
      },
      imageUrl: data.sprites.other['official-artwork'].front_default,
      generation: this.getGeneration(data.id),
      region: this.getRegion(data.id),
    };
  }

  private getGeneration(id: number): number {
    if (id <= 151) return 1;
    if (id <= 251) return 2;
    if (id <= 386) return 3;
    if (id <= 493) return 4;
    if (id <= 649) return 5;
    if (id <= 721) return 6;
    if (id <= 809) return 7;
    if (id <= 905) return 8;
    return 9;
  }

  private getRegion(id: number): string {
    const regions = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];
    return regions[this.getGeneration(id) - 1];
  }

  private getCachedPokemon(id: number): Pokemon | null {
    try {
      const cache = localStorage.getItem(`${CACHE_KEY}_${id}`);
      if (!cache) return null;

      const { data, timestamp } = JSON.parse(cache);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(`${CACHE_KEY}_${id}`);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private cachePokemon(id: number, pokemon: Pokemon): void {
    try {
      localStorage.setItem(
        `${CACHE_KEY}_${id}`,
        JSON.stringify({ data: pokemon, timestamp: Date.now() })
      );
    } catch {
      // localStorage full, ignore
    }
  }
}

export const pokemonService = new PokemonService();
```

### Step 3: Create Search Hook (20 minutes)

Create `hooks/useSearchPokemon.ts`:

```typescript
import { useMemo, useState } from 'react';
import { Pokemon } from '@/types/pokemon';
import Fuse from 'fuse.js';

export function useSearchPokemon(pokemon: Pokemon[]) {
  const [searchQuery, setSearchQuery] = useState('');

  // Create Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(pokemon, {
      keys: ['name', 'abilities'],
      threshold: 0.3, // Lower = more strict
      includeScore: true,
    });
  }, [pokemon]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return pokemon;

    // Check if searching by number (#025)
    if (searchQuery.startsWith('#')) {
      const id = parseInt(searchQuery.slice(1));
      return pokemon.filter(p => p.id === id);
    }

    // Fuzzy search
    const results = fuse.search(searchQuery);
    return results.map(result => result.item);
  }, [searchQuery, pokemon, fuse]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
  };
}
```

### Step 4: Create Filter Store (30 minutes)

Create `store/pokemonStore.ts`:

```typescript
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
  allPokemon: Pokemon[];
  filters: FilterState;

  setAllPokemon: (pokemon: Pokemon[]) => void;
  setSearchQuery: (query: string) => void;
  toggleType: (type: PokemonType) => void;
  toggleGeneration: (gen: number) => void;
  clearFilters: () => void;
  setSortBy: (sortBy: FilterState['sortBy']) => void;

  // Computed
  filteredPokemon: () => Pokemon[];
}

export const usePokemonStore = create<PokemonStore>((set, get) => ({
  allPokemon: [],
  filters: {
    types: [],
    generations: [],
    searchQuery: '',
    sortBy: 'id',
    sortOrder: 'asc',
  },

  setAllPokemon: (pokemon) => set({ allPokemon: pokemon }),

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

  filteredPokemon: () => {
    const { allPokemon, filters } = get();
    let results = [...allPokemon];

    // Apply search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.id.toString() === query.replace('#', '')
      );
    }

    // Apply type filter
    if (filters.types.length > 0) {
      results = results.filter((p) =>
        p.types.some((t) => filters.types.includes(t))
      );
    }

    // Apply generation filter
    if (filters.generations.length > 0) {
      results = results.filter((p) =>
        filters.generations.includes(p.generation)
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
}));
```

### Step 5: Update Navbar Component (15 minutes)

Modify `components/Navbar.tsx`:

```typescript
'use client';

import { Search, Shuffle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePokemonStore } from '@/store/pokemonStore';

export default function Navbar({ onShuffle }: { onShuffle?: () => void }) {
  const { filters, setSearchQuery } = usePokemonStore();

  return (
    <motion.nav className="w-full px-8 py-6 flex items-center justify-between backdrop-blur-md bg-white/5">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-lg">
            <Search className="w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-white/50 outline-none w-48 text-sm"
            />
          </div>
        </div>

        <button
          onClick={onShuffle}
          className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/20 transition-all shadow-lg"
        >
          <Shuffle className="w-5 h-5 text-white/80" />
        </button>
      </div>

      {/* Filter Button (will be enhanced later) */}
      <div className="relative">
        <button className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/20 transition-all shadow-lg">
          <span className="text-white/80 text-sm font-medium">Filter</span>
          <ChevronDown className="w-4 h-4 text-white/60" />
        </button>
      </div>
    </motion.nav>
  );
}
```

### Step 6: Update Main Page (30 minutes)

Modify `app/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { usePokemonStore } from '@/store/pokemonStore';
import { pokemonService } from '@/lib/pokemonService';
import Navbar from '@/components/Navbar';
import PokemonCard from '@/components/PokemonCard';
// ... other imports

export default function Home() {
  const { allPokemon, setAllPokemon, filteredPokemon } = usePokemonStore();
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial Pokemon (Gen 1)
  useEffect(() => {
    const loadPokemon = async () => {
      setIsLoading(true);
      try {
        // Load Gen 1 first (fast)
        const gen1 = await pokemonService.fetchRange(1, 151);
        setAllPokemon(gen1);
        setCurrentPokemon(gen1[0]);

        // Load other generations in background
        Promise.all([
          pokemonService.fetchRange(152, 251),
          pokemonService.fetchRange(252, 386),
          // ... etc
        ]).then((generations) => {
          const allGen = [...gen1, ...generations.flat()];
          setAllPokemon(allGen);
        });
      } catch (error) {
        console.error('Failed to load Pokemon:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPokemon();
  }, []);

  const filtered = filteredPokemon();

  if (isLoading) {
    return <div>Loading Pokemon...</div>;
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      <Navbar onShuffle={() => {
        const random = filtered[Math.floor(Math.random() * filtered.length)];
        setCurrentPokemon(random);
      }} />

      {currentPokemon && (
        <PokemonCard pokemon={currentPokemon} />
      )}

      {/* Add a grid view for filtered results here */}
    </div>
  );
}
```

---

## Performance Optimizations

### 1. Debounce Search
```typescript
import { useCallback } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useCallback(
  debounce((query: string) => setSearchQuery(query), 300),
  []
);
```

### 2. Virtual Scrolling for Results
```typescript
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={4}
  columnWidth={200}
  height={600}
  rowCount={Math.ceil(filtered.length / 4)}
  rowHeight={250}
  width={900}
>
  {({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * 4 + columnIndex;
    if (index >= filtered.length) return null;
    return <PokemonGridItem pokemon={filtered[index]} style={style} />;
  }}
</FixedSizeGrid>
```

### 3. Lazy Load Images
```typescript
import Image from 'next/image';

<Image
  src={pokemon.imageUrl}
  alt={pokemon.name}
  width={200}
  height={200}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,..."
/>
```

---

## Testing Your Implementation

### Test Cases:
1. Search "pika" -> Should show Pikachu, Pikipek, etc.
2. Search "#025" -> Should show only Pikachu
3. Filter by Fire type -> Should show all fire Pokemon
4. Filter Gen 1 + Water type -> Should show Squirtle, Blastoise, etc.
5. Clear filters -> Should show all Pokemon
6. Sort by name Z-A -> Zygarde should be first

### Performance Benchmarks:
- Search response: < 100ms
- Filter application: < 50ms
- Scroll 60fps with virtual scrolling
- Initial load: < 3 seconds

---

## Next Steps

1. **Implement Filter Panel UI** (See main plan document)
2. **Add Advanced Search** (Operators, multi-field search)
3. **Optimize Bundle Size** (Code splitting, lazy loading)
4. **Add Analytics** (Track popular searches/filters)
5. **Accessibility Audit** (Keyboard nav, screen readers)

---

## Common Issues & Solutions

### Issue: Pokemon images not loading
**Solution**: Verify imageUrl format and use Next.js Image component with proper domains in next.config.js

### Issue: Search is slow
**Solution**: Ensure search is debounced and Fuse.js threshold is not too low

### Issue: Too much localStorage usage
**Solution**: Implement LRU cache with size limits

### Issue: Initial bundle too large
**Solution**: Use dynamic imports and code splitting for unused features

---

## Resources

- [PokeAPI Documentation](https://pokeapi.co/docs/v2)
- [Fuse.js Guide](https://fusejs.io/)
- [React Window Examples](https://react-window.vercel.app/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)

---

## Estimated Implementation

- **Core Features (Steps 1-6)**: 2-3 hours
- **Filter UI**: 2-3 hours
- **Optimizations**: 1-2 hours
- **Testing & Polish**: 2-3 hours

**Total**: 7-11 hours for a fully functional search and filter system
