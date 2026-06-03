import { text } from '@/constants/text';
import { GeneralSettings, BackgroundSettings, TokenSection } from '@/components/settings/GeneralSettings';
import { BranchManager } from '@/components/settings/BranchManager';

export default function SettingsPage() {
  return (
    <div className={`mx-auto max-w-2xl px-4 py-8 sm:px-6`}>
      <h1 className="mb-6 text-xl font-bold sm:mb-8 sm:text-2xl">
        {text.settings.title}
      </h1>
      <GeneralSettings />
      <BackgroundSettings />
      <TokenSection />
      <BranchManager />
    </div>
  );
}