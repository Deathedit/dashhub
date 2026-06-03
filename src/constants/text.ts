export const text = {
  app: {
    name: 'DashHub',
    tokenRequired: {
      title: 'GitHub Token Required',
      description: 'A Personal Access Token is required to use DashHub. Add one in Settings to get started.',
      goToSettings: 'Go to Settings',
    },
  },
  nav: {
    dashboard: 'Dashboard',
    settings: 'Settings',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
  },
  status: {
    passing: 'Passing',
    failed: 'Failed',
    inProgress: 'In Progress',
    noCi: 'No CI',
  },
  dashboard: {
    noBranchesTitle: 'No branches tracked',
    noBranchesSubtitle: 'Go to Settings to add a public GitHub branch.',
  },
  branch: {
    recentCommits: 'Recent Commits',
    noCommits: 'No commits found for this branch.',
    openOnGitHub: 'Open on GitHub',
    backToDashboard: 'Dashboard',
  },
  settings: {
    title: 'Settings',
    general: 'General',
    autoRefreshOn: 'Auto-refresh: On',
    autoRefreshOff: 'Auto-refresh: Off',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    background: 'Background',
    bgNone: 'None',
    bgMatrix: 'Matrix',
    tokenTitle: 'GitHub Token (required)',
    tokenPlaceholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
    verify: 'Verify',
    save: 'Save',
    validAs: 'Valid — authenticated as',
    tokenHelp: 'Required. A Personal Access Token is needed to access the GitHub API. No scopes are needed for public repos.',
    createToken: 'Create one here',
    createTokenUrl: 'https://github.com/settings/tokens/new',
    addBranch: 'Add Branch',
    branchPlaceholder: 'e.g. https://github.com/vitejs/vite/tree/main',
    resolving: 'Resolving…',
    add: 'Add',
    branchHelpFormat: 'owner/repo/branch',
    branchHelpPrefix: 'Paste a GitHub URL or use',
    branchHelpSuffix: 'format. The default branch is auto-detected if omitted.',
    trackedBranches: (n: number) => `Tracked Branches (${n})`,
    noBranches: 'No branches tracked yet. Add one above to get started.',
  },
  errors: {
    invalidFormat: 'Invalid format. Paste a GitHub URL or owner/repo/branch.',
    repoNotFound: 'Repository not found. Check the owner/repo name.',
    rateLimit: 'GitHub API rate limit reached.',
    rateLimitSuffix: 'to increase your limit.',
    githubApiError: 'GitHub API error',
    noCommits: 'No commits found',
    branchLimit: (n: number) => `Limit of ${n} branches reached.`,
    alreadyTracked: 'This branch is already being tracked.',
    repoOrBranchNotFound: 'Repository or branch not found',
    addToken: 'Add a GitHub token',
    unexpectedError: 'Something went wrong',
    retry: 'Try again',
  },
};

export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (!Number.isFinite(diff) || diff < 0) return '';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
