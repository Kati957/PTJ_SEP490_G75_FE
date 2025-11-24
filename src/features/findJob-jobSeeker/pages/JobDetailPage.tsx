import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, message, Modal, Select, Tag } from 'antd';
import DOMPurify from 'dompurify';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { RootState } from '../../../app/store';
import JobCard from '../../homepage-jobSeeker/components/JobCard';
import { fetchJobDetail } from '../jobDetailSlice';
import { addSavedJob, fetchSavedJobs, removeSavedJob } from '../../savedJob-jobSeeker/slice';
import { fetchAppliedJobs } from '../../applyJob-jobSeeker/slices/appliedJobsSlice';
import applyJobService from '../../applyJob-jobSeeker/services';
import jobSeekerCvService from '../../jobSeekerCv/services';
import type { JobSeekerCv } from '../../jobSeekerCv/types';
import jobPostService from '../../job/jobPostService';
import type { Job } from '../../../types';
import NoLogo from '../../../assets/no-logo.png';
import followService from '../services/followService';

const { TextArea } = Input;

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  const { job, status, error } = useAppSelector((state: RootState) => state.jobDetail);
  const { jobs: savedJobs } = useAppSelector((state: RootState) => state.savedJobs);
  const { jobs: appliedJobs } = useAppSelector((state: RootState) => state.appliedJobs);
  const jobSeekerId = useAppSelector((state: RootState) => state.auth.user?.id);

  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [cvOptions, setCvOptions] = useState<JobSeekerCv[]>([]);
  const [cvLoading, setCvLoading] = useState(false);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const applyRequestLock = useRef(false);

  useEffect(() => {
    if (!jobSeekerId) {
      setCvOptions([]);
      return;
    }
    dispatch(fetchSavedJobs(String(jobSeekerId)));
    dispatch(fetchAppliedJobs(Number(jobSeekerId)));

    let isMounted = true;
    const loadCvs = async () => {
      setCvLoading(true);
      try {
        const cvs = await jobSeekerCvService.fetchMyCvs();
        if (isMounted) {
          setCvOptions(cvs);
        }
      } catch (err) {
        message.error('Không thể tải danh sách CV. Vui lòng thử lại sau.');
        console.error('Failed to load CV list', err);
      } finally {
        if (isMounted) {
          setCvLoading(false);
        }
      }
    };

    void loadCvs();

    return () => {
      isMounted = false;
    };
  }, [dispatch, jobSeekerId]);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobDetail(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (job && savedJobs.some((savedJob) => savedJob.id === String(job.employerPostId))) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [job, savedJobs]);

  useEffect(() => {
    if (!job || !jobSeekerId) {
      setHasApplied(false);
      return;
    }
    const applied = appliedJobs.some(
      (application) =>
        application.employerPostId === job.employerPostId &&
        application.status?.toLowerCase() !== 'withdraw'
    );
    setHasApplied(applied);
  }, [appliedJobs, job, jobSeekerId]);

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      if (!job?.categoryName) {
        setSimilarJobs([]);
        return;
      }
      setSimilarLoading(true);
      try {
        const response = await jobPostService.getAllJobs();
        const allJobs = response.data ?? [];
        const filteredJobs = allJobs
          .filter(
            (post) =>
              post.categoryName === job.categoryName &&
              post.employerPostId !== job.employerPostId
          )
          .slice(0, 4)
          .map((post) => ({
            id: String(post.employerPostId),
            title: post.title,
            description: post.description || '',
            company: post.employerName || null,
            location: post.location || null,
            salary:
              post.salaryText ||
              (typeof post.salary === 'number'
                ? `${post.salary.toLocaleString()} VNĐ`
                : null),
            updatedAt: post.createdAt,
            companyLogo: null,
            isHot: null,
          }));
        setSimilarJobs(filteredJobs);
      } catch (err) {
        console.error('Failed to fetch similar jobs', err);
        setSimilarJobs([]);
      } finally {
        setSimilarLoading(false);
      }
    };

    void fetchSimilarJobs();
  }, [job?.categoryName, job?.employerPostId]);

  useEffect(() => {
    if (cvOptions.length === 0) {
      form.setFieldsValue({ cvId: undefined });
      return;
    }
    const currentCv = form.getFieldValue('cvId');
    if (!currentCv) {
      form.setFieldsValue({ cvId: cvOptions[0].cvid });
    }
  }, [cvOptions, form]);

  const extractAxiosErrorMessage = (error: unknown): string | null => {
    if (!axios.isAxiosError(error)) {
      return null;
    }
    const data = error.response?.data as { message?: string; error?: string; title?: string } | string | undefined;
    if (!data) {
      return null;
    }
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (typeof data.error === 'string') {
      return data.error;
    }
    if (typeof data.title === 'string') {
      return data.title;
    }
    return null;
  };

  useEffect(() => {
    const checkFollow = async () => {
      if (!job || !jobSeekerId) {
        setIsFollowing(false);
        return;
      }
      try {
        const payload = await followService.check(jobSeekerId, job.employerId);
        const followState =
          typeof payload === 'boolean'
            ? payload
            : typeof payload?.isFollowing === 'boolean'
              ? payload.isFollowing
              : false;
        setIsFollowing(followState);
      } catch (err) {
        console.error('Failed to check follow status', err);
      }
    };
    void checkFollow();
  }, [job?.employerId, jobSeekerId]);

  const isDuplicateApplicationError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) {
      return false;
    }
    if (error.response?.status === 409) {
      return true;
    }
    const messageText = extractAxiosErrorMessage(error);
    if (!messageText) {
      return false;
    }
    const normalized = messageText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const duplicateMarkers = ['da ung tuyen', 'da nop don', 'already applied'];
    return duplicateMarkers.some((marker) => normalized.includes(marker));
  };

    const handleSaveToggle = async () => {
    if (!job || !jobSeekerId) {
      message.warning('Vui lòng đăng nhập để lưu tin.');
      return;
    }
    const jobId = String(job.employerPostId);
    try {
      if (isSaved) {
        await dispatch(removeSavedJob({ jobSeekerId: String(jobSeekerId), jobId })).unwrap();
        message.success('Đã hủy lưu công việc');
        setIsSaved(false);
      } else {
        await dispatch(addSavedJob({ jobSeekerId: String(jobSeekerId), jobId })).unwrap();
        message.success('Đã lưu công việc thành công');
        setIsSaved(true);
      }
    } catch (err) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Failed to save/unsave the job: ', err);
    }
  };

  const handleFollowToggle = async () => {
    if (!job || !jobSeekerId) {
      message.warning('Vui lòng đăng nhập để theo dõi nhà tuyển dụng.');
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await followService.unfollow(jobSeekerId, job.employerId);
        message.success(res.data?.message || 'Đã hủy theo dõi nhà tuyển dụng.');
        setIsFollowing(false);
      } else {
        const res = await followService.follow(jobSeekerId, job.employerId);
        message.success(res.data?.message || 'Đã theo dõi nhà tuyển dụng.');
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Toggle follow failed', err);
      message.error('Không thể cập nhật theo dõi. Vui lòng thử lại.');
    } finally {
      setFollowLoading(false);
    }
  };

  
  const handleApplyNow = () => {
    if (!jobSeekerId) {
      message.warning('Vui lòng đăng nhập để ứng tuyển.');
      navigate('/login');
      return;
    }
    setIsApplyModalVisible(true);
  };

  const refreshJobData = async () => {
    const tasks: Array<Promise<unknown>> = [];
    if (jobSeekerId) {
      tasks.push(
        dispatch(fetchAppliedJobs(Number(jobSeekerId))).unwrap().catch(() => undefined)
      );
    }
    if (id) {
      tasks.push(dispatch(fetchJobDetail(id)).unwrap().catch(() => undefined));
    }
    if (tasks.length) {
      await Promise.all(tasks);
    }
  };

  const handleApplySuccess = async (successMessage: string) => {
    message.success(successMessage);
    setIsApplyModalVisible(false);
    form.resetFields();
    setHasApplied(true);
    await refreshJobData();
  };

  const handleApplySubmit = async (values: { note: string; cvId?: number }) => {
    if (!job || !jobSeekerId) return;
    if (!values.cvId) {
      message.warning('Vui lòng chọn CV để ứng tuyển.');
      return;
    }
    if (applying || applyRequestLock.current) {
      return;
    }
    applyRequestLock.current = true;
    setApplying(true);
    try {
      await applyJobService.applyJob({
        jobSeekerId,
        employerPostId: job.employerPostId,
        cvid: values.cvId,
        note: values.note,
      });
      await handleApplySuccess('Nộp đơn thành công!');
    } catch (error) {
      console.error('Apply failed:', error);
      if (isDuplicateApplicationError(error)) {
        await handleApplySuccess('Bạn đã nộp đơn trước đó. Đã cập nhật lại thông tin.');
      } else {
        message.error('Nộp đơn thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setApplying(false);
      applyRequestLock.current = false;
    }
  };

  if (status === 'loading') {
    return <div className="container mx-auto p-4 text-center">Đang tải...</div>;
  }
  if (status === 'failed') {
    return <div className="container mx-auto p-4 text-center">Lỗi: {error}</div>;
  }
  if (!job) {
    return null;
  }

  const salaryText =
    job.salary && !Number.isNaN(Number(job.salary))
      ? `${Number(job.salary).toLocaleString()} VNĐ`
      : 'Thương lượng';
  const requirementLines =
    job.requirements?.split('\n').map((l) => l.trim()).filter(Boolean) ?? [];
  const gallery = [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80'
  ];

  return (
    <div className="bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-gray-200 bg-white flex items-center justify-center">
                  <img
                    src={(job as any).logoUrl || NoLogo}
                    alt={job.employerName || 'Company logo'}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = NoLogo;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">{job.title}</h1>
                  <p className="text-lg text-gray-700 mt-1">{job.employerName}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-money-bill-wave text-green-600" />
                      <div>
                        <p className="text-xs text-slate-500">Thu nhập</p>
                        <p className="font-semibold">{salaryText}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">Địa điểm</p>
                        <p className="font-semibold">{job.location || 'Đang cập nhật'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-user-clock text-emerald-600" />
                      <div>
                        <p className="text-xs text-slate-500">Kinh nghiệm</p>
                        <p className="font-semibold">{job.workHours || 'Không yêu cầu'}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Hạn nộp hồ sơ: {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Button
                      type="primary"
                      size="large"
                      className="bg-green-600 hover:bg-green-500"
                      onClick={handleApplyNow}
                      disabled={hasApplied}
                    >
                      {hasApplied ? 'Đã nộp đơn' : 'Ứng tuyển ngay'}
                    </Button>
                    <Button
                      size="large"
                      loading={followLoading}
                      onClick={handleFollowToggle}
                      type={isFollowing ? 'default' : 'primary'}
                      className={isFollowing ? '' : 'bg-blue-600 hover:bg-blue-500'}
                    >
                      {isFollowing ? 'Đang theo dõi' : 'Theo dõi nhà tuyển dụng'}
                    </Button>
                    <Button
                      size="large"
                      onClick={handleSaveToggle}
                      icon={isSaved ? <i className="fas fa-heart text-red-500"></i> : <i className="far fa-heart"></i>}
                    >
                      {isSaved ? 'Đã lưu tin' : 'Lưu tin'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 space-y-8">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <i className="fas fa-briefcase text-green-600" /> Chi tiết tin tuyển dụng
                </h2>
                <Button type="text" icon={<i className="far fa-paper-plane text-green-600"></i>} className="text-green-600">
                  Gửi tới việc làm tương tự
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(requirementLines.length ? requirementLines.slice(0, 6) : ['Không yêu cầu']).map((item, idx) => (
                  <Tag key={idx} color="blue" className="px-3 py-1 text-sm rounded-full">
                    {item}
                  </Tag>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-2xl border-green-100">
                  <p className="text-xs text-slate-500">Thu nhập</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{salaryText}</p>
                </Card>
                <Card className="rounded-2xl border-blue-100">
                  <p className="text-xs text-slate-500">Địa điểm</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{job.location || 'Đang cập nhật'}</p>
                </Card>
                <Card className="rounded-2xl border-emerald-100">
                  <p className="text-xs text-slate-500">Kinh nghiệm</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{job.workHours || 'Không yêu cầu'}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {gallery.map((src, idx) => (
                  <div key={src} className="rounded-2xl overflow-hidden border border-gray-200 h-44">
                    <img src={src} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Mô tả công việc</h3>
                  <div
                    className="prose max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description || 'Chưa cập nhật mô tả.') }}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Yêu cầu ứng viên</h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-800">
                    {requirementLines.length ? (
                      requirementLines.map((line, idx) => <li key={idx}>{line.replace(/^- /, '')}</li>)
                    ) : (
                      <li>Không yêu cầu cụ thể.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Quyền lợi</h3>
                  <p className="text-slate-800">
                    Quyền lợi sẽ trao đổi chi tiết khi phỏng vấn. Bạn sẽ được hưởng chế độ lương thưởng, phụ cấp và môi
                    trường làm việc phù hợp theo chính sách công ty.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Địa điểm làm việc</h3>
                  <p className="text-slate-800">{job.location || 'Đang cập nhật'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Việc làm tương tự</h3>
              {similarLoading ? (
                <p>Đang tải việc làm tương tự...</p>
              ) : similarJobs.length ? (
                <div className="space-y-4">
                  {similarJobs.map((similarJob) => (
                    <JobCard key={similarJob.id} job={similarJob} />
                  ))}
                </div>
              ) : (
                <p>Hiện chưa có gợi ý.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={`Ứng tuyển: ${job.title}`}
        open={isApplyModalVisible}
        onCancel={() => setIsApplyModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleApplySubmit}
          initialValues={{ note: '', cvId: undefined }}
        >
          <Form.Item name="note" label="Lời nhắn đến nhà tuyển dụng">
            <TextArea rows={4} placeholder="Viết đôi lời về bạn hoặc lý do phù hợp với vị trí này." />
          </Form.Item>

          <Form.Item
            name="cvId"
            label="Chọn CV của bạn"
            rules={[{ required: true, message: 'Vui lòng chọn một CV để ứng tuyển!' }]}
          >
            <Select placeholder="Chọn CV" loading={cvLoading} disabled={cvOptions.length === 0}>
              {cvOptions.map((cv) => (
                <Select.Option key={cv.cvid} value={cv.cvid}>
                  {cv.cvTitle || `CV #${cv.cvid}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {cvOptions.length === 0 && (
            <p className="text-sm text-gray-500 mb-4">
              Bạn chưa có CV nào.{' '}
              <button
                type="button"
                className="text-blue-600 underline"
                onClick={() => {
                  setIsApplyModalVisible(false);
                  navigate('/cv-cua-toi');
                }}
              >
                Tạo CV ngay
              </button>
              .
            </p>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={applying} block disabled={cvOptions.length === 0}>
              Xác nhận ứng tuyển
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JobDetailPage;
