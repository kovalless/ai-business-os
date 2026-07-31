import { Structure } from "@/components/ui";

export default function Loading() {
  return (
    <div className="flex min-w-0 flex-1 flex-col border-l border-hair">
      <div className="flex h-14 items-center px-stride md:px-court">
        <span className="text-title font-medium text-ink">Today</span>
      </div>
      <div className="px-stride md:px-court">
        <Structure heads={["Cash on hand"]} columns={["Invoiced", "Owed", "Committed out"]} />
      </div>
    </div>
  );
}
