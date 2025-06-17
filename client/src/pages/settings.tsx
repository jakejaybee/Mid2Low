import { Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <SettingsIcon className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure your app preferences and account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings Coming Soon</CardTitle>
          <CardDescription>
            We're working on adding customization options for your golf activity tracking experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <SettingsIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500">Settings panel will be available soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}