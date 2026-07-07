import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.PUBLIC_APP_URL || "https://example.vercel.app";
const ENDPOINT = __ENV.AGGREGATE_ENDPOINT || "/api/reports/aggregate";
const PROJECT_ID = __ENV.K6_CLOUD_PROJECT_ID || "8021352";

export const options = {
  vus: 50,
  duration: "2m",
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.01"],
  },
  cloud: {
    projectID: Number(PROJECT_ID),
    name: `${ENDPOINT.replace(/\//g, "-")}-cpu-test-${new Date().toISOString().slice(0, 19)}`,
  },
};

export default function () {
  const url = `${BASE_URL}${ENDPOINT}`;
  const res = http.get(url, { headers: { Accept: "application/json" } });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "totalValue is present": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.totalValue >= 0;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
