// netlify/functions/submit.js
const { getDatabase } = require('./util/db');
const crypto = require('crypto');

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
    let quests = [];
    const db = await getDatabase();
    
    try {
      const storedQuests = await db.get('quests');
      if (storedQuests) {
        quests = JSON.parse(storedQuests);
      }
    } catch (error) {
      console.error('Error reading from database:', error);
      // Continue with empty quests array
    }
    
    // Create new quest
    const newQuest = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      character: data.character || 'Anonymous',
      quest: data.quest,
      timestamp: new Date().toISOString()
    };
    
    // Add to quests array
    quests.push(newQuest);
    
    // Save to database
    await db.set('quests', JSON.stringify(quests));
    
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
