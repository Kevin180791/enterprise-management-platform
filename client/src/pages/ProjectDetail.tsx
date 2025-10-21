import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  ClipboardList,
  FileText,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TaskFormData = {
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string;
  startDate: string;
  dueDate: string;
  estimatedHours: string;
};

type TeamMemberFormData = {
  employeeId: string;
  role: string;
};

const initialTaskFormData: TaskFormData = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  assignedTo: "",
  startDate: "",
  dueDate: "",
  estimatedHours: "",
};

const initialTeamMemberFormData: TeamMemberFormData = {
  employeeId: "",
  role: "",
};

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id || "";

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskFormData, setTaskFormData] = useState<TaskFormData>(initialTaskFormData);
  const [teamFormData, setTeamFormData] = useState<TeamMemberFormData>(initialTeamMemberFormData);

  const utils = trpc.useUtils();
  const { data: project, isLoading } = trpc.projects.get.useQuery({ id: projectId });
  const { data: tasks } = trpc.projects.getTasks.useQuery({ projectId });
  const { data: documents } = trpc.projects.getDocuments.useQuery({ projectId });
  const { data: teamMembers } = trpc.projects.getTeamMembers.useQuery({ projectId });
  const { data: employees } = trpc.employees.list.useQuery();

  const createTaskMutation = trpc.projects.createTask.useMutation({
    onSuccess: () => {
      utils.projects.getTasks.invalidate();
      toast.success("Aufgabe erfolgreich erstellt");
      setIsTaskDialogOpen(false);
      setTaskFormData(initialTaskFormData);
    },
    onError: (error) => {
      toast.error("Fehler: " + error.message);
    },
  });

  const updateTaskMutation = trpc.projects.updateTask.useMutation({
    onSuccess: () => {
      utils.projects.getTasks.invalidate();
      toast.success("Aufgabe erfolgreich aktualisiert");
      setIsTaskDialogOpen(false);
      setEditingTaskId(null);
      setTaskFormData(initialTaskFormData);
    },
    onError: (error) => {
      toast.error("Fehler: " + error.message);
    },
  });

  const deleteTaskMutation = trpc.projects.deleteTask.useMutation({
    onSuccess: () => {
      utils.projects.getTasks.invalidate();
      toast.success("Aufgabe erfolgreich gelöscht");
    },
    onError: (error) => {
      toast.error("Fehler: " + error.message);
    },
  });

  const addTeamMemberMutation = trpc.projects.addTeamMember.useMutation({
    onSuccess: () => {
      utils.projects.getTeamMembers.invalidate();
      toast.success("Teammitglied erfolgreich hinzugefügt");
      setIsTeamDialogOpen(false);
      setTeamFormData(initialTeamMemberFormData);
    },
    onError: (error) => {
      toast.error("Fehler: " + error.message);
    },
  });

  const removeTeamMemberMutation = trpc.projects.removeTeamMember.useMutation({
    onSuccess: () => {
      utils.projects.getTeamMembers.invalidate();
      toast.success("Teammitglied erfolgreich entfernt");
    },
    onError: (error) => {
      toast.error("Fehler: " + error.message);
    },
  });

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskFormData.title) {
      toast.error("Bitte geben Sie einen Titel ein");
      return;
    }

    const data = {
      projectId,
      ...taskFormData,
      startDate: taskFormData.startDate ? new Date(taskFormData.startDate) : undefined,
      dueDate: taskFormData.dueDate ? new Date(taskFormData.dueDate) : undefined,
      estimatedHours: taskFormData.estimatedHours ? parseInt(taskFormData.estimatedHours) : undefined,
      description: taskFormData.description || undefined,
      assignedTo: taskFormData.assignedTo || undefined,
    };

    if (editingTaskId) {
      updateTaskMutation.mutate({ id: editingTaskId, ...data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTaskId(task.id);
    setTaskFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || "",
      startDate: task.startDate ? new Date(task.startDate).toISOString().split("T")[0] : "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      estimatedHours: task.estimatedHours?.toString() || "",
    });
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Möchten Sie diese Aufgabe wirklich löschen?")) {
      deleteTaskMutation.mutate({ id });
    }
  };

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamFormData.employeeId) {
      toast.error("Bitte wählen Sie einen Mitarbeiter aus");
      return;
    }

    addTeamMemberMutation.mutate({
      projectId,
      employeeId: teamFormData.employeeId,
      role: teamFormData.role || undefined,
    });
  };

  const handleRemoveTeamMember = (memberId: string) => {
    if (confirm("Möchten Sie dieses Teammitglied wirklich entfernen?")) {
      removeTeamMemberMutation.mutate({ memberId });
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees?.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unbekannt";
  };

  const taskStats = {
    total: tasks?.length || 0,
    pending: tasks?.filter(t => t.status === "pending").length || 0,
    inProgress: tasks?.filter(t => t.status === "in_progress").length || 0,
    completed: tasks?.filter(t => t.status === "completed").length || 0,
    blocked: tasks?.filter(t => t.status === "blocked").length || 0,
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Projekt nicht gefunden</p>
        <Link href="/projects">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description || "Keine Beschreibung"}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.status === "active" ? "bg-green-100 text-green-800" :
              project.status === "planning" ? "bg-blue-100 text-blue-800" :
              project.status === "completed" ? "bg-gray-100 text-gray-800" :
              project.status === "on_hold" ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {project.status === "active" ? "Aktiv" :
               project.status === "planning" ? "Planung" :
               project.status === "completed" ? "Abgeschlossen" :
               project.status === "on_hold" ? "Pausiert" : "Abgebrochen"}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.priority === "critical" ? "bg-red-100 text-red-800" :
              project.priority === "high" ? "bg-orange-100 text-orange-800" :
              project.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {project.priority === "critical" ? "Kritisch" :
               project.priority === "high" ? "Hoch" :
               project.priority === "medium" ? "Mittel" : "Niedrig"}
            </span>
          </div>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Kunde</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{project.client || "Nicht angegeben"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Standort</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{project.location || "Nicht angegeben"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {project.budget 
                ? (project.budget / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                : "Nicht angegeben"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Zeitraum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {project.startDate 
                ? new Date(project.startDate).toLocaleDateString("de-DE")
                : "Nicht angegeben"}
              {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString("de-DE")}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">
            <ClipboardList className="h-4 w-4 mr-2" />
            Aufgaben ({taskStats.total})
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team ({teamMembers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Dokumente ({documents?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">Offen: </span>
                <span className="font-semibold">{taskStats.pending}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">In Bearbeitung: </span>
                <span className="font-semibold">{taskStats.inProgress}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Abgeschlossen: </span>
                <span className="font-semibold">{taskStats.completed}</span>
              </div>
              {taskStats.blocked > 0 && (
                <div className="text-sm">
                  <span className="text-gray-600">Blockiert: </span>
                  <span className="font-semibold text-red-600">{taskStats.blocked}</span>
                </div>
              )}
            </div>
            <Button onClick={() => {
              setEditingTaskId(null);
              setTaskFormData(initialTaskFormData);
              setIsTaskDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Aufgabe
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {tasks && tasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titel</TableHead>
                      <TableHead>Zugewiesen an</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priorität</TableHead>
                      <TableHead>Fällig am</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-600 line-clamp-1">{task.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {task.assignedTo ? getEmployeeName(task.assignedTo) : "Nicht zugewiesen"}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === "completed" ? "bg-green-100 text-green-800" :
                            task.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                            task.status === "blocked" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {task.status === "completed" ? <CheckCircle2 className="h-3 w-3 mr-1" /> :
                             task.status === "in_progress" ? <Circle className="h-3 w-3 mr-1" /> :
                             task.status === "blocked" ? <AlertCircle className="h-3 w-3 mr-1" /> :
                             <Circle className="h-3 w-3 mr-1" />}
                            {task.status === "completed" ? "Abgeschlossen" :
                             task.status === "in_progress" ? "In Bearbeitung" :
                             task.status === "blocked" ? "Blockiert" : "Offen"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === "critical" ? "bg-red-100 text-red-800" :
                            task.priority === "high" ? "bg-orange-100 text-orange-800" :
                            task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {task.priority === "critical" ? "Kritisch" :
                             task.priority === "high" ? "Hoch" :
                             task.priority === "medium" ? "Mittel" : "Niedrig"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {task.dueDate 
                            ? new Date(task.dueDate).toLocaleDateString("de-DE")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTask(task)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">Noch keine Aufgaben vorhanden</p>
                  <Button onClick={() => {
                    setEditingTaskId(null);
                    setTaskFormData(initialTaskFormData);
                    setIsTaskDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Erste Aufgabe erstellen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Teammitglieder</h3>
            <Button onClick={() => {
              setTeamFormData(initialTeamMemberFormData);
              setIsTeamDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Mitglied hinzufügen
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {teamMembers && teamMembers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Rolle</TableHead>
                      <TableHead>Zugewiesen am</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {getEmployeeName(member.employeeId)}
                        </TableCell>
                        <TableCell>{member.role || "Nicht angegeben"}</TableCell>
                        <TableCell>
                          {new Date(member.assignedDate).toLocaleDateString("de-DE")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTeamMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">Noch keine Teammitglieder zugewiesen</p>
                  <Button onClick={() => {
                    setTeamFormData(initialTeamMemberFormData);
                    setIsTeamDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Erstes Mitglied hinzufügen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dokumente</CardTitle>
              <CardDescription>Projektbezogene Dokumente und Dateien</CardDescription>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Kategorie: {doc.category === "plan" ? "Plan" :
                                   doc.category === "contract" ? "Vertrag" :
                                   doc.category === "rfi" ? "RFI" :
                                   doc.category === "measurement" ? "Aufmaß" :
                                   doc.category === "progress_report" ? "Fortschrittsbericht" : "Sonstiges"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">Noch keine Dokumente vorhanden</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTaskId ? "Aufgabe bearbeiten" : "Neue Aufgabe erstellen"}
            </DialogTitle>
            <DialogDescription>
              Geben Sie die Aufgabeninformationen ein
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="taskTitle">Titel *</Label>
                <Input
                  id="taskTitle"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskDescription">Beschreibung</Label>
                <Textarea
                  id="taskDescription"
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskStatus">Status</Label>
                  <Select
                    value={taskFormData.status}
                    onValueChange={(value: any) => setTaskFormData({ ...taskFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Offen</SelectItem>
                      <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                      <SelectItem value="completed">Abgeschlossen</SelectItem>
                      <SelectItem value="blocked">Blockiert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskPriority">Priorität</Label>
                  <Select
                    value={taskFormData.priority}
                    onValueChange={(value: any) => setTaskFormData({ ...taskFormData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niedrig</SelectItem>
                      <SelectItem value="medium">Mittel</SelectItem>
                      <SelectItem value="high">Hoch</SelectItem>
                      <SelectItem value="critical">Kritisch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskAssignedTo">Zugewiesen an</Label>
                <Select
                  value={taskFormData.assignedTo}
                  onValueChange={(value) => setTaskFormData({ ...taskFormData, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.filter(e => e.status === "active").map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskStartDate">Startdatum</Label>
                  <Input
                    id="taskStartDate"
                    type="date"
                    value={taskFormData.startDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskDueDate">Fälligkeitsdatum</Label>
                  <Input
                    id="taskDueDate"
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskEstimatedHours">Geschätzte Stunden</Label>
                <Input
                  id="taskEstimatedHours"
                  type="number"
                  value={taskFormData.estimatedHours}
                  onChange={(e) => setTaskFormData({ ...taskFormData, estimatedHours: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={createTaskMutation.isPending || updateTaskMutation.isPending}>
                {editingTaskId ? "Aktualisieren" : "Erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Team Member Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teammitglied hinzufügen</DialogTitle>
            <DialogDescription>
              Fügen Sie ein Teammitglied zum Projekt hinzu
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTeamSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teamEmployeeId">Mitarbeiter *</Label>
                <Select
                  value={teamFormData.employeeId}
                  onValueChange={(value) => setTeamFormData({ ...teamFormData, employeeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.filter(e => e.status === "active").map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamRole">Rolle</Label>
                <Input
                  id="teamRole"
                  value={teamFormData.role}
                  onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value })}
                  placeholder="z.B. Bauleiter, Planer, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={addTeamMemberMutation.isPending}>
                Hinzufügen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

