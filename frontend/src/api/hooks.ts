import { useQuery } from "@tanstack/react-query";
import { getTask, getVoices, listTasks } from "./client";

export function useTask(taskId: string | null) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId!),
    enabled: !!taskId,
    refetchInterval: (query) =>
      query.state.data?.status === "completed" ||
      query.state.data?.status === "error"
        ? false
        : 1000,
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: listTasks,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}


export function useVoices() {
  return useQuery({
    queryKey: ["voices"],
    queryFn: getVoices,
    staleTime: 1000 * 60 * 60,
  });
}
