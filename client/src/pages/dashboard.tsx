import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ClipboardList, MessageSquare, Activity, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: managers, isLoading: managersLoading } = useQuery<any[]>({
    queryKey: ["/api/managers"],
  });

  const { data: radarData, isLoading: radarLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/radar"],
  });

  const { data: trendData, isLoading: trendLoading } = useQuery<any[]>({
    queryKey: ["/api/dashboard/trends"],
  });

  const { data: pulseSnapshot, isLoading: pulseLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/pulse"],
  });

  const isLoading = managersLoading || radarLoading || trendLoading || pulseLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your leadership development and team insights
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-self-assessments">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Self Assessments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold font-mono" data-testid="text-assessments-count">
                {radarData?.selfAssessmentCount || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Completed assessments
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-feedback-received">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">360° Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold font-mono" data-testid="text-feedback-count">
                {radarData?.feedbackCount || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Responses received
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-pulse-score">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Pulse</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold font-mono" data-testid="text-pulse-score">
                {pulseSnapshot?.averageScore || "—"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Average team score
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-growth-trend">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-2xl font-semibold font-mono" data-testid="text-growth-percentage">
                  +{radarData?.growthPercentage || 0}%
                </div>
                <Badge variant="secondary" className="text-xs" data-testid="text-growth-status">
                  {radarData?.growthStatus || "Stable"}
                </Badge>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              vs. last assessment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <Card data-testid="card-radar-chart">
          <CardHeader>
            <CardTitle>Self vs 360° Comparison</CardTitle>
            <CardDescription>
              Identify gaps between self-perception and team feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            {radarLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <Skeleton className="h-[300px] w-[300px] rounded-full" />
              </div>
            ) : radarData?.competencies?.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData.competencies}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Radar
                    name="Self Assessment"
                    dataKey="self"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="360° Feedback"
                    dataKey="feedback"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">No data available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete a self-assessment and collect 360° feedback to see your comparison
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" data-testid="button-start-assessment">
                    <Link href="/self-assessment">Start Assessment</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" data-testid="button-collect-feedback">
                    <Link href="/feedback">Collect Feedback</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card data-testid="card-trend-chart">
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>
              Track your development across assessment cycles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : trendData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
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
                    dataKey="self"
                    name="Self Assessment"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="feedback"
                    name="360° Feedback"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                <TrendingUp className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">No trend data yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete multiple assessments to track your progress
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pulse Snapshot */}
      <Card data-testid="card-pulse-snapshot">
        <CardHeader>
          <CardTitle>Team Pulse Snapshot</CardTitle>
          <CardDescription>
            Latest team check-in results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pulseLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pulseSnapshot?.metrics?.length > 0 ? (
            <div className="space-y-4">
              {pulseSnapshot.metrics.map((metric: any) => (
                <div key={metric.name} className="space-y-2" data-testid={`metric-${metric.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className="text-sm font-mono text-muted-foreground" data-testid={`score-${metric.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {metric.score}/10
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(metric.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">No pulse data</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Collect team pulse responses to see insights
                </p>
              </div>
              <Button asChild size="sm" data-testid="button-pulse-check">
                <Link href="/pulse">Start Pulse Check</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
