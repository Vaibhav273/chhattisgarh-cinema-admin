// ═══════════════════════════════════════════════════════════════
// ✅ CONTENT APPROVAL
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Button, Table, Tag, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { CheckSquare } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../types/roles';

const ContentApproval: React.FC = () => {
    const { can } = usePermissions();

    const columns = [
        {
            title: 'Content',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => <Tag>{type}</Tag>,
        },
        {
            title: 'Submitted By',
            dataIndex: 'creator',
            key: 'creator',
        },
        {
            title: 'Submitted Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color="orange">{status.toUpperCase()}</Tag>
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
                    {can(Permission.APPROVE_CONTENT) && (
                        <Button type="link" icon={<CheckCircleOutlined />} size="small" className="text-green-600">
                            Approve
                        </Button>
                    )}
                    {can(Permission.REJECT_CONTENT) && (
                        <Button type="link" danger icon={<CloseCircleOutlined />} size="small">
                            Reject
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            title: 'New Movie Submission',
            type: 'Movie',
            creator: 'Creator Studio A',
            date: '2024-01-20',
            status: 'pending',
        },
        {
            key: '2',
            title: 'Web Series Episode',
            type: 'Series',
            creator: 'Creator Studio B',
            date: '2024-01-21',
            status: 'pending',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <CheckSquare className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Content Approval</h1>
                        <p className="text-gray-500">Review and approve submitted content</p>
                    </div>
                </div>
            </div>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default ContentApproval;
