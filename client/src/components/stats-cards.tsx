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
      improvement: stats.handicapImprovement,
      improvementText: "this month",
      color: "primary",
    },
    {
      title: "Rounds Played",
      value: stats.roundsPlayed,
      icon: Calendar,
      detail: "Last round: 3 days ago",
      color: "secondary",
    },
    {
      title: "Practice Hours",
      value: stats.practiceHours,
      icon: Clock,
      detail: "This month",
      color: "accent",
    },
    {
      title: "Practice Goal",
      value: stats.goalTarget,
      icon: Target,
      progress: stats.goalProgress,
      color: "warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 bg-${card.color}/10 rounded-lg flex items-center justify-center`}>
                    <Icon className={`text-${card.color} h-5 w-5`} />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
              <div className="mt-4">
                {card.improvement && (
                  <div className="flex items-center text-sm">
                    <TrendingDown className="text-success mr-1 h-4 w-4" />
                    <span className="text-success font-medium">{card.improvement}</span>
                    <span className="text-gray-600 ml-1">{card.improvementText}</span>
                  </div>
                )}
                {card.detail && (
                  <div className="flex items-center text-sm">
                    <Calendar className="text-gray-400 mr-1 h-4 w-4" />
                    <span className="text-gray-600">{card.detail}</span>
                  </div>
                )}
                {card.progress && (
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${card.color} h-2 rounded-full`}
                        style={{ width: `${card.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 mt-1 block">{card.progress}% to goal</span>
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
