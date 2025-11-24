import { DollarCircleOutlined, EnvironmentOutlined, EyeOutlined, FieldTimeOutlined } from '@ant-design/icons'
import { Button, Card, Col, Input, Modal, Row, Tag } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

import type { JobApplicationResultDto } from '../type'
import { APPLICATION_STATUS_VN, STATUS_COLORS } from '../constants'

const { TextArea } = Input

interface AppliedJobCardProps {
  appliedJob: JobApplicationResultDto
  onWithdraw: (jobSeekerId: number, employerPostId: number) => void
}

const AppliedJobCard = ({ appliedJob, onWithdraw }: AppliedJobCardProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  // Hàm xử lý khi rút đơn ứng tuyển
  const handleWithdraw = () => {
    onWithdraw(appliedJob.jobSeekerId, appliedJob.employerPostId)
  }

  const formattedDate = appliedJob.applicationDate ? format(parseISO(appliedJob.applicationDate), 'dd/MM/yyyy') : 'N/A'

  return (
    <Card
      className='mb-4 overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105'
      hoverable
      style={{ borderRadius: '12px' }}
    >
      <Row gutter={[16, 16]}>
        {/* Cột hiển thị logo công ty */}
        <Col xs={24} sm={4} className='flex items-center justify-center'>
          <img
            src={appliedJob.companyLogo || '/src/assets/no-logo.png'}
            alt={`${appliedJob.employerName} logo`}
            className='h-20 w-20 rounded-full object-cover'
          />
        </Col>

        {/* Cột hiển thị thông tin chính của công việc */}
        <Col xs={24} sm={14}>
          <Link to={`/viec-lam/chi-tiet/${appliedJob.employerPostId}`}>
            <h3 className='mb-2 text-lg font-bold text-blue-600'>{appliedJob.postTitle}</h3>
          </Link>
          <p className='mb-2 text-base font-semibold text-gray-700'>{appliedJob.employerName}</p>
          <div className='flex flex-wrap items-center gap-4 text-gray-500'>
            <span className='flex items-center'>
              <DollarCircleOutlined className='mr-2' /> {appliedJob.salary > 0 ? appliedJob.salary : "Thỏa Thuận"}
            </span>
            <span className='flex items-center'>
              <EnvironmentOutlined className='mr-2' /> {appliedJob.location}
            </span>
            <span className='flex items-center'>
              <FieldTimeOutlined className='mr-2' /> Ngày ứng tuyển: {formattedDate}
            </span>
          </div>
        </Col>

        {/* Cột hiển thị trạng thái và các nút hành động */}
        <Col xs={24} sm={6} className='flex flex-col items-end justify-between'>
          <Tag
            color={STATUS_COLORS[appliedJob.status]}
            className='mb-2 inline-flex items-center justify-center self-start rounded-full px-4 py-1 text-base font-semibold uppercase tracking-wide shadow-md sm:self-end'
          >
            {APPLICATION_STATUS_VN[appliedJob.status as keyof typeof APPLICATION_STATUS_VN] || 'Không xác định'}
          </Tag>
          <div className='flex w-full flex-col gap-2 sm:w-auto'>
            <Button icon={<EyeOutlined />} onClick={showModal} block>
              Xem Ghi Chú
            </Button>
            {appliedJob.status === 'Pending' && (
              <Button danger onClick={handleWithdraw} block>
                Rút Đơn
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Modal hiển thị ghi chú khi ứng tuyển */}
      <Modal title='Ghi Chú Ứng Tuyển' open={isModalVisible} onCancel={handleCancel} footer={null}>
        <TextArea
          readOnly
          value={appliedJob.notes || 'Không có ghi chú.'}
          autoSize={{ minRows: 4, maxRows: 10 }}
          style={{ cursor: 'default', backgroundColor: '#fff', color: 'rgba(0, 0, 0, 0.88)' }}
        />
      </Modal>
    </Card>
  )
}

export default AppliedJobCard
