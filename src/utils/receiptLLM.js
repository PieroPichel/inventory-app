export async function parseReceiptText(ocrText) {
  const prompt = `
You are a receipt parser. Extract purchased items from the following OCR text.

Return ONLY valid JSON in this format:
[
  { "name": "string", "qty": number }
]

Rules:
- Ignore prices, totals, VAT, discounts, store info.
- If quantity is not explicitly shown, assume qty = 1.
- Clean up abbreviations (e.g., "MLK 2PK" → "Milk").
- Do not include prices.
- Do not include empty or invalid lines.
- Do not include store metadata.

OCR text:
${ocrText}
`;

  const data = await response.json();
  console.log("LLM raw response:", data);

  try {
    const text = data.generated_text || data[0]?.generated_text || "";
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Failed to parse LLM JSON:", err);
    return [];
  }
}
