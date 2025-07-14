import { memo, useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";

// Memoized placeholder content to prevent re-creation
const PlaceholderContent = memo(() => (
  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
    <div className="text-center" role="img" aria-label="Chart placeholder">
      <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-2" aria-hidden="true" />
      <p className="text-gray-500 font-medium">Handicap Progress Chart</p>
      <p className="text-sm text-gray-400">Chart visualization coming soon</p>
    </div>
  </div>
));

PlaceholderContent.displayName = "PlaceholderContent";

const ProgressChart = memo(() => {
  const [timeRange, setTimeRange] = useState("last-year");

  // Memoized callback to prevent unnecessary re-renders of Select component
  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value);
    // Add analytics or data fetching logic here when chart is implemented
  }, []);

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Handicap Progress
          </CardTitle>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-40" aria-label="Select time range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-year">Last year</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
              <SelectItem value="all-time">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <PlaceholderContent />
      </CardContent>
    </Card>
  );
});

ProgressChart.displayName = "ProgressChart";

export default ProgressChart;
