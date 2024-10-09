import { ApEdition, ApFlagId, isNil } from '@activepieces/shared';
import { useMutation } from '@tanstack/react-query';
import { t } from 'i18next';
import { CircleCheckBig, CircleX } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { INTERNAL_ERROR_TOAST, toast } from '@/components/ui/use-toast';
import { flagsHooks } from '@/hooks/flags-hooks';
import { platformHooks } from '@/hooks/platform-hooks';
import { platformApi } from '@/lib/platforms-api';

const LICENSE_PROPS_MAP = {
  cloudAuthEnabled: 'Cloud Authentication',
  gitSyncEnabled: 'Git Sync',
  analyticsEnabled: 'Analytics',
  auditLogEnabled: 'Audit Log',
  embeddingEnabled: 'Embedding',
  managePiecesEnabled: 'Manage Pieces',
  manageTemplatesEnabled: 'Manage Templates',
  customAppearanceEnabled: 'Custom Appearance',
  manageProjectsEnabled: 'Manage Projects',
  projectRolesEnabled: 'Project Roles',
  customDomainsEnabled: 'Custom Domains',
  apiKeysEnabled: 'API Keys',
  flowIssuesEnabled: 'Flow Issues',
  alertsEnabled: 'Alerts',
  ssoEnabled: 'SSO',
  emailAuthEnabled: 'Email Authentication',
};

const LicenseKeysPage = () => {
  const { platform, refetch } = platformHooks.useCurrentPlatform();
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivated, setIsActivated] = useState(false);

  const { mutate: activateLicenseKey, isPending } = useMutation({
    mutationFn: async () => {
      if (licenseKey.trim() === '') {
        return;
      }
      const res = await platformApi.verifyLicenseKey(licenseKey.trim());
      if (res) {
        setIsActivated(true);
      } else {
        setIsActivated(false);
      }
      await refetch();
    },
    onSuccess: () => {
      if (licenseKey.trim() === '') {
        toast({
          title: t('Error'),
          description: t('License key is required'),
          duration: 3000,
        });
        return;
      }

      toast({
        title: isActivated ? t('Success') : t('Error'),
        description: isActivated
          ? t('License key activated')
          : t('License key is invalid'),
        duration: 3000,
      });
    },
    onError: () => {
      toast(INTERNAL_ERROR_TOAST);
    },
  });

  const { data: edition } = flagsHooks.useFlag<ApEdition>(ApFlagId.EDITION);

  if (edition !== ApEdition.ENTERPRISE) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold w-full">{t('License Keys')}</h1>
        <p className="text-md text-gray-500 w-full">
          {t('This feature is not available in your edition. ')}
          <Link
            className="text-blue-500"
            target="_blank"
            to={
              'https://www.activepieces.com/docs/install/configuration/overview'
            }
          >
            {t('Upgrade to Enterprise')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex-col w-full">
      <div className="mb-4 flex">
        <div className="flex justify-between flex-row w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold w-full">{t('License Keys')}</h1>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex flex-row gap-2">
          <Input
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="Enter your license key"
          />
          <Button
            size="sm"
            className="flex items-center justify-center gap-2"
            onClick={() => activateLicenseKey(licenseKey)}
            disabled={isPending}
          >
            {t('Activate')}
          </Button>
        </div>
      </div>
      <div>
        {!isNil(platform) &&
          Object.keys(platform).map((key) => {
            if (key.endsWith('Enabled')) {
              return (
                <div className="flex flex-row items-center" key={key}>
                  {platform?.[key] ? (
                    <CircleCheckBig className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <CircleX className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <h3 className="text-lg">{t(LICENSE_PROPS_MAP[key])}</h3>
                </div>
              );
            }
          })}
      </div>
    </div>
  );
};

LicenseKeysPage.displayName = 'LicenseKeysPage';
export { LicenseKeysPage };