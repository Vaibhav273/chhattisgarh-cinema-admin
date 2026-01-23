// ═══════════════════════════════════════════════════════════════
// 🎨 BANNERS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Button, Table, Tag, Space, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Image } from 'lucide-react';

const BannersManagement: React.FC = () => {
    const columns = [
        {
            title: 'Banner',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden">
                        <img src={record.image} alt={text} className="w-full h-full object-cover" />
                    </div>
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: 'Position',
            dataIndex: 'position',
            key: 'position',
            render: (pos: string) => <Tag>{pos}</Tag>,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
        },
        {
            title: 'Clicks',
            dataIndex: 'clicks',
            key: 'clicks',
        },
        {
            title: 'Active',
            dataIndex: 'active',
            key: 'active',
            render: (active: boolean) => <Switch checked={active} />,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} size="small">
                        Preview
                    </Button>
                    <Button type="link" icon={<EditOutlined />} size="small">
                        Edit
                    </Button>
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
            title: 'New Release Banner',
            image: 'https://via.placeholder.com/200x120',
            position: 'Home Hero',
            priority: 1,
            clicks: 4523,
            active: true,
        },
        {
            key: '2',
            title: 'Premium Offer',
            image: 'https://via.placeholder.com/200x120',
            position: 'Sidebar',
            priority: 2,
            clicks: 2341,
            active: true,
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Image className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Banners Management</h1>
                        <p className="text-gray-500">Manage promotional banners</p>
                    </div>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large">
                    Add New Banner
                </Button>
            </div>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default BannersManagement;
