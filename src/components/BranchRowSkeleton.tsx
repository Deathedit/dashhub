export default function BranchRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="min-w-0 flex-1 animate-pulse space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-14 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-14 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-10 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}