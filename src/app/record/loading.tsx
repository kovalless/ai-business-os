import { Structure } from "@/components/ui";

export default function Loading() {
  return (
    <div className="flex min-w-0 flex-1 flex-col border-l border-hair">
      <div className="h-14 shrink-0" />
      <div className="px-stride md:px-court">
        <Structure heads={["Loading"]} columns={["Name", "Standing", "Amount"]} />
      </div>
    </div>
  );
}
