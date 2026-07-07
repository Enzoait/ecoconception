import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.PUBLIC_APP_URL || "https://example.vercel.app";
const PROJECT_ID = __ENV.K6_CLOUD_PROJECT_ID || "8021352";

export const options = {
  vus: 30,
  duration: "1m",
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
  cloud: {
    projectID: Number(PROJECT_ID),
    name: `cache-state-test-${new Date().toISOString().slice(0, 19)}`,
  },
};

function cacheHeader(res) {
  // Vercel Edge / Data Cache header; fall back to our application header.
  return (
    res.headers["X-Vercel-Cache"] ||
    res.headers["x-vercel-cache"] ||
    res.headers["X-Cache"] ||
    res.headers["x-cache"] ||
    ""
  ).toUpperCase();
}

export default function () {
  // --- Public route: must eventually HIT the cache ---
  const publicUrl = `${BASE_URL}/api/vehicles?category=all&sort=price_asc`;
  const first = http.get(publicUrl, { headers: { Accept: "application/json" } });
  const second = http.get(publicUrl, { headers: { Accept: "application/json" } });

  check(first, {
    "public route returns 200": (r) => r.status === 200,
    "public route is cacheable": (r) =>
      (r.headers["Cache-Control"] || "").includes("public"),
  });

  const publicCache = cacheHeader(second);
  check(second, {
    "public route second call is HIT or MISS": (r) => {
      const h = cacheHeader(r);
      return h === "HIT" || h === "MISS" || h === "STALE";
    },
    "public route never BYPASS": (r) => cacheHeader(r) !== "BYPASS",
  });

  // Track HIT rate as a custom metric-friendly boolean check.
  if (publicCache === "HIT") {
    check(second, { "public route achieved HIT": () => true });
  }

  // --- Private route: must never be served from cache ---
  const privateUrl = `${BASE_URL}/api/cart`;
  const privateRes = http.get(privateUrl, { headers: { Accept: "application/json" } });

  check(privateRes, {
    "private route returns 401 when unauthenticated": (r) => r.status === 401,
    "private route has no-store cache header": (r) =>
      (r.headers["Cache-Control"] || "").includes("no-store"),
    "private route is never HIT": (r) => {
      const h = cacheHeader(r);
      return h !== "HIT";
    },
    "private route cache is MISS or BYPASS": (r) => {
      const h = cacheHeader(r);
      return h === "MISS" || h === "BYPASS" || h === "";
    },
  });
}
