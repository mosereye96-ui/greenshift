exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return { statusCode: 500, body: JSON.stringify({ error: 'Missing API token' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { image } = body;
  if (!image) return { statusCode: 400, body: JSON.stringify({ error: 'No image provided' }) };

  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: '39ed52f2319f9b691a06d9b73e3e2aa27b396c93d9aada4e6f0e75979b8db8ca',
      input: {
        image: image,
        prompt: 'backyard with lush green artificial turf grass, perfectly installed synthetic lawn, professional landscaping, photorealistic, high quality, 4k',
        negative_prompt: 'dead grass, weeds, dirt, mud, ugly, blurry, low quality',
        prompt_strength: 0.7,
        num_inference_steps: 30,
        guidance_scale: 7.5
      }
    })
  });

  const prediction = await res.json();
  if (!prediction.id) return { statusCode: 500, body: JSON.stringify({ error: 'Failed to start', detail: prediction }) };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: prediction.id })
  };
};
