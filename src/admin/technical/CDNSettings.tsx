// ═══════════════════════════════════════════════════════════════
// 🌐 CDN SETTINGS
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Form, Input, Button, Select, Switch, Space, Statistic, Row, Col } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { Server, Globe } from 'lucide-react';

const CDNSettings: React.FC = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('CDN Settings:', values);
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Globe className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">CDN Settings</h1>
                    <p className="text-gray-500">Configure Content Delivery Network</p>
                </div>
            </div>

            {/* CDN Stats */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Total Bandwidth" value={2.5} suffix="TB" />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Cache Hit Rate" value={89.5} suffix="%" valueStyle={{ color: '#3f8600' }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Avg Response Time" value={45} suffix="ms" />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Active Regions" value={12} />
                    </Card>
                </Col>
            </Row>

            <Card title="CDN Configuration">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        provider: 'cloudflare',
                        enabled: true,
                        caching: true,
                    }}
                >
                    <Form.Item label="CDN Provider" name="provider">
                        <Select size="large">
                            <Select.Option value="cloudflare">Cloudflare</Select.Option>
                            <Select.Option value="cloudfront">AWS CloudFront</Select.Option>
                            <Select.Option value="bunnycdn">BunnyCDN</Select.Option>
                            <Select.Option value="fastly">Fastly</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="CDN URL" name="cdnUrl">
                        <Input size="large" placeholder="https://cdn.chhattisgarhcinema.com" />
                    </Form.Item>

                    <Form.Item label="API Key" name="apiKey">
                        <Input.Password size="large" placeholder="Enter CDN API Key" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Zone ID" name="zoneId">
                                <Input size="large" placeholder="Enter Zone ID" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Pull Zone" name="pullZone">
                                <Input size="large" placeholder="Enter Pull Zone" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Enable CDN" name="enabled" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item label="Enable Caching" name="caching" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
                                Save Settings
                            </Button>
                            <Button size="large">Test Connection</Button>
                            <Button danger size="large">Purge Cache</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Regional Distribution" className="mt-6">
                <div className="space-y-3">
                    {['India (Mumbai)', 'India (Delhi)', 'Singapore', 'US East', 'Europe (London)'].map((region) => (
                        <div key={region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Server size={20} className="text-cyan-600" />
                                <span className="font-semibold">{region}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">Latency: {Math.floor(Math.random() * 50 + 20)}ms</span>
                                <Switch defaultChecked />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default CDNSettings;
