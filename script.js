import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
  cloud: {
    // Project: Default project
    projectID: 8021352,
    // Test runs with the same name groups test runs together.
    name: "Test (07/07/2026-10:59:39)",
  },
};

export default function () {
  http.get("https://niftymanatee1052.grafana.net/");
  sleep(1);
}
