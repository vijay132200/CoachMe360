import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeedbackSchema } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
import { CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export default function Feedback() {
  const { toast } = useToast();
  const [submittedCount, setSubmittedCount] = useState(0);

  const { data: managers, isLoading: managersLoading } = useQuery<any[]>({
    queryKey: ["/api/managers"],
  });

  const { data: competencies, isLoading: competenciesLoading } = useQuery<any[]>({
    queryKey: ["/api/competencies"],
  });

  const form = useForm<typeof insertFeedbackSchema._type>({
    resolver: zodResolver(insertFeedbackSchema),
    defaultValues: {
      managerId: "",
      isAnonymous: 1,
      submitterName: "",
      responses: {},
      comments: {},
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof insertFeedbackSchema._type) => {
      return await apiRequest("POST", "/api/feedbacks", data);
    },
    onSuccess: () => {
      setSubmittedCount(prev => prev + 1);
      form.reset({
        managerId: form.getValues("managerId"),
        isAnonymous: 1,
        submitterName: "",
        responses: {},
        comments: {},
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/radar"] });
      toast({
        title: "Feedback submitted",
        description: "Thank you for providing feedback. Submit another response or return to dashboard.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: typeof insertFeedbackSchema._type) => {
    mutation.mutate(data);
  };

  const isLoading = managersLoading || competenciesLoading;
  const isAnonymous = form.watch("isAnonymous") === 1;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">360° Feedback</h1>
            <p className="text-muted-foreground mt-1">
              Provide anonymous feedback on manager's leadership competencies
            </p>
          </div>
          {submittedCount > 0 && (
            <Badge variant="secondary" className="text-sm" data-testid="badge-submitted-count">
              {submittedCount} submitted
            </Badge>
          )}
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Privacy Guaranteed</h3>
              <p className="text-sm text-muted-foreground">
                Your feedback is anonymous by default. Multiple team members can submit feedback consecutively on this page without needing email invitations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Submit Feedback
          </CardTitle>
          <CardDescription>
            Rate the manager and provide specific examples for each competency
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="managerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager Being Assessed</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-manager">
                            <SelectValue placeholder="Choose the manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {managers?.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name} - {manager.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <FormField
                    control={form.control}
                    name="isAnonymous"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value === 1}
                            onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            data-testid="switch-anonymous"
                          />
                        </FormControl>
                        <div>
                          <FormLabel className="text-sm font-medium">Anonymous Feedback</FormLabel>
                          <FormDescription className="text-xs">
                            Your identity will not be shared with the manager
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {!isAnonymous && (
                  <FormField
                    control={form.control}
                    name="submitterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="space-y-6">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Competency Ratings & Feedback</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Provide a rating and 1-2 sentences of specific feedback for each competency
                    </p>
                  </div>

                  {competencies?.map((competency) => (
                    <div key={competency.id} className="space-y-4 pb-6 border-b last:border-0">
                      <FormField
                        control={form.control}
                        name={`responses.${competency.id}`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="space-y-1">
                                <FormLabel className="text-base">{competency.name}</FormLabel>
                                {competency.description && (
                                  <FormDescription>{competency.description}</FormDescription>
                                )}
                              </div>
                              <span className="text-2xl font-mono font-semibold min-w-[3rem] text-right" data-testid={`rating-${competency.id}`}>
                                {field.value || "—"}
                              </span>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value || 5]}
                                onValueChange={(value) => field.onChange(value[0])}
                                data-testid={`slider-${competency.id}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`comments.${competency.id}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Specific Examples</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={`Example: "Sometimes dismisses new ideas before discussion" or "Encourages open sharing in team meetings"`}
                                className="resize-none min-h-[80px]"
                                maxLength={500}
                                {...field}
                                data-testid={`comment-${competency.id}`}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {field.value?.length || 0}/500 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="min-w-[120px]"
                    data-testid="button-submit"
                  >
                    {mutation.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    data-testid="button-reset"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {submittedCount > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {submittedCount} {submittedCount === 1 ? "response" : "responses"} submitted successfully
                </p>
                <p className="text-sm text-muted-foreground">
                  You can submit another response for a different manager or return to the dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
