import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Club, TrendingDown, Calendar, Target, Clock, ChevronDown } from "lucide-react";
import { useState } from "react";

interface StatsCardsProps {
  stats: any;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const [handicapPeriod, setHandicapPeriod] = useState("current");
  
  if (!stats) return null;

  const getHandicapValue = () => {
    switch (handicapPeriod) {
      case "ytd":
        return stats.handicapYTD || stats.currentHandicap;
      case "alltime":
        return stats.handicapAllTime || stats.currentHandicap;
      default:
        return stats.currentHandicap;
    }
  };

  const getHandicapDetail = () => {
    switch (handicapPeriod) {
      case "ytd":
        return "Year to date";
      case "alltime":
        return "All time";
      default:
        return "Official GHIN";
    }
  };

  const cards = [
    {
      title: "Current Handicap",
      value: getHandicapValue(),
      icon: Club,
      detail: getHandicapDetail(),
      color: "primary",
      hasDropdown: true,
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
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
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
                {card.hasDropdown && (
                  <div className="ml-2 flex-shrink-0">
                    <Select value={handicapPeriod} onValueChange={setHandicapPeriod}>
                      <SelectTrigger className="w-auto h-8 text-xs border-none shadow-none p-1">
                        <ChevronDown className="h-3 w-3 text-gray-400" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="ytd">Year to Date</SelectItem>
                        <SelectItem value="alltime">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
