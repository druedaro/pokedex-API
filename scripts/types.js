"use strict"

const TYPE_COLORS = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
};

const TYPE_TRANSLATIONS = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    electric: 'Eléctrico',
    grass: 'Planta',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero',
    fairy: 'Hada'
};

const STAT_NAMES = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SP.ATK',
    'special-defense': 'SP.DEF',
    speed: 'SPD'
};

class PokemonUtils {
    static formatName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    static formatStatName(statName) {
        return STAT_NAMES[statName] || statName.toUpperCase();
    }

    static getTypeColor(typeName) {
        return TYPE_COLORS[typeName] || '#68A090';
    }

    static translateType(typeName) {
        return TYPE_TRANSLATIONS[typeName.toLowerCase()] || this.formatName(typeName);
    }

    static formatHeight(height) {
        return (height / 10).toFixed(1); 
    }

    static formatWeight(weight) {
        return (weight / 10).toFixed(1); 
    }

    static formatPokemonId(id) {
        return id.toString().padStart(3, '0');
    }

    static cleanDescription(desc) {
        return desc.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    }
}

class Pokemon {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.sprites = data.sprites;
        this.types = data.types;
        this.stats = data.stats;
        this.height = data.height;
        this.weight = data.weight;
        this.abilities = data.abilities;
        this.species = data.species;
        this.abilitiesInSpanish = [];
    }

    get formattedName() {
        return PokemonUtils.formatName(this.name);
    }

    get formattedId() {
        return PokemonUtils.formatPokemonId(this.id);
    }

    get formattedHeight() {
        return PokemonUtils.formatHeight(this.height);
    }

    get formattedWeight() {
        return PokemonUtils.formatWeight(this.weight);
    }

    get primaryType() {
        return this.types[0]?.type.name || 'unknown';
    }

    get typeNames() {
        return this.types.map(t => t.type.name);
    }

    get formattedTypes() {
        return this.types.map(t => PokemonUtils.translateType(t.type.name));
    }

    get mainImage() {
        return this.sprites.other?.['official-artwork']?.front_default || this.sprites.front_default || '';
    }

    hasType(typeName) {
        return this.types.some(t => t.type.name === typeName);
    }

    matchesSearch(term) {
        const lower = term.toLowerCase();
        return this.name.toLowerCase().includes(lower) || this.id.toString().includes(lower);
    }
}

class PokemonStats {
    constructor(stats) {
        this.stats = stats;
    }

    getStat(statName) {
        const stat = this.stats.find(s => s.stat.name === statName);
        return stat ? stat.base_stat : 0;
    }

    getStatPercentage(statName, max = 200) {
        const value = this.getStat(statName);
        return Math.min((value / max) * 100, 100);
    }

    get formattedStats() {
        return this.stats.map(stat => ({
            name: PokemonUtils.formatStatName(stat.stat.name),
            value: stat.base_stat,
            percentage: this.getStatPercentage(stat.stat.name)
        }));
    }
}

class AppState {
    constructor() {
        this.pokemons = [];
        this.filteredPokemons = [];
        this.currentPokemon = null;
        this.currentIndex = 0;
        this.pokemonDescription = '';
        this.searchTerm = '';
        this.selectedType = '';
        this.loading = false;
        this.showList = false;
    }

    setPokemons(list) {
        this.pokemons = list;
        this.updateFilteredPokemons();
    }

    setCurrentPokemon(pokemon, index) {
        this.currentPokemon = pokemon;
        this.currentIndex = index;
    }

    setSearchTerm(term) {
        this.searchTerm = term;
        this.updateFilteredPokemons();
    }

    setSelectedType(type) {
        this.selectedType = type;
        this.updateFilteredPokemons();
    }

    updateFilteredPokemons() {
        this.filteredPokemons = this.pokemons.filter(p => {
            const matchSearch = !this.searchTerm || p.matchesSearch(this.searchTerm);
            const matchType = !this.selectedType || p.hasType(this.selectedType);
            return matchSearch && matchType;
        });
    }

    getAllTypes() {
        const types = new Set();
        this.pokemons.forEach(p => p.typeNames.forEach(t => types.add(t)));
        return Array.from(types).sort();
    }

    getAllTypesInSpanish() {
        const types = this.getAllTypes();
        return types.map(type => ({
            value: type,
            label: PokemonUtils.translateType(type)
        })).sort((a, b) => a.label.localeCompare(b.label));
    }

    getPreviousIndex() {
        return this.currentIndex > 0 ? this.currentIndex - 1 : this.filteredPokemons.length - 1;
    }

    getNextIndex() {
        return this.currentIndex < this.filteredPokemons.length - 1 ? this.currentIndex + 1 : 0;
    }
}

const appState = new AppState();