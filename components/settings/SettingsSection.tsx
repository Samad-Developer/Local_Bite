"use client";

export function SettingsSection({
  title,
  description,
  action,
  contentClassName = "p-5",
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border border-border rounded-xl">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-title">{title}</h2>
          <p className="text-xs text-label mt-1">{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className={contentClassName}>{children}</div>
    </section>
  );
}
