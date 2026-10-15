// Pulls real product-usage numbers from Supabase for the pitch deck's
// Traction slide: total signed-up users, median time to first value, AI
// generation usage by type, and 7-day feature retention. All of it comes from
// one aggregate RPC, public.pitch_traction() — defined in
// "Spinel Server/migrations/046_pitch_traction_rpc.sql" on top of the analytics
// views (v_signups, v_time_to_first_value_summary, v_ai_generation_usage,
// v_feature_retention) — product-specific numbers, not generic web traffic.
//
// The deck calls the same RPC itself on load (traction.js), so the numbers are
// live; this script keeps data/traction.json — the deck's fallback when that
// call fails — fresh. Run by .github/workflows/update-traction.yml on a daily
// cron. No npm dependencies: a plain REST POST against Supabase's PostgREST API
// (service-role key), matching this repo's zero-dependency philosophy.
//
// Why an RPC and not the views: since migrations 039/041 the views run with
// security_invoker, so reading v_signups as service_role hits
// "permission denied for table users" (403). The views stay locked; only the
// aggregates are exposed.
import { writeFile, mkdir } from "node:fs/promises";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not set");
if (!SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/pitch_traction", {
  method: "POST",
  headers: {
    apikey: SERVICE_ROLE_KEY,
    Authorization: "Bearer " + SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  },
  body: "{}",
});
if (!res.ok) throw new Error("Supabase rpc pitch_traction error " + res.status + ": " + (await res.text()));
const traction = await res.json();
if (!traction || !traction.signups) throw new Error("Supabase rpc pitch_traction returned no data");

await mkdir("data", { recursive: true });
await writeFile("data/traction.json", JSON.stringify(traction, null, 2) + "\n");
console.log("Wrote data/traction.json (" + traction.signups.total + " signups)");
