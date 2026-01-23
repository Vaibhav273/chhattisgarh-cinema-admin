// ═══════════════════════════════════════════════════════════════
// 🔌 API SETTINGS
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Form, Input, Button, Space, Switch, Table, Tag } from 'antd';
import { SaveOutlined, CopyOutlined, PlusOutlined } from '@ant-design/icons';
import { Key } from 'lucide-react';

const APISettings: React.FC = () => {
    const [form] = Form.useForm();

    const columns = [
        {
            title: 'API Key',
            dataIndex: 'key',
            key: 'key',
            render: (text: string) => (
                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{text}</code>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Permissions',
            dataIndex: 'permissions',
            key: 'permissions',
            render: (perms: string[]) => (
                <>
                    {perms.map(perm => (
                        <Tag key={perm}>{perm}</Tag>
                    ))}
                </>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Button type="link" icon={<CopyOutlined />} size="small">
                        Copy
                    </Button>
                    <Button type="link" danger size="small">
                        Revoke
                    </Button>
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            keyId: 'sk_live_abc123xyz789',
            name: 'Production Key',
            permissions: ['read', 'write'],
            active: true,
        },
        {
            key: '2',
            keyId: 'sk_test_def456uvw012',
            name: 'Test Key',
            permissions: ['read'],
            active: true,
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Key className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">API Settings</h1>
                    <p className="text-gray-500">Manage API keys and configurations</p>
                </div>
            </div>

            <Card title="API Configuration" className="mb-6">
                <Form form={form} layout="vertical">
                    <Form.Item label="API Base URL" name="baseUrl">
                        <Input size="large" defaultValue="https://api.chhattisgarhcinema.com" />
                    </Form.Item>

                    <Form.Item label="API Version" name="version">
                        <Input size="large" defaultValue="v1" />
                    </Form.Item>

                    <Form.Item label="Rate Limit (requests/minute)" name="rateLimit">
                        <Input size="large" type="number" defaultValue="100" />
                    </Form.Item>

                    <Form.Item label="Enable CORS" name="cors" valuePropName="checked">
                        <Switch defaultChecked />
                    </Form.Item>

                    <Form.Item label="Enable API Documentation" name="docs" valuePropName="checked">
                        <Switch defaultChecked />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" icon={<SaveOutlined />} size="large">
                            Save Settings
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card
                title="API Keys"
                extra={
                    <Button type="primary" icon={<PlusOutlined />}>
                        Generate New Key
                    </Button>
                }
            >
                <Table columns={columns} dataSource={data} />
            </Card>

            <Card title="Webhook Configuration" className="mt-6">
                <Form layout="vertical">
                    <Form.Item label="Webhook URL" name="webhookUrl">
                        <Input size="large" placeholder="https://your-domain.com/webhook" />
                    </Form.Item>

                    <Form.Item label="Events" name="events">
                        <Space direction="vertical">
                            <Switch defaultChecked /> <span>user.created</span>
                            <Switch defaultChecked /> <span>subscription.updated</span>
                            <Switch /> <span>payment.success</span>
                            <Switch /> <span>content.published</span>
                        </Space>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" icon={<SaveOutlined />} size="large">
                            Save Webhook
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default APISettings;
