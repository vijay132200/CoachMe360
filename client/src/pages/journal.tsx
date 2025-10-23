import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJournalEntrySchema } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Sparkles, TrendingUp } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const journalPrompts = [
  "What leadership challenge did you face this week, and how did you respond?",
  "Describe a moment when you felt your team was truly engaged. What contributed to that?",
  "What feedback did you receive recently? How did it make you feel, and what will you do with it?",
];

export default function Journal() {
  const { toast } = useToast();
  const [promptIndex, setPromptIndex] = useState(0);

  const { data: managers, isLoading: managersLoading } = useQuery<any[]>({
    queryKey: ["/api/managers"],
  });

  const { data: entries, isLoading: entriesLoading } = useQuery<any[]>({
    queryKey: ["/api/journal/entries"],
  });

  const form = useForm<typeof insertJournalEntrySchema._type>({
    resolver: zodResolver(insertJournalEntrySchema.extend({
      text: insertJournalEntrySchema.shape.text.min(10, "Please write at least 10 characters").max(5000),
    })),
    defaultValues: {
      managerId: "",
      text: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof insertJournalEntrySchema._type) => {
      return await apiRequest("POST", "/api/journal", data);
    },
    onSuccess: () => {
      form.reset({ managerId: form.getValues("managerId"), text: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/journal/entries"] });
      toast({
        title: "Journal entry saved",
        description: "AI sentiment analysis in progress...",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: typeof insertJournalEntrySchema._type) => {
    mutation.mutate(data);
  };

  const nextPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % journalPrompts.length);
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return "text-chart-3";
    if (score < -0.3) return "text-destructive";
    return "text-muted-foreground";
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.5) return "Very Positive";
    if (score > 0.2) return "Positive";
    if (score > -0.2) return "Neutral";
    if (score > -0.5) return "Negative";
    return "Very Negative";
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Reflection Journal</h1>
        <p className="text-muted-foreground mt-1">
          Build self-awareness through regular reflection with AI-powered sentiment analysis
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                New Entry
              </CardTitle>
              <CardDescription>
                Reflect on your leadership experiences and emotional journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {managersLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="managerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manager</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-manager">
                                <SelectValue placeholder="Select manager" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {managers?.map((manager) => (
                                <SelectItem key={manager.id} value={manager.id}>
                                  {manager.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Today's Prompt</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={nextPrompt}
                          data-testid="button-next-prompt"
                        >
                          Next →
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {journalPrompts[promptIndex]}
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Reflection</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write your thoughts, feelings, and insights..."
                              className="min-h-[200px] resize-none"
                              maxLength={5000}
                              {...field}
                              data-testid="textarea-entry"
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/5000 characters • AI will analyze sentiment and emotion
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full"
                      data-testid="button-submit"
                    >
                      {mutation.isPending ? "Saving..." : "Save Entry"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reflection Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Be honest and vulnerable in your reflections.
              </p>
              <p>
                Focus on specific situations and how they made you feel.
              </p>
              <p>
                AI analysis helps track your emotional patterns over time.
              </p>
              <p>
                Your entries are private unless you choose to share insights with your coach.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Previous Entries */}
      <Card data-testid="card-entries">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Journal History
          </CardTitle>
          <CardDescription>
            Your reflection timeline with AI-powered emotional insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entriesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : entries?.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry: any) => (
                <div
                  key={entry.id}
                  className="rounded-lg border p-4 space-y-3 hover-elevate"
                  data-testid={`entry-${entry.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      {entry.sentimentScore !== null && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Sentiment: {getSentimentLabel(entry.sentimentScore)}
                          </Badge>
                          <span className={`text-sm font-mono font-semibold ${getSentimentColor(entry.sentimentScore)}`} data-testid={`sentiment-score-${entry.id}`}>
                            {entry.sentimentScore > 0 ? "+" : ""}{entry.sentimentScore?.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-3" data-testid={`text-entry-${entry.id}`}>
                    {entry.text}
                  </p>
                  {entry.emotionTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.emotionTags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs" data-testid={`emotion-tag-${index}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No journal entries yet. Start reflecting to build self-awareness.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
