/// <reference types="vitest/config" />

import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig as defineVitestConfig, type Plugin } from "vite";

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

const pdfWorkerSource = path.resolve(
	dirname,
	"node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
);
const pdfWorkerDest = path.resolve(dirname, "public/pdf.worker.min.js");

/** Hostinger/Apache often serves .mjs as text/plain — ship worker as .js instead. */
const copyPdfWorkerPlugin = (): Plugin => ({
	name: "copy-pdf-worker",
	buildStart() {
		if (!existsSync(pdfWorkerSource)) {
			throw new Error(
				"Missing pdfjs-dist worker. Run npm install in /client first.",
			);
		}

		copyFileSync(pdfWorkerSource, pdfWorkerDest);
	},
});

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineVitestConfig({
	plugins: [react(), copyPdfWorkerPlugin()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: "./src/test/setup.ts",
		include: ["src/**/*.test.{ts,tsx}"],
		projects: [
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(dirname, ".storybook"),
					}),
				],
				test: {
					name: "storybook",
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: "chromium",
							},
						],
					},
					setupFiles: [".storybook/vitest.setup.ts"],
				},
			},
		],
	},
});
