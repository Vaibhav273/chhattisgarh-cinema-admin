// ═══════════════════════════════════════════════════════════════
// 👤 PROFILE SETTINGS
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Form, Input, Button, Avatar, Upload } from 'antd';
import { SaveOutlined, UserOutlined, UploadOutlined } from '@ant-design/icons';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings: React.FC = () => {
    const { user } = useAuth();
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Profile Settings:', values);
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <User className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Profile Settings</h1>
                    <p className="text-gray-500">Manage your account settings</p>
                </div>
            </div>

            <Card title="Profile Information">
                <div className="flex items-center gap-6 mb-6">
                    <Avatar size={100} icon={<UserOutlined />} src={user?.photoURL} />
                    <Upload>
                        <Button icon={<UploadOutlined />}>Change Avatar</Button>
                    </Upload>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        name: user?.displayName,
                        email: user?.email,
                    }}
                >
                    <Form.Item label="Full Name" name="name">
                        <Input size="large" />
                    </Form.Item>

                    <Form.Item label="Email" name="email">
                        <Input size="large" type="email" disabled />
                    </Form.Item>

                    <Form.Item label="Phone Number" name="phone">
                        <Input size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Change Password" className="mt-6">
                <Form layout="vertical">
                    <Form.Item label="Current Password" name="currentPassword">
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item label="New Password" name="newPassword">
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item label="Confirm New Password" name="confirmPassword">
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" icon={<SaveOutlined />} size="large">
                            Update Password
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ProfileSettings;
