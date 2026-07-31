import { cx } from "@/lib/utils";
import { Actuator } from "./Actuator";
import { Label } from "./Label";

export function Empty({
  kind,
  title,
  body,
  action,
  href,
  className,
}: {
  kind: "unfilled" | "cleared" | "blocked";
  title: string;
  body?: string;
  action?: string;
  href?: string;
  className?: string;
}) {
  if (kind === "cleared") {
    return (
      <div className={cx("py-atrium", className)}>
        <div className="h-px w-full bg-hair" />
        <p className="voice mt-stride max-w-[440px] text-head text-ink-2">{title}</p>
      </div>
    );
  }

  if (kind === "blocked") {
    return (
      <div className={cx("py-court", className)}>
        <div className="h-px w-full max-w-[420px] bg-rust" />
        <p className="mt-rise text-head text-ink">{title}</p>
        {body ? <p className="mt-step max-w-[440px] text-bodysm text-ink-2">{body}</p> : null}
        {action ? (
          <div className="mt-stride">
            <Actuator rank="primary" href={href}>
              {action}
            </Actuator>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cx("py-court", className)}>
      <Label>Nothing filed here</Label>
      <p className="mt-rise max-w-[440px] text-head text-ink">{title}</p>
      {body ? <p className="mt-step max-w-[440px] text-bodysm text-ink-2">{body}</p> : null}
      {action ? (
        <div className="mt-stride">
          <Actuator rank="primary" href={href}>
            {action}
          </Actuator>
        </div>
      ) : null}
      <div className="mt-court h-px w-full max-w-[440px] bg-hair opacity-40" />
      <div className="mt-rise max-w-[440px] opacity-40">
        <Label>What it will look like</Label>
        <p className="mt-tick num text-fm text-ink">&euro;12,400</p>
        <p className="mt-tick text-caption text-ink-3">Three rows, a total, and a receipt.</p>
      </div>
    </div>
  );
}
