import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Download, 
  RefreshCw, 
  Unlink, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Clock,
  Target
} from "lucide-react";

export default function GhinOnboarding() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const connectGhinMutation = useMutation({
    mutationFn: async () => {
      setIsConnecting(true);
      const response = await apiRequest('GET', '/api/ghin/auth-url');
      if (response.authUrl) {
        window.location.href = response.authUrl;
      }
      return response;
    },
    onError: (error: any) => {
      setIsConnecting(false);
      const isConfigIssue = error.message?.includes('configuration') || error.message?.includes('requires setup');
      toast({
        title: isConfigIssue ? "GHIN Setup Required" : "Connection Failed",
        description: isConfigIssue 
          ? "GHIN API credentials are needed to enable automatic score syncing. You can still use manual score entry in the meantime."
          : error.message,
        variant: isConfigIssue ? "default" : "destructive",
      });
    },
  });

  const syncGhinMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/ghin/sync'),
    onSuccess: (data) => {
      toast({
        title: "GHIN Data Synced",
        description: `Successfully imported ${data.newRounds} new rounds and updated handicap to ${data.handicap || 'N/A'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rounds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/performance"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectGhinMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/ghin/disconnect'),
    onSuccess: () => {
      toast({
        title: "GHIN Disconnected",
        description: "Your GHIN account has been disconnected successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isConnected = user?.ghinConnected;
  const lastSync = user?.lastGhinSync ? new Date(user.lastGhinSync) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Shield className="mr-2 h-5 w-5 text-primary" />
              GHIN Integration
            </CardTitle>
            <p className="text-gray-600 mt-1">
              Connect your GHIN account to automatically import scores and track your official handicap
            </p>
          </div>
          {isConnected && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="space-y-6">
            {/* Benefits Section */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <h4 className="font-medium text-primary mb-3">Benefits of Connecting GHIN:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <Download className="mr-2 h-4 w-4 text-primary" />
                  Automatically import all your recent golf rounds
                </li>
                <li className="flex items-center">
                  <Target className="mr-2 h-4 w-4 text-primary" />
                  Real-time handicap tracking and updates
                </li>
                <li className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 text-primary" />
                  Enhanced practice plan recommendations based on official scores
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  No more manual score entry - everything syncs automatically
                </li>
              </ul>
            </div>

            {/* Privacy Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Your privacy is protected:</strong> We only access your golf scores and handicap information. 
                Your GHIN login credentials are never stored on our servers.
              </AlertDescription>
            </Alert>

            {/* Connection Steps */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">How it works:</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Connect to GHIN</p>
                    <p className="text-sm text-gray-600">Securely link your existing GHIN account</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Import Your History</p>
                    <p className="text-sm text-gray-600">We'll import your recent rounds and current handicap</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Get Personalized Plans</p>
                    <p className="text-sm text-gray-600">Receive AI-powered practice recommendations based on your actual performance</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Connect Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => connectGhinMutation.mutate()}
                disabled={isConnecting}
                className="bg-primary text-white px-8 py-3 font-medium hover:bg-primary/90"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connecting to GHIN...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect Your GHIN Account
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connected Status */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-900">GHIN Account Connected</h4>
                  <p className="text-sm text-green-700 mt-1">
                    GHIN #: {user?.ghinNumber || "N/A"}
                  </p>
                  {lastSync && (
                    <p className="text-xs text-green-600 mt-1">
                      Last synced: {lastSync.toLocaleDateString()} at {lastSync.toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            {/* Sync Controls */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Sync Your Latest Scores</h4>
                <p className="text-sm text-gray-600">
                  Import new rounds and update your handicap from GHIN
                </p>
              </div>
              <Button
                onClick={() => syncGhinMutation.mutate()}
                disabled={syncGhinMutation.isPending}
                variant="outline"
              >
                {syncGhinMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>

            {/* Auto-sync Notice */}
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your GHIN data automatically syncs when you generate new practice plans. 
                You can also manually sync anytime using the button above.
              </AlertDescription>
            </Alert>

            <Separator />

            {/* Disconnect Option */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Manage Connection</h4>
                <p className="text-sm text-gray-600">
                  Disconnect your GHIN account if needed
                </p>
              </div>
              <Button
                onClick={() => disconnectGhinMutation.mutate()}
                disabled={disconnectGhinMutation.isPending}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {disconnectGhinMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect GHIN
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}