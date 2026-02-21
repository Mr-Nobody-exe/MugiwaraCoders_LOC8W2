import groq from '../config/groq.js';

// Mock PPT text extraction — swap for a real library like pptx2json in production
export const extractTextFromPPT = async (_fileBuffer, filename) => {
  return `Mock extracted text from ${filename}. Slide 1: Introduction. Slide 2: Problem. Slide 3: Solution. Slide 4: Tech Stack. Slide 5: Business Model.`;
};

export const evaluatePPT = async (extractedText) => {
  const prompt = `
You are a hackathon judge evaluating a project presentation. Based on the following extracted PPT text, provide scores (0-10) for each criterion with brief reasoning.

PPT Content:
${extractedText}

Respond ONLY in this exact JSON format:
{
  "innovation": { "score": 7, "reason": "brief reason" },
  "feasibility": { "score": 6, "reason": "brief reason" },
  "presentation": { "score": 8, "reason": "brief reason" },
  "technicalDepth": { "score": 5, "reason": "brief reason" },
  "impact": { "score": 7, "reason": "brief reason" },
  "summary": "One paragraph overall summary"
}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile', // Fast Groq model (or 'mixtral-8x7b-32768', 'gemma2-9b-it')
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 600,
  });

  const rawText = response.choices[0].message.content;

  try {
    const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    return { parsed, raw: rawText };
  } catch {
    return { parsed: null, raw: rawText };
  }
};