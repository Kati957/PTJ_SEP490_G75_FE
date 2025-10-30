import { Button, Result } from "antd";
import { Link, useSearchParams } from "react-router-dom";

const VerifyFailedPage = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Result
        status="error"
        title="Xác thực Email thất bại!"
        subTitle={error || "Đã có lỗi xảy ra. Vui lòng thử lại."}
        extra={[
          <Link to="/register" key="register">
            <Button type="default">Thử lại</Button>
          </Link>,
          <Link to="/login" key="login">
            <Button type="primary">Đi đến trang đăng nhập</Button>
          </Link>,
        ]}
      />
    </div>
  );
};

export default VerifyFailedPage;
