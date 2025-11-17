

import React, { useEffect, useState } from 'react';
import { Modal, Row, Col, List, Button, Divider, Spin, message, Typography, Tooltip, Avatar } from 'antd';
import { HeartFilled, HeartOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';

import { JobDetailView } from './JobDetailView';
import { useAuth } from '../../../auth/hooks';
import { jobSeekerPostService } from '../../../candidate/services'; //
import { jobApplicationService } from '../../../applyJob-employer/jobApplicationService';

import type { JobPostView } from '../../jobTypes';
import type { ShortlistedCandidateDto } from '../../../candidate/type'; 
import type { JobApplicationResultDto } from '../../../applyJob-jobSeeker/type';

const { Title, Text } = Typography;

interface Props {
  jobPost: JobPostView | null;
  visible: boolean;
  onClose: () => void;
}

export const JobPostDetailModal: React.FC<Props> = ({ jobPost, visible, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [applicants, setApplicants] = useState<JobApplicationResultDto[]>([]);
  const [shortlisted, setShortlisted] = useState<ShortlistedCandidateDto[]>([]);


  const fetchShortlisted = async (postId: number) => {
    try {
      const res = await jobSeekerPostService.getShortlistedCandidates(postId);
      if (res.success) {
        setShortlisted(res.data);
      }
    } catch (e) {
      message.error("Lỗi khi tải danh sách đã lưu.");
    }
  };

  const fetchApplicants = async (postId: number) => {
    try {
      const res = await jobApplicationService.getApplicationsByPost(postId);
      if (res.success) {
        setApplicants(res.data);
      }
    } catch (e) {
      message.error("Lỗi khi tải danh sách ứng tuyển.");
    }
  };

  useEffect(() => {
    if (jobPost && user) {
      setLoading(true);
      Promise.all([
        fetchApplicants(jobPost.employerPostId),
        fetchShortlisted(jobPost.employerPostId)
      ]).finally(() => setLoading(false));
    } else {
      setApplicants([]);
      setShortlisted([]);
    }
  }, [jobPost, user]);


  const handleSave = async (record: JobApplicationResultDto) => {
    if (!user || !jobPost) return;

    try {
      await jobSeekerPostService.saveCandidate({
        employerId: user.id,
        jobSeekerId: record.jobSeekerId,
        employerPostId: jobPost.employerPostId,
        note: "Lưu từ danh sách ứng tuyển"
      });
      message.success("Đã lưu ứng viên.");
      
      await fetchShortlisted(jobPost.employerPostId);

    } catch (e) {
      message.error("Lỗi khi lưu ứng viên.");
    }
  };

  const handleUnsave = async (jobSeekerId: number) => {
    if (!user || !jobPost) return;

    try {
      await jobSeekerPostService.unsaveCandidate({
        employerId: user.id,
        jobSeekerId: jobSeekerId,
        employerPostId: jobPost.employerPostId
      });
      message.success("Đã bỏ lưu ứng viên.");

      await fetchShortlisted(jobPost.employerPostId);
      
    } catch (e) {
      message.error("Lỗi khi bỏ lưu.");
    }
  };

  const savedIdSet = new Set(shortlisted.map(s => s.jobSeekerId));

  return (
    <Modal
      title={jobPost?.title || "Chi tiết công việc"}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={1200}
    >
      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            {jobPost && <JobDetailView job={jobPost} />}
          </Col>

          <Col span={12}>
            <Title level={4}>Đã ứng tuyển ({applicants.length})</Title>
            <List
              itemLayout="horizontal"
              dataSource={applicants}
              renderItem={(app) => {
                const isSaved = savedIdSet.has(app.jobSeekerId);
                return (
                  <List.Item
                    actions={[
                      <Tooltip title={isSaved ? "Đã lưu" : "Lưu hồ sơ"}>
                        <Button
                          shape="circle"
                          type="text"
                          icon={
                            isSaved ? (
                              <HeartFilled style={{ color: 'hotpink' }} />
                            ) : (
                              <HeartOutlined />
                            )
                          }
                          onClick={() => handleSave(app)}
                          disabled={isSaved}
                        />
                      </Tooltip>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={<a onClick={() => {/* TODO: navigate to profile */}}>{app.username}</a>}
                      description={`Nộp ngày: ${new Date(app.applicationDate).toLocaleDateString('vi-VN')}`}
                    />
                  </List.Item>
                );
              }}
              locale={{ emptyText: "Chưa có ai ứng tuyển" }}
            />
          </Col>
        </Row>

        <Divider style={{ marginTop: 32, marginBottom: 32 }} />

        <Title level={4}>Hồ sơ đã lưu (Shortlist) ({shortlisted.length})</Title>
        <List
          size="small"
          itemLayout="horizontal"
          dataSource={shortlisted}
          renderItem={(saved) => (
            <List.Item
              actions={[
                <Tooltip title="Bỏ lưu">
                  <Button
                    shape="circle"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleUnsave(saved.jobSeekerId)}
                  />
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar size="small" icon={<UserOutlined />} />}
                title={<a onClick={() => {/* TODO: navigate to profile */}}>{saved.jobSeekerName}</a>}
                description={saved.note || `Lưu ngày ${new Date(saved.addedAt).toLocaleDateString('vi-VN')}`}
              />
            </List.Item>
          )}
          locale={{ emptyText: "Bạn chưa lưu hồ sơ nào cho tin này" }}
        />
      </Spin>
    </Modal>
  );
};