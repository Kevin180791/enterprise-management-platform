import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function RFIs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">RFI - Request for Information</h1>
        <p className="text-gray-600 mt-2">Verwalten Sie Anfragen und Klärungen</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            RFI Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">RFIs werden projektspezifisch verwaltet</p>
        </CardContent>
      </Card>
    </div>
  );
}
