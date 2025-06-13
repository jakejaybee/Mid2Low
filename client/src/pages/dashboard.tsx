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
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
              <Skeleton className="h-12 sm:h-16 w-full" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Skeleton className="h-64 sm:h-80 lg:h-96 w-full" />
          <Skeleton className="h-64 sm:h-80 lg:h-96 w-full" />
        </div>
        <Skeleton className="h-48 sm:h-56 lg:h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <ProgressChart />
        <PerformanceAnalysis performance={performance} />
      </div>

      <RecentRounds rounds={stats?.recentRounds || []} />
    </div>
  );
}
