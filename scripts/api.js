"use strict"

class PokemonAPI {
    static BASE_URL = 'https://pokeapi.co/api/v2';

    static async getPokemonList(limit = 151, offset = 0) {
        const res = await fetch(`${this.BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const data = await res.json();
        return data.results;
    }

    static async getPokemonDetails(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
    }

    static async getMultiplePokemonDetails(list) {
        const promises = list.map(p => this.getPokemonDetails(p.url));
        const results = await Promise.allSettled(promises);
        return results.filter(r => r.status === 'fulfilled').map(r => r.value);
    }

    static async getPokemonSpecies(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
    }

    static async getAbilityInSpanish(abilityUrl) {
        try {
            const res = await fetch(abilityUrl);
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
            const data = await res.json();
            const es = data.names.find(n => n.language.name === 'es');
            return es ? es.name : PokemonUtils.formatName(data.name);
        } catch {
            return 'Desconocida';
        }
    }

    static async getPokemonDescription(pokemon) {
        const species = await this.getPokemonSpecies(pokemon.species.url);
        const es = species.flavor_text_entries.find(e => e.language.name === 'es');
        const en = species.flavor_text_entries.find(e => e.language.name === 'en');
        return PokemonUtils.cleanDescription(es?.flavor_text || en?.flavor_text || 'Sin descripción.');
    }

    static async loadKantoPokemon() {
        console.log('Cargando lista de las 4 primeras gen...');
        const list = await this.getPokemonList(493, 0);
        console.log('Cargando detalles...');
        const details = await this.getMultiplePokemonDetails(list);

        const pokemons = await Promise.all(details.map(async data => {
            const p = new Pokemon(data);
            p.abilitiesInSpanish = await Promise.all(
                p.abilities.map(a => this.getAbilityInSpanish(a.ability.url))
            );
            return p;
        }));

        return pokemons.sort((a, b) => a.id - b.id);
    }

    static async searchPokemon(query) {
        try {
            const res = await fetch(`${this.BASE_URL}/pokemon/${query.toLowerCase()}`);
            if (!res.ok) throw new Error('No encontrado');
            const data = await res.json();
            const p = new Pokemon(data);
            p.abilitiesInSpanish = await Promise.all(
                p.abilities.map(a => this.getAbilityInSpanish(a.ability.url))
            );
            return p;
        } catch {
            return null;
        }
    }
}

async function loadInitialData() {
    try {
        appState.loading = true;
        updateLoadingState();

        const pokemons = await PokemonAPI.loadKantoPokemon();
        appState.setPokemons(pokemons);

        if (appState.filteredPokemons.length > 0) {
            appState.setCurrentPokemon(appState.filteredPokemons[0], 0);
            await loadPokemonDescription(appState.currentPokemon);
        }

        appState.loading = false;
        updateLoadingState();
        updateUI();
    } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        appState.loading = false;
        updateLoadingState();
        showError('Error al cargar los datos. Recarga la página.');
    }
}

async function loadPokemonDescription(pokemon) {
    try {
        const desc = await PokemonAPI.getPokemonDescription(pokemon);
        appState.pokemonDescription = desc;
        updateLeftScreen();
    } catch (err) {
        console.error('Error loading Pokemon description:', err);
        appState.pokemonDescription = 'Error al cargar la descripción.';
        updateLeftScreen();
    }
}

function showError(msg) {
    document.getElementById('left-screen').innerHTML = `
        <div class="text-center text-red-400">ERROR</div>
        <div class="text-sm">${msg}</div>
    `;
}
