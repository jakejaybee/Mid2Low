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

export function useRounds() {
  return useQuery({
    queryKey: ["/api/rounds"],
  });
}

export function useResources() {
  return useQuery({
    queryKey: ["/api/resources"],
  });
}

export function usePracticePlans() {
  return useQuery({
    queryKey: ["/api/practice-plans"],
  });
}

export function useActivePracticePlan() {
  return useQuery({
    queryKey: ["/api/practice-plans/active"],
  });
}
