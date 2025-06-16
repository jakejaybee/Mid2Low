import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface RecentActivitiesProps {
  activities: any[];
}

const activityTypeLabels = {
  "off-course": "Off-Course",
  "on-course": "On-Course", 
  "practice-area": "Practice"
};

const activityTypeColors = {
  "off-course": "bg-blue-100 text-blue-800",
  "on-course": "bg-green-100 text-green-800",
  "practice-area": "bg-yellow-100 text-yellow-800"
};

const subtypeLabels = {
  "golf-strength-training": "Golf Strength Training",
  "playing-9-holes-walking": "9 Holes - Walking",
  "playing-9-holes-riding": "9 Holes - Riding", 
  "playing-18-holes-walking": "18 Holes - Walking",
  "playing-18-holes-riding": "18 Holes - Riding",
  "driving-range": "Driving Range",
  "putting-practice": "Putting Practice",
  "chipping-practice": "Chipping Practice",
  "wedge-work": "Wedge Work",
  "short-game-all-around": "Short Game - All Around",
  "cardio-workout": "Cardio Workout",
  "flexibility-stretching": "Flexibility & Stretching",
  "mental-training": "Mental Training"
};

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No activities recorded yet</p>
            <p className="text-sm text-gray-400">Start tracking your golf activities to see them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id || index}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 space-y-2 sm:space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge 
                    className={`${activityTypeColors[activity.activityType as keyof typeof activityTypeColors] || 'bg-gray-100 text-gray-800'} text-xs`}
                  >
                    {activityTypeLabels[activity.activityType as keyof typeof activityTypeLabels] || activity.activityType}
                  </Badge>
                  {activity.subType && (
                    <span className="text-sm font-medium text-gray-900">
                      {subtypeLabels[activity.subType as keyof typeof subtypeLabels] || activity.subType}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {format(new Date(activity.date), "MMM d, yyyy")}
                  </div>
                  
                  {activity.duration && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                    </div>
                  )}
                  
                  {activity.startTime && activity.endTime && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {format(new Date(activity.startTime), "h:mm a")} - {format(new Date(activity.endTime), "h:mm a")}
                    </div>
                  )}
                </div>

                {activity.comment && (
                  <div className="flex items-start mt-2">
                    <MessageSquare className="mr-2 h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 italic">"{activity.comment}"</p>
                  </div>
                )}
              </div>

              {/* Activity-specific metadata */}
              {activity.metadata && (
                <div className="mt-2 sm:mt-0 sm:ml-4 flex flex-wrap gap-2">
                  {activity.metadata.course && (
                    <span className="text-xs bg-white px-2 py-1 rounded border">
                      {activity.metadata.course}
                    </span>
                  )}
                  {activity.metadata.score && (
                    <span className="text-xs bg-white px-2 py-1 rounded border font-medium">
                      Score: {activity.metadata.score}
                    </span>
                  )}
                  {activity.metadata.bucketSize && (
                    <span className="text-xs bg-white px-2 py-1 rounded border">
                      {activity.metadata.bucketSize} bucket
                    </span>
                  )}
                  {activity.metadata.ballsHit && (
                    <span className="text-xs bg-white px-2 py-1 rounded border">
                      {activity.metadata.ballsHit} balls
                    </span>
                  )}
                  {activity.metadata.workoutType && (
                    <span className="text-xs bg-white px-2 py-1 rounded border">
                      {activity.metadata.workoutType}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}