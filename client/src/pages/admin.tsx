import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertManagerSchema, insertCompetencySchema } from "@shared/schema";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Plus, Users, Download, Sliders } from "lucide-react";
import { apiRequest, queryClient, isStaticMode } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const { toast } = useToast();
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [competencyDialogOpen, setCompetencyDialogOpen] = useState(false);

  const { data: managers, isLoading: managersLoading } = useQuery<any[]>({
    queryKey: ["/api/managers"],
  });

  const { data: competencies, isLoading: competenciesLoading } = useQuery<any[]>({
    queryKey: ["/api/competencies"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
  });

  const managerForm = useForm<typeof insertManagerSchema._type>({
    resolver: zodResolver(insertManagerSchema.extend({
      name: insertManagerSchema.shape.name.min(1, "Name is required"),
    })),
    defaultValues: {
      name: "",
      department: "",
      role: "",
    },
  });

  const competencyForm = useForm<typeof insertCompetencySchema._type>({
    resolver: zodResolver(insertCompetencySchema.extend({
      name: insertCompetencySchema.shape.name.min(1, "Name is required"),
    })),
    defaultValues: {
      name: "",
      description: "",
      order: 0,
    },
  });

  const managerMutation = useMutation({
    mutationFn: async (data: typeof insertManagerSchema._type) => {
      return await apiRequest("POST", "/api/managers", data);
    },
    onSuccess: () => {
      managerForm.reset();
      setManagerDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/managers"] });
      toast({
        title: "Manager created",
        description: "New manager has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create manager. Please try again.",
        variant: "destructive",
      });
    },
  });

  const competencyMutation = useMutation({
    mutationFn: async (data: typeof insertCompetencySchema._type) => {
      return await apiRequest("POST", "/api/competencies", data);
    },
    onSuccess: () => {
      competencyForm.reset();
      setCompetencyDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/competencies"] });
      toast({
        title: "Competency created",
        description: "New competency has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create competency. Please try again.",
        variant: "destructive",
      });
    },
  });

  const exportData = async (type: string) => {
    if (isStaticMode) {
      toast({
        title: "Export unavailable",
        description: "Export is not available in static mode. Please configure VITE_API_BASE_URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const url = `${API_BASE_URL}/api/admin/export/${type}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${type}-export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      toast({
        title: "Export successful",
        description: `${type} data has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Configure competencies, manage managers, and export data
        </p>
      </div>

      {isStaticMode && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">Demo Mode</CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              You're viewing static demo data. To enable full functionality (create, edit, export), configure VITE_API_BASE_URL to point to your backend server.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card data-testid="card-total-managers">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold font-mono" data-testid="text-manager-count">
                {stats?.managersCount || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-assessments">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <Sliders className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold font-mono" data-testid="text-assessment-count">
                {stats?.assessmentsCount || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-feedback">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">360° Responses</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold font-mono" data-testid="text-feedback-count">
                {stats?.feedbackCount || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-competencies">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competencies</CardTitle>
            <Badge className="h-4" data-testid="text-competency-count">
              {competencies?.length || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompetencyDialogOpen(true)}
              data-testid="button-add-competency"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Managers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Managers</CardTitle>
              <CardDescription>
                Create and manage manager records
              </CardDescription>
            </div>
            <Dialog open={managerDialogOpen} onOpenChange={setManagerDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-manager">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manager
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Manager</DialogTitle>
                  <DialogDescription>
                    Add a new manager to the system
                  </DialogDescription>
                </DialogHeader>

                <Form {...managerForm}>
                  <form onSubmit={managerForm.handleSubmit((data) => managerMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={managerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Manager name" {...field} data-testid="input-manager-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={managerForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Engineering, Sales" {...field} data-testid="input-department" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={managerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Engineering Manager" {...field} data-testid="input-role" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={managerMutation.isPending || isStaticMode} data-testid="button-submit-manager">
                        {managerMutation.isPending ? "Creating..." : "Create Manager"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setManagerDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {managersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : managers?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager: any) => (
                  <TableRow key={manager.id} data-testid={`manager-row-${manager.id}`}>
                    <TableCell className="font-medium" data-testid={`text-manager-name-${manager.id}`}>{manager.name}</TableCell>
                    <TableCell data-testid={`text-department-${manager.id}`}>{manager.department || "—"}</TableCell>
                    <TableCell data-testid={`text-role-${manager.id}`}>{manager.role || "—"}</TableCell>
                    <TableCell className="text-muted-foreground" data-testid={`text-created-${manager.id}`}>
                      {new Date(manager.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No managers yet. Create your first manager.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competencies Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Competencies</CardTitle>
              <CardDescription>
                Configure leadership competencies for assessments
              </CardDescription>
            </div>
            <Dialog open={competencyDialogOpen} onOpenChange={setCompetencyDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-add-competency-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competency
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Competency</DialogTitle>
                  <DialogDescription>
                    Add a new leadership competency
                  </DialogDescription>
                </DialogHeader>

                <Form {...competencyForm}>
                  <form onSubmit={competencyForm.handleSubmit((data) => competencyMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={competencyForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Emotional Intelligence" {...field} data-testid="input-competency-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={competencyForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what this competency measures..."
                              className="resize-none min-h-[80px]"
                              {...field}
                              data-testid="textarea-competency-description"
                            />
                          </FormControl>
                          <FormDescription>
                            Optional description to help users understand the competency
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={competencyMutation.isPending || isStaticMode} data-testid="button-submit-competency">
                        {competencyMutation.isPending ? "Creating..." : "Create Competency"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCompetencyDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {competenciesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : competencies?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competencies.map((competency: any) => (
                  <TableRow key={competency.id} data-testid={`competency-row-${competency.id}`}>
                    <TableCell className="font-medium" data-testid={`text-competency-name-${competency.id}`}>{competency.name}</TableCell>
                    <TableCell className="text-muted-foreground" data-testid={`text-competency-description-${competency.id}`}>
                      {competency.description || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No competencies configured. Add your first competency.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Download data for external analysis and reporting
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => exportData("managers")} disabled={isStaticMode} data-testid="button-export-managers">
            <Download className="h-4 w-4 mr-2" />
            Export Managers
          </Button>
          <Button variant="outline" onClick={() => exportData("assessments")} disabled={isStaticMode} data-testid="button-export-assessments">
            <Download className="h-4 w-4 mr-2" />
            Export Assessments
          </Button>
          <Button variant="outline" onClick={() => exportData("feedback")} disabled={isStaticMode} data-testid="button-export-feedback">
            <Download className="h-4 w-4 mr-2" />
            Export 360° Feedback
          </Button>
          <Button variant="outline" onClick={() => exportData("pulse")} disabled={isStaticMode} data-testid="button-export-pulse">
            <Download className="h-4 w-4 mr-2" />
            Export Pulse Checks
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
