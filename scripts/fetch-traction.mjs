// Pulls real product-usage numbers from Supabase for the pitch deck's
// Traction slide: time-to-first-value, AI generation usage by type, and
// 7-day feature retention. These come from SQL views defined in
// "Spinel Server/migrations/023_analytics_views.sql"
// (v_time_to_first_value_summary, v_ai_generation_usage, v_feature_retention)
// -- product-specific numbers, not generic web traffic. Run by
// .github/workflows/update-traction.yml on a daily cron -- writes
// data/traction.json, which the deck fetches at load time and shows
// "pending" (no fabricated numbers) on any failure -- including when the
// deck is opened via file://, or before this workflow has ever run
// successfully. No npm dependencies: a plain authenticated REST GET against
// Supabase's PostgREST API (service-role key), matching this repo's
// zero-dependency philosophy.
import { writeFile, mkdir } from "node:fs/promises";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not set");
if (!SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

async function fetchView(name) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + name + "?select=*", {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: "Bearer " + SERVICE_ROLE_KEY,
    },
  });
  if (!res.ok) throw new Error("Supabase view " + name + " error " + res.status + ": " + (await res.text()));
  return res.json();
}

const [ttfvRows, genRows, retRows] = await Promise.all([
  fetchView("v_time_to_first_value_summary"),
  fetchView("v_ai_generation_usage"),
  fetchView("v_feature_retention"),
]);

const ttfvRow = ttfvRows[0] || {};
const ttfv =
  ttfvRow.users_with_value != null
    ? {
        usersWithValue: Number(ttfvRow.users_with_value),
        avgSeconds: ttfvRow.avg_ttfv_seconds != null ? Math.round(Number(ttfvRow.avg_ttfv_seconds)) : null,
      }
    : null;

const generationUsage = genRows.length
  ? genRows.map((r) => ({ kind: r.kind, requests: Number(r.requests), users: Number(r.users) }))
  : null;

const featureRetention = retRows.length
  ? retRows.map((r) => ({
      feature: r.feature,
      totalFirstUsers: Number(r.total_first_users),
      repeatUsers: Number(r.repeat_users),
      // repeat_rate is a 0..1 fraction in the view; store as a percent (1 decimal).
      repeatRate: r.repeat_rate != null ? Math.round(Number(r.repeat_rate) * 1000) / 10 : 0,
    }))
  : null;

await mkdir("data", { recursive: true });
await writeFile(
  "data/traction.json",
  JSON.stringify({ ttfv, generationUsage, featureRetention, updatedAt: new Date().toISOString() }, null, 2) + "\n"
);
console.log("Wrote data/traction.json");
