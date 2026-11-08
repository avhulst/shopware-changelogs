import { cn } from "../../lib/utils";
import React from "react";

const TabsContext = React.createContext(null);

export function Tabs({ value, onValueChange, className, ...props }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />
    </TabsContext.Provider>
  );
}
export function TabsList({ className, ...props }) {
  return <div className={cn("inline-flex h-7 items-center justify-center gap-0.5", className)} {...props} />;
}
export function TabsTrigger({ value, className, ...props }) {
  const ctx = React.useContext(TabsContext);
  const active = ctx && ctx.value === value;
  return (
    <button
      type="button"
      data-state={active ? "active" : "inactive"}
      onClick={() => ctx && ctx.onValueChange && ctx.onValueChange(value)}
      className={cn(
        "inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-all cursor-pointer",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}
export function TabsContent({ value, className, ...props }) {
  const ctx = React.useContext(TabsContext);
  if (ctx && ctx.value !== value) return null;
  return <div className={cn("mt-3", className)} {...props} />;
}
