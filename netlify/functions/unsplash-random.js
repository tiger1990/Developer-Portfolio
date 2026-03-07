export const handler = async (event, context) => {
    try {
      const accessKey = process.env.UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Missing Unsplash access key' }),
        };
      }

      const url = 'https://api.unsplash.com/photos/random?query=motivation,success,growth,inspiration&orientation=landscape&content_filter=high';

      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      });
  
      if (!response.ok) {
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: 'Error calling Unsplash' }),
        };
      }
  
      const data = await response.json();
  
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // adjust or restrict if needed
        },
        body: JSON.stringify(data),
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server error' }),
      };
    }
  };