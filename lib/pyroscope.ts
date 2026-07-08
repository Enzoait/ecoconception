import Pyroscope from "@pyroscope/nodejs";

export function initPyroscope() {
  if (process.env.PYROSCOPE_ENABLED !== "true") return;
  if (typeof window !== "undefined") return; // client-side build, do nothing

  const serverAddress = process.env.PYROSCOPE_SERVER_URL;
  const password = process.env.PYROSCOPE_API_TOKEN;
  if (!serverAddress || !password) {
    console.warn("[pyroscope] missing PYROSCOPE_SERVER_URL or PYROSCOPE_API_TOKEN");
    return;
  }

  try {
    Pyroscope.init({
      appName: process.env.PYROSCOPE_APP_NAME || "ecoconception-rust",
      serverAddress,
      basicAuthUser: process.env.PYROSCOPE_USER || "1714687",
      basicAuthPassword: password,
      wall: {
        collectCpuTime: true,
      },
    });

    Pyroscope.start();
    console.log("[pyroscope] profiling started");
  } catch (error) {
    console.error("[pyroscope] failed to start:", error);
  }
}
