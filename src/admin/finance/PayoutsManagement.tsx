// ═══════════════════════════════════════════════════════════════
// 💸 PAYOUTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Table, Tag, Space, Button } from 'antd';
import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { Wallet } from 'lucide-react';

const PayoutsManagement: React.FC = () => {
    const columns = [
        {
            title: 'Creator',
            dataIndex: 'creator',
            key: 'creator',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => `₹${amount.toLocaleString()}`,
        },
        {
            title: 'Period',
            dataIndex: 'period',
            key: 'period',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'paid' ? 'green' : 'orange'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: any) => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} size="small">
                        View
                    </Button>
                    {record.status === 'pending' && (
                        <Button type="link" icon={<CheckCircleOutlined />} size="small" className="text-green-600">
                            Process
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            creator: 'Creator Studio A',
            email: 'studioa@example.com',
            amount: 45000,
            period: 'Jan 2024',
            status: 'pending',
        },
        {
            key: '2',
            creator: 'Creator Studio B',
            email: 'studiob@example.com',
            amount: 32000,
            period: 'Dec 2023',
            status: 'paid',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Wallet className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Payouts Management</h1>
                        <p className="text-gray-500">Manage creator payouts</p>
                    </div>
                </div>
            </div>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default PayoutsManagement;
