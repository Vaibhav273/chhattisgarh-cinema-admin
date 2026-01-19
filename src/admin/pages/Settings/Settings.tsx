import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Upload,
  Divider,
  Row,
  Col,
  message,
  Space,
  Typography,
  InputNumber,
  Tabs,
} from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  SettingOutlined,
  BellOutlined,
  SecurityScanOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import "./Settings.css";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      // Save settings to Firestore or backend
      console.log("Settings:", values);
      message.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      message.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: "general",
      label: (
        <span>
          <SettingOutlined />
          General
        </span>
      ),
      children: (
        <Card bordered={false}>
          <Title level={5}>Platform Information</Title>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Platform Name"
                name="platformName"
                rules={[
                  { required: true, message: "Please enter platform name" },
                ]}
              >
                <Input size="large" placeholder="Chhattisgarh Cinema" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Support Email"
                name="supportEmail"
                rules={[
                  { required: true, message: "Please enter support email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input size="large" placeholder="support@cgcinema.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Support Phone" name="supportPhone">
                <Input size="large" placeholder="+91 1234567890" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Support URL" name="supportUrl">
                <Input
                  size="large"
                  placeholder="https://support.cgcinema.com"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Platform Description" name="description">
                <TextArea
                  rows={4}
                  placeholder="Enter platform description"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5}>Branding</Title>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Logo URL" name="logoUrl">
                <Input.Group compact>
                  <Input style={{ width: "calc(100% - 100px)" }} />
                  <Upload showUploadList={false}>
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </Input.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Favicon URL" name="faviconUrl">
                <Input.Group compact>
                  <Input style={{ width: "calc(100% - 100px)" }} />
                  <Upload showUploadList={false}>
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </Input.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Primary Color" name="primaryColor">
                <Input type="color" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Secondary Color" name="secondaryColor">
                <Input type="color" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5}>Features</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item
              label="Enable User Registration"
              name="enableRegistration"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Enable Comments"
              name="enableComments"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Enable Download"
              name="enableDownload"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Enable Watchlist"
              name="enableWatchlist"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Maintenance Mode"
              name="maintenanceMode"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Space>
        </Card>
      ),
    },
    {
      key: "payment",
      label: (
        <span>
          <DollarOutlined />
          Payment
        </span>
      ),
      children: (
        <Card bordered={false}>
          <Title level={5}>Razorpay Configuration</Title>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Razorpay Key ID"
                name="razorpayKeyId"
                rules={[
                  { required: true, message: "Please enter Razorpay Key ID" },
                ]}
              >
                <Input size="large" placeholder="rzp_test_xxxxxxxxxxxxx" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Razorpay Key Secret"
                name="razorpayKeySecret"
                rules={[
                  {
                    required: true,
                    message: "Please enter Razorpay Key Secret",
                  },
                ]}
              >
                <Input.Password size="large" placeholder="Enter secret key" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Webhook Secret" name="razorpayWebhookSecret">
                <Input.Password size="large" placeholder="Webhook secret" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Currency" name="currency">
                <Select size="large" defaultValue="INR">
                  <Option value="INR">INR (₹)</Option>
                  <Option value="USD">USD ($)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5}>Tax & Fees</Title>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="GST (%)" name="gstPercentage">
                <InputNumber
                  size="large"
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="18"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Platform Fee (%)" name="platformFee">
                <InputNumber
                  size="large"
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="5"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5}>Payment Settings</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item
              label="Enable Test Mode"
              name="paymentTestMode"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Auto-capture Payment"
              name="autoCapturePayment"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Space>
        </Card>
      ),
    },
    {
      key: "notifications",
      label: (
        <span>
          <BellOutlined />
          Notifications
        </span>
      ),
      children: (
        <Card bordered={false}>
          <Title level={5}>Email Notifications</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item
              label="Welcome Email"
              name="welcomeEmail"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Payment Success Email"
              name="paymentSuccessEmail"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Subscription Expiry Reminder"
              name="expiryReminderEmail"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="New Content Alert"
              name="newContentEmail"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Space>

          <Divider />

          <Title level={5}>Push Notifications</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item
              label="Enable Push Notifications"
              name="enablePushNotifications"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="New Content Push"
              name="newContentPush"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Promotional Push"
              name="promotionalPush"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Space>

          <Divider />

          <Title level={5}>SMTP Configuration</Title>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="SMTP Host" name="smtpHost">
                <Input size="large" placeholder="smtp.gmail.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="SMTP Port" name="smtpPort">
                <InputNumber
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="587"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="SMTP Username" name="smtpUsername">
                <Input size="large" placeholder="your-email@gmail.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="SMTP Password" name="smtpPassword">
                <Input.Password size="large" placeholder="Enter password" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: "security",
      label: (
        <span>
          <SecurityScanOutlined />
          Security
        </span>
      ),
      children: (
        <Card bordered={false}>
          <Title level={5}>Authentication</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item
              label="Enable Email/Password Login"
              name="enableEmailLogin"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Enable Google Login"
              name="enableGoogleLogin"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Enable Phone Login"
              name="enablePhoneLogin"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Two-Factor Authentication"
              name="enable2FA"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Space>

          <Divider />

          <Title level={5}>Content Security</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item
              label="Enable DRM Protection"
              name="enableDRM"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Enable Watermark"
              name="enableWatermark"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
            <Form.Item
              label="Block Screenshots"
              name="blockScreenshots"
              valuePropName="checked"
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Space>

          <Divider />

          <Title level={5}>Session Management</Title>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Max Concurrent Devices" name="maxDevices">
                <InputNumber
                  size="large"
                  min={1}
                  max={10}
                  style={{ width: "100%" }}
                  placeholder="3"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Session Timeout (hours)" name="sessionTimeout">
                <InputNumber
                  size="large"
                  min={1}
                  max={72}
                  style={{ width: "100%" }}
                  placeholder="24"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className="settings-card"
        title={
          <Space>
            <SettingOutlined />
            <span className="card-title">Settings</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            loading={loading}
            onClick={() => form.submit()}
          >
            Save All Settings
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            platformName: "Chhattisgarh Cinema",
            supportEmail: "support@cgcinema.com",
            enableRegistration: true,
            enableComments: true,
            enableDownload: false,
            enableWatchlist: true,
            maintenanceMode: false,
            currency: "INR",
            gstPercentage: 18,
            platformFee: 0,
            paymentTestMode: true,
            autoCapturePayment: true,
            welcomeEmail: true,
            paymentSuccessEmail: true,
            expiryReminderEmail: true,
            newContentEmail: true,
            enablePushNotifications: true,
            newContentPush: true,
            promotionalPush: false,
            enableEmailLogin: true,
            enableGoogleLogin: true,
            enablePhoneLogin: false,
            enable2FA: false,
            enableDRM: false,
            enableWatermark: true,
            blockScreenshots: false,
            maxDevices: 3,
            sessionTimeout: 24,
          }}
        >
          <Tabs items={tabItems} />
        </Form>
      </Card>
    </motion.div>
  );
};

export default Settings;
