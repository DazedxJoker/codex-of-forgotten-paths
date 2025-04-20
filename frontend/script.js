// Configuration
const API_URL = "https://b81b3fac-32e9-404b-8a27-2678a06f3d64-00-3c73whxwpihsv.janeway.replit.dev";
// Change this to your API URL

// DOM Elements
const questsContainer = document.getElementById('quests-container');
const questDetail = document.getElementById('quest-detail');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resetButton = document.getElementById('reset-button');
const characterFilter = document.getElementById('character-filter');
const gridViewButton = document.getElementById('grid-view');
const listViewButton = document.getElementById('list-view');
const backButton = document.getElementById('back-button');

// State
let quests = [];
let filteredQuests = [];
let currentView = 'grid';
let characters = new Set();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchQuests();
    setupEventListeners();
});

// Fetch quests from API
async function fetchQuests() {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/quests`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        quests = await response.json();
        filteredQuests = [...quests];
        
        // Extract unique character names
        characters = new Set(quests.map(quest => quest.character));
        populateCharacterFilter();
        
        renderQuests();
    } catch (error) {
        console.error('Error fetching quests:', error);
        questsContainer.innerHTML = `
            <div class="error">
                <p>Failed to load quests. Please try again later.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

// Populate character filter dropdown
function populateCharacterFilter() {
    characterFilter.innerHTML = '<option value="">All Characters</option>';
    
    [...characters].sort().forEach(character => {
        const option = document.createElement('option');
        option.value = character;
        option.textContent = character;
        characterFilter.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Reset
    resetButton.addEventListener('click', resetSearch);
    
    // Character filter
    characterFilter.addEventListener('change', filterByCharacter);
    
    // View switching
    gridViewButton.addEventListener('click', () => switchView('grid'));
    listViewButton.addEventListener('click', () => switchView('list'));
    
    // Back button
    backButton.addEventListener('click', hideDetail);
}

// Search functionality
function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        resetSearch();
        return;
    }
    
    filteredQuests = quests.filter(quest => 
        quest.quest.toLowerCase().includes(searchTerm) || 
        quest.character.toLowerCase().includes(searchTerm)
    );
    
    renderQuests();
}

// Reset search
function resetSearch() {
    searchInput.value = '';
    characterFilter.value = '';
    filteredQuests = [...quests];
    renderQuests();
}

// Filter by character
function filterByCharacter() {
    const selectedCharacter = characterFilter.value;
    
    if (selectedCharacter === '') {
        filteredQuests = [...quests];
    } else {
        filteredQuests = quests.filter(quest => quest.character === selectedCharacter);
    }
    
    renderQuests();
}

// Switch view (grid/list)
function switchView(view) {
    currentView = view;
    
    if (view === 'grid') {
        questsContainer.className = 'grid-view';
        gridViewButton.classList.add('active');
        listViewButton.classList.remove('active');
    } else {
        questsContainer.className = 'list-view';
        listViewButton.classList.add('active');
        gridViewButton.classList.remove('active');
    }
    
    renderQuests();
}

// Render quests
function renderQuests() {
    if (filteredQuests.length === 0) {
        questsContainer.innerHTML = '<div class="no-results">No quests found matching your search.</div>';
        return;
    }
    
    questsContainer.innerHTML = '';
    
    filteredQuests.forEach(quest => {
        const card = document.createElement('div');
        card.className = 'quest-card';
        card.onclick = () => showQuestDetail(quest);
        
        // Format timestamp
        const timestamp = new Date(quest.timestamp);
        const formattedDate = timestamp.toLocaleDateString();
        const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Truncate quest text for preview
        const previewText = quest.quest.length > 150 
            ? quest.quest.substring(0, 150) + '...' 
            : quest.quest;
        
        card.innerHTML = `
            <div class="quest-header">
                <div class="character-name">${quest.character}</div>
                <div class="timestamp">${formattedDate}</div>
            </div>
            <div class="quest-content">
                <div class="quest-text">${previewText}</div>
                <div class="read-more">
                    <a>Read more</a>
                </div>
            </div>
        `;
        
        questsContainer.appendChild(card);
    });
}

// Show quest detail
function showQuestDetail(quest) {
    questsContainer.classList.add('hidden');
    questDetail.classList.remove('hidden');
    
    // Format timestamp
    const timestamp = new Date(quest.timestamp);
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const detailContent = questDetail.querySelector('.detail-content');
    detailContent.innerHTML = `
        <div class="detail-character">${quest.character}</div>
        <div class="detail-time">${formattedDate} at ${formattedTime}</div>
        <div class="detail-quest">${quest.quest}</div>
    `;
}

// Hide detail view
function hideDetail() {
    questDetail.classList.add('hidden');
    questsContainer.classList.remove('hidden');
}

// Show loading indicator
function showLoading() {
    questsContainer.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading quests...</p>
        </div>
    `;
}
