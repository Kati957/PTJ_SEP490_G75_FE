import React from 'react';
import { Typography, Avatar, Spin, Alert, Button, Upload, message } from 'antd';
import { UserOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import ProfileField from './ProfileField';
import { useJobSeekerProfile } from '../hooks/useJobSeekerProfile';
import { useAuth } from '../../auth/hooks';
import { useDispatch } from 'react-redux';
import { updateJobSeekerProfile } from '../slice/profileSlice';
import type { AppDispatch } from '../../../app/store';
import type { JobSeekerProfileUpdateDto } from '../types';

const { Title, Paragraph } = Typography;

/**
 * Component hiển thị chi tiết hồ sơ người dùng với chức năng chỉnh sửa.
 */
const ProfileDetails: React.FC = () => {
  const { profile, loading, error } = useJobSeekerProfile();
  const { user } = useAuth();
  const dispatch: AppDispatch = useDispatch();

  // Hàm xử lý lưu một trường dữ liệu
  const handleSaveField = async (field: keyof JobSeekerProfileUpdateDto, value: any) => {
    const profileData: JobSeekerProfileUpdateDto = { [field]: value };
    try {
      await dispatch(updateJobSeekerProfile(profileData)).unwrap();
      message.success('Cập nhật hồ sơ thành công!');
    } catch (err) {
      message.error('Cập nhật hồ sơ thất bại!');
    }
  };

  // Hàm xử lý tải lên ảnh đại diện
  const handleImageUpload = async (file: File) => {
    const profileData: JobSeekerProfileUpdateDto = { imageFile: file };
    try {
      await dispatch(updateJobSeekerProfile(profileData)).unwrap();
      message.success('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      message.error('Cập nhật ảnh đại diện thất bại!');
    }
    return false; // Ngăn chặn hành vi tải lên mặc định
  };

  // Chỉ hiển thị spinner khi tải lần đầu
  if (loading && !profile) {
    return <div className="text-center p-10"><Spin size="large" /></div>;
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  if (!profile) {
    return <Alert message="Không tìm thấy hồ sơ" type="warning" showIcon />;
  }

  return (
    <Spin spinning={loading} tip="Đang cập nhật...">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <Title level={3}>Tài khoản</Title>
        <Paragraph type="secondary">
          Hãy cập nhật thông tin mới nhất. Thông tin cá nhân dưới đây sẽ tự động điền khi bạn tạo hồ sơ mới.
        </Paragraph>

        <div className="flex items-center my-8">
          <Avatar size={64} src={profile.profilePicture} icon={<UserOutlined />} />
          <div className="ml-4">
            <Upload beforeUpload={handleImageUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
            </Upload>
            <Paragraph type="secondary" style={{ fontSize: '12px', margin: '8px 0 0 0' }}>
              (JPEG/PNG/GIF, ≤ 1MB)
            </Paragraph>
          </div>
        </div>

        {/* Các trường thông tin có thể chỉnh sửa */}
        <ProfileField label="Họ và tên" value={profile.fullName} onSave={(value) => handleSaveField('fullName', value)} />
        <ProfileField label="Địa chỉ email" value={user?.email} />
        <ProfileField label="Giới tính" value={profile.gender} onSave={(value) => handleSaveField('gender', value)} />
        <ProfileField label="Năm sinh" value={profile.birthYear} onSave={(value) => handleSaveField('birthYear', Number(value))} />
        <ProfileField label="Số điện thoại" value={profile.contactPhone} onSave={(value) => handleSaveField('contactPhone', value)} />
        <ProfileField label="Địa chỉ" value={profile.preferredLocation} onSave={(value) => handleSaveField('preferredLocation', value)} />
        
        <ProfileField label="Kỹ năng" value={profile.skills} onSave={(value) => handleSaveField('skills', value)} inputType="textarea" />
        <ProfileField label="Kinh nghiệm" value={profile.experience} onSave={(value) => handleSaveField('experience', value)} inputType="textarea" />
        <ProfileField label="Học vấn" value={profile.education} onSave={(value) => handleSaveField('education', value)} inputType="textarea" />
        <ProfileField label="Loại công việc ưa thích" value={profile.preferredJobType} onSave={(value) => handleSaveField('preferredJobType', value)} />

        <div className="mt-8">
          <Button danger icon={<DeleteOutlined />}>
            Xóa tài khoản
          </Button>
        </div>
      </div>
    </Spin>
  );
};

export default ProfileDetails;

