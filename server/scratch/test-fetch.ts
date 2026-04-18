import 'dotenv/config';

async function testFetch() {
  console.log('API Key length:', process.env.AI_API_KEY?.length);
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-exp",
        "messages": [
          { "role": "user", "content": "Say hello" }
        ]
      })
    });
    const data: any = await response.json();
    if (response.ok) {
      console.log('Success:', data.choices[0].message.content);
    } else {
      console.error('Fetch Error:', response.status, data);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
}

testFetch();
