import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

let _genai = null;
function getGenAI() {
  if (!_genai) {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error('VITE_GEMINI_API_KEY is not set in .env');
    _genai = new GoogleGenAI({ apiKey: key });
  }
  return _genai;
}

export async function analyzeUrbanImage(base64Image) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an urban liveability expert. Analyze the provided image of an urban area and return a JSON object with:
{
  "overallScore": <number 0-100>,
  "categories": {
    "greenery": { "score": <0-100>, "observations": "<string>" },
    "infrastructure": { "score": <0-100>, "observations": "<string>" },
    "cleanliness": { "score": <0-100>, "observations": "<string>" },
    "accessibility": { "score": <0-100>, "observations": "<string>" },
    "safety": { "score": <0-100>, "observations": "<string>" }
  },
  "issues": ["<string>", ...],
  "suggestions": ["<string>", ...],
  "improvedImagePrompt": "<A detailed prompt to generate an improved version of this urban scene with the suggestions applied. Be specific about the improvements, describe the scene in detail including all visual elements.>"
}
Return ONLY valid JSON, no markdown.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
          {
            type: 'text',
            text: 'Analyze this urban area for liveability. Return JSON only.',
          },
        ],
      },
    ],
    max_tokens: 1500,
  });

  const text = response.choices[0].message.content.trim();
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1].trim());
    throw new Error('Failed to parse vision analysis response');
  }
}

export async function generateImprovedImage(prompt) {
  const response = await getGenAI().models.generateContent({
    model: 'gemini-2.0-flash-exp-image-generation',
    contents: prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  // Extract the image from the response parts
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      // Return as a data URL for direct use in <img> src
      const mimeType = part.inlineData.mimeType || 'image/png';
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('No image was generated in the response');
}
