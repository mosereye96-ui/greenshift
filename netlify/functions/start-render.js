exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return { statusCode: 500, body: JSON.stringify({ error: 'Missing API token' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { image } = body;
  if (!image) return { statusCode: 400, body: JSON.stringify({ error: 'No image provided' }) };

  // Strip data URL prefix if present, Replicate wants raw base64
  const base64 = image.replace(/^data:image\/\w+;base64,/, '');

  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait'
    },
    body: JSON.stringify({
      version: 'a00d0b7dcbb9c3fbb34ba87d2d5b46c56969c84a628bf778a7fdaec30b1b99c5',
      input: {
        image: `data:image/jpeg;base64,${base64}`,
        prompt: 'lush green artificial turf grass installed in backyard, synthetic lawn, professional landscaping, photorealistic',
        negative_prompt: 'dead grass, weeds, dirt, ugly, blurry',
        strength: 0.7,
        num_inference_steps: 20
      }
    })
  });

  const prediction = await res.json();
  
  if (prediction.error) {
    return { statusCode: 500, body: JSON.stringify({ error: prediction.error }) };
  }

  if (!prediction.id) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to start', detail: JSON.stringify(prediction) }) };
  }

  // If already done (Prefer: wait)
  if (prediction.status === 'succeeded') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: prediction.id, output: prediction.output })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: prediction.id })
  };
};
