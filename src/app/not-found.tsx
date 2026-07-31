import { Actuator } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center px-court">
      <div className="max-w-[440px]">
        <div className="h-px w-full bg-hair" />
        <p className="voice mt-stride text-head text-ink-2">
          There is no room here. The five you use are on the left.
        </p>
        <div className="mt-bay">
          <Actuator rank="primary" href="/today">
            Back to Today
          </Actuator>
        </div>
      </div>
    </div>
  );
}
