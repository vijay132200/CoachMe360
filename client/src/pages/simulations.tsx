import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, TrendingUp, Users, Target, Sparkles, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";

const scenarios = [
  {
    id: "conflict-resolution",
    title: "Team Conflict Resolution",
    description: "Two team members disagree on project direction. How do you handle it?",
    theory: "Path-Goal Leadership",
    choices: [
      { id: "directive", label: "Make the decision yourself and enforce it", impact: { morale: -2, performance: +1 } },
      { id: "supportive", label: "Listen to both sides and facilitate a compromise", impact: { morale: +3, performance: +2 } },
      { id: "participative", label: "Involve the whole team in finding a solution", impact: { morale: +2, performance: +1 } },
      { id: "achievement", label: "Set challenging goals and let them compete", impact: { morale: -1, performance: +2 } },
    ],
  },
  {
    id: "low-performer",
    title: "Addressing Low Performance",
    description: "A previously high-performing team member's output has declined significantly.",
    theory: "Transformational Leadership",
    choices: [
      { id: "punitive", label: "Issue a formal warning about performance", impact: { morale: -3, performance: -1 } },
      { id: "coaching", label: "Have a supportive 1-on-1 to understand root causes", impact: { morale: +3, performance: +3 } },
      { id: "ignore", label: "Wait and see if they improve on their own", impact: { morale: 0, performance: -2 } },
      { id: "reassign", label: "Move them to less critical tasks", impact: { morale: -1, performance: +1 } },
    ],
  },
  {
    id: "delegation",
    title: "Delegation Challenge",
    description: "A critical project needs completion, but your team is already stretched thin.",
    theory: "Empowerment & LMX",
    choices: [
      { id: "micromanage", label: "Take control and do most of it yourself", impact: { morale: -2, performance: +1 } },
      { id: "distribute", label: "Distribute tasks evenly across the team", impact: { morale: +1, performance: 0 } },
      { id: "empower-star", label: "Delegate to your most capable team member", impact: { morale: +2, performance: +3 } },
      { id: "outsource", label: "Hire external contractors", impact: { morale: 0, performance: +2 } },
    ],
  },
];

