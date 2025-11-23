import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeFeedback(content: string, toolType: string) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Analyze this ${toolType} feedback: ${content}`
    }]
  });
  
  return message.content[0].type === "text" ? message.content[0].text : "";
}
