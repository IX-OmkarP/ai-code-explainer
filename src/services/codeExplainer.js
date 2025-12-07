import Groq from 'groq-sdk';

const getGroqClient = (apiKey) => {
  return new Groq({ apiKey, dangerouslyAllowBrowser: true });
};

const getSystemPrompt = () => {
  return `You are a code explainer. Explain code simply and clearly.

RULES:
1. Explain what the code does in plain English
2. DO NOT suggest fixes or improvements
3. DO NOT write new code
4. DO NOT include language name in response
5. Be concise - use short sentences
6. Group related lines together

FORMAT (follow EXACTLY):
**What this code does:**
[Write 4-5 lines explaining the overall purpose and functionality of the code. Include what problem it solves, what inputs it takes, what it returns/outputs, and the main approach used.]

**Explanation:**
[Clear explanation using bullet points]`;
};

export const explainCode = async (code, apiKey, language = 'JavaScript') => {
  if (!code.trim()) throw new Error('Please provide some code to explain.');
  if (!apiKey) throw new Error('API key not configured.');
  if (!apiKey.startsWith('gsk_')) throw new Error('Invalid API key format.');
  
  const groq = getGroqClient(apiKey);
  const systemPrompt = getSystemPrompt();

  const userPrompt = `Explain this ${language} code (do NOT fix or modify it, just explain):

\`\`\`
${code}
\`\`\``;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response received from AI.');
    return content;
  } catch (error) {
    console.error('Groq API Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    if (error.status === 401 || error.code === 'invalid_api_key') {
      throw new Error('Invalid API key. Please check config.json');
    }
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    if (error.status === 500 || error.status === 502 || error.status === 503) {
      throw new Error('AI service is temporarily unavailable. Please try again.');
    }
    if (error.message) throw new Error(`Error: ${error.message}`);
    throw new Error('An unexpected error occurred. Please try again.');
  }
};
