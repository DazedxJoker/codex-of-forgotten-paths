const fs = require('fs');
const path = require('path');

// Path to our data file
const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'quests.json');

// Helper to ensure data file exists
function ensureDataFile() {
  const dataDir = path.join(__dirname, '..', '..', 'data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create empty quests file if it doesn't exist
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
}

// Helper to read quests
function getQuests() {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

exports.handler = async (event) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    // Get quests from file
    const quests = getQuests();
    
    // Parse query parameters
    const params = event.queryStringParameters || {};
    let filteredQuests = [...quests];
    
    // Filter by character if specified
    if (params.character) {
      filteredQuests = filteredQuests.filter(q => 
        q.character.toLowerCase() === params.character.toLowerCase()
      );
    }
    
    // Filter by search term if specified
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredQuests = filteredQuests.filter(q => 
        q.quest.toLowerCase().includes(searchTerm) || 
        q.character.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by timestamp (newest first)
    filteredQuests.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(filteredQuests)
    };
  } catch (error) {
    console.error('Error getting quests:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to retrieve quests' })
    };
  }
};