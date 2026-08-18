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

// Swap this for a different capability/cost tradeoff. Roughly what one meal
// photo costs (~1.7k input tokens for the image and prompt, ~200 output):
//   claude-opus-5    $5 / $25 per 1M tokens  -> ~1.4c per photo (most capable)
//   claude-sonnet-5  $3 / $15 per 1M         -> ~0.8c per photo
//   claude-haiku-4-5 $1 / $5  per 1M         -> ~0.3c per photo (cheapest)
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

  // Never index content[0] blindly. Current models run adaptive thinking when
  // the `thinking` parameter is omitted, so the first block is usually a
  // `thinking` block whose text is empty by default — reading [0].text would
  // make every estimate fail with "returned no content". Take the text blocks.
  const blocks: { type?: string; text?: string }[] = Array.isArray(data?.content) ? data.content : [];
  const text = blocks
    .filter((b) => b?.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('')
    .trim();

  if (!text) {
    // A safety refusal comes back as HTTP 200 with stop_reason "refusal", so it
    // has to be distinguished from an genuinely empty response.
    if (data?.stop_reason === 'refusal') {
      throw new Error('The model declined to analyse this photo. Try a different image.');
    }
    throw new Error('Vision API returned no content.');
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse estimate from model response.');

  const parsed = JSON.parse(jsonMatch[0]) as PhotoEstimate;
  if (!Array.isArray(parsed.items)) throw new Error('Malformed estimate response.');
  return parsed;
}
