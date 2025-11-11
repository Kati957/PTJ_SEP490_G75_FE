import React, { useState, useEffect } from 'react';
import { Typography, Button, Input } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ProfileFieldProps {
  label: string;
  value: React.ReactNode;
  onSave?: (newValue: any) => void;
  inputType?: 'text' | 'textarea';
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, onSave, inputType = 'text' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex justify-between items-center py-4 border-b">
        <div className="flex-grow">
          <Text type="secondary" className="block">{label}</Text>
          {inputType === 'textarea' ? (
            <Input.TextArea
              value={editValue as string}
              onChange={(e) => setEditValue(e.target.value)}
              autoSize
              className="mt-1"
            />
          ) : (
            <Input
              value={editValue as string | number}
              onChange={(e) => setEditValue(e.target.value)}
              className="mt-1"
            />
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} className="mr-2">
            Xác nhận
          </Button>
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
            Hủy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-4 border-b">
      <div>
        <Text type="secondary" className="block">{label}</Text>
        <Text strong>{value || 'Chưa cập nhật'}</Text>
      </div>
      {onSave && (
        <Button type="link" icon={<EditOutlined />} onClick={handleEdit}>
          Chỉnh sửa
        </Button>
      )}
    </div>
  );
};

export default ProfileField;

