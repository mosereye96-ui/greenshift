exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return { statusCode: 500, body: JSON.stringify({ error: 'Missing API token' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { image } = body;
  if (!image) return { statusCode: 400, body: JSON.stringify({ error: 'No image provided' }) };

  const res = await fetch('https://api.replicate.com/v1/models/google/nano-banana-pro/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: {
        prompt: 'Replace all grass and dirt with lush green artificial turf, synthetic lawn, photorealistic',
        image_input: [image],
        aspect_ratio: 'match_input_image',
        output_format: 'jpg'
      }
    })
  });

  const prediction = await res.json();

  if (!prediction.id) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to start' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: prediction.id })
  };
};
