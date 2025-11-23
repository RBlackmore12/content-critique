import { useToast } from "@/hooks/use-toast";
import type { FeedbackRequest, FeedbackResponse } from "@shared/schema";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

const TOOLS = {
  contentCritique: "Content Critique (Full CONNECT Method)",
  week1Recognition: "Week 1: Recognition Analysis",
  week2Observation: "Week 2: Observation Practice",
  week3Navigation: "Week 3: Navigate Resistance",
  week4NaturalVoice: "Week 4: Natural Voice Discovery",
  week5MicroMoments: "Week 5: Micro-Moments Creation",
  week6Convert: "Week 6: Convert Through Recognition",
  week7Transform: "Week 7: Complete Message Transform",
  week8Refinement: "Week 8: Refinement & Integration",
  emailAnalyzer: "Email Analyzer",
  salesPage: "Sales Page Analyzer (40-30-20-10)",
  socialPost: "Social Post Analyzer",
} as const;

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [toolType, setToolType] = useState<keyof typeof TOOLS>("contentCritique");
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { toast } = useToast();

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    setLocation("/login");
    return null;
  }

  const feedbackMutation = useMutation({
    mutationFn: async (data: FeedbackRequest) => {
      const response = await apiRequest<FeedbackResponse>("/api/feedback", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (response) => {
      setFeedback(response.feedback);
      toast({
        title: "Analysis Complete",
        description: "Your content has been analyzed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter some content to analyze.",
        variant: "destructive",
      });
      return;
    }

    feedbackMutation.mutate({
      content,
      toolType,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CONNECT Method Content Critique
          </h1>
          <p className="text-gray-600">
            Get AI-powered feedback on your content using Racheal's proven framework
          </p>
        </div>

        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tool-select">Select Analysis Tool</Label>
              <Select
                value={toolType}
                onValueChange={(value) => setToolType(value as keyof typeof TOOLS)}
              >
                <SelectTrigger id="tool-select">
                  <SelectValue placeholder="Choose a tool" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TOOLS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content">Your Content</Label>
              <Textarea
                id="content"
                placeholder="Paste your content here for analysis..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="font-mono"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={feedbackMutation.isPending}
            >
              {feedbackMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Get Feedback"
              )}
            </Button>
          </form>

          {feedback && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
              <div className="prose prose-sm max-w-none">
                {feedback.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
