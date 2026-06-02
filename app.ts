import { App } from "@slack/bolt";
import { franc } from "franc";
import * as dotenv from "dotenv";
import http from "http";
import { execSync } from "child_process"; // Native module to run terminal commands
import fs from "fs"; // Native module to write files

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN || "",
  appToken: process.env.SLACK_APP_TOKEN || "",
  socketMode: true,
});

app.event("app_mention", async ({ event, say, client }) => {
  try {
    const text = event.text;
    const userId = event.user;

    if (!userId) return;

    // 1. Language Inference with robust fallback
    const langCode = franc(text);
    // If it's explicitly French, use FR. Otherwise, default to English ('eng' or 'und')
    const isFrench = langCode === "fra";

    // 2. Role-Based Routing
    const result = await client.users.info({ user: userId });
    const userRole = result.user?.is_admin ? "Manager" : "Developer";

    // 3. Inform the user in their language that automation has begun
    if (isFrench) {
      await say(
        `Bonjour ${userRole}! J'active l'agent IA pour générer le code et déployer la preview...`,
      );
    } else {
      await say(
        `Hello ${userRole}! Activating the AI Agent to generate code and deploy your preview...`,
      );
    }

    console.log(
      `Pipeline triggered by ${userRole} in ${isFrench ? "FR" : "EN"}`,
    );

    // -----------------------------------------------------------------
    // 4. AUTOMATION LOOP: Generate Code and Push to GitHub
    // -----------------------------------------------------------------
    // Clean out the user mention tag (<@U123456>) from the prompt text
    const cleanPrompt = text.replace(/<@.*?>/g, "").trim();

    // Simulating the Gemini code generation step for testing:
    const generatedCode = `// Generated automatically from Slack Prompt: "${cleanPrompt}"
console.log("Hello from the live preview server!");
`;

    console.log("💾 Writing generated code to file...");
    fs.writeFileSync("generated-app.js", generatedCode);

    console.log("🚀 Executing Git operations...");
    // These terminal commands will run inside your local machine / Render server container
    execSync("git checkout -B sadullah"); // Create or reset the side branch
    execSync("git add generated-app.js"); // Stage the new file
    execSync(
      'git commit -m "feat: automated agent code injection" --allow-empty',
    );
    execSync("git push origin sadullah --force"); // Force push to kick off GitHub Actions instantly

    console.log(
      "✅ Code pushed successfully! GitHub Actions is now handling the PR creation.",
    );
  } catch (error) {
    console.error("Error handling mention or running automation:", error);
    await say("An error occurred while processing the automation loop.");
  }
});

(async () => {
  await app.start();
  console.log("⚡️ Elio Tax Pipeline: Orchestration Layer is active!");

  // -----------------------------------------------------------------
  // RENDER PORT BINDING FIX: Keep the Web Service Alive
  // -----------------------------------------------------------------
  const PORT = process.env.PORT || 3000;

  const healthCheckServer = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Elio Tax Orchestration Engine Liveness: OK\n");
  });

  healthCheckServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(
      `📡 Render Health Check server listening on port ${PORT} via 0.0.0.0`,
    );
  });
})();
