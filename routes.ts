import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "../db";
import { feedbackRequests, userFoundations } from "../db/schema";
import { requireAuth } from "./auth";
import Anthropic from "@anthropic-ai/sdk";
import cookieParser from "cookie-parser";
import authRoutes from "./authRoutes";
import { eq } from "drizzle-orm";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function registerRoutes(app: Express): Server {
  
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Register auth routes
  app.use("/api/auth", authRoutes);
  
  // Feedback analysis endpoint (now requires auth)
  app.post("/api/feedback", requireAuth, async (req, res) => {
    try {
      const { content, toolType, voiceGuide, weekGuide } = req.body;
      const { userId } = (req as any).user;

      if (!content || !toolType) {
        return res.status(400).json({ 
          error: "Missing required fields: content and toolType" 
        });
      }

      // Get user's foundation if it exists
      let userFoundation = null;
      const [foundation] = await db
        .select()
        .from(userFoundations)
        .where(eq(userFoundations.userId, userId));
      
      if (foundation) {
        userFoundation = foundation;
      }

      // Get the appropriate analysis prompt based on tool type
      const systemPrompt = getAnalysisPrompt(toolType, userFoundation, voiceGuide, weekGuide);

      // Call Claude API
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: content,
          },
        ],
      });

      const feedback = message.content[0].type === "text" 
        ? message.content[0].text 
        : "Unable to generate feedback";

      // Store in database
      await db.insert(feedbackRequests).values({
        userId,
        content,
        toolType,
        feedback,
      });

      res.json({ feedback });
    } catch (error) {
      console.error("Error generating feedback:", error);
      res.status(500).json({ 
        error: "Failed to generate feedback" 
      });
    }
  });

  // Save/update user foundation
  app.post("/api/foundation", requireAuth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const foundationData = req.body;

      // Check if foundation exists
      const [existing] = await db
        .select()
        .from(userFoundations)
        .where(eq(userFoundations.userId, userId));

      if (existing) {
        // Update existing
        await db
          .update(userFoundations)
          .set({ ...foundationData, updatedAt: new Date() })
          .where(eq(userFoundations.userId, userId));
      } else {
        // Create new
        await db
          .insert(userFoundations)
          .values({ userId, ...foundationData });
      }

      res.json({ message: "Foundation saved successfully" });
    } catch (error) {
      console.error("Error saving foundation:", error);
      res.status(500).json({ error: "Failed to save foundation" });
    }
  });

  // Get user foundation
  app.get("/api/foundation", requireAuth, async (req, res) => {
    try {
      const { userId } = (req as any).user;

      const [foundation] = await db
        .select()
        .from(userFoundations)
        .where(eq(userFoundations.userId, userId));

      res.json({ foundation: foundation || null });
    } catch (error) {
      console.error("Error fetching foundation:", error);
      res.status(500).json({ error: "Failed to fetch foundation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to get the right prompt for each tool
function getAnalysisPrompt(
  toolType: string, 
  userFoundation: any = null,
  voiceGuide?: string,
  weekGuide?: string
): string {
  
  // Build context from user's foundation
  let foundationContext = "";
  if (userFoundation) {
    foundationContext = `
USER'S FOUNDATION (Use this context for all analysis):

Voice Guide: ${userFoundation.voiceGuide || "Not provided"}

Target Audience: ${userFoundation.targetAudience || "Not provided"}

Audience Pain Points: ${userFoundation.audiencePainPoints || "Not provided"}

Unique Positioning: ${userFoundation.uniquePositioning || "Not provided"}

Audience Observations: ${userFoundation.audienceObservations || "Not provided"}

Business/Offer: ${userFoundation.offerDescription || "Not provided"}
`;
  }

  // Add any additional voice guide or week guide passed in
  if (voiceGuide) {
    foundationContext += `\n\nADDITIONAL VOICE GUIDE:\n${voiceGuide}`;
  }
  if (weekGuide) {
    foundationContext += `\n\nWEEK IMPLEMENTATION GUIDE:\n${weekGuide}`;
  }

  const prompts: Record<string, string> = {
    contentCritique: getFullConnectPrompt(),
    week1Recognition: getWeek1Prompt(),
    week2Observation: getWeek2Prompt(),
    week3Navigation: getWeek3Prompt(),
    week4NaturalVoice: getWeek4Prompt(),
    week5MicroMoments: getWeek5Prompt(),
    week6Convert: getWeek6Prompt(),
    week7Transform: getWeek7Prompt(),
    week8Refinement: getWeek8Prompt(),
    emailAnalyzer: getEmailPrompt(),
    salesPage: getSalesPagePrompt(),
    socialPost: getSocialPostPrompt(),
  };

  const basePrompt = prompts[toolType] || prompts.contentCritique;
  
  // Prepend foundation context if available
  return foundationContext ? `${foundationContext}\n\n${basePrompt}` : basePrompt;
}

// Simplified prompts (keeping the core ones from before)
function getFullConnectPrompt(): string {
  return `You are an expert messaging strategist trained in the CONNECT Method.

Analyze content and provide specific, actionable feedback on Recognition vs Performance, specificity, voice authenticity, and conversion principles.

Provide concrete rewrites showing exactly how to improve.`;
}

function getWeek1Prompt(): string {
  return `Week 1: Recognition Analysis. Check if content creates recognition (about THEM) vs performance (about YOU). Provide ratio and specific rewrites.`;
}

function getWeek2Prompt(): string {
  return `Week 2: Observation Practice. Check if using their exact words, not projecting your journey. Flag cleaned-up language.`;
}

function getWeek3Prompt(): string {
  return `Week 3: Navigate Resistance. Check if acknowledging protection with compassion vs trying to overcome. Identify protection pattern.`;
}

function getWeek4Prompt(): string {
  return `Week 4: Natural Voice. Check for performance vs authentic presence. Flag forced vulnerability.`;
}

function getWeek5Prompt(): string {
  return `Week 5: Micro-Moments. Check specificity (time, place, thought). Is it screenshot-worthy? One paragraph max?`;
}

function getWeek6Prompt(): string {
  return `Week 6: Recognition Sales. Analyze using 40-30-20-10 formula. Calculate actual percentages.`;
}

function getWeek7Prompt(): string {
  return `Week 7: Complete Message. Check if recognition is consistent across all touchpoints.`;
}

function getWeek8Prompt(): string {
  return `Week 8: Refinement. Comprehensive analysis across all 7 weeks. Integration score and priority fixes.`;
}

function getEmailPrompt(): string {
  return `Email Analysis: Check subject line recognition, opening specificity, body recognition maintenance, clear CTA.`;
}

function getSalesPagePrompt(): string {
  return `Sales Page Analysis using 40-30-20-10 formula. Calculate exact percentages and provide section rewrites.`;
}

function getSocialPostPrompt(): string {
  return `Social Post Analysis: First 7 words, recognition quality, length for platform, screenshot potential.`;
}