export default function Simulations() {
  const { toast } = useToast();
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const { data: managers, isLoading: managersLoading } = useQuery<any[]>({
    queryKey: ["/api/managers"],
  });

  const { data: history, isLoading: historyLoading } = useQuery<any[]>({
    queryKey: ["/api/simulations/history", selectedManager],
    enabled: !!selectedManager,
  });

  const mutation = useMutation({
    mutationFn: async (data: { managerId: string; scenarioId: string; choiceId: string }) => {
      return await apiRequest("POST", "/api/simulations", {
        managerId: data.managerId,
        scenarioId: data.scenarioId,
        choices: [data.choiceId],
      });
    },
    onSuccess: (response) => {
      setResult(response);
      queryClient.invalidateQueries({ queryKey: ["/api/simulations/history"] });
      toast({
        title: "Simulation complete",
        description: "View your results and learning points below.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete simulation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startScenario = (scenarioId: string) => {
    if (!selectedManager) {
      toast({
        title: "Select a manager",
        description: "Please select a manager before starting a simulation.",
        variant: "destructive",
      });
      return;
    }
    setActiveScenario(scenarioId);
    setSelectedChoice(null);
    setResult(null);
  };

  const submitChoice = () => {
    if (!selectedChoice || !activeScenario || !selectedManager) return;

    mutation.mutate({
      managerId: selectedManager,
      scenarioId: activeScenario,
      choiceId: selectedChoice,
    });
  };

  const resetSimulation = () => {
    setActiveScenario(null);
    setSelectedChoice(null);
    setResult(null);
  };

  const currentScenario = scenarios.find((s) => s.id === activeScenario);
  const selectedChoiceData = currentScenario?.choices.find((c) => c.id === selectedChoice);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">LeadLab Simulations</h1>
        <p className="text-muted-foreground mt-1">
          Practice leadership decisions through gamified scenarios
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Manager</CardTitle>
          <CardDescription>
            Choose the manager who will participate in simulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedManager} onValueChange={setSelectedManager}>
            <SelectTrigger data-testid="select-manager">
              <SelectValue placeholder="Choose a manager" />
            </SelectTrigger>
            <SelectContent>
              {managersLoading ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : (
                managers?.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name} - {manager.role}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {!activeScenario ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} data-testid={`scenario-${scenario.id}`} className="hover-elevate cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                  <Badge variant="secondary" className="text-xs" data-testid={`theory-${scenario.id}`}>
                    {scenario.theory}
                  </Badge>
                </div>
                <CardTitle className="text-lg" data-testid={`title-${scenario.id}`}>{scenario.title}</CardTitle>
                <CardDescription className="line-clamp-3" data-testid={`description-${scenario.id}`}>
                  {scenario.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => startScenario(scenario.id)}
                  disabled={!selectedManager}
                  className="w-full"
                  data-testid={`button-start-${scenario.id}`}
                >
                  Start Scenario
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Badge variant="secondary" data-testid="badge-active-theory">{currentScenario?.theory}</Badge>
                  <CardTitle data-testid="text-active-scenario">{currentScenario?.title}</CardTitle>
                  <CardDescription className="text-base" data-testid="text-scenario-description">
                    {currentScenario?.description}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={resetSimulation} data-testid="button-back">
                  ← Back
                </Button>
              </div>
            </CardHeader>
          </Card>

          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Response</CardTitle>
                <CardDescription>
                  Select how you would handle this situation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentScenario?.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => setSelectedChoice(choice.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors hover-elevate ${
                      selectedChoice === choice.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    data-testid={`choice-${choice.id}`}
                  >
                    <p className="text-sm font-medium" data-testid={`text-choice-${choice.id}`}>{choice.label}</p>
                    {selectedChoice === choice.id && (
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1" data-testid={`impact-morale-${choice.id}`}>
                          <Users className="h-3 w-3" />
                          Morale: {choice.impact.morale > 0 ? "+" : ""}{choice.impact.morale}
                        </span>
                        <span className="flex items-center gap-1" data-testid={`impact-performance-${choice.id}`}>
                          <TrendingUp className="h-3 w-3" />
                          Performance: {choice.impact.performance > 0 ? "+" : ""}{choice.impact.performance}
                        </span>
                      </div>
                    )}
                  </button>
                ))}

                <div className="pt-4">
                  <Button
                    onClick={submitChoice}
                    disabled={!selectedChoice || mutation.isPending}
                    className="w-full"
                    data-testid="button-submit-choice"
                  >
                    {mutation.isPending ? "Processing..." : "Submit Choice"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    Simulation Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Team Morale
                        </span>
                        <span className="text-2xl font-mono font-semibold" data-testid="text-morale-score">
                          {result.teamMoraleScore}
                        </span>
                      </div>
                      <Progress value={(result.teamMoraleScore / 10) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground" data-testid="text-morale-impact">
                        Impact: {selectedChoiceData?.impact.morale > 0 ? "+" : ""}{selectedChoiceData?.impact.morale}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Performance
                        </span>
                        <span className="text-2xl font-mono font-semibold" data-testid="text-performance-score">
                          {result.performanceScore}
                        </span>
                      </div>
                      <Progress value={(result.performanceScore / 10) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground" data-testid="text-performance-impact">
                        Impact: {selectedChoiceData?.impact.performance > 0 ? "+" : ""}{selectedChoiceData?.impact.performance}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Leadership Insights
                    </h4>
                    <p className="text-sm leading-relaxed" data-testid="text-feedback">
                      {result.feedback}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={resetSimulation} data-testid="button-try-another">
                      Try Another Scenario
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = "/"} data-testid="button-dashboard">
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {selectedManager && history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation History</CardTitle>
            <CardDescription>
              Previous scenarios completed by this manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border"
                  data-testid={`history-${index}`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium" data-testid={`history-title-${index}`}>
                      {scenarios.find((s) => s.id === item.scenarioId)?.title}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`history-date-${index}`}>
                      {new Date(item.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1" data-testid={`history-morale-${index}`}>
                      <Users className="h-3 w-3" />
                      {item.teamMoraleScore}
                    </span>
                    <span className="flex items-center gap-1" data-testid={`history-performance-${index}`}>
                      <TrendingUp className="h-3 w-3" />
                      {item.performanceScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
