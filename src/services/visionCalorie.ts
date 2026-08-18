// Photo -> calorie estimation.
//
// This calls a vision-capable LLM (Anthropic Claude) directly from the app with a
// user-supplied API key (entered in Settings, stored locally on-device only).
// That is fine for personal / hobby use, but shipping this to an app store should
// route the request through your own backend instead of embedding a key on-device.
//
// Swap ESTIMATE_MODEL or the whole callVisionApi implementation to point at a
// different provider (OpenAI, Google, a self-hosted model, a food-recognition
// API like LogMeal/CalorieMama) without touching any UI code.

export interface EstimatedFoodItem {
  name: string;
  estimatedGrams: number;
  caloriesPer100g: number;
  calories: number;
}

export interface PhotoEstimate {
  items: EstimatedFoodItem[];
  totalCalories: number;
  notes: string;
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ESTIMATE_MODEL = 'claude-sonnet-5';

const SYSTEM_PROMPT = `You are a nutrition estimation assistant embedded in a fitness app.
Given a photo of a meal, identify each distinct food item, estimate its portion size in
grams from visual cues, and estimate calories per 100g and total calories for that portion.
Respond with ONLY compact JSON, no markdown fences, matching exactly this shape:
{"items":[{"name":string,"estimatedGrams":number,"caloriesPer100g":number,"calories":number}],"totalCalories":number,"notes":string}
"notes" should be a one-sentence caveat about estimation uncertainty. Be realistic, not overly
precise - portion and calorie estimates from a photo are inherently approximate.`;

export async function estimateCaloriesFromPhoto(
  base64Image: string,
  apiKey: string,
  mediaType: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<PhotoEstimate> {
  if (!apiKey) {
    throw new Error('No API key configured. Add one in Settings to enable photo estimation.');
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ESTIMATE_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } },
            { type: 'text', text: 'Estimate the calories in this meal photo.' },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Vision API error (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.content?.[0]?.text;
  if (!text) throw new Error('Vision API returned no content.');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse estimate from model response.');

  const parsed = JSON.parse(jsonMatch[0]) as PhotoEstimate;
  if (!Array.isArray(parsed.items)) throw new Error('Malformed estimate response.');
  return parsed;
}
