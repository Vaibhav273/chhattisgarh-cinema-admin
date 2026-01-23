// ═══════════════════════════════════════════════════════════════
// ⚙️ PLATFORM SETTINGS
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Form, Input, Button, Switch, Select } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { Settings } from 'lucide-react';

const PlatformSettings: React.FC = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Platform Settings:', values);
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                    <Settings className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Platform Settings</h1>
                    <p className="text-gray-500">Configure global platform settings</p>
                </div>
            </div>

            <Card title="General Settings" className="mb-6">
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Platform Name" name="platformName">
                        <Input size="large" defaultValue="Chhattisgarh Cinema" />
                    </Form.Item>

                    <Form.Item label="Support Email" name="supportEmail">
                        <Input size="large" type="email" defaultValue="support@chhattisgarhcinema.com" />
                    </Form.Item>

                    <Form.Item label="Contact Phone" name="contactPhone">
                        <Input size="large" defaultValue="+91 1234567890" />
                    </Form.Item>

                    <Form.Item label="Default Language" name="defaultLanguage">
                        <Select size="large" defaultValue="hi">
                            <Select.Option value="en">English</Select.Option>
                            <Select.Option value="hi">Hindi</Select.Option>
                            <Select.Option value="cg">Chhattisgarhi</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Enable Registration" name="enableRegistration" valuePropName="checked">
                        <Switch defaultChecked />
                    </Form.Item>

                    <Form.Item label="Maintenance Mode" name="maintenanceMode" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
                            Save Settings
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="SEO Settings">
                <Form layout="vertical">
                    <Form.Item label="Meta Title" name="metaTitle">
                        <Input size="large" defaultValue="Chhattisgarh Cinema - Stream Regional Content" />
                    </Form.Item>

                    <Form.Item label="Meta Description" name="metaDescription">
                        <Input.TextArea
                            rows={3}
                            defaultValue="Watch latest Chhattisgarhi movies, web series, and short films online."
                        />
                    </Form.Item>

                    <Form.Item label="Meta Keywords" name="metaKeywords">
                        <Input size="large" defaultValue="chhattisgarh, cinema, movies, web series" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" icon={<SaveOutlined />} size="large">
                            Save SEO Settings
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default PlatformSettings;
