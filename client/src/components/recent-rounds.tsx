import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecentRoundsProps {
  rounds: any[];
}

export default function RecentRounds({ rounds }: RecentRoundsProps) {
  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
            Recent Rounds
          </CardTitle>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Mobile Card Layout */}
        <div className="block md:hidden space-y-3">
          {rounds.map((round) => (
            <div key={round.id} className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{round.courseName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(round.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={round.processed ? "default" : "secondary"} className="text-xs">
                  {round.processed ? "Processed" : "Pending"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Score:</span>
                <span className="font-medium text-gray-900">{round.totalScore}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Differential:</span>
                <span className="text-gray-900">+{round.differential}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Differential
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rounds.map((round) => (
                <tr key={round.id}>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(round.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {round.courseName}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {round.totalScore}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    +{round.differential}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <Badge variant={round.processed ? "default" : "secondary"}>
                      {round.processed ? "Processed" : "Pending"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
