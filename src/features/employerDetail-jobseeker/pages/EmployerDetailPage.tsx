import React from 'react';
import { Spin, Typography, Row, Col, Tag, Divider } from 'antd';
import { GlobalOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined} from '@ant-design/icons';
import { useEmployerDetail } from '../hooks';
import JobCard from '../../../features/homepage-jobSeeker/components/JobCard';
import TextArea from 'antd/es/input/TextArea';

const { Title, Paragraph } = Typography;

const EmployerDetailPage: React.FC = () => {
    const { profile, jobs, loading, error } = useEmployerDetail();
    const getPlainText = (html: string) => {
        if (typeof window === 'undefined' || !html) return "Chưa có mô tả giới thiệu.";
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.innerText;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" tip="Đang tải thông tin..." />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="text-center mt-10 text-red-500">
                {error || "Không tìm thấy thông tin nhà tuyển dụng."}
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            <div className="relative">
                <div className="h-[250px] w-full bg-gradient-to-r from-emerald-600 to-emerald-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                </div>

                <div className="container mx-auto px-4 relative -mt-20">
                    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-32 h-32 flex-shrink-0 bg-white rounded-full border-4 border-white shadow-sm overflow-hidden flex items-center justify-center">
                             <img 
                                src={profile.avatarUrl || "https://via.placeholder.com/150"} 
                                alt={profile.displayName} 
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="flex-1">
                            <Title level={2} className="!mb-2 !text-gray-800">
                                {profile.displayName}
                            </Title>
                            <div className="flex items-center gap-4 text-gray-500 mb-4">
                                {profile.website && (
                                    <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center hover:text-emerald-600">
                                        <GlobalOutlined className="mr-1" /> Website công ty
                                    </a>
                                )}
                                <span className="flex items-center">
                                    <EnvironmentOutlined className="mr-1" /> {profile.location || "Chưa cập nhật địa chỉ"}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-6">
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-t-4 border-emerald-500">
                            <Title level={4} className="border-l-4 border-emerald-500 pl-3 mb-4">
                                Giới thiệu công ty
                            </Title>
                            <TextArea 
                                rows={8} 
                                value={getPlainText(profile.description) || "Chưa có mô tả giới thiệu."} 
                                readOnly
                                className="text-gray-600 leading-relaxed resize-none cursor-default"
                            />
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-emerald-500">
                            <div className="flex justify-between items-center mb-6">
                                <Title level={4} className="border-l-4 border-emerald-500 pl-3 !mb-0">
                                    Tuyển dụng
                                </Title>
                                <Tag color="green" className="text-base py-1 px-3 rounded">
                                    {jobs.length} việc làm đang tuyển
                                </Tag>
                            </div>

                            {jobs.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {jobs.map((job) => (
                                        <div key={job.id} className="hover:shadow-md transition-shadow">
                                            <JobCard job={job} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded">
                                    Hiện nhà tuyển dụng chưa có tin đăng nào.
                                </div>
                            )}
                        </div>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 border-t-4 border-emerald-500">
                            <Title level={4} className="mb-4">Thông tin liên hệ</Title>
                            
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <EnvironmentOutlined className="text-emerald-500 mt-1 text-lg" />
                                    <div>
                                        <p className="font-semibold text-gray-700 mb-0">Địa chỉ công ty</p>
                                        <p className="text-gray-600 text-sm">{profile.location || "Chưa cập nhật"}</p>
                                    </div>
                                </div>

                                {profile.contactEmail && (
                                    <>
                                        <Divider className="my-2" />
                                        <div className="flex items-start gap-3">
                                            <MailOutlined className="text-emerald-500 mt-1 text-lg" />
                                            <div>
                                                <p className="font-semibold text-gray-700 mb-0">Email liên hệ</p>
                                                <a href={`mailto:${profile.contactEmail}`} className="text-emerald-600 text-sm hover:underline">
                                                    {profile.contactEmail}
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {profile.contactPhone && (
                                    <>
                                        <Divider className="my-2" />
                                        <div className="flex items-start gap-3">
                                            <PhoneOutlined className="text-emerald-500 mt-1 text-lg" />
                                            <div>
                                                <p className="font-semibold text-gray-700 mb-0">Điện thoại</p>
                                                <p className="text-gray-600 text-sm">{profile.contactPhone}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                           
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default EmployerDetailPage;