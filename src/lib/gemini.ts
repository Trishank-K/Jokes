import { GoogleGenerativeAI } from '@google/generative-ai';

interface Joke {
  style: string;
  theme: string;
  setup?: string;
  punchline?: string;
  content: string;
}

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export const getJoke = async (): Promise<Joke[]> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });

  const prompt = `You are **CreativeJoker**, an AI designed to craft fresh, imaginative jokes on demand.  

**Instructions:**
1. **Produce 5 jokes** per request, each in a **different style** (e.g., pun, one‑liner, absurdist anecdote, observational humor, surreal).
2. **Randomize the theme** of each joke by selecting from a broad list (e.g., animals, tech, food, office life, relationships, sci‑fi, history, nature, sports, everyday mishaps).  
3. **Ensure zero overlap** in subject matter, punchlines, or structure across the five jokes.  
4. **Keep them concise** (1–3 sentences each) and **family‑friendly**, unless otherwise specified.  
5. **Include a one‑sentence "setup"** and a **one‑sentence "punchline"** for clarity.  
6. **Label each joke** with its style and theme.  
7. **Surprise me**: feel free to bend expectations, invent whimsical scenarios, or mash up unlikely ideas.

**Output format:**
1. **Style:** Pun  
   **Theme:** ___  
   **Joke:** "Setup…" / "Punchline…"  
2. **Style:** One‑liner  
   **Theme:** ___  
   **Joke:** "…"  
…  

Now—go wild and give me five entirely unique jokes!
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response into structured jokes
    const jokes: Joke[] = [];
    const jokeBlocks = text.split(/\d+\.\s+/).filter(block => block.trim());
    
    for (const block of jokeBlocks) {
      const styleMatch = block.match(/\*\*Style:\*\*\s*([^\n]+)/);
      const themeMatch = block.match(/\*\*Theme:\*\*\s*([^\n]+)/);
      const jokeMatch = block.match(/\*\*Joke:\*\*\s*"([^"]+)"(?:\s*\/\s*"([^"]+)")?/);
      
      if (styleMatch && themeMatch && jokeMatch) {
        const joke: Joke = {
          style: styleMatch[1].trim(),
          theme: themeMatch[1].trim(),
          content: jokeMatch[0].replace(/\*\*Joke:\*\*\s*/, '').trim(),
        };
        
        if (jokeMatch[2]) {
          joke.setup = jokeMatch[1].trim();
          joke.punchline = jokeMatch[2].trim();
        }
        
        jokes.push(joke);
      }
    }
    
    return jokes;
  } catch (error) {
    console.error('Error generating jokes:', error);
    return [{
      style: 'Fallback',
      theme: 'Programming',
      content: "Why did the programmer quit his job? Because he didn't get arrays! 😄",
      setup: "Why did the programmer quit his job?",
      punchline: "Because he didn't get arrays! 😄"
    }];
  }
}; 