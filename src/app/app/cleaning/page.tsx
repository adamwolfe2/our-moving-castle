"use client";
import { SectionTitle } from "@/components/app/ui";
import { TaskList } from "@/components/app/TaskList";

export default function CleaningPage() {
  return (
    <div>
      <SectionTitle kicker="New place + old place">Cleaning</SectionTitle>
      <p className="mb-6 max-w-xl text-sm text-ink-3">
        Deep-clean the new house before furniture lands, and leave the old
        apartment spotless for the deposit. Grouped by area.
      </p>
      <TaskList
        fixedCategory="cleaning"
        groupBy="area"
        emptyText="No cleaning tasks yet — add one."
      />
    </div>
  );
}
