// Pulls real product-usage numbers from Supabase for the pitch deck's
// Traction slide: total signed-up users, AI generation usage by type, and
// 7-day feature retention. These come from SQL views defined in
// "Spinel Server/migrations/023_analytics_views.sql"
// (v_signups, v_ai_generation_usage, v_feature_retention) -- product-specific
// numbers, not generic web traffic. Run by .github/workflows/update-traction.yml
// on a daily cron -- writes data/traction.json, which the deck fetches at load
// time and shows "pending" (no fabricated numbers) on any failure -- including
// when the deck is opened via file://, or before this workflow has ever run
// successfully. No npm dependencies: a plain authenticated REST GET against
// Supabase's PostgREST API (service-role key), matching this repo's
// zero-dependency philosophy.
//
// Time-to-first-value (v_time_to_first_value_summary) is back as the MEDIAN
// (migration 029) now that migration 028 excludes the founder/dogfood account
// and floors the cohort at instrumentation go-live (2026-07-05). The old
// straight-mean ~59h was an artifact of one pre-instrumentation dogfood account
// plus a couple of genuine late-returners; the median is ~5 min.
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

// Exact row count via PostgREST's HEAD + Prefer:count=exact convention --
// avoids pulling every signup row just to know how many there are.
async function fetchExactCount(name) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + name + "?select=user_id", {
    method: "HEAD",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: "Bearer " + SERVICE_ROLE_KEY,
      Prefer: "count=exact",
    },
  });
  if (!res.ok) throw new Error("Supabase count " + name + " error " + res.status + ": " + (await res.text()));
  const range = res.headers.get("content-range"); // e.g. "*/42"
  return range ? Number(range.split("/")[1]) : null;
}

const [signupTotal, genRows, retRows, ttfvRows] = await Promise.all([
  fetchExactCount("v_signups"),
  fetchView("v_ai_generation_usage"),
  fetchView("v_feature_retention"),
  fetchView("v_time_to_first_value_summary"),
]);

const signups = signupTotal != null ? { total: signupTotal } : null;

// Median time to first value (seconds). Guarded so a pre-029 view (no
// median_ttfv_seconds column) simply yields null -> the tile stays "pending"
// rather than showing a fabricated or misleading number.
const ttfvRow = ttfvRows && ttfvRows[0];
const timeToValue =
  ttfvRow && ttfvRow.median_ttfv_seconds != null
    ? {
        medianSeconds: Number(ttfvRow.median_ttfv_seconds),
        usersWithValue:
          ttfvRow.users_with_value != null ? Number(ttfvRow.users_with_value) : null,
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
  JSON.stringify({ signups, timeToValue, generationUsage, featureRetention, updatedAt: new Date().toISOString() }, null, 2) + "\n"
);
console.log("Wrote data/traction.json");
