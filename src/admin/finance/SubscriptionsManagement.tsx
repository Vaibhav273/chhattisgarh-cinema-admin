// ═══════════════════════════════════════════════════════════════
// 💳 SUBSCRIPTIONS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Button, Table, Tag, Space, Avatar, Statistic, Row, Col } from 'antd';
import { UserOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { CreditCard, TrendingUp, Users } from 'lucide-react';

const SubscriptionsManagement: React.FC = () => {
    const columns = [
        {
            title: 'User',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-2">
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <div className="font-semibold">{text}</div>
                        <div className="text-xs text-gray-500">{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Plan',
            dataIndex: 'plan',
            key: 'plan',
            render: (plan: string) => (
                <Tag color="gold">{plan.toUpperCase()}</Tag>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => `₹${amount}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Next Billing',
            dataIndex: 'nextBilling',
            key: 'nextBilling',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} size="small">
                        View
                    </Button>
                    <Button type="link" icon={<EditOutlined />} size="small">
                        Edit
                    </Button>
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            name: 'John Doe',
            email: 'john@example.com',
            plan: 'Premium',
            amount: 599,
            status: 'active',
            nextBilling: '2024-02-23',
        },
        {
            key: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            plan: 'Basic',
            amount: 299,
            status: 'active',
            nextBilling: '2024-02-20',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Subscriptions Management</h1>
                    <p className="text-gray-500">Manage user subscriptions and plans</p>
                </div>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Subscribers"
                            value={1248}
                            prefix={<Users size={20} />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Subscriptions"
                            value={1156}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Monthly Revenue"
                            value={456789}
                            prefix="₹"
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Growth"
                            value={12.5}
                            suffix="%"
                            prefix={<TrendingUp size={20} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default SubscriptionsManagement;
