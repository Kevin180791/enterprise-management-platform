import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Documents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dokumente</h1>
        <p className="text-gray-600 mt-2">Zentrale Dokumentenverwaltung</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Dokumente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Dokumente werden projektspezifisch in den Projektdetails verwaltet</p>
        </CardContent>
      </Card>
    </div>
  );
}
