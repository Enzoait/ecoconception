import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.PUBLIC_APP_URL || "https://example.vercel.app";
const ENDPOINT = __ENV.AGGREGATE_ENDPOINT || "/api/reports/aggregate";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
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
