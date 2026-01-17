// ====================================
// GBA POKEDEX - FIRERED EDITION
// Vue.js Application
// ====================================

// Evolution Display Component (Recursive)
Vue.component('evolution-display', {
    props: ['chain'],
    template: `
        <div class="evolution-stage">
            <div class="evolution-item">
                <img
                    :src="getSpriteUrl(chain.species.url)"
                    :alt="chain.species.name"
                    class="evolution-sprite"
                >
                <div class="evolution-name">{{ capitalizeFirst(chain.species.name) }}</div>
            </div>
            <template v-if="chain.evolves_to && chain.evolves_to.length > 0">
                <span class="evolution-arrow">→</span>
                <evolution-display
                    v-for="(evolution, index) in chain.evolves_to"
                    :key="index"
                    :chain="evolution"
                ></evolution-display>
            </template>
        </div>
    `,
    methods: {
        getSpriteUrl(speciesUrl) {
            // Extract ID from species URL
            const id = speciesUrl.split('/').filter(Boolean).pop();
            return `assets/pokemon/${id}.png`;
        },
        capitalizeFirst(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    }
});

// Main Vue Instance
new Vue({
    el: '#app',
    data: {
        currentId: 1,
        searchQuery: '',
        pokemonData: null,
        speciesData: null,
        evolutionData: null,
        loading: false,
        maxPokemonId: 898 // Gen 1-8
    },
    methods: {
        // === API Methods ===

        async fetchPokemonComplete(id) {
            this.loading = true;
            this.pokemonData = null;
            this.speciesData = null;
            this.evolutionData = null;

            try {
                // 1. Fetch Pokemon data
                const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                if (!pokemonResponse.ok) {
                    throw new Error('Pokemon not found');
                }
                this.pokemonData = await pokemonResponse.json();
                this.currentId = this.pokemonData.id;

                // 2. Fetch Species data
                const speciesResponse = await fetch(this.pokemonData.species.url);
                this.speciesData = await speciesResponse.json();

                // 3. Fetch Evolution Chain data
                if (this.speciesData.evolution_chain) {
                    const evolutionResponse = await fetch(this.speciesData.evolution_chain.url);
                    this.evolutionData = await evolutionResponse.json();
                }

            } catch (error) {
                console.error('Error fetching Pokemon data:', error);
                this.pokemonData = null;
                this.speciesData = null;
                this.evolutionData = null;
            } finally {
                this.loading = false;
            }
        },

        // === Navigation Methods ===

        navigatePokemon(direction) {
            let newId = this.currentId;

            if (direction === 'prev') {
                newId = this.currentId > 1 ? this.currentId - 1 : this.maxPokemonId;
            } else if (direction === 'next') {
                newId = this.currentId < this.maxPokemonId ? this.currentId + 1 : 1;
            } else if (direction === 'random') {
                newId = Math.floor(Math.random() * this.maxPokemonId) + 1;
            }

            this.fetchPokemonComplete(newId);
        },

        searchPokemon() {
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) return;

            // Search by ID or name
            this.fetchPokemonComplete(query);
        },

        // === Formatting Methods ===

        formatId(id) {
            return String(id).padStart(3, '0');
        },

        capitalizeFirst(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        formatStatName(statName) {
            const statMap = {
                'hp': 'HP',
                'attack': 'ATTACK',
                'defense': 'DEFENSE',
                'special-attack': 'SP. ATK',
                'special-defense': 'SP. DEF',
                'speed': 'SPEED'
            };
            return statMap[statName] || statName.toUpperCase();
        },

        getStatPercentage(value) {
            // Max base stat is typically 200, but we'll cap display at 100%
            const maxStat = 200;
            return Math.min((value / maxStat) * 100, 100);
        },

        getStatLevel(value) {
            if (value >= 100) return 'high';
            if (value >= 60) return 'medium';
            return 'low';
        },

        getRomanNumeral(generationUrl) {
            const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
            const id = generationUrl.split('/').filter(Boolean).pop();
            return romanNumerals[parseInt(id) - 1] || id;
        },

        getFilteredEntries() {
            if (!this.speciesData || !this.speciesData.flavor_text_entries) {
                return [];
            }

            // Get unique English entries from different versions
            const englishEntries = this.speciesData.flavor_text_entries.filter(
                entry => entry.language.name === 'en'
            );

            // Get unique entries by version
            const uniqueEntries = [];
            const seenTexts = new Set();

            for (const entry of englishEntries) {
                // Clean up text (remove form feeds and newlines)
                const cleanText = entry.flavor_text
                    .replace(/\f/g, ' ')
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                if (!seenTexts.has(cleanText)) {
                    seenTexts.add(cleanText);
                    uniqueEntries.push({
                        version: this.capitalizeFirst(entry.version.name.replace('-', ' ')),
                        text: cleanText
                    });
                }
            }

            // Return up to 5 unique entries
            return uniqueEntries.slice(0, 5);
        },

        handleSpriteError(event) {
            // Fallback to PokeAPI sprite if local asset is missing
            if (this.pokemonData && this.pokemonData.sprites) {
                event.target.src = this.pokemonData.sprites.front_default ||
                                  this.pokemonData.sprites.other['official-artwork'].front_default;
            }
        }
    },

    // === Lifecycle Hooks ===

    mounted() {
        // Load Bulbasaur on start
        this.fetchPokemonComplete(1);

        // Add keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && !this.loading) {
                this.navigatePokemon('prev');
            } else if (e.key === 'ArrowRight' && !this.loading) {
                this.navigatePokemon('next');
            } else if (e.key === 'r' && !this.loading) {
                this.navigatePokemon('random');
            }
        });

        console.log('GBA Pokedex initialized!');
        console.log('Keyboard shortcuts:');
        console.log('  ← Previous Pokemon');
        console.log('  → Next Pokemon');
        console.log('  R Random Pokemon');
    }
});
