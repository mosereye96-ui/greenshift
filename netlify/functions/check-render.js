exports.handler = async function(event) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return { statusCode: 500, body: JSON.stringify({ error: 'Missing API token' }) };

  const id = event.queryStringParameters && event.queryStringParameters.id;
  if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'No prediction ID' }) };

  const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { 'Authorization': `Token ${token}` }
  });

  const prediction = await res.json();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: prediction.status,
      output: prediction.output,
      error: prediction.error
    })
  };
};
