import React from "react";
import {
  Typography,
  Avatar,
  Spin,
  Alert,
  Button,
  Upload,
  message,
  Card
} from "antd";
import { UserOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import ProfileField from "./ProfileField";
import { useAuth } from "../../auth/hooks";
import { useDispatch } from "react-redux";
import { updateJobSeekerProfile } from "../slice/profileSlice";
import type { AppDispatch } from "../../../app/store";
import type { JobSeekerProfileDto, JobSeekerProfileUpdateDto } from "../types";

const { Title, Paragraph } = Typography;

interface ProfileDetailsProps {
  profile: JobSeekerProfileDto | null;
  loading: boolean;
  error: string | null;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ profile, loading, error }) => {
  const { user } = useAuth();
  const dispatch: AppDispatch = useDispatch();

  const handleSaveField = async (
    field: keyof JobSeekerProfileUpdateDto,
    value: any
  ) => {
    const profileData: JobSeekerProfileUpdateDto = { [field]: value };
    try {
      await dispatch(updateJobSeekerProfile(profileData)).unwrap();
      message.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      message.error("Cập nhật hồ sơ thất bại!");
    }
  };

  const handleImageUpload = async (file: File) => {
    const profileData: JobSeekerProfileUpdateDto = { imageFile: file };
    try {
      await dispatch(updateJobSeekerProfile(profileData)).unwrap();
      message.success("Cập nhật ảnh thành công!");
    } catch (err) {
      message.error("Cập nhật ảnh thất bại!");
    }
    return false;
  };

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  if (!profile) {
    return (
      <Card className="shadow-md">
        <Alert message="Không tìm thấy hồ sơ" type="warning" showIcon />
      </Card>
    );
  }

  return (
    <Spin spinning={loading} tip="Đang cập nhật..." className="w-full">
      <div className="space-y-6">
        <Card className="shadow-md">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Avatar size={84} src={profile.profilePicture} icon={<UserOutlined />} />
            <div className="flex-1 w-full">
              <Title level={4} className="mb-1">
                Tài khoản
              </Title>
              <Paragraph type="secondary" className="mb-1">
                Hãy cập nhật thông tin mới nhất. Thông tin dưới đây sẽ được điền khi bạn tạo hồ sơ.
              </Paragraph>
              <Paragraph type="secondary" style={{ fontSize: "12px" }}>
                (JPEG/PNG/GIF, duoi 1MB)
              </Paragraph>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Upload beforeUpload={handleImageUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Doi anh</Button>
              </Upload>
              <Button icon={<DeleteOutlined />} danger>
                Xoa tai khoan
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Thong tin ca nhan" className="shadow-md">
            <ProfileField
              label="Ho va ten"
              value={profile.fullName}
              onSave={(value) => handleSaveField("fullName", value)}
            />
            <ProfileField label="Email" value={user?.username + "@gmail.com"} />
            <ProfileField
              label="Gioi tinh"
              value={profile.gender}
              onSave={(value) => handleSaveField("gender", value)}
            />
            <ProfileField
              label="Nam sinh"
              value={profile.birthYear}
              onSave={(value) => handleSaveField("birthYear", Number(value))}
            />
            <ProfileField
              label="So dien thoai"
              value={profile.contactPhone}
              onSave={(value) => handleSaveField("contactPhone", value)}
            />
            <ProfileField
              label="Dia chi"
              value={profile.preferredLocation}
              onSave={(value) => handleSaveField("preferredLocation", value)}
            />
          </Card>

          <Card title="Thong tin nghe nghiep" className="shadow-md">
            <ProfileField
              label="Ky nang"
              value={profile.skills}
              onSave={(value) => handleSaveField("skills", value)}
              inputType="textarea"
            />
            <ProfileField
              label="Kinh nghiem"
              value={profile.experience}
              onSave={(value) => handleSaveField("experience", value)}
              inputType="textarea"
            />
            <ProfileField
              label="Hoc van"
              value={profile.education}
              onSave={(value) => handleSaveField("education", value)}
              inputType="textarea"
            />
            <ProfileField
              label="Loai cong viec ua thich"
              value={profile.preferredJobType}
              onSave={(value) => handleSaveField("preferredJobType", value)}
            />
          </Card>
        </div>
      </div>
    </Spin>
  );
};

export default ProfileDetails;
