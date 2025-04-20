const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// Helper to write quests
function saveQuests(quests) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(quests, null, 2));
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

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const data = JSON.parse(event.body);
    
    // Validate required fields
    if (!data.quest) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Quest text is required' })
      };
    }
    
    // Get existing quests
    const quests = getQuests();
    
    // Create new quest
    const newQuest = {
      id: crypto.randomUUID(),
      character: data.character || 'Anonymous',
      quest: data.quest,
      timestamp: new Date().toISOString()
    };
    
    // Add to quests array
    quests.push(newQuest);
    
    // Save to file
    saveQuests(quests);
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ 
        success: true,
        id: newQuest.id
      })
    };
  } catch (error) {
    console.error('Error submitting quest:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to submit quest' })
    };
  }
};