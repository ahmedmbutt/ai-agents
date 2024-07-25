import { FlowTemplate, FlowVersion, TemplateType } from '@activepieces/shared';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Static, Type } from '@sinclair/typebox';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INTERNAL_ERROR_TOAST, toast } from '@/components/ui/use-toast';
import { flowsApi } from '@/features/flows/lib/flows-api';
import { templatesApi } from '@/features/templates/lib/templates-api';

const ShareTemplateSchema = Type.Object({
  description: Type.String(),
  blogUrl: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
});

type ShareTemplateSchema = Static<typeof ShareTemplateSchema>;

const ShareTemplateDialog: React.FC<{
  flowId: string;
  flowVersion: FlowVersion;
  setIsShareDialogOpen: (isOpen: boolean) => void;
}> = ({ flowId, flowVersion, setIsShareDialogOpen }) => {
  const shareTemplateForm = useForm<ShareTemplateSchema>({
    resolver: typeboxResolver(ShareTemplateSchema),
  });

  const { mutate, isPending } = useMutation<
    FlowTemplate,
    Error,
    { flowId: string; description: string }
  >({
    mutationFn: async () => {
      const template = await flowsApi.getTemplate(flowId, {
        versionId: flowVersion.id,
      });

      const flowTemplate = await templatesApi.create({
        template: flowVersion,
        type: TemplateType.PROJECT,
        blogUrl: template.blogUrl,
        tags: template.tags,
        description: shareTemplateForm.getValues().description,
      });

      return flowTemplate;
    },
    onSuccess: (data) => {
      window.open(`/templates/${data.id}`, '_blank', 'noopener');
      setIsShareDialogOpen(false);
    },
    onError: () => toast(INTERNAL_ERROR_TOAST),
  });

  const onShareTemplateSubmit: SubmitHandler<{
    description: string;
  }> = (data) => {
    mutate({
      flowId,
      description: data.description,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Share Template</DialogTitle>
        <DialogDescription className="flex flex-col gap-2">
          <span>
            Generate or update a template link for the current flow to easily
            share it with others.
          </span>
          <span>
            The template will not have any credentials in connection fields,
            keeping sensitive information secure.
          </span>
        </DialogDescription>
      </DialogHeader>
      <Form {...shareTemplateForm}>
        <form
          className="grid space-y-4"
          onSubmit={shareTemplateForm.handleSubmit(onShareTemplateSubmit)}
        >
          <FormField
            control={shareTemplateForm.control}
            name="description"
            render={({ field }) => (
              <FormItem className="grid space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  {...field}
                  required
                  id="description"
                  placeholder="A short description of the template"
                  className="rounded-sm"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {shareTemplateForm?.formState?.errors?.root?.serverError && (
            <FormMessage>
              {shareTemplateForm.formState.errors.root.serverError.message}
            </FormMessage>
          )}
          <Button loading={isPending}>Confirm</Button>
        </form>
      </Form>
    </DialogContent>
  );
};

export { ShareTemplateDialog };