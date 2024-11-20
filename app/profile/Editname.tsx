'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UpdateUsername } from '@/lib/actions';
interface EditableUsernameProps {
  username: string;
  userid: string;
}

const EditableUsername: React.FC<EditableUsernameProps> = ({
  username,
  userid,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(username);
  const [currentName, setCurrentName] = useState(username);
  const [error, setError] = useState('');

  const handleSaveName = async () => {
    if (tempName.length < 4) {
      setError('Username must be more than 3 letters.');
      return;
    }
    if (tempName === currentName) {
      setIsEditing(false);
      return;
    }
    if (tempName.length > 20) {
      setError('Username must be less than 20 letters.');
      return;
    }
    try {
      await UpdateUsername(tempName, `${userid}`);
      setCurrentName(tempName);
      setIsEditing(false);
      setError('');
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username.');
    }
  };

  // Edit mode and reset tempName if canceled
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setTempName(currentName);
    setError('');
  };

  return (
    <div className="space-y-2">
      {isEditing ? (
        <>
          <Input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="text-2xl font-bold"
            aria-label="Edit username"
            maxLength={20}
          />
          {error && <p className="text-red-500">{error}</p>}
          <div className="space-x-2">
            <Button onClick={handleSaveName} size="sm">
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold">{currentName}</p>
          <Button onClick={handleEdit} size="sm">
            Edit username
          </Button>
        </>
      )}
    </div>
  );
};

export default EditableUsername;
