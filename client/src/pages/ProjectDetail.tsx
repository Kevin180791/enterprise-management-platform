import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ClipboardList, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id || "";

  const { data: project, isLoading } = trpc.projects.get.useQuery({ id: projectId });
  const { data: tasks } = trpc.projects.getTasks.useQuery({ projectId });
  const { data: documents } = trpc.projects.getDocuments.useQuery({ projectId });
  const { data: teamMembers } = trpc.projects.getTeamMembers.useQuery({ projectId });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-12">Projekt nicht gefunden</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-gray-600 mt-2">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.status === "active" ? "bg-green-100 text-green-800" :
              project.status === "planning" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {project.status === "active" ? "Aktiv" :
               project.status === "planning" ? "Planung" :
               project.status === "completed" ? "Abgeschlossen" : "Pausiert"}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Teammitglieder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-gray-400" />
              <span className="text-2xl font-bold">{teamMembers?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Aufgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ClipboardList className="h-5 w-5 mr-2 text-gray-400" />
              <span className="text-2xl font-bold">{tasks?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Dokumente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-400" />
              <span className="text-2xl font-bold">{documents?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Aufgaben</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks && tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Noch keine Aufgaben vorhanden</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dokumente</CardTitle>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{doc.category}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Noch keine Dokumente vorhanden</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Teammitglieder</CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers && teamMembers.length > 0 ? (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-3 border rounded-lg">
                      <p className="font-medium">Mitarbeiter ID: {member.employeeId}</p>
                      <p className="text-sm text-gray-600 mt-1">Rolle: {member.role || "Nicht angegeben"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Noch keine Teammitglieder zugewiesen</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
