// ═══════════════════════════════════════════════════════════════
// 🚨 REPORTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Button, Table, Tag, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { AlertTriangle } from 'lucide-react';

const ReportsManagement: React.FC = () => {
    const columns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color="red">{type.toUpperCase()}</Tag>
            ),
        },
        {
            title: 'Reported Content',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: 'Reported By',
            dataIndex: 'reporter',
            key: 'reporter',
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'pending' ? 'orange' : 'green'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} size="small">
                        Review
                    </Button>
                    <Button type="link" icon={<CheckCircleOutlined />} size="small" className="text-green-600">
                        Resolve
                    </Button>
                    <Button type="link" danger icon={<CloseCircleOutlined />} size="small">
                        Dismiss
                    </Button>
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            type: 'spam',
            content: 'Comment on Movie XYZ',
            reporter: 'user123',
            reason: 'Spam content',
            date: '2024-01-23',
            status: 'pending',
        },
        {
            key: '2',
            type: 'inappropriate',
            content: 'Profile: @baduser',
            reporter: 'user456',
            reason: 'Inappropriate content',
            date: '2024-01-22',
            status: 'pending',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Reports Management</h1>
                        <p className="text-gray-500">Handle user reports and violations</p>
                    </div>
                </div>
            </div>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default ReportsManagement;
