// ═══════════════════════════════════════════════════════════════
// 💬 COMMENTS MODERATION
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Button, Table, Tag, Space, Avatar } from 'antd';
import { DeleteOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { MessageSquare } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../types/roles';

const CommentsModeration: React.FC = () => {
    const { can } = usePermissions();

    const columns = [
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (text: string) => (
                <div className="flex items-center gap-2">
                    <Avatar>{text.charAt(0)}</Avatar>
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: 'Comment',
            dataIndex: 'comment',
            key: 'comment',
            render: (text: string) => (
                <div className="max-w-md truncate">{text}</div>
            ),
        },
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: 'Reports',
            dataIndex: 'reports',
            key: 'reports',
            render: (count: number) => (
                <Tag color={count > 5 ? 'red' : 'orange'}>{count} reports</Tag>
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
                    {can(Permission.DELETE_COMMENTS) && (
                        <>
                            <Button type="link" icon={<CheckCircleOutlined />} size="small" className="text-green-600">
                                Approve
                            </Button>
                            <Button type="link" danger icon={<DeleteOutlined />} size="small">
                                Delete
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            user: 'John Doe',
            comment: 'This is an inappropriate comment that needs review...',
            content: 'Movie: Sample Movie 1',
            reports: 8,
            date: '2024-01-23',
        },
        {
            key: '2',
            user: 'Jane Smith',
            comment: 'Another comment flagged by users for spam content...',
            content: 'Series: Sample Series 1',
            reports: 3,
            date: '2024-01-23',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <MessageSquare className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Comments Moderation</h1>
                        <p className="text-gray-500">Review and moderate reported comments</p>
                    </div>
                </div>
            </div>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default CommentsModeration;
