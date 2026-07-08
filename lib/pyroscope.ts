import Pyroscope from "@pyroscope/nodejs";

export function initPyroscope() {
  if (process.env.PYROSCOPE_ENABLED !== "true") return;
  if (typeof window !== "undefined") return; // client-side build, do nothing

  const serverAddress = process.env.PYROSCOPE_SERVER_URL;
  if (!serverAddress) {
    console.warn("[pyroscope] missing PYROSCOPE_SERVER_URL");
    return;
  }

  try {
    const config: Record<string, unknown> = {
      appName: process.env.PYROSCOPE_APP_NAME || "ecoconception-rust",
      serverAddress,
      wall: {
        collectCpuTime: true,
      },
    };

    const user = process.env.PYROSCOPE_USER;
    const password = process.env.PYROSCOPE_API_TOKEN;
    if (user && password) {
      config.basicAuthUser = user;
      config.basicAuthPassword = password;
    }

    Pyroscope.init(config);

    Pyroscope.start();
    console.log("[pyroscope] profiling started");
  } catch (error) {
    console.error("[pyroscope] failed to start:", error);
  }
}
