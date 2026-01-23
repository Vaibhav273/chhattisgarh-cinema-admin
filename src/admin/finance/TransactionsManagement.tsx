// ═══════════════════════════════════════════════════════════════
// 💰 TRANSACTIONS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Table, Tag, Space, Button } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { Receipt } from 'lucide-react';

const TransactionsManagement: React.FC = () => {
    const columns = [
        {
            title: 'Transaction ID',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => (
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{text}</code>
            ),
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color="blue">{type.toUpperCase()}</Tag>
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
                <Tag color={status === 'success' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} size="small">
                        View
                    </Button>
                    <Button type="link" icon={<DownloadOutlined />} size="small">
                        Receipt
                    </Button>
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            id: 'TXN001234567',
            user: 'john@example.com',
            type: 'subscription',
            amount: 599,
            status: 'success',
            date: '2024-01-23 14:30',
        },
        {
            key: '2',
            id: 'TXN001234568',
            user: 'jane@example.com',
            type: 'subscription',
            amount: 299,
            status: 'success',
            date: '2024-01-23 12:15',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Receipt className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Transactions Management</h1>
                        <p className="text-gray-500">View all payment transactions</p>
                    </div>
                </div>
                <Button type="primary" icon={<DownloadOutlined />}>
                    Export Report
                </Button>
            </div>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default TransactionsManagement;
