import { useQuery } from "@tanstack/react-query";
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
import { FileText, Download, TrendingUp, TrendingDown, AlertCircle, Lightbulb, Target } from "lucide-react";
import { useState } from "react";
import { isStaticMode } from "@/lib/queryClient";

export default function Reports() {
  const [selectedManager, setSelectedManager] = useState<string>("");

  const { data: managers, isLoading: managersLoading } = useQuery<any[]>({
    queryKey: ["/api/managers"],
  });

  const { data: report, isLoading: reportLoading } = useQuery<any>({
    queryKey: ["/api/reports", selectedManager],
    enabled: !!selectedManager,
  });

  const handleDownloadPDF = async () => {
    if (!selectedManager) return;
    
    if (isStaticMode) {
      console.error("PDF download is not available in static mode");
      return;
    }
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const url = `${API_BASE_URL}/api/reports/${selectedManager}/pdf`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `360-report-${selectedManager}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">360° Reports</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered insights and gap analysis from your feedback cycles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Manager</CardTitle>
          <CardDescription>
            View comprehensive 360° feedback analysis and action recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Select value={selectedManager} onValueChange={setSelectedManager}>
              <SelectTrigger className="flex-1" data-testid="select-manager">
                <SelectValue placeholder="Choose a manager to view their report" />
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
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={!selectedManager || reportLoading || isStaticMode}
              data-testid="button-download-pdf"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedManager && (
        <>
          {reportLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* AI Summary */}
              <Card data-testid="card-ai-summary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    AI Summary
                  </CardTitle>
                  <CardDescription>
                    Gemini-powered analysis of your 360° feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed" data-testid="text-summary">
                    {report.summary || "No AI summary available yet. Complete more feedback cycles for detailed analysis."}
                  </p>
                </CardContent>
              </Card>

              {/* Strengths & Development Areas */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card data-testid="card-strengths">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-chart-3" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.strengths?.length > 0 ? (
                      <ul className="space-y-2">
                        {report.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex gap-2 text-sm" data-testid={`strength-${index}`}>
                            <span className="text-chart-3 shrink-0">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No strengths identified yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-development-areas">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingDown className="h-5 w-5 text-chart-5" />
                      Development Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.developmentAreas?.length > 0 ? (
                      <ul className="space-y-2">
                        {report.developmentAreas.map((area: string, index: number) => (
                          <li key={index} className="flex gap-2 text-sm" data-testid={`development-area-${index}`}>
                            <span className="text-chart-5 shrink-0">•</span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No development areas identified yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Key Themes */}
              <Card data-testid="card-themes">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Key Themes
                  </CardTitle>
                  <CardDescription>
                    Recurring patterns in your feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.themes?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {report.themes.map((theme: string, index: number) => (
                        <Badge key={index} variant="secondary" data-testid={`theme-${index}`}>
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No themes identified yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card data-testid="card-action-items">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Recommended Actions
                  </CardTitle>
                  <CardDescription>
                    Evidence-based micro-actions grounded in HR theory (GROW, SBI, Path-Goal)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.actionItems?.length > 0 ? (
                    <div className="space-y-4">
                      {report.actionItems.map((action: string, index: number) => (
                        <div
                          key={index}
                          className="flex gap-3 p-3 rounded-lg bg-muted/50"
                          data-testid={`action-${index}`}
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-sm">{action}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <Lightbulb className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">
                        No action items yet. Complete self-assessment and collect 360° feedback for personalized recommendations.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  No report available for this manager yet. Complete assessments and collect feedback to generate insights.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
