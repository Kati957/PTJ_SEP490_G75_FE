// Định nghĩa các hằng số cho trạng thái ứng tuyển (application status)

// Trạng thái ứng tuyển bằng tiếng Anh, dùng để so khớp với dữ liệu từ API
export const APPLICATION_STATUS = {
  PENDING: 'Pending', // Đang chờ duyệt
  WITHDRAWN: 'Withdrawn', // Đã rút đơn
  ACCEPTED: 'Accepted', // Đã chấp nhận
  REJECTED: 'Rejected' // Đã từ chối
} as const

// Trạng thái ứng tuyển bằng tiếng Việt, dùng để hiển thị trên giao diện người dùng
export const APPLICATION_STATUS_VN = {
  Pending: 'Đang chờ',
  Withdrawn: 'Đã rút đơn',
  Accepted: 'Đã chấp nhận',
  Rejected: 'Bị từ chối'
}

// Màu sắc tương ứng với từng trạng thái, sử dụng cho component Tag của Ant Design
export const STATUS_COLORS: { [key: string]: string } = {
  Pending: 'blue',
  Withdrawn: 'grey',
  Accepted: 'green',
  Rejected: 'red'
}
