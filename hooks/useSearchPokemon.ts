import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { Pokemon } from '@/types/pokemon';

interface SearchOptions {
  threshold?: number; // 0.0 = exact match, 1.0 = match anything
  limit?: number; // Maximum number of results
}

export function useSearchPokemon(
  pokemon: Pokemon[],
  searchQuery: string,
  options: SearchOptions = {}
) {
  const { threshold = 0.3, limit = 50 } = options;

  // Create Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(pokemon, {
      keys: [
        { name: 'name', weight: 2 }, // Name is most important
        { name: 'types', weight: 1 },
        { name: 'abilities', weight: 0.5 },
      ],
      threshold,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true, // Search entire string
    });
  }, [pokemon, threshold]);

  const searchResults = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) {
      return pokemon;
    }

    const query = searchQuery.trim();

    // Check if searching by number (#025 or 25)
    const numberMatch = query.match(/^#?(\d+)$/);
    if (numberMatch) {
      const id = parseInt(numberMatch[1]);
      const found = pokemon.filter((p) => p.id === id);
      return found;
    }

    // Perform fuzzy search
    const results = fuse.search(query, { limit });
    
    // Sort by score (lower score = better match)
    const sorted = results
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .map((result) => result.item);

    return sorted;
  }, [searchQuery, pokemon, fuse, limit]);

  return {
    searchResults,
    hasResults: searchResults.length > 0,
    resultsCount: searchResults.length,
  };
}
