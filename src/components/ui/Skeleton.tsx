// src/components/ui/Skeleton.tsx

import { HTMLAttributes } from "react";

export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}