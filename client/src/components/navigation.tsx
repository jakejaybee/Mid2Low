import { Link, useLocation } from "wouter";
import { Club, Upload, Calendar, Settings, Trophy, Menu, X, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const navItems = [
    { path: "/", label: "Dashboard", icon: Club },
    { path: "/submit-round", label: "Submit Round", icon: Upload },
    { path: "/practice-plan", label: "Practice Plan", icon: Calendar },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Club className="text-primary text-2xl mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8" />
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Mid2Low</h1>
              </div>
            </div>
            
            {/* Desktop Header Content */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, <span className="font-medium">{user?.name || "Golfer"}</span>
              </span>
              <div className="flex items-center bg-primary text-white px-3 py-1 rounded-full text-sm">
                <Trophy className="mr-2 h-4 w-4" />
                <span>Handicap: {user?.handicap || "N/A"}</span>
              </div>
            </div>

            {/* Mobile Header Content */}
            <div className="md:hidden flex items-center space-x-2">
              <div className="flex items-center bg-primary text-white px-2 py-1 rounded-full text-xs">
                <Trophy className="mr-1 h-3 w-3" />
                <span>{user?.handicap || "N/A"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <nav className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
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
                    } py-4 px-1 text-sm font-medium flex items-center transition-colors whitespace-nowrap`}
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

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${
                      isActive
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"
                    } w-full text-left py-3 px-4 text-base font-medium flex items-center transition-colors`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Bottom Navigation for Mobile (iOS App Store Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="flex w-full h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            const isLocked = item.locked;
            
            return (
              <Link key={item.path} href={item.path} className="flex-1">
                <button
                  className={`${
                    isActive
                      ? "text-primary"
                      : isLocked ? "text-gray-300" : "text-gray-400"
                  } flex flex-col items-center justify-center h-full w-full transition-colors ${isLocked ? 'cursor-not-allowed' : ''}`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5 mb-1" />
                    {isLocked && <span className="absolute -top-1 -right-1 text-xs">🔒</span>}
                  </div>
                  <span className="text-xs font-medium truncate max-w-full">
                    {item.label.split(' ')[0]}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
