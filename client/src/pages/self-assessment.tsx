import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSelfAssessmentSchema } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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
import { CheckCircle2, ClipboardList } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SelfAssessment() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { data: managers, isLoading: managersLoading } = useQuery<any[]>({
    queryKey: ["/api/managers"],
  });

  const { data: competencies, isLoading: competenciesLoading } = useQuery<any[]>({
    queryKey: ["/api/competencies"],
  });

  const form = useForm<typeof insertSelfAssessmentSchema._type>({
    resolver: zodResolver(insertSelfAssessmentSchema),
    defaultValues: {
      managerId: "",
      responses: {},
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof insertSelfAssessmentSchema._type) => {
      return await apiRequest("POST", "/api/self-assessments", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/radar"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/trends"] });
      toast({
        title: "Assessment submitted",
        description: "Your self-assessment has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: typeof insertSelfAssessmentSchema._type) => {
    mutation.mutate(data);
  };

  const isLoading = managersLoading || competenciesLoading;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Assessment Complete!</h2>
          <p className="text-muted-foreground max-w-md">
            Your self-assessment has been submitted. Now collect 360° feedback from your team to identify blind spots.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setSubmitted(false)} variant="outline" data-testid="button-new-assessment">
            Submit Another
          </Button>
          <Button onClick={() => window.location.href = "/feedback"} data-testid="button-collect-feedback">
            Collect Feedback
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Self Assessment</h1>
        <p className="text-muted-foreground mt-1">
          Rate yourself across key leadership competencies
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Leadership Competencies Assessment
          </CardTitle>
          <CardDescription>
            Rate yourself on a scale of 1-10 for each competency. Be honest and reflective.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-10 w-full" />
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
                      <FormLabel>Select Manager</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-manager">
                            <SelectValue placeholder="Choose the manager being assessed" />
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
                      <FormDescription>
                        This is the manager completing the self-assessment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-6">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Competency Ratings</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      1 = Needs Significant Development | 10 = Expert Level
                    </p>
                  </div>

                  {competencies?.map((competency) => (
                    <FormField
                      key={competency.id}
                      control={form.control}
                      name={`responses.${competency.id}`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="space-y-1">
                              <FormLabel>{competency.name}</FormLabel>
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
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="min-w-[120px]"
                    data-testid="button-submit"
                  >
                    {mutation.isPending ? "Submitting..." : "Submit Assessment"}
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
    </div>
  );
}
