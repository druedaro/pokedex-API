"use strict";

function updateUI() {
    updateLeftScreen();
    updateRightScreen();
    updatePokemonList();
    updateButtonsState();
    updateTypeFilter();
}

function updateLeftScreen() {
    const leftScreen = document.getElementById('left-screen');
    const pokemon = appState.currentPokemon;

    if (!pokemon) {
        leftScreen.innerHTML = '<div class="text-center text-green-400">NO DATA</div>';
        return;
    }

    let abilities = ['Desconocidas'];
    if (Array.isArray(pokemon.abilitiesInSpanish)) {
        abilities = pokemon.abilitiesInSpanish;
    } else if (Array.isArray(pokemon.abilities)) {
        abilities = pokemon.abilities.map(a => PokemonUtils.formatName(a.ability.name));
    }

    const typeBadges = pokemon.types.map(typeObj => {
        const typeName = typeObj.type.name;
        const spanishName = PokemonUtils.translateType(typeName);
        const backgroundColor = PokemonUtils.getTypeColor(typeName);
        
        return `<span class="inline-block px-3 py-1 rounded-full text-white text-sm font-medium mr-2 mb-1" style="background-color: ${backgroundColor};">${spanishName}</span>`;
    }).join('');

    leftScreen.innerHTML = `
        <div class="text-center">
            <img src="${pokemon.mainImage}" alt="${pokemon.formattedName}" class="mx-auto mb-2 pixelated max-h-48">
            <div class="text-lg font-bold">${pokemon.formattedName} (#${pokemon.formattedId})</div>
            <div class="mt-2 mb-2">${typeBadges}</div>
            <div class="mt-2 text-sm">${appState.pokemonDescription}</div>
            <div class="mt-2 text-sm">Altura: ${pokemon.formattedHeight} m</div>
            <div class="text-sm">Peso: ${pokemon.formattedWeight} kg</div>
            <div class="text-sm">Habilidades: ${abilities.join(', ')}</div>
        </div>
    `;
}

function updateRightScreen() {
    const rightScreen = document.getElementById('right-screen');
    const pokemon = appState.currentPokemon;

    if (!pokemon) {
        rightScreen.innerHTML = '<div class="text-center text-green-400">NO DATA</div>';
        return;
    }

    const stats = new PokemonStats(pokemon.stats);

    rightScreen.innerHTML = `
        <div class="space-y-1">
            ${stats.formattedStats.map(stat => `
                <div class="flex justify-between text-sm">
                    <span>${stat.name}</span>
                    <span>${stat.value}</span>
                </div>
                <div class="w-full bg-gray-800 rounded-full h-2 mb-1">
                    <div class="bg-green-400 h-2 rounded-full" style="width: ${stat.percentage}%;"></div>
                </div>
            `).join('')}
        </div>
    `;
}

function updatePokemonList() {
    const listContainer = document.getElementById('pokemon-grid');
    const count = document.getElementById('list-count');

    if (!appState.filteredPokemons) return;

    listContainer.innerHTML = appState.filteredPokemons.map(pokemon => `
        <div class="pokemon-item border border-green-400 p-2 rounded hover:bg-gray-700 transition-all cursor-pointer ${pokemon.id === appState.currentPokemon?.id ? 'active' : ''}"
            onclick="selectPokemonFromList(${pokemon.id})">
            ${pokemon.formattedName} (#${pokemon.formattedId})
        </div>
    `).join('');

    count.textContent = `${appState.filteredPokemons.length} ENTRADAS ENCONTRADAS`;
}

function updateButtonsState() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const hasPokemons = appState.filteredPokemons && appState.filteredPokemons.length > 0;

    prevBtn.disabled = !hasPokemons;
    nextBtn.disabled = !hasPokemons;
}

function updateTypeFilter() {
    const typeFilter = document.getElementById('type-filter');
    if (!typeFilter.options || typeFilter.options.length <= 1) {
        const typesInSpanish = appState.getAllTypesInSpanish();
        typesInSpanish.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value; 
            option.textContent = type.label; 
            typeFilter.appendChild(option);
        });
    }
}

function updateLoadingState() {
    const loadingScreen = document.getElementById('loading-screen');
    const pokedexMain = document.getElementById('pokedex-main');
    if (appState.loading) {
        loadingScreen.classList.remove('hidden');
        pokedexMain.classList.add('hidden');
    } else {
        loadingScreen.classList.add('hidden');
        pokedexMain.classList.remove('hidden');
    }
}

function selectPokemonFromList(id) {
    const index = appState.filteredPokemons.findIndex(p => p.id === id);
    if (index !== -1) {
        appState.setCurrentPokemon(appState.filteredPokemons[index], index);
        loadPokemonDescription(appState.currentPokemon);
        updateUI();
    }
}

function showError(msg) {
    document.getElementById('left-screen').innerHTML = `
        <div class="text-center text-red-400">ERROR</div>
        <div class="text-sm">${msg}</div>
    `;
}