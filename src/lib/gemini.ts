import { GoogleGenerativeAI } from '@google/generative-ai';

interface Joke {
  style: string;
  theme: string;
  setup?: string;
  punchline?: string;
  content: string;
}

interface Story {
  genre: string;
  theme: string;
  title: string;
  content: string;
  moral?: string;
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

export const getStory = async (): Promise<Story[]> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });

  const prompt = `You are **StoryWeaver**, an AI designed to craft engaging and meaningful stories on demand.

**Instructions:**
1. **Produce 3 stories** per request, each in a **different genre** (e.g., fantasy, mystery, adventure, sci-fi, fable).
2. **Randomize the theme** of each story by selecting from a broad list (e.g., friendship, courage, wisdom, discovery, redemption).
3. **Ensure zero overlap** in subject matter or structure across the stories.
4. **Keep them concise** (2-3 paragraphs each at least) and **family-friendly**.
5. **Include a title** and optional **moral lesson** for each story.
6. **Label each story** with its genre and theme.
7. **Make them engaging**: create vivid imagery, interesting characters, and meaningful plots.

**IMPORTANT: Follow this EXACT format for each story, including the numbering and markdown formatting:**

1. **Genre:** [Genre Name]
   **Theme:** [Theme Name]
   **Title:** "[Story Title]"
   **Story:** [Story content here, 2-3 paragraphs]
   **Moral:** "[Moral lesson]"

2. **Genre:** [Genre Name]
   **Theme:** [Theme Name]
   **Title:** "[Story Title]"
   **Story:** [Story content here, 2-3 paragraphs]
   **Moral:** "[Moral lesson]"

3. **Genre:** [Genre Name]
   **Theme:** [Theme Name]
   **Title:** "[Story Title]"
   **Story:** [Story content here, 2-3 paragraphs]
   **Moral:** "[Moral lesson]"

**Example of a properly formatted story:**
1. **Genre:** Fantasy
   **Theme:** Friendship
   **Title:** "The Magical Garden"
   **Story:** In a world where plants could talk, there was a special garden tended by a young girl named Lily. Every day, she would water the flowers and trees, listening to their stories and dreams. The garden was her best friend, and she knew every plant by name.

One day, a terrible storm threatened to destroy the garden. The plants were terrified, but Lily stayed with them, using her knowledge of each plant's needs to protect them. She worked tirelessly through the night, and when morning came, the garden was safe.

The plants had never felt so loved, and from that day on, they grew more beautiful than ever before, creating a magical display of colors and scents that brought joy to everyone who visited.
   **Moral:** "True friendship grows stronger through shared challenges"

Now, please generate three unique stories following this exact format.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw story response:', text);
    
    // Parse the response into structured stories
    const stories: Story[] = [];
    const storyBlocks = text.split(/\d+\.\s+/).filter(block => block.trim());
    
    console.log('Number of story blocks found:', storyBlocks.length);
    
    for (const block of storyBlocks) {
      // Skip any introductory text
      if (block.includes('Example of a properly formatted story:') || 
          block.includes('Now, please generate') ||
          block.includes('You are **StoryWeaver**')) {
        continue;
      }
      
      console.log('Processing block:', block);
      
      // Extract genre and theme
      const genreMatch = block.match(/\*\*Genre:\*\*\s*([^\n]+)/i);
      const themeMatch = block.match(/\*\*Theme:\*\*\s*([^\n]+)/i);
      
      // Extract title
      const titleMatch = block.match(/\*\*Title:\*\*\s*"([^"]+)"/i);
      
      // Extract story content - everything between **Story:** and **Moral:** or end of block
      const storyContentMatch = block.match(/\*\*Story:\*\*([\s\S]*?)(?=\s*\*\*Moral:\*\*|$)/i);
      
      // Extract moral if present
      const moralMatch = block.match(/\*\*Moral:\*\*\s*"([^"]+)"/i);
      
      console.log('Matches found:', { 
        genre: genreMatch?.[1], 
        theme: themeMatch?.[1], 
        title: titleMatch?.[1],
        storyContent: storyContentMatch?.[1]?.trim()?.substring(0, 50) + '...',
        moral: moralMatch?.[1]
      });
      
      if (genreMatch && themeMatch && titleMatch && storyContentMatch) {
        const story: Story = {
          genre: genreMatch[1].trim(),
          theme: themeMatch[1].trim(),
          title: titleMatch[1].trim(),
          content: storyContentMatch[1].trim(),
        };
        
        if (moralMatch) {
          story.moral = moralMatch[1].trim();
        }
        
        stories.push(story);
      } else {
        console.log('Failed to parse story block:', block);
      }
    }
    
    console.log('Final stories array:', stories);
    
    if (stories.length === 0) {
      console.log('No stories were parsed successfully, returning fallback story');
      return [{
        genre: 'Fable',
        theme: 'Wisdom',
        title: "The Wise Owl's Lesson",
        content: "Once there was a wise old owl who taught young animals about the importance of patience and observation. Through his gentle guidance, they learned that rushing to conclusions often leads to mistakes.",
        moral: "Take time to observe and learn before making decisions."
      }];
    }
    
    return stories;
  } catch (error) {
    console.error('Error generating stories:', error);
    return [{
      genre: 'Fable',
      theme: 'Wisdom',
      title: "The Wise Owl's Lesson",
      content: "Once there was a wise old owl who taught young animals about the importance of patience and observation. Through his gentle guidance, they learned that rushing to conclusions often leads to mistakes.",
      moral: "Take time to observe and learn before making decisions."
    }];
  }
}; 