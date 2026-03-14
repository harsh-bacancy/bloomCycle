type AiInsightInput = {
  cycleLengths: number[];
  cycleAverage: number;
  cycleStdDev: number;
  topSymptomType?: string;
  topSymptomCount: number;
  totalSymptoms: number;
  phaseCounts: Record<string, number>;
  pregnancyWeek: number | null;
};

function buildFallbackSummary(input: AiInsightInput) {
  const lines: string[] = [];

  if (input.cycleLengths.length >= 2) {
    lines.push(
      `Your recent average cycle length is about ${Math.round(input.cycleAverage)} days with variability around ${input.cycleStdDev.toFixed(1)} days.`,
    );
  } else {
    lines.push("There is not enough cycle history yet for a stable cycle-length pattern.");
  }

  if (input.totalSymptoms > 0 && input.topSymptomType) {
    lines.push(
      `Most frequently logged symptom category is ${input.topSymptomType} (${input.topSymptomCount} of ${input.totalSymptoms} total symptom entries).`,
    );
  } else {
    lines.push("Symptom data is still limited, so pattern confidence is low.");
  }

  if (input.pregnancyWeek && input.pregnancyWeek > 0) {
    lines.push(`Pregnancy context: currently around week ${input.pregnancyWeek}.`);
  }

  lines.push("Use this as supportive trend context, not as a diagnosis.");
  return lines;
}

function parseBullets(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .map((line) => line.replace(/^[-*•]\s*/, ""))
    .filter(Boolean);

  return lines.slice(0, 5);
}

export async function generateAiInsightsSummary(input: AiInsightInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { points: buildFallbackSummary(input), source: "fallback" as const };
  }

  const systemPrompt =
    "You are a women's health tracking assistant. Provide a concise, supportive, non-diagnostic summary in 4-5 bullet points. Avoid medical diagnosis. Be specific to the provided numbers.";

  const userPrompt = [
    "Create a short insight summary for this user data:",
    `- cycle lengths: ${input.cycleLengths.join(", ") || "none"}`,
    `- cycle average: ${input.cycleAverage.toFixed(2)}`,
    `- cycle stddev: ${input.cycleStdDev.toFixed(2)}`,
    `- total symptom logs: ${input.totalSymptoms}`,
    `- top symptom type: ${input.topSymptomType ?? "none"} (${input.topSymptomCount})`,
    `- phase counts: ${JSON.stringify(input.phaseCounts)}`,
    `- pregnancy week: ${input.pregnancyWeek ?? "not pregnant"}`,
    "Return only bullet points. Include one practical next tracking suggestion and one short safety reminder.",
  ].join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.3,
        max_output_tokens: 220,
        input: [
          { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
          { role: "user", content: [{ type: "input_text", text: userPrompt }] },
        ],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return { points: buildFallbackSummary(input), source: "fallback" as const };
    }

    const data = (await response.json()) as { output_text?: string };
    const text = data.output_text?.trim();

    if (!text) {
      return { points: buildFallbackSummary(input), source: "fallback" as const };
    }

    const points = parseBullets(text);
    if (!points.length) {
      return { points: buildFallbackSummary(input), source: "fallback" as const };
    }

    return { points, source: "openai" as const };
  } catch {
    return { points: buildFallbackSummary(input), source: "fallback" as const };
  }
}
