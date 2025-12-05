import React, { useState } from "react";
import { Button, Input, Checkbox, Form, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { login, googlePrepare } from "../services";
import { setAccessToken } from "../../../services/baseService";
import { loginSuccess } from "../slice";
import { ROLES } from "../../../constants/roles";
import { saveGoogleOnboardingData } from "../utils/googleOnboardingStorage";
import type { User } from "../types";

type LoginFormValues = {
  email: string;
  password: string;
};

type ApiError = { response?: { data?: { message?: string } }; message?: string };

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as ApiError;
  return err?.response?.data?.message || err?.message || fallback;
};

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginSuccess = (
    user: User,
    accessToken: string,
    successMessage = "Đăng nhập thành công!"
  ) => {
    const normalizedRoles =
      Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [ROLES.JOB_SEEKER];
    const normalizedUser = {
      ...user,
      roles: normalizedRoles,
    };

    setAccessToken(accessToken);
    dispatch(loginSuccess({ user: normalizedUser, token: accessToken }));

    message.success(successMessage);

    if (normalizedRoles.includes("PendingEmployer")) {
      message.info("Tài khoản nhà tuyển dụng đang chờ admin phê duyệt.");
      navigate("/login", { replace: true });
      return;
    }

    if (normalizedRoles.includes(ROLES.ADMIN)) {
      navigate("/admin/dashboard");
      return;
    }

    if (normalizedRoles.includes(ROLES.EMPLOYER)) {
      navigate("/nha-tuyen-dung/dashboard");
      return;
    }

    navigate("/");
  };

  const onLoginFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await login(values);
      const { accessToken, user } = response;
      if (!accessToken) {
        throw new Error("Thiếu access token từ server.");
      }
      handleLoginSuccess(user, accessToken);
    } catch (error: unknown) {
      console.error("Lỗi đăng nhập:", error);
      const errorMessage = getErrorMessage(error, "Đã có lỗi xảy ra. Vui lòng thử lại.");
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: unknown) => {
    console.log("Lỗi:", errorInfo);
    message.error("Vui lòng kiểm tra lại thông tin!");
  };

  const handleGoogleResult = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      const response = await googlePrepare(idToken);

      if ("accessToken" in response && response.accessToken) {
        const { accessToken, user } = response;
        handleLoginSuccess(user, accessToken, "Đăng nhập Google thành công!");
        return;
      }

      if ("needRoleSelection" in response && response.needRoleSelection) {
        saveGoogleOnboardingData({
          idToken,
          email: response.email,
          name: response.name,
          picture: response.picture,
          availableRoles: response.availableRoles,
        });
        message.info("Vui lòng chọn vai trò để hoàn tất đăng ký.");
        navigate("/google/select-role");
        return;
      }

      message.error("Phản hồi không hợp lệ từ server.");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Không thể kết nối Google.");
      message.error(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleCredential = (credentialResponse: CredentialResponse): void => {
    const rawIdToken = credentialResponse.credential;
    if (!rawIdToken) {
      message.error("Google không trả về ID token. Vui lòng thử lại.");
      return;
    }
    void handleGoogleResult(rawIdToken);
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_35px_120px_rgba(15,23,42,0.2)] border border-white/40 p-6 sm:p-8 max-w-md mx-auto">
      <Form
        name="platform_login"
        initialValues={{ remember: true }}
        onFinish={onLoginFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}
        >
          <Input
            size="large"
            placeholder="Email"
            prefix={<MailOutlined className="text-blue-500" />}
            className="rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-0"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input
            size="large"
            placeholder="Mật khẩu"
            type={passwordVisible ? "text" : "password"}
            prefix={<LockOutlined className="text-blue-500" />}
            className="rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-0"
          />
        </Form.Item>

        <div className="flex justify-between items-center mb-4">
          <Checkbox
            checked={passwordVisible}
            onChange={(e) => setPasswordVisible(e.target.checked)}
          >
            Hiển thị mật khẩu
          </Checkbox>
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full"
            loading={loading}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-400">Hoặc</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className={`flex justify-center ${googleLoading ? "opacity-60 pointer-events-none" : ""}`}>
        <div className="w-full max-w-xs">
          <GoogleLogin
            onSuccess={handleGoogleCredential}
            onError={() => message.error("Có lỗi xảy ra khi xử lý Google.")}
            useOneTap={false}
            theme="outline"
            shape="rectangular"
            text="continue_with"
            size="large"
          />
        </div>
      </div>

      <p className="text-center mt-6 text-sm">
        Chưa có tài khoản?{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/register");
          }}
          className="text-blue-600 hover:underline font-semibold"
        >
          Đăng ký
        </a>
      </p>
    </div>
  );
};

export default LoginForm;
