import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "../../../config/firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import "./Login.css";

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );

      // Check if user is admin
      const userDoc = await getDoc(doc(db, "admins", userCredential.user.uid));
      if (!userDoc.exists()) {
        message.error("You do not have admin access");
        await auth.signOut();
        return;
      }

      message.success("Login successful!");
      navigate("/admin");
    } catch (error: any) {
      message.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Check if user is admin
      const userDoc = await getDoc(doc(db, "admins", userCredential.user.uid));
      if (!userDoc.exists()) {
        message.error("You do not have admin access");
        await auth.signOut();
        return;
      }

      message.success("Login successful!");
      navigate("/admin");
    } catch (error: any) {
      message.error(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-card-wrapper"
      >
        <Card className="login-card" bordered={false}>
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="login-header"
          >
            <div className="logo-container">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="logo-icon"
              >
                🎬
              </motion.div>
            </div>
            <Title level={2} className="login-title">
              CG Cinema Admin
            </Title>
            <Text className="login-subtitle">
              Welcome back! Please login to continue
            </Text>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className="login-form"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email"
                  className="login-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please enter your password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  className="login-input"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="login-button"
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            {/* Divider */}
            <div className="login-divider">
              <span>OR</span>
            </div>

            {/* Google Login */}
            <Button
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              loading={loading}
              block
              size="large"
              className="google-button"
            >
              Continue with Google
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="login-footer"
          >
            <Text type="secondary" className="footer-text">
              © 2026 Chhattisgarh Cinema. All rights reserved.
            </Text>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
