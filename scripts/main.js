"use strict";

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadInitialData();
        setupEventListeners();
    } catch (error) {
        console.error('Error inicializando la Pokédex:', error);
        showError('Error al cargar la Pokédex. Recarga la página.');
    }
});

function setupEventListeners() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const searchInput = document.getElementById('search-input');
    const listBtn = document.getElementById('list-btn');
    const typeFilter = document.getElementById('type-filter');

    prevBtn.addEventListener('click', async () => {
        const newIndex = appState.getPreviousIndex();
        const newPokemon = appState.filteredPokemons[newIndex];
        appState.setCurrentPokemon(newPokemon, newIndex);
        await loadPokemonDescription(newPokemon);
        updateUI();
    });

    nextBtn.addEventListener('click', async () => {
        const newIndex = appState.getNextIndex();
        const newPokemon = appState.filteredPokemons[newIndex];
        appState.setCurrentPokemon(newPokemon, newIndex);
        await loadPokemonDescription(newPokemon);
        updateUI();
    });

    searchInput.addEventListener('input', async (e) => {
        appState.setSearchTerm(e.target.value.trim());
        if (appState.filteredPokemons.length > 0) {
            const first = appState.filteredPokemons[0];
            appState.setCurrentPokemon(first, 0);
            await loadPokemonDescription(first);
        } else {
            appState.currentPokemon = null;
        }
        updateUI();
    });

    listBtn.addEventListener('click', () => {
        appState.showList = !appState.showList;
        togglePokemonList();
    });

    typeFilter.addEventListener('change', async (e) => {
        appState.setSelectedType(e.target.value);
        if (appState.filteredPokemons.length > 0) {
            const first = appState.filteredPokemons[0];
            appState.setCurrentPokemon(first, 0);
            await loadPokemonDescription(first);
        } else {
            appState.currentPokemon = null;
        }
        updateUI();
    });
}

function togglePokemonList() {
    const listSection = document.getElementById('pokemon-list');
    if (appState.showList) {
        listSection.classList.remove('hidden');
    } else {
        listSection.classList.add('hidden');
    }
}
