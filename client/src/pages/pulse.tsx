import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPulseCheckSchema } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
import { CheckCircle2, Activity, LineChart as LineChartIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Pulse() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { data: managers, isLoading: managersLoading } = useQuery<any[]>({
    queryKey: ["/api/managers"],
  });

  const { data: pulseHistory, isLoading: historyLoading } = useQuery<any[]>({
    queryKey: ["/api/pulse/history"],
  });

  const form = useForm<typeof insertPulseCheckSchema._type>({
    resolver: zodResolver(insertPulseCheckSchema),
    defaultValues: {
      managerId: "",
      listenedTo: 5,
      workloadFair: 5,
      managerHelpful: 5,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof insertPulseCheckSchema._type) => {
      return await apiRequest("POST", "/api/pulse", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/pulse/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/pulse"] });
      toast({
        title: "Pulse check submitted",
        description: "Thank you for sharing your feedback.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit pulse check. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: typeof insertPulseCheckSchema._type) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Pulse Check Complete!</h2>
          <p className="text-muted-foreground max-w-md">
            Your feedback has been recorded. Check back weekly to see team trends.
          </p>
        </div>
        <Button onClick={() => setSubmitted(false)} data-testid="button-submit-another">
          Submit Another Check-in
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Team Pulse Check</h1>
        <p className="text-muted-foreground mt-1">
          Quick weekly check-in to gauge team health and manager effectiveness
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Weekly Check-in
              </CardTitle>
              <CardDescription>
                Rate your experience this week on these three dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {managersLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
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
                          <FormLabel>Your Manager</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-manager">
                                <SelectValue placeholder="Select your manager" />
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

                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="listenedTo"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between gap-4 mb-2">
                              <div>
                                <FormLabel>I felt listened to this week</FormLabel>
                                <FormDescription className="text-xs mt-1">
                                  How well did your manager listen to your ideas and concerns?
                                </FormDescription>
                              </div>
                              <span className="text-2xl font-mono font-semibold min-w-[3rem] text-right" data-testid="rating-listened">
                                {field.value}
                              </span>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                data-testid="slider-listened"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="workloadFair"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between gap-4 mb-2">
                              <div>
                                <FormLabel>My workload felt fair</FormLabel>
                                <FormDescription className="text-xs mt-1">
                                  Was the workload distributed reasonably and manageable?
                                </FormDescription>
                              </div>
                              <span className="text-2xl font-mono font-semibold min-w-[3rem] text-right" data-testid="rating-workload">
                                {field.value}
                              </span>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                data-testid="slider-workload"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="managerHelpful"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between gap-4 mb-2">
                              <div>
                                <FormLabel>My manager was helpful</FormLabel>
                                <FormDescription className="text-xs mt-1">
                                  Did your manager provide support when you needed it?
                                </FormDescription>
                              </div>
                              <span className="text-2xl font-mono font-semibold min-w-[3rem] text-right" data-testid="rating-helpful">
                                {field.value}
                              </span>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                data-testid="slider-helpful"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full"
                      data-testid="button-submit"
                    >
                      {mutation.isPending ? "Submitting..." : "Submit Check-in"}
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
              <CardTitle className="text-base">About Pulse Checks</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Weekly pulse checks help track team morale and manager effectiveness over time.
              </p>
              <p>
                Your responses are anonymous and aggregated with other team members' feedback.
              </p>
              <p>
                Consistent participation helps identify trends and areas for improvement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pulse History Chart */}
      <Card data-testid="card-pulse-history">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5" />
            Team Pulse Trends
          </CardTitle>
          <CardDescription>
            Historical view of team health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : pulseHistory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pulseHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="listenedTo"
                  name="Listened To"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="workloadFair"
                  name="Workload Fair"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="managerHelpful"
                  name="Manager Helpful"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center gap-3">
              <LineChartIcon className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No pulse history yet. Submit check-ins weekly to see trends.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
