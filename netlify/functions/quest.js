// List of quests (in-memory since Netlify Functions are stateless)
// For demo purposes, we'll include some sample quests
const QUESTS = [
  {
    id: "1",
    character: "Arien",
    quest: "A small adventurer's journal has been left here. It describes a hidden alcove within the Aureliana Falls where a gemmed artifact was discovered under the spray.",
    timestamp: "2023-04-15T12:30:00Z"
  },
  {
    id: "2",
    character: "Tyron",
    quest: "This journal seems to have been dropped by a forgetful adventurer. It mentions a hidden cave behind the Dawnspear Mountains where a strange crystal artifact pulses with arcane energy.",
    timestamp: "2023-05-20T15:45:00Z"
  }
];

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

  try {
    // Get query parameters
    const params = event.queryStringParameters || {};
    let result = [...QUESTS];
    
    // Filter by character if specified
    if (params.character) {
      result = result.filter(q => 
        q.character.toLowerCase() === params.character.toLowerCase()
      );
    }
    
    // Filter by search term if specified
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      result = result.filter(q => 
        q.quest.toLowerCase().includes(searchTerm) || 
        q.character.toLowerCase().includes(searchTerm)
      );
    }
    
    // Return filtered quests
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to retrieve quests' })
    };
  }
};
