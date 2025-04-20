// netlify/functions/quests.js
const { getDatabase } = require('./util/db');

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
    // Initialize quests array
    let quests = [];
    
    try {
      // Try to get existing quests from KV store
      const db = await getDatabase();
      const storedQuests = await db.get('quests');
      if (storedQuests) {
        quests = JSON.parse(storedQuests);
      }
    } catch (error) {
      console.error('Error reading from database:', error);
      // Continue with empty quests array
    }
    
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
