import { App } from "@slack/bolt";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import http from "http";
import { execSync } from "child_process";
import fs from "fs";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const app = new App({
  token: process.env.SLACK_BOT_TOKEN || "",
  appToken: process.env.SLACK_APP_TOKEN || "",
  socketMode: true,
});

app.event("app_mention", async ({ event, say }) => {
  try {
    const text = event.text;
    const threadTs = event.thread_ts || event.ts;

    // Clean out the bot mention tag to get the raw requirement (e.g., "give me a green button")
    const userPrompt = text.replace(/<@.*?>/g, "").trim();
    if (!userPrompt) return;

    await say(
      `Processing request: "${userPrompt}"... Generating interface code via Gemini...`,
    );

    // 1. Direct Gemini to generate ONLY clean, valid HTML/CSS code
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction:
          "You are an automated frontend developer. Generate a single, complete, valid HTML file containing the requested component. Include beautiful inline CSS styling so it looks professional. Return ONLY the raw HTML code markup. Do not wrap the code in markdown code blocks, and do not include any conversational text or markdown formatting outside the HTML.",
      },
    });

// Add a unique timestamp so the file content is always fresh
    const timestamp = new Date().toISOString();
    const cleanHtmlCode = (aiResponse.text || "<h1>Failed to generate component</h1>") + `\n`;

    console.log("💾 Writing AI code to index.html...");
    fs.writeFileSync("index.html", cleanHtmlCode);

    console.log("🚀 Executing Git operations...");
    
    // 1. Set a local author identity so Git stops crashing inside Render
    execSync('git config user.email "gemini-bot@elio-tax.local"');
    execSync('git config user.name "Gemini Automation Agent"');

    // Ensure this branch name matches your workflow target precisely!
    const targetBranch = "feature-slack-orchestration-v2";

    execSync(`git checkout -B ${targetBranch}`); 
    execSync("git add index.html"); 
    execSync(`git commit -m "feat: AI generated component - ${userPrompt}" --allow-empty`);

    const repoUrl = `https://x-access-token:${process.env.GH_TOKEN}@github.com/Sadullah-TANRIKULU/my-instance-issue-to-live-preview.git`;
    execSync(`git push ${repoUrl} ${targetBranch} --force`); 

    await say(
      "Code pushed to repository! Building your temporary preview sandbox now...",
    );
  } catch (error) {
    console.error("Pipeline Error:", error);
    await say("An error occurred while compiling your dynamic layout.");
  }
});

(async () => {
  await app.start();
  console.log("⚡️ Dynamic AI Generation Engine is active!");

  const PORT = process.env.PORT || 3000;
  const healthCheckServer = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Orchestration Engine Active\n");
  });
  healthCheckServer.listen(Number(PORT), "0.0.0.0");
})();
