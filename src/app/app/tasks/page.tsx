"use client";
import { SectionTitle } from "@/components/app/ui";
import { TaskList } from "@/components/app/TaskList";

export default function TasksPage() {
  return (
    <div>
      <SectionTitle kicker="Everything, one place">All Tasks</SectionTitle>
      <p className="mb-6 max-w-xl text-sm text-ink-3">
        The full move. Filter by category, check things off, add anything that
        comes up. Critical-path items are flagged.
      </p>
      <TaskList groupBy="category" showCategoryFilter />
    </div>
  );
}
