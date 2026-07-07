import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.PUBLIC_APP_URL || "https://example.vercel.app";

export const options = {
  vus: 1,
  iterations: 3,
  thresholds: {},
};

function cacheHeader(res) {
  return (
    res.headers["X-Vercel-Cache"] ||
    res.headers["x-vercel-cache"] ||
    res.headers["X-Cache"] ||
    res.headers["x-cache"] ||
    ""
  ).toUpperCase();
}

export default function () {
  const publicUrl = `${BASE_URL}/api/vehicles?category=all&sort=price_asc`;
  const first = http.get(publicUrl, { headers: { Accept: "application/json" } });
  const second = http.get(publicUrl, { headers: { Accept: "application/json" } });

  check(first, {
    "public first call returns 200": (r) => r.status === 200,
    "public route has cache-control public": (r) =>
      (r.headers["Cache-Control"] || "").includes("public"),
  });

  const secondCache = cacheHeader(second);
  check(second, {
    "public second call is HIT or MISS": (r) => {
      const h = cacheHeader(r);
      return h === "HIT" || h === "MISS";
    },
    "public route achieved HIT at least once": () => secondCache === "HIT",
  });

  const privateUrl = `${BASE_URL}/api/cart`;
  const privateRes = http.get(privateUrl, { headers: { Accept: "application/json" } });

  check(privateRes, {
    "private route returns 401": (r) => r.status === 401,
    "private route has no-store": (r) =>
      (r.headers["Cache-Control"] || "").includes("no-store"),
    "private route is never HIT": (r) => cacheHeader(r) !== "HIT",
    "private route cache is MISS or BYPASS": (r) => {
      const h = cacheHeader(r);
      return h === "MISS" || h === "BYPASS" || h === "";
    },
  });
}
