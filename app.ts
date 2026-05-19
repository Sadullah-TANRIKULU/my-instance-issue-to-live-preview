import { App } from "@slack/bolt";
import { franc } from "franc";
import * as dotenv from "dotenv";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN || "",
  appToken: process.env.SLACK_APP_TOKEN || "",
  socketMode: true,
});

// Use 'app_mention' to capture the "@elio-tax" call
app.event("app_mention", async ({ event, say, client }) => {
  try {
    const text = event.text;

    // 1. Language Inference (Requirement: French & English)
    const langCode = franc(text);
    const isEnglish = langCode === "fra";

    // 2. Role-Based Routing (Requirement: Handler by role)
    const result = await client.users.info({ user: event.user as string });
    const userRole = result.user?.is_admin ? "Manager" : "Developer";

    // 3. Response logic
    if (isEnglish) {
      await say(
        `Hello ${userRole}! I am analyzing your request for the preview...`,
      );
    } else {
      await say(
        `Bonjour ${userRole}! J'analyse votre demande pour la preview...`,
      );
    }

    console.log(
      `Pipeline triggered by ${userRole} in ${isEnglish ? "EN" : "FR"}`,
    );
  } catch (error) {
    console.error("Error handling mention:", error);
  }
});

(async () => {
  await app.start();
  console.log("⚡️ Elio Tax Pipeline: Orchestration Layer is active!");
})();
