require("dotenv").config();
import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts.js";
import { basePrompt as nodeBasePrompt } from "./defaults/node.js";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import { testConnection } from "./db/index.js";
import { runMigrations } from "./db/schema.js";

// Define interfaces for request bodies
interface TemplateRequest {
  prompt: string;
}

interface ChatRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
}

interface TemplateResponse {
  prompts: string[];
  uiPrompts: string[];
}

interface ChatResponse {
  response: string;
}

interface ErrorResponse {
  message: string;
}

// Define interface for message parts
interface MessagePart {
  text: string;
}

// Define interface for Gemini content
interface GeminiContent {
  role: "user" | "model";
  parts: MessagePart[];
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "your-api-key-here"
});

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());

app.post("/template", async (req: Request<{}, TemplateResponse | ErrorResponse, TemplateRequest>, res: Response<TemplateResponse | ErrorResponse>) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt || prompt.trim() === "") {
      res.status(400).json({ message: "Prompt cannot be empty" });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${prompt}\n\nReturn either 'node' or 'react' based on what you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra.` }]
          }
        ]
      });

      if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
        res.status(500).json({ message: "No response from AI" });
        return;
      }

      const answer = response.candidates[0].content.parts[0].text.toLowerCase().trim();

      if (answer === "react") {
        res.json({
          prompts: [
            BASE_PROMPT,
            `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
          ],
          uiPrompts: [reactBasePrompt]
        });
        return;
      }

      if (answer === "node") {
        res.json({
          prompts: [
            `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
          ],
          uiPrompts: [nodeBasePrompt]
        });
        return;
      }

      res.status(403).json({ message: "Invalid response from AI" });
    } catch (apiError: any) {
      console.error("Gemini API error:", apiError);
      const statusCode = apiError?.status || 500;
      const errorMessage = apiError?.message || "Error calling Gemini API";
      res.status(statusCode).json({ message: `API Error: ${errorMessage}` });
    }

  } catch (error) {
    console.error("Template error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/chat", async (req: Request<{}, ChatResponse | ErrorResponse, ChatRequest>, res: Response<ChatResponse | ErrorResponse>) => {
  try {
    const messages = req.body.messages;

    // Convert message format from Anthropic to Gemini with proper typing
    const geminiContents: GeminiContent[] = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Include system prompt in the first message instead of systemInstruction
    const systemPrompt = getSystemPrompt();
    if (geminiContents.length > 0 && geminiContents[0].role === 'user') {
      geminiContents[0].parts[0].text = `${systemPrompt}\n\n${geminiContents[0].parts[0].text}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: geminiContents
    });

    console.log(response);

    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.status(500).json({ message: "No response from AI" });
      return;
    }

    res.json({
      response: response.candidates[0].content.parts[0].text
    });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);

async function start() {
  await testConnection();
  await runMigrations();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});