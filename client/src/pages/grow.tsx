import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGrowGoalSchema } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Plus, CheckCircle2, Circle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Grow() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: managers, isLoading: managersLoading } = useQuery<any[]>({
    queryKey: ["/api/managers"],
  });

  const { data: goals, isLoading: goalsLoading } = useQuery<any[]>({
    queryKey: ["/api/grow/goals"],
  });

  const form = useForm<typeof insertGrowGoalSchema._type>({
    resolver: zodResolver(insertGrowGoalSchema.extend({
      directReport: insertGrowGoalSchema.shape.directReport.min(1, "Please enter direct report name"),
      goal: insertGrowGoalSchema.shape.goal.min(10, "Please describe the goal"),
      reality: insertGrowGoalSchema.shape.reality.min(10, "Please describe current reality"),
      options: insertGrowGoalSchema.shape.options.min(10, "Please list options"),
      will: insertGrowGoalSchema.shape.will.min(10, "Please describe action plan"),
    })),
    defaultValues: {
      managerId: "",
      directReport: "",
      goal: "",
      reality: "",
      options: "",
      will: "",
      status: "active",
      progressNotes: null,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof insertGrowGoalSchema._type) => {
      return await apiRequest("POST", "/api/grow/goals", data);
    },
    onSuccess: () => {
      form.reset();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/grow/goals"] });
      toast({
        title: "GROW goal created",
        description: "Coaching goal has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: typeof insertGrowGoalSchema._type) => {
    mutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "paused":
        return "bg-chart-5/10 text-chart-5 border-chart-5/20";
      default:
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
    }
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">GROW Goals</h1>
          <p className="text-muted-foreground mt-1">
            Structured coaching framework for developing your direct reports
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-goal">
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create GROW Goal</DialogTitle>
              <DialogDescription>
                Use the GROW model to structure coaching conversations with your direct reports
              </DialogDescription>
            </DialogHeader>

            {managersLoading ? (
              <Skeleton className="h-[600px] w-full" />
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

                  <FormField
                    control={form.control}
                    name="directReport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direct Report</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of the person being coached" {...field} data-testid="input-direct-report" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What do they want to achieve? Make it specific and measurable."
                            className="resize-none min-h-[80px]"
                            {...field}
                            data-testid="textarea-goal"
                          />
                        </FormControl>
                        <FormDescription>
                          The desired outcome or aspiration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reality</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What is the current situation? What challenges exist?"
                            className="resize-none min-h-[80px]"
                            {...field}
                            data-testid="textarea-reality"
                          />
                        </FormControl>
                        <FormDescription>
                          Current state and obstacles
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="options"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Options</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What are possible ways forward? List multiple approaches."
                            className="resize-none min-h-[80px]"
                            {...field}
                            data-testid="textarea-options"
                          />
                        </FormControl>
                        <FormDescription>
                          Potential strategies and alternatives
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="will"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Will (Action Plan)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What specific actions will be taken? When? What support is needed?"
                            className="resize-none min-h-[80px]"
                            {...field}
                            data-testid="textarea-will"
                          />
                        </FormControl>
                        <FormDescription>
                          Concrete steps and commitments
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      data-testid="button-submit"
                    >
                      {mutation.isPending ? "Creating..." : "Create Goal"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">GROW Model Overview</h3>
            <div className="grid gap-3 md:grid-cols-4 text-sm">
              <div>
                <span className="font-medium">Goal:</span>
                <span className="text-muted-foreground ml-1">What they want</span>
              </div>
              <div>
                <span className="font-medium">Reality:</span>
                <span className="text-muted-foreground ml-1">Where they are</span>
              </div>
              <div>
                <span className="font-medium">Options:</span>
                <span className="text-muted-foreground ml-1">Ways forward</span>
              </div>
              <div>
                <span className="font-medium">Will:</span>
                <span className="text-muted-foreground ml-1">Action plan</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {goalsLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </>
        ) : goals?.length > 0 ? (
          goals.map((goal: any) => (
            <Card key={goal.id} data-testid={`goal-${goal.id}`} className="hover-elevate">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-3">
                      <Target className="h-5 w-5" />
                      <span data-testid={`text-direct-report-${goal.id}`}>{goal.directReport}</span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>Created {format(new Date(goal.createdAt), "MMM d, yyyy")}</span>
                      {goal.updatedAt && goal.updatedAt !== goal.createdAt && (
                        <span>• Updated {format(new Date(goal.updatedAt), "MMM d, yyyy")}</span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(goal.status)} data-testid={`status-${goal.id}`}>
                    {goal.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {goal.status === "active" && <Circle className="h-3 w-3 mr-1" />}
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-primary">Goal</h4>
                    <p className="text-sm" data-testid={`text-goal-${goal.id}`}>{goal.goal}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-primary">Reality</h4>
                    <p className="text-sm" data-testid={`text-reality-${goal.id}`}>{goal.reality}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-primary">Options</h4>
                    <p className="text-sm" data-testid={`text-options-${goal.id}`}>{goal.options}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-primary">Will (Action Plan)</h4>
                    <p className="text-sm" data-testid={`text-will-${goal.id}`}>{goal.will}</p>
                  </div>
                </div>

                {goal.progressNotes?.length > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="text-sm font-semibold">Progress Notes</h4>
                    <div className="space-y-2">
                      {goal.progressNotes.map((note: any, index: number) => (
                        <div key={index} className="text-sm bg-muted p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">{note.date}</p>
                          <p>{note.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
              <Target className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">No GROW goals yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first coaching goal to start developing your team
                </p>
              </div>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-goal">
                <Plus className="h-4 w-4 mr-2" />
                Create First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
