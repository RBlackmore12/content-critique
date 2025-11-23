import { z } from "zod";

export const feedbackRequestSchema = z.object({
  content: z.string().min(1),
  toolType: z.enum([
    "contentCritique",
    "week1Recognition",
    "week2Observation",
    "week3Navigation",
    "week4NaturalVoice",
    "week5MicroMoments",
    "week6Convert",
    "week7Transform",
    "week8Refinement",
    "emailAnalyzer",
    "salesPage",
    "socialPost"
  ]).default("contentCritique"),
});

export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

export interface FeedbackResponse {
  feedback: string;
  timestamp: string;
}
