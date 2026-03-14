export type Article = {
  id: string;
  title: string;
  slug: string;
  body: string;
  topic: string | null;
  stage: string | null;
  language: string;
  is_premium: boolean;
  created_by?: string | null;
  published_at: string | null;
  created_at: string;
};

export const TOPICS = ["cycle", "fertility", "pregnancy", "postpartum", "baby"] as const;

export function stageFromGoal(goal?: string | null) {
  if (!goal) return null;
  if (goal === "pregnant") return "pregnancy";
  if (goal === "postpartum") return "postpartum";
  if (goal === "ttc") return "ttc";
  if (goal === "cycle_tracking") return "cycle";
  return null;
}

export function excerpt(markdown: string, limit = 160) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trim()}...`;
}

export function formatDate(input: string | null) {
  if (!input) return "Draft";
  return new Date(input).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function estimateReadMinutes(markdown: string) {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function simpleMarkdownToHtml(markdown: string) {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/^###\s+(.*)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.*)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n+/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

export function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
