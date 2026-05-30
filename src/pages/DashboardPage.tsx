import { useApp } from "@/App";
import { text } from "@/text";
import type { BranchData } from "@/types";
import BranchRow from "@/components/BranchRow";
import BranchRowSkeleton from "@/components/BranchRowSkeleton";

export default function DashboardPage() {
  const { branches, data } = useApp();

  if (branches.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="mb-2 text-lg font-medium text-muted-foreground">{text.dashboard.noBranchesTitle}</p>
          <p className="text-sm text-muted-foreground">
            {text.dashboard.noBranchesSubtitle}
          </p>
        </div>
      </div>
    );
  }

  const sortPriority = (b: BranchData): number =>
    b.loading ? 0 : b.error || !b.commit ? 2 : 1;

  const sorted = data
    .map(b => ({ ...b, _p: sortPriority(b), _d: b.commit ? new Date(b.commit.date).getTime() : 0 }))
    .sort((a, b) => a._p - b._p || b._d - a._d)
    .map(({ _p, _d, ...b }) => b);

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