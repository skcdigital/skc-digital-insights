import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(async ({ command }) => {
  const { tanstackStart } = await import("@tanstack/react-start/plugin/vite");

  const plugins: Parameters<typeof defineConfig>[0] extends (...args: any[]) => any
    ? never
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : any[] = [
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart(),
  ];

  if (command === "build") {
    const { cloudflare } = await import("@cloudflare/vite-plugin");
    plugins.unshift(cloudflare({ viteEnvironment: { name: "ssr" } }));
  }

  return { plugins };
});
