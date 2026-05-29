import { useApp } from "../App";
import BranchRow from "../components/BranchRow";
import BranchRowSkeleton from "../components/BranchRowSkeleton";

export default function DashboardPage() {
  const { branches, data } = useApp();

  if (branches.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">No branches tracked</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Go to Settings to add a public GitHub branch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="space-y-3">
        {data.map((branch) =>
          branch.loading ? (
            <BranchRowSkeleton key={branch.key.id} />
          ) : (
            <BranchRow key={branch.key.id} branch={branch} />
          ),
        )}
      </div>
    </div>
  );
}