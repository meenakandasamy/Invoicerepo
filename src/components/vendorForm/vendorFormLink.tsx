import { useState } from 'react';
import { Check, Copy, Link, Loader2 } from 'lucide-react'; // Import Check icon
import { useMutation } from '@tanstack/react-query';
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
import { Label } from '@/components/ui/label';
import CustomTooltip from '@/utils/common/components/CustomTooltip';
import { VendorServices } from '@/integrations/Services/vendorServices';
import { Encrypt } from '@/utils/auth/encryptor';

export function VendorFormLink({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: VendorServices.GenerateVendorFormToken,
    onSuccess: (data) => {
      const encodedEncryptedData = encodeURIComponent(data.hashingKey);
      const encodedUserId = encodeURIComponent(session.userId);

      const origin = window.location.origin;
      const baseName =
        import.meta.env.VITE_BASE_URL ||
        '/saas-po';
      const url = `${origin}${baseName}/#/vendorForm?id=${encodedUserId}&ec=${encodedEncryptedData}`;

      setGeneratedLink(url);
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setGeneratedLink('');
      setCopied(false);

      const encryptedLinkData = Encrypt({
        string: JSON.stringify({
          userId: session.userId,
          userName: session.userName,
          time: new Date().toISOString(),
          email: session.emailId,
        }),
        key: import.meta.env.VITE_AES_SECRET_KEY,
        iv: import.meta.env.VITE_AES_IV,
      });

      mutate({ userId: session.userId, hashingKey: encryptedLinkData });
    }
    setOpen(isOpen);
  };

  const handleCopyClick = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2">
          <CustomTooltip
            content="Generate Vendor Form"
            children={
              <Link
                color="blue"
                className="h-4 w-4 cursor-pointer hover:text-blue-500"
              />
            }
          />
        </div>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          if (isPending) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Generate Vendor Form</DialogTitle>
          <DialogDescription>
            {isPending
              ? 'Generating Vendor Form, please wait...'
              : 'Anyone with this link can fill the vendor form.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 relative">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  Generating link...
                </span>
              </div>
            ) : (
              <div className="relative">
                <Input
                  id="link"
                  value={generatedLink}
                  readOnly
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={handleCopyClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200"
                  aria-label="Copy link"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-500 cursor-pointer" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          {!isPending && (
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
