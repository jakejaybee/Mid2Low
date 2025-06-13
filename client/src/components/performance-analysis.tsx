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
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
          Performance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 sm:space-y-4">
          {performanceAreas.map((area, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">{area.name}</span>
                <span className={`text-xs sm:text-sm font-semibold ${getColorClass(area.color)}`}>
                  {area.rating}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(area.color)}`}
                  style={{ width: `${area.percentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{area.detail}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-lg">
          <div className="flex items-start">
            <Target className="text-primary mt-0.5 sm:mt-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm sm:text-base font-medium text-primary mb-1 sm:mb-2">AI Recommendation</h4>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{performance.recommendation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
