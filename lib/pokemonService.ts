import { Pokemon, Region } from '@/types/pokemon';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const CACHE_KEY = 'pokemon_cache_v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Region mapping based on generation
const REGION_DATA: Record<Region, { generation: number; range: [number, number]; color: string }> = {
  kanto: { generation: 1, range: [1, 151], color: '#FF6B6B' },
  johto: { generation: 2, range: [152, 251], color: '#4ECDC4' },
  hoenn: { generation: 3, range: [252, 386], color: '#45B7D1' },
  sinnoh: { generation: 4, range: [387, 493], color: '#96CEB4' },
  unova: { generation: 5, range: [494, 649], color: '#FFEAA7' },
  kalos: { generation: 6, range: [650, 721], color: '#DFE6E9' },
  alola: { generation: 7, range: [722, 809], color: '#FD79A8' },
  galar: { generation: 8, range: [810, 905], color: '#A29BFE' },
  paldea: { generation: 9, range: [906, 1025], color: '#6C5CE7' },
};

export class PokemonService {
  private cache: Map<number, Pokemon> = new Map();

  /**
   * Fetch a single Pokemon by ID
   */
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

  /**
   * Fetch a range of Pokemon
   */
  async fetchRange(start: number, end: number): Promise<Pokemon[]> {
    const promises = [];
    for (let i = start; i <= end; i++) {
      promises.push(this.fetchPokemon(i));
    }
    return Promise.all(promises);
  }

  /**
   * Fetch Pokemon by generation
   */
  async fetchGeneration(generation: number): Promise<Pokemon[]> {
    const region = this.getRegionByGeneration(generation);
    if (!region) {
      throw new Error(`Invalid generation: ${generation}`);
    }

    const [start, end] = REGION_DATA[region].range;
    return this.fetchRange(start, end);
  }

  /**
   * Fetch from PokeAPI and transform data
   */
  private async fetchFromAPI(id: number): Promise<Pokemon> {
    try {
      const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Pokemon ${id}: ${response.statusText}`);
      }

      const data = await response.json();

      // Get species data for additional info
      const speciesResponse = await fetch(data.species.url);
      const speciesData = await speciesResponse.json();

      // Extract English flavor text (description)
      const englishFlavorText = speciesData.flavor_text_entries?.find(
        (entry: any) => entry.language.name === 'en'
      );
      const description = englishFlavorText
        ? englishFlavorText.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ')
        : 'A mysterious Pokemon with unique characteristics.';

      // Extract category (genus)
      const englishGenus = speciesData.genera?.find(
        (genus: any) => genus.language.name === 'en'
      );
      const category = englishGenus ? englishGenus.genus : 'Unknown Pokemon';

      // Transform API response to our Pokemon interface
      const pokemon: Pokemon = {
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
        imageUrl: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        sprites: {
          normal: data.sprites.front_default,
          shiny: data.sprites.front_shiny,
          artwork: data.sprites.other['official-artwork'].front_default,
        },
        generation: this.getGeneration(data.id),
        region: this.getRegion(data.id),
        legendaryStatus: speciesData.is_legendary ? 'legendary' :
                        speciesData.is_mythical ? 'mythical' : 'normal',
        description,
        category,
        searchTerms: this.generateSearchTerms(data.name, data.types),
      };

      return pokemon;
    } catch (error) {
      console.error(`Error fetching Pokemon ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get generation from Pokemon ID
   */
  private getGeneration(id: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 {
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

  /**
   * Get region from Pokemon ID
   */
  private getRegion(id: number): Region {
    const regions: Region[] = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];
    return regions[this.getGeneration(id) - 1];
  }

  /**
   * Get region by generation number
   */
  private getRegionByGeneration(generation: number): Region | null {
    const entry = Object.entries(REGION_DATA).find(([_, data]) => data.generation === generation);
    return entry ? (entry[0] as Region) : null;
  }

  /**
   * Generate search terms for a Pokemon
   */
  private generateSearchTerms(name: string, types: any[]): string[] {
    const terms = [
      name,
      name.toLowerCase(),
      ...types.map((t: any) => t.type.name),
    ];
    return [...new Set(terms)]; // Remove duplicates
  }

  /**
   * Get cached Pokemon from localStorage
   */
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

  /**
   * Cache Pokemon to localStorage
   */
  private cachePokemon(id: number, pokemon: Pokemon): void {
    try {
      localStorage.setItem(
        `${CACHE_KEY}_${id}`,
        JSON.stringify({ data: pokemon, timestamp: Date.now() })
      );
    } catch {
      // localStorage full, ignore
      console.warn(`Failed to cache Pokemon ${id}: localStorage quota exceeded`);
    }
  }

  /**
   * Clear all cached Pokemon
   */
  clearCache(): void {
    this.cache.clear();
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY)) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      console.warn('Failed to clear localStorage cache');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { memorySize: number; localStorageSize: number } {
    return {
      memorySize: this.cache.size,
      localStorageSize: Object.keys(localStorage).filter(k => k.startsWith(CACHE_KEY)).length,
    };
  }
}

// Export singleton instance
export const pokemonService = new PokemonService();
