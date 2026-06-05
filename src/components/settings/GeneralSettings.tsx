import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { useGlassActive, cardTitleClass, cardWithMarginClass } from '@/lib/glass';
import { EXTERNAL_LINK_ATTRS } from '@/lib/utils';
import { verifyToken } from '@/services/github';
import { text } from '@/constants/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BG_OPTIONS } from '@/components/Background';
import { Moon, Sun, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function TokenSection() {
  const { token, setToken } = useApp();
  const isGlass = useGlassActive();
  const [tokenInput, setTokenInput] = useState(token);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    login?: string;
    error?: string;
  } | null>(null);

  const handleVerifyToken = async () => {
    setVerifying(true);
    setVerifyResult(null);
    const result = await verifyToken(tokenInput);
    setVerifyResult(result);
    setVerifying(false);
  };

  const handleSaveToken = () => {
    setToken(tokenInput);
    setVerifyResult(null);
  };

  return (
    <Card className={cardWithMarginClass(isGlass)}>
      <CardHeader>
        <CardTitle className={cardTitleClass}>{text.settings.tokenTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <div className='min-w-0 flex-1'>
            <Input
              type='password'
              placeholder={text.settings.tokenPlaceholder}
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                setVerifyResult(null);
              }}
            />
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='default' onClick={handleVerifyToken} disabled={!tokenInput.trim() || verifying}>
              {verifying ? <Loader2 className='h-4 w-4 animate-spin' /> : <CheckCircle2 className='h-4 w-4' />}
              {text.settings.verify}
            </Button>
            <Button variant='default' size='default' onClick={handleSaveToken}>
              {text.settings.save}
            </Button>
          </div>
        </div>
        {verifyResult && (
          <div className={`mt-2 flex items-center gap-1.5 text-sm ${verifyResult.valid ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
            {verifyResult.valid ? (
              <>
                <CheckCircle2 className='h-4 w-4' /> {text.settings.validAs} <span className='font-mono font-medium'>{verifyResult.login}</span>
              </>
            ) : (
              <>
                <XCircle className='h-4 w-4' /> {verifyResult.error}
              </>
            )}
          </div>
        )}
        <p className='mt-2 text-xs text-muted-foreground'>
          {text.settings.tokenHelp}{' '}
          <a href={text.settings.createTokenUrl} {...EXTERNAL_LINK_ATTRS} className='text-primary hover:underline'>
            {text.settings.createToken}
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}

const REFRESH_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '1m' },
  { value: 2, label: '2m' },
  { value: 5, label: '5m' },
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
];

const CACHE_TTL_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: '5m' },
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 120, label: '2h' },
];

export function GeneralSettings() {
  const { autoRefresh, onToggleAutoRefresh, refreshInterval, setRefreshInterval, cacheTtl, setCacheTtl, darkMode, onToggleDarkMode } = useApp();
  const isGlass = useGlassActive();

  return (
    <Card className={cardWithMarginClass(isGlass)}>
      <CardHeader>
        <CardTitle className={cardTitleClass}>{text.settings.general}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex flex-col gap-3 sm:flex-row'>
          <Button variant={autoRefresh ? 'default' : 'secondary'} size='default' onClick={onToggleAutoRefresh}>
            {autoRefresh ? text.settings.autoRefreshOn : text.settings.autoRefreshOff}
          </Button>
          <Button variant='secondary' size='default' onClick={onToggleDarkMode}>
            {darkMode ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
            {darkMode ? text.settings.lightMode : text.settings.darkMode}
          </Button>
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='text-xs font-medium text-muted-foreground'>{text.settings.autoRefreshInterval}</span>
          <div className='flex flex-wrap gap-2'>
            {REFRESH_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={refreshInterval === opt.value ? 'default' : 'secondary'}
                size='default'
                onClick={() => setRefreshInterval(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='text-xs font-medium text-muted-foreground'>{text.settings.cacheLifetime}</span>
          <div className='flex flex-wrap gap-2'>
            {CACHE_TTL_OPTIONS.map((opt) => (
              <Button key={opt.value} variant={cacheTtl === opt.value ? 'default' : 'secondary'} size='default' onClick={() => setCacheTtl(opt.value)}>
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BackgroundSettings() {
  const { darkMode, animatedBg, setAnimatedBg } = useApp();
  const isGlass = useGlassActive();

  if (!darkMode) return null;

  return (
    <Card className={cardWithMarginClass(isGlass)}>
      <CardHeader>
        <CardTitle className={cardTitleClass}>{text.settings.background}</CardTitle>
      </CardHeader>
      <CardContent className='flex gap-2'>
        {BG_OPTIONS.map((opt) => (
          <Button key={opt.value} variant={animatedBg === opt.value ? 'default' : 'secondary'} size='default' onClick={() => setAnimatedBg(opt.value)}>
            {opt.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
