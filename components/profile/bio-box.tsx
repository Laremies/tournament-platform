'use client';
import { SetStateAction, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { PublicUser } from '@/app/types/types';
import { updateUserBio } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export function BioBox({ user }: { user: PublicUser }) {
  const [bio, setBio] = useState(user.bio || '');
  const [isEdited, setIsEdited] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    setBio(e.target.value);
    setIsEdited(true);
  };

  const handleSave = async () => {
    if (bio === user.bio) {
      return;
    }

    const { success, error } = await updateUserBio(bio);
    if (success) {
      toast({ description: 'Bio updated' });
    } else {
      toast({ description: error });
    }

    setIsEdited(false);
  };

  const handleDiscard = () => {
    setBio(user.bio || '');
    setIsEdited(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          id="bio"
          name="bio"
          spellCheck="false"
          className="resize-none pr-20"
          placeholder="Enter your bio here"
          value={bio}
          onChange={handleChange}
          rows={4}
        />
        {isEdited && (
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label="Discard changes"
              onClick={handleDiscard}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleSave}
              className="h-8 w-8"
              aria-label="Save changes"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
