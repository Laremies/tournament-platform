
"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client'; // Ensure this import path is correct
import { getAuthUser } from '@/lib/actions'; // Ensure this import path is correct
import { v4 as uuidv4 } from 'uuid';

export default function Avatar2({
    uid,
    url: initialUrl,
    size,
    usernames,
}: {
    uid: string | null;
    url: string | null;
    size: number;
    usernames: any;
}) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const [url, setUrl] = useState(initialUrl); // Local state for the avatar URL

    const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
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

            const { data: existingFiles, error: listError } = await supabase.storage.from('profiles').list(userid + '/');

            if (listError) {
                console.error("Error listing files:", listError); // Log the error
                throw listError;
            }

            if (existingFiles && existingFiles.length > 0) {
                const filesToDelete = existingFiles.map(file => `${userid}/${file.name}`);

                // Remove all existing files
                const { error: deleteError } = await supabase.storage.from('profiles').remove(filesToDelete);

                if (deleteError) {
                    throw deleteError;
                } else {
                    console.log("All existing files deleted successfully.");
                }
            }


            // Upload the new avatar
            const fileName = `${userid}/${uuidv4()}`; // Create a unique filename
            const { error: uploadError } = await supabase.storage.from('profiles').upload(fileName, file);

            if (uploadError) {
                throw uploadError;
            }

            // Construct the public URL for the newly uploaded file
            const { data: publicUrlData } = supabase.storage.from('profiles').getPublicUrl(fileName);
            const publicURL = publicUrlData.publicUrl; // Access the publicUrl property from the data object
            if (publicURL) {
                setUrl(publicURL); // Set the URL state to the new public URL
            }
        } catch (error) {
            alert('Error uploading avatar!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            {url ? (
                <Image
                    width={size}
                    height={size}
                    src={url}
                    alt="Avatar"
                    className="avatar image"
                    style={{ height: size, width: size }}
                />
            ) : (
                <Avatar className="w-16 h-16">
                    <AvatarImage src={''} alt={''} />
                    <AvatarFallback>
                        {usernames.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            )}
            <div style={{ width: size }}>
                <label className="button primary block" htmlFor="single">
                    {uploading ? 'Uploading...' : 'Upload'}
                </label>
                <input
                    style={{
                        visibility: 'hidden',
                        position: 'absolute',
                    }}
                    type="file"
                    id="single"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                />
            </div>
        </div>
    );
}

