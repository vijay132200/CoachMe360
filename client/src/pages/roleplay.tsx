import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { MessageCircle, Send, Bot, User, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function Roleplay() {
  const { toast } = useToast();
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [evaluation, setEvaluation] = useState<any>(null);

  const { data: managers, isLoading: managersLoading } = useQuery<any[]>({
    queryKey: ["/api/managers"],
  });

  const formSchema = z.object({
    message: z.string().min(1, "Please enter a message"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: { managerId: string; message: string; sessionId?: string }) => {
      return await apiRequest("POST", "/api/roleplay/message", data);
    },
    onSuccess: (response) => {
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
      setMessages(response.messages || []);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/roleplay/evaluate", { sessionId });
    },
    onSuccess: (response) => {
      setEvaluation(response);
      queryClient.invalidateQueries({ queryKey: ["/api/roleplay/sessions"] });
      toast({
        title: "Evaluation complete",
        description: "Your role-play session has been analyzed by AI.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to evaluate session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startNewSession = () => {
    setSessionId("");
    setMessages([]);
    setEvaluation(null);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!selectedManager) {
      toast({
        title: "Select a manager",
        description: "Please select a manager before starting the role-play.",
        variant: "destructive",
      });
      return;
    }

    sendMutation.mutate({
      managerId: selectedManager,
      message: data.message,
      sessionId: sessionId || undefined,
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Feedback Buddy</h1>
        <p className="text-muted-foreground mt-1">
          Practice delivering feedback with AI-powered role-play and coaching evaluation
        </p>
      </div>

      {!sessionId && messages.length === 0 ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Start Role-play Session
              </CardTitle>
              <CardDescription>
                Select a manager and practice delivering feedback. AI will play the role of a direct report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {managersLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Manager</label>
                    <Select value={selectedManager} onValueChange={setSelectedManager}>
                      <SelectTrigger data-testid="select-manager">
                        <SelectValue placeholder="Choose manager for this session" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers?.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} - {manager.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Type your opening message to the direct report..."
                                {...field}
                                data-testid="input-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={sendMutation.isPending || !selectedManager}
                        data-testid="button-send"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">How it works</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI plays the role of a direct report receiving feedback</li>
                    <li>• Practice using the SBI model (Situation, Behavior, Impact)</li>
                    <li>• Get real-time AI evaluation on tone, clarity, and approach</li>
                    <li>• Receive specific suggestions for improvement</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" data-testid="badge-session-status">
                Active Session
              </Badge>
              {evaluation && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">SBI Score:</span>
                  <span className="text-sm font-mono font-semibold" data-testid="text-sbi-score">
                    {evaluation.sbiScore}/10
                  </span>
                  <span className="text-sm text-muted-foreground">Tone:</span>
                  <span className="text-sm font-mono font-semibold" data-testid="text-tone-score">
                    {evaluation.toneScore}/10
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {messages.length >= 6 && !evaluation && (
                <Button
                  onClick={() => evaluateMutation.mutate()}
                  disabled={evaluateMutation.isPending}
                  size="sm"
                  data-testid="button-evaluate"
                >
                  Get AI Evaluation
                </Button>
              )}
              <Button onClick={startNewSession} variant="outline" size="sm" data-testid="button-new-session">
                New Session
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] p-6">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${index}`}
                    >
                      {message.role === "ai" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {sendMutation.isPending && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {!evaluation && (
                <div className="border-t p-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Continue the conversation..."
                                {...field}
                                data-testid="input-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={sendMutation.isPending}
                        data-testid="button-send"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
          </Card>

          {evaluation && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5" />
                  AI Evaluation & Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Overall Feedback</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-evaluation">
                    {evaluation.evaluation}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">SBI Usage Score</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-mono font-semibold" data-testid="text-sbi-detailed">{evaluation.sbiScore}/10</div>
                      <p className="text-xs text-muted-foreground">
                        How well you applied Situation-Behavior-Impact model
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Tone & Approach</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-mono font-semibold" data-testid="text-tone-detailed">{evaluation.toneScore}/10</div>
                      <p className="text-xs text-muted-foreground">
                        Empathy, clarity, and professionalism
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
