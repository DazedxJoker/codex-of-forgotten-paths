// Temporary storage for demo purposes
// In a real app, you would use a database
const QUESTS = require('./quests').QUESTS;

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only accept POST
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
    
    // Create new quest
    const newQuest = {
      id: Date.now().toString(),
      character: data.character || 'Anonymous',
      quest: data.quest,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, you would save this to a database
    // For demo purposes, just log it
    console.log('New quest submitted:', newQuest);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Quest received! Note: For this demo, quests are not permanently saved.'
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to submit quest' })
    };
  }
};
