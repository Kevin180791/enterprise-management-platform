import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Projects() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projekte</h1>
          <p className="text-gray-600 mt-2">Verwalten Sie alle Bauprojekte</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Projekt erstellen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : projects && projects.length > 0 ? (
          projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{project.name}</span>
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.client && (
                      <p className="text-sm text-gray-600">Kunde: {project.client}</p>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === "active" ? "bg-green-100 text-green-800" :
                        project.status === "planning" ? "bg-blue-100 text-blue-800" :
                        project.status === "completed" ? "bg-gray-100 text-gray-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {project.status === "active" ? "Aktiv" :
                         project.status === "planning" ? "Planung" :
                         project.status === "completed" ? "Abgeschlossen" :
                         project.status === "on_hold" ? "Pausiert" : "Abgebrochen"}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">Noch keine Projekte vorhanden</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Erstes Projekt erstellen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
