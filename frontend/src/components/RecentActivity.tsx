import { useTasks } from "../api/hooks";
import { useMemo } from "react";
import TaskRow from "./TaskRow";

export default function RecentActivity() {
  const { data: tasks = [], isLoading } = useTasks();

  const reversedTasks = useMemo(() => {
    if (Array.isArray(tasks)) {
      return [...tasks].reverse();
    }
    return [];
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
        {reversedTasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
