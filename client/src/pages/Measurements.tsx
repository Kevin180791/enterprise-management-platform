import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function Measurements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aufmaße</h1>
        <p className="text-gray-600 mt-2">Erfassen und verwalten Sie Bauaufmaße</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Aufmaße
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Aufmaße werden projektspezifisch erfasst</p>
        </CardContent>
      </Card>
    </div>
  );
}
