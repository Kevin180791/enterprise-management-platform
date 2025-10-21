import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function Capacity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kapazitätenplanung</h1>
        <p className="text-gray-600 mt-2">Planen Sie Mitarbeiterkapazitäten und Ressourcen</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Kapazitätsübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Kapazitätenplanung für Mitarbeiter und Projekte</p>
        </CardContent>
      </Card>
    </div>
  );
}
