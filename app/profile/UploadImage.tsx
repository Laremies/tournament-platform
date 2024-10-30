'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getAuthUser, revalidateAll } from '@/lib/actions';
import { v4 as uuidv4 } from 'uuid';

export default function Component({
  initialUrl,
  size = 96,
  username,
}: {
  initialUrl: string | null;
  size?: number;
  username?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const user = await getAuthUser();
      const userid = user?.id;

      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed.');
      }

      const { data: existingFiles, error: listError } = await supabase.storage
        .from('profiles')
        .list(userid + '/');

      if (listError) {
        console.error('Error listing files:', listError);
        throw listError;
      }

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(
          (file) => `${userid}/${file.name}`
        );
        const { error: deleteError } = await supabase.storage
          .from('profiles')
          .remove(filesToDelete);

        if (deleteError) {
          throw deleteError;
        } else {
          console.log('All existing files deleted successfully.');
        }
      }

      const fileName = `${userid}/${uuidv4()}`;
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);
      const publicURL = publicUrlData.publicUrl;

      await supabase
        .from('users')
        .update({ avatar_url: publicURL })
        .eq('id', userid);

      if (publicURL) {
        setUrl(publicURL);
      }
      await revalidateAll(); // this just to get the corner picture to update aswell
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Error uploading avatar!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      {
        <Avatar
          className="cursor-pointer"
          onClick={handleImageClick}
          style={{ width: size, height: size }}
        >
          <AvatarImage src={url || ''} alt="Profile" />
          <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      }
      <Button
        size="icon"
        variant="secondary"
        className="absolute bottom-0 right-0 rounded-full"
        onClick={handleImageClick}
        aria-label="Upload new image"
      >
        <Camera className="h-4 w-4" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={uploadAvatar}
        className="hidden"
        accept="image/*"
        disabled={uploading}
      />
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}
