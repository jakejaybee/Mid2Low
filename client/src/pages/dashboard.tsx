import { useQuery } from "@tanstack/react-query";
import StatsCards from "@/components/stats-cards";
import ProgressChart from "@/components/progress-chart";
import PerformanceAnalysis from "@/components/performance-analysis";
import RecentRounds from "@/components/recent-rounds";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/performance"],
  });

  if (statsLoading || performanceLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProgressChart />
        <PerformanceAnalysis performance={performance} />
      </div>

      <RecentRounds rounds={stats?.recentRounds || []} />
    </div>
  );
}
