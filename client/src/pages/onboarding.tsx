import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GhinOnboarding from "@/components/ghin-onboarding";
import { CheckCircle, AlertCircle, ArrowRight, Trophy, Target } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ghinStatus = urlParams.get('ghin');
    
    if (ghinStatus === 'connected') {
      setConnectionStatus('success');
      // Clean up URL
      window.history.replaceState({}, '', '/onboarding');
    } else if (ghinStatus === 'error') {
      setConnectionStatus('error');
      // Clean up URL
      window.history.replaceState({}, '', '/onboarding');
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Mid2Low
        </h1>
        <p className="text-lg text-gray-600">
          Let's get you set up with personalized golf improvement tracking
        </p>
      </div>

      {/* Connection Status Alerts */}
      {connectionStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Success!</strong> Your GHIN account has been connected successfully. 
            Your scores and handicap will now sync automatically.
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus === 'error' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            <strong>Connection Failed:</strong> There was an issue connecting your GHIN account. 
            Please try again or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      )}

      {/* Onboarding Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                1
              </div>
              <CardTitle className="text-lg">Connect GHIN</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Link your official GHIN account to automatically import your golf scores and handicap data.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardHeader>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                2
              </div>
              <CardTitle className="text-lg">Add Resources</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Tell us about your available practice facilities and equipment for personalized recommendations.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardHeader>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                3
              </div>
              <CardTitle className="text-lg">Generate Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Get AI-powered practice plans tailored to your performance data and availability.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* GHIN Integration Section */}
      <GhinOnboarding />

      {/* Quick Start Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Ready to Get Started?</CardTitle>
          <p className="text-gray-600">
            Once you've connected your GHIN account, explore these key features
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => setLocation('/resources')}
            >
              <div className="flex items-center w-full">
                <Target className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Add Practice Resources</div>
                  <div className="text-sm text-gray-600">Set up your facilities and equipment</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => setLocation('/practice-plan')}
            >
              <div className="flex items-center w-full">
                <Trophy className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Generate Practice Plan</div>
                  <div className="text-sm text-gray-600">Get personalized training recommendations</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => setLocation('/submit-round')}
            >
              <div className="flex items-center w-full">
                <CheckCircle className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Submit Round Manually</div>
                  <div className="text-sm text-gray-600">Add scores with screenshot analysis</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => setLocation('/')}
            >
              <div className="flex items-center w-full">
                <Trophy className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">View Dashboard</div>
                  <div className="text-sm text-gray-600">Track your progress and performance</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">💡 Pro Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-blue-800">
            <li>• Connect GHIN first for the most accurate practice recommendations</li>
            <li>• Add all your available practice facilities for comprehensive plans</li>
            <li>• Be honest about your time availability - realistic plans work better</li>
            <li>• Check back weekly to track your improvement and adjust plans</li>
            <li>• Use the manual round submission for courses not in GHIN</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}