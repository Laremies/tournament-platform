'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { test } from '@/lib/actions';
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

  const handleSaveName = async () => {
    try {
      await test(tempName, `${userid}`);
      setCurrentName(tempName);
      setIsEditing(false);
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
            aria-label="Edit name"
          />
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
          <h2 className="text-2xl font-bold">{currentName}</h2>
          <Button onClick={handleEdit} variant="outline" size="sm">
            Edit Name
          </Button>
        </>
      )}
    </div>
  );
};

export default EditableUsername;
