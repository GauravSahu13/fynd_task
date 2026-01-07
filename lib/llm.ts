import axios from 'axios';

interface LLMConfig {
  useOllama: boolean;
  ollamaUrl: string;
  ollamaModel: string;
  grokApiKey: string;
  grokUrl: string;
  openrouterApiKey: string;
  openrouterUrl: string;
}

const config: LLMConfig = {
  useOllama: process.env.USE_OLLAMA === 'true' || !process.env.GROK_API_KEY && !process.env.OPENROUTER_API_KEY,
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434/api/generate',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2',
  grokApiKey: process.env.GROK_API_KEY || '',
  grokUrl: process.env.GROK_URL || 'https://api.x.ai/v1/chat/completions',
  openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openrouterUrl: process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions',
};

export async function callLLM(prompt: string, modelType: 'ollama' | 'grok' | 'openrouter' = 'ollama'): Promise<string> {
  try {
    if (modelType === 'ollama' && config.useOllama) {
      const response = await axios.post(
        config.ollamaUrl,
        {
          model: config.ollamaModel,
          prompt: prompt,
          stream: false,
        },
        { timeout: 30000 }
      );
      return response.data.response || '';
    }

    if (modelType === 'grok' && config.grokApiKey) {
      const response = await axios.post(
        config.grokUrl,
        {
          model: 'grok-beta',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Authorization': `Bearer ${config.grokApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      return response.data.choices[0].message.content || '';
    }

    if (modelType === 'openrouter' && config.openrouterApiKey) {
      const response = await axios.post(
        config.openrouterUrl,
        {
          model: 'openai/gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Authorization': `Bearer ${config.openrouterApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      return response.data.choices[0].message.content || '';
    }

    // Fallback: try Ollama if available
    if (config.useOllama) {
      try {
        const response = await axios.post(
          config.ollamaUrl,
          {
            model: config.ollamaModel,
            prompt: prompt,
            stream: false,
          },
          { timeout: 30000 }
        );
        return response.data.response || '';
      } catch (error) {
        console.error('Ollama fallback failed:', error);
      }
    }

    // Final fallback
    return 'Thank you for your review. We appreciate your feedback!';
  } catch (error: any) {
    console.error('LLM API Error:', error.message);
    return 'Thank you for your review. We appreciate your feedback!';
  }
}

export async function generateUserResponse(rating: number, reviewText: string): Promise<string> {
  const prompt = `You are a friendly customer service representative. A customer has submitted a ${rating}-star review:

"${reviewText}"

Generate a warm, professional, and personalized response (2-3 sentences) that:
- Acknowledges their feedback
- Shows appreciation for their input
- If rating is 3 or below, expresses commitment to improvement
- If rating is 4 or 5, thanks them for their positive feedback

Keep it concise and genuine.`;

  return await callLLM(prompt);
}

export async function generateSummary(rating: number, reviewText: string): Promise<string> {
  const prompt = `Summarize this ${rating}-star restaurant review in 1-2 sentences:

"${reviewText}"

Provide a concise summary highlighting the key points.`;

  return await callLLM(prompt);
}

export async function generateRecommendedActions(rating: number, reviewText: string): Promise<string> {
  const prompt = `Based on this ${rating}-star restaurant review, suggest 2-3 specific recommended actions for the restaurant management:

Review: "${reviewText}"

Provide actionable recommendations in a bullet-point format. Focus on concrete steps the restaurant can take.`;

  return await callLLM(prompt);
}

