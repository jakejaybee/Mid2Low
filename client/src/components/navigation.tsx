import { Link, useLocation } from "wouter";
import { Club, Upload, Calendar, Settings, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Navigation() {
  const [location] = useLocation();
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const navItems = [
    { path: "/", label: "Dashboard", icon: Club },
    { path: "/submit-round", label: "Submit Round", icon: Upload },
    { path: "/practice-plan", label: "Practice Plan", icon: Calendar },
    { path: "/resources", label: "Resources", icon: Settings },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Club className="text-primary text-2xl mr-3 h-8 w-8" />
                <h1 className="text-xl font-semibold text-gray-900">GolfPro Practice Planner</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, <span className="font-medium">{user?.name || "Golfer"}</span>
              </span>
              <div className="flex items-center bg-primary text-white px-3 py-1 rounded-full text-sm">
                <Trophy className="mr-2 h-4 w-4" />
                <span>Handicap: {user?.handicap || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`${
                      isActive
                        ? "border-b-2 border-primary text-primary"
                        : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } py-4 px-1 text-sm font-medium flex items-center transition-colors`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
