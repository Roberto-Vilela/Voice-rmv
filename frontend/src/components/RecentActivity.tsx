import { useTasks } from "../api/hooks";
import { useMemo } from "react";
import TaskRow from "./TaskRow";
import type { Task } from "../types";

interface Props {
  onSelectTask?: (task: Task) => void;
}

export default function RecentActivity({ onSelectTask }: Props) {
  const { data: tasks = [], isLoading, refetch } = useTasks();

  const recentTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    return [...tasks].slice(0, 5);
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex-grow">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
          <h2 className="text-headline-md text-on-surface">Recent Activity</h2>
        </div>
        <div className="p-6 text-center text-body-sm text-on-surface-variant">Loading…</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex-grow">
      <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
        <h2 className="text-headline-md text-on-surface">Recent Activity</h2>
        <button className="text-primary text-label-md hover:underline px-3 py-1 rounded-lg hover:bg-primary/5">
          View All
        </button>
      </div>
      <div className="zebra-striping">
        {recentTasks.map((task) => (
          <TaskRow key={task.id} task={task} onRefetch={refetch} onSelectTask={onSelectTask} />
        ))}
      </div>
    </div>
  );
}
