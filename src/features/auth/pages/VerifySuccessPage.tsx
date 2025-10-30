import { Button, Result } from "antd";
import { Link } from "react-router-dom";

const VerifySuccessPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Result
        status="success"
        title="Xác thực Email thành công!"
        subTitle="Tài khoản của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ."
        extra={[
          <Link to="/login" key="login">
            <Button type="primary">Đi đến trang đăng nhập</Button>
          </Link>,
        ]}
      />
    </div>
  );
};

export default VerifySuccessPage;
