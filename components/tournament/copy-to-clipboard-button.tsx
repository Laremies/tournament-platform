'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CopyToClipboardButton() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ description: 'Copied tournament link to clipboard' });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button
      onClick={copyToClipboard}
      variant={copied ? 'outline' : 'ghost'}
      className="transition-all duration-200 ease-in-out p-1"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
        </>
      ) : (
        <>
          <Link className=" h-4 w-4" />
        </>
      )}
    </Button>
  );
}
