// ═══════════════════════════════════════════════════════════════
// 🔔 NOTIFICATIONS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Button, Table, Tag, Space } from 'antd';
import { PlusOutlined, SendOutlined, DeleteOutlined } from '@ant-design/icons';
import { Bell } from 'lucide-react';

const NotificationsManagement: React.FC = () => {
    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            render: (text: string) => (
                <div className="max-w-md truncate">{text}</div>
            ),
        },
        {
            title: 'Target',
            dataIndex: 'target',
            key: 'target',
            render: (target: string) => <Tag color="blue">{target}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'sent' ? 'green' : 'orange'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Sent',
            dataIndex: 'sent',
            key: 'sent',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: any) => (
                <Space>
                    {record.status === 'draft' && (
                        <Button type="link" icon={<SendOutlined />} size="small" className="text-blue-600">
                            Send
                        </Button>
                    )}
                    <Button type="link" danger icon={<DeleteOutlined />} size="small">
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            title: 'New Content Alert',
            message: 'Check out our latest movie releases this week!',
            target: 'All Users',
            status: 'sent',
            sent: '2024-01-23',
        },
        {
            key: '2',
            title: 'Premium Offer',
            message: 'Get 50% off on annual subscription',
            target: 'Free Users',
            status: 'draft',
            sent: '-',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Bell className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Notifications Management</h1>
                        <p className="text-gray-500">Send push notifications to users</p>
                    </div>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large">
                    Create Notification
                </Button>
            </div>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default NotificationsManagement;
