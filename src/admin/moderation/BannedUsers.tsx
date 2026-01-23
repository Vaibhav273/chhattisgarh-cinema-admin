// ═══════════════════════════════════════════════════════════════
// 🚫 BANNED USERS
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Button, Table, Tag, Space, Avatar } from 'antd';
import { UserOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { UserX } from 'lucide-react';

const BannedUsers: React.FC = () => {
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
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Banned By',
            dataIndex: 'bannedBy',
            key: 'bannedBy',
        },
        {
            title: 'Ban Date',
            dataIndex: 'banDate',
            key: 'banDate',
        },
        {
            title: 'Duration',
            dataIndex: 'duration',
            key: 'duration',
            render: (duration: string) => (
                <Tag color="red">{duration}</Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} size="small">
                        View Details
                    </Button>
                    <Button type="link" icon={<CheckCircleOutlined />} size="small" className="text-green-600">
                        Unban
                    </Button>
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            name: 'Banned User 1',
            email: 'banned1@example.com',
            reason: 'Multiple violations',
            bannedBy: 'Super Admin',
            banDate: '2024-01-20',
            duration: 'Permanent',
        },
        {
            key: '2',
            name: 'Banned User 2',
            email: 'banned2@example.com',
            reason: 'Spam',
            bannedBy: 'Moderator',
            banDate: '2024-01-22',
            duration: '7 days',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                        <UserX className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Banned Users</h1>
                        <p className="text-gray-500">Manage banned and suspended users</p>
                    </div>
                </div>
            </div>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default BannedUsers;
