import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export const getJoke = async (): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });

  const prompt = `Tell me a funny joke that's appropriate for all ages. The joke should be engaging and have a good punchline. Format the response as just the joke text, without any additional commentary or formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating joke:', error);
    return "Why did the programmer quit his job? Because he didn't get arrays! 😄";
  }
}; 