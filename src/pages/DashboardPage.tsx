import { useApp } from "../App";
import { text } from "../text";
import BranchRow from "../components/BranchRow";
import BranchRowSkeleton from "../components/BranchRowSkeleton";

export default function DashboardPage() {
  const { branches, data } = useApp();

  if (branches.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">{text.dashboard.noBranchesTitle}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {text.dashboard.noBranchesSubtitle}
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => {
    if (a.loading) return -1;
    if (b.loading) return 1;
    if (!a.commit && !b.commit) return 0;
    if (!a.commit) return 1;
    if (!b.commit) return -1;
    return new Date(b.commit.date).getTime() - new Date(a.commit.date).getTime();
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="space-y-3">
        {sorted.map((branch) =>
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