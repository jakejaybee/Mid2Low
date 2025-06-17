import { Card, CardContent } from "@/components/ui/card";
import { Club, TrendingDown, Calendar, Target, Clock } from "lucide-react";

interface StatsCardsProps {
  stats: any;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;

  const cards = [
    {
      title: "Current Handicap",
      value: stats.currentHandicap,
      icon: Club,
      detail: "Official GHIN",
      color: "primary",
    },
    {
      title: "Total Activities",
      value: stats.totalActivities || 0,
      icon: Calendar,
      detail: `${stats.thisWeekActivities || 0} this week`,
      color: "secondary",
    },
    {
      title: "Total Hours",
      value: `${stats.totalHours || 0}h`,
      icon: Clock,
      detail: "All time tracked",
      color: "accent",
    },
    {
      title: "On-Course",
      value: stats.activityBreakdown?.['on-course'] || 0,
      icon: Target,
      detail: `${stats.activityBreakdown?.['practice-area'] || 0} practice, ${stats.activityBreakdown?.['off-course'] || 0} fitness`,
      color: "warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-${card.color}/10 rounded-lg flex items-center justify-center`}>
                    <Icon className={`text-${card.color} h-4 w-4 sm:h-5 sm:w-5`} />
                  </div>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{card.title}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                {card.detail && (
                  <div className="flex items-center text-xs sm:text-sm">
                    <Calendar className="text-gray-400 mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-gray-600 truncate">{card.detail}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
