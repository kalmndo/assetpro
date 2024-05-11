"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Table } from "@tanstack/react-table";

function CheckboxToolbarAction({
  table,
  title,
  desc,
  variant = "outline",
  handleAction
}: {
  table: any
  title: string
  desc: string
  variant?: "outline" | "link" | "default" | "destructive" | "secondary" | "ghost" | null | undefined
  handleAction(table: any): void
}) {
  function onActionClick() {
    handleAction(table)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant={variant}
          className="w-full text-sm rounded-xl z-50"
          onClick={onActionClick}
        >
          {title}
        </Button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent sideOffset={8} className="rounded-lg text-xs">
          <p>{desc}</p>
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}

interface CheckboxToolbarProps<TData> {
  table: Table<TData>
  count: number
  actions: { title: string, desc: string, handleAction(table: any): void }[]
}

export function CheckboxToolbar<TData>({ table, count, actions }: CheckboxToolbarProps<TData>) {

  function handleClearAll() {
    table.resetRowSelection()
  }

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 flex justify-center p-4 z-50">
      <div
        className={cn(
          "flex h-[52px] flex-row items-center justify-between pl-4 pr-2 min-w-[420px] max-w-full bg-background rounded-2xl shadow-dropdown transition duration-300 ease-in-out pointer-events-auto select-none shadow-2xl border border-slate-200",
          count > 0
            ? "translate-y-0 opacity-100"
            : "translate-y-16 opacity-0"
        )}
      >
        <h2 className="overflow-hidden overflow-ellipsis whitespace-nowrap text-body-medium-bold text-fg-primary">
          {count} terpilih
        </h2>

        <div className="flex flex-row gap-2 pl-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-sm rounded-xl z-50"
                  onClick={handleClearAll}
                >
                  Clear all
                </Button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent sideOffset={8} className="rounded-lg text-xs">
                  <p>Hapus semua yang terpilih</p>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
            {actions.map((v, i) => (
              // eslint-disable-next-line @typescript-eslint/unbound-method
              <CheckboxToolbarAction key={i} {...v} table={table} />
            ))}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}