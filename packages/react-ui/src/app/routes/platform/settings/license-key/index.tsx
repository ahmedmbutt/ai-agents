import { ApEdition, ApFlagId, isNil, ErrorCode } from '@activepieces/shared';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Static, Type } from '@sinclair/typebox';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { CircleCheckBig } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/seperator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PermissionNeededTooltip } from '@/components/ui/permission-needed-tooltip';
import { LoadingSpinner } from '@/components/ui/spinner';
import { INTERNAL_ERROR_TOAST, toast } from '@/components/ui/use-toast';
import { flagsHooks } from '@/hooks/flags-hooks';
import { platformHooks } from '@/hooks/platform-hooks';
import { platformApi } from '@/lib/platforms-api';
import { useForm } from 'react-hook-form';
import { formatUtils } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CalendarDays } from 'lucide-react';
import { Zap, AlertTriangle } from 'lucide-react';
import { Loader2 } from 'lucide-react';

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

const LicenseKeySchema = Type.Object({
  tempLicenseKey: Type.String({
    errorMessage: t('License key is invalid'),
  }),
});

type LicenseKeySchema = Static<typeof LicenseKeySchema>;

const LicenseKeyPage = () => {
  const form = useForm<LicenseKeySchema>({
    resolver: typeboxResolver(LicenseKeySchema),
    defaultValues: {
      tempLicenseKey: '',
    },
    mode: 'onChange',
  });
  const { platform, refetch } = platformHooks.useCurrentPlatform();
  const [licenseKey, setLicenseKey] = useState(platform.licenseKey || '');
  const [isActivated, setIsActivated] = useState(false);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [showLicenseKey, setShowLicenseKey] = useState(false);

  const { data: keyData, isLoading } = useQuery({
    queryKey: ['license-key'],
    queryFn: async () => {
      const response = await platformApi.getLicenseKey(platform.licenseKey);
      return response;
    },
    onError: (error) => {
      toast({
        title: t('Error'),
        description: t('Failed to fetch license key'),
        duration: 3000,
      });
    },
    enabled: !isNil(platform.licenseKey),
    refetchOnWindowFocus: false,
  });

  const { mutate: activateLicenseKey, isPending } = useMutation({
    mutationFn: async (tempLicenseKey: string) => {
      if (tempLicenseKey.trim() === '') return;
      const response = await platformApi.verifyLicenseKey(
        tempLicenseKey.trim(),
      );
      if (!isNil(response)) {
        setIsActivated(true);
        setLicenseKey(tempLicenseKey.trim());
        setIsOpenDialog(false);
        await refetch();
        return response; 
      } else {
        setIsActivated(false);
        return null;
      }
    },
    onSuccess: (data) => {
      if (data) {
        setKeyData(data);
      }
      toast({
        title: isActivated ? t('Success') : t('Error'),
        description: isActivated
          ? t('License key activated')
          : t('Invalid license key'),
        duration: 3000,
      });
    },
    onError: () => {
      form.setError('tempLicenseKey', {
        message: t('Invalid license key'),
      });
    },
  });

  const onSubmit: SubmitHandler<activateLicenseKey> = (data) => {
    form.clearErrors();
    activateLicenseKey(data.tempLicenseKey);
  };

  const { data: edition } = flagsHooks.useFlag<ApEdition>(ApFlagId.EDITION);

  if (edition === ApEdition.COMMUNITY) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold w-full">{t('License Key')}</h1>
        <p className="text-md text-gray-500 w-full">
          {t('This feature is not available in your edition. ')}
          <Link
            className="text-blue-500"
            target="_blank"
            to="https://www.activepieces.com/docs/install/configuration/overview"
          >
            {t('Upgrade to Enterprise')}
          </Link>
        </p>
      </div>
    );
  }

  const handleOpenDialog = () => {
    form.clearErrors();
    form.reset({ tempLicenseKey: '' });
    setIsOpenDialog(true);
  };

  return (
    <div className="flex-col w-full max-w-2xl mx-auto">
      <div className="mb-6 flex items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('License Key')}</h1>
          <p className="text-sm text-gray-500">
            {t('Activate your platform and unlock enterprise features')}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Input
                  value={licenseKey}
                  readOnly
                  type={showLicenseKey ? 'text' : 'password'}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder={t('Enter your license key')}
                  className="pr-20 text-base"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowLicenseKey(!showLicenseKey)}
                          className="mr-1"
                        >
                          {showLicenseKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {showLicenseKey ? t('Hide') : t('Show')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full" disabled={isPending} onClick={handleOpenDialog}>
                    <Zap className="w-4 h-4 mr-2" />
                    {t('Activate License')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('License Key Activation')}</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form className="grid space-y-4">
                      <FormField
                        control={form.control}
                        name="tempLicenseKey"
                        render={({ field }) => (
                          <FormItem className="grid space-y-2">
                            <Input
                              {...field}
                              required
                              id="tempLicenseKey"
                              type="text"
                              placeholder={'Enter your license key'}
                              className="rounded-sm"
                              tabIndex={1}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form?.formState?.errors?.root?.serverError && (
                        <FormMessage>
                          {form.formState.errors.root.serverError.message}
                        </FormMessage>
                      )}
                    </form>
                  </Form>
                  <DialogFooter className="justify-end">
                    <DialogClose asChild>
                      <Button
                        variant={'outline'}
                        onClick={() => setIsOpenDialog(false)}
                      >
                        {t('Cancel')}
                      </Button>
                    </DialogClose>
                    <Button
                      loading={isPending}
                      onClick={(e) => form.handleSubmit(onSubmit)(e)}
                      tabIndex={3}
                    >
                      {isPending ? (
                        <LoadingSpinner className="w-4 h-4" />
                      ) : (
                        t('Confirm')
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {!isNil(keyData?.expiresAt) && (
            <div className="rounded-lg p-3 mt-5">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-sm">{t('Expiration')}</p>
                  <p className="text-xs">
                    {t('Valid until')}{' '}
                    {dayjs(keyData.expiresAt).format('MMMM D, YYYY')}
                    {dayjs(keyData.expiresAt).isBefore(dayjs().add(7, 'day')) && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-warning-100 text-warning-300">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {t('Expires soon')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isNil(keyData?.expiresAt) && <Separator className="my-5" />}

          <div className="rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-5">{t('Features')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(LICENSE_PROPS_MAP).map(([key, label]) => (
                <div className="flex items-center p-2 rounded-md" key={key}>
                  {platform?.[key as keyof typeof platform] && (
                    <>
                      <CircleCheckBig className="w-4 h-4 text-green-500 mr-2" />
                      <span className={`text-sm`}>
                        {t(label)}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

LicenseKeyPage.displayName = 'LicenseKeyPage';
export { LicenseKeyPage };