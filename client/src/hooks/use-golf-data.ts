import { useQuery } from "@tanstack/react-query";

export function useGolfStats() {
  return useQuery({
    queryKey: ["/api/stats"],
  });
}

export function usePerformanceAnalysis() {
  return useQuery({
    queryKey: ["/api/performance"],
  });
}

export function useActivities() {
  return useQuery({
    queryKey: ["/api/activities"],
  });
}
