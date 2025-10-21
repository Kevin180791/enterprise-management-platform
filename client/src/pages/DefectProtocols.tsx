import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function DefectProtocols() {
  const params = useParams();
  const projectId = params.projectId as string | undefined;
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    trade: "",
    category: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    responsibleParty: "",
    responsibleContact: "",
    detectedDate: new Date().toISOString().split('T')[0],
    dueDate: "",
  });

  const { data: projects } = trpc.projects.list.useQuery();
  const { data: defects, isLoading } = trpc.defectProtocols.list.useQuery(
    { projectId: projectId || selectedProjectId },
    { enabled: !!(projectId || selectedProjectId) }
  );
  const utils = trpc.useUtils();
  const createMutation = trpc.defectProtocols.create.useMutation({
    onSuccess: () => {
      toast.success("Mangel erfasst");
      setIsDialogOpen(false);
      const pid = projectId || selectedProjectId;
      if (pid) {
        utils.defectProtocols.list.invalidate({ projectId: pid });
      }
    },
  });

  const severityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  const statusIcons = {
    open: <Clock className="h-4 w-4 text-yellow-600" />,
    in_progress: <Clock className="h-4 w-4 text-blue-600" />,
    resolved: <CheckCircle className="h-4 w-4 text-green-600" />,
    verified: <CheckCircle className="h-4 w-4 text-green-700" />,
    closed: <XCircle className="h-4 w-4 text-gray-600" />,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mängelprotokoll</h1>
          <p className="text-muted-foreground mt-2">Erfassung und Verfolgung von Baumängeln</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} disabled={!projectId && !selectedProjectId}>
          <Plus className="h-4 w-4 mr-2" />
          Mangel erfassen
        </Button>
      </div>

      {!projectId && (
        <div className="mb-6">
          <Label htmlFor="project-select">Projekt auswählen</Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger id="project-select">
              <SelectValue placeholder="Bitte Projekt auswählen" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-4">
        {defects && defects.length > 0 ? (
          defects.map((defect) => (
            <Card key={defect.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{defect.defectNumber}</Badge>
                      <Badge className={severityColors[defect.severity]}>
                        {defect.severity === "low" ? "Niedrig" : defect.severity === "medium" ? "Mittel" : defect.severity === "high" ? "Hoch" : "Kritisch"}
                      </Badge>
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      {defect.title}
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        {statusIcons[defect.status]}
                        {defect.status === "open" ? "Offen" : defect.status === "in_progress" ? "In Bearbeitung" : defect.status === "resolved" ? "Behoben" : defect.status === "verified" ? "Verifiziert" : "Geschlossen"}
                      </span>
                      {defect.location && <span>📍 {defect.location}</span>}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Beschreibung</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{defect.description}</p>
                </div>
                {defect.responsibleParty && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Verantwortlich:</span> {defect.responsibleParty}
                    </div>
                    {defect.dueDate && (
                      <div>
                        <span className="font-semibold">Fällig:</span> {format(new Date(defect.dueDate), "dd.MM.yyyy")}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Keine Mängel erfasst</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neuen Mangel erfassen</DialogTitle>
            <DialogDescription>Dokumentieren Sie festgestellte Baumängel</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                placeholder="Kurze Beschreibung des Mangels"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Beschreibung *</Label>
              <Textarea
                id="description"
                placeholder="Detaillierte Beschreibung des Mangels"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Ort</Label>
                <Input
                  id="location"
                  placeholder="z.B. EG, Raum 101"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="severity">Schweregrad *</Label>
                <Select value={formData.severity} onValueChange={(value: any) => setFormData({ ...formData, severity: value })}>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trade">Gewerk</Label>
                <Input
                  id="trade"
                  placeholder="z.B. KG410, KG420"
                  value={formData.trade}
                  onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Input
                  id="category"
                  placeholder="z.B. Elektro, Sanitär"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsibleParty">Verantwortliche Firma</Label>
                <Input
                  id="responsibleParty"
                  placeholder="Name der verantwortlichen Firma"
                  value={formData.responsibleParty}
                  onChange={(e) => setFormData({ ...formData, responsibleParty: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="responsibleContact">Kontakt</Label>
                <Input
                  id="responsibleContact"
                  placeholder="Ansprechpartner"
                  value={formData.responsibleContact}
                  onChange={(e) => setFormData({ ...formData, responsibleContact: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="detectedDate">Feststellungsdatum *</Label>
                <Input
                  id="detectedDate"
                  type="date"
                  value={formData.detectedDate}
                  onChange={(e) => setFormData({ ...formData, detectedDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
            <Button 
              onClick={() => createMutation.mutate({ 
                projectId: projectId || selectedProjectId,
                title: formData.title,
                description: formData.description,
                location: formData.location,
                trade: formData.trade,
                category: formData.category,
                severity: formData.severity,
                responsibleParty: formData.responsibleParty,
                responsibleContact: formData.responsibleContact,
                detectedDate: new Date(formData.detectedDate),
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
              })}
              disabled={!formData.title || !formData.description}
            >
              Mangel erfassen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
