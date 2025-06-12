import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface PerformanceAnalysisProps {
  performance: any;
}

export default function PerformanceAnalysis({ performance }: PerformanceAnalysisProps) {
  if (!performance) return null;

  const getColorClass = (color: string) => {
    switch (color) {
      case 'success':
        return 'text-golf-success';
      case 'warning':
        return 'text-golf-warning';
      case 'error':
        return 'text-golf-error';
      default:
        return 'text-gray-500';
    }
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'success':
        return 'bg-golf-success';
      case 'warning':
        return 'bg-golf-warning';
      case 'error':
        return 'bg-golf-error';
      default:
        return 'bg-gray-400';
    }
  };

  const performanceAreas = [
    {
      name: "Driving Accuracy",
      ...performance.drivingAccuracy,
    },
    {
      name: "Short Game",
      ...performance.shortGame,
    },
    {
      name: "Putting",
      ...performance.putting,
    },
  ];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Performance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performanceAreas.map((area, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{area.name}</span>
                <span className={`text-sm font-semibold ${getColorClass(area.color)}`}>
                  {area.rating}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div
                  className={`h-2 rounded-full ${getProgressColor(area.color)}`}
                  style={{ width: `${area.percentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{area.detail}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <div className="flex items-start">
            <Target className="text-primary mt-1 mr-3 h-5 w-5" />
            <div>
              <h4 className="font-medium text-primary mb-2">AI Recommendation</h4>
              <p className="text-sm text-gray-700">{performance.recommendation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
