// ═══════════════════════════════════════════════════════════════
// 🎁 PROMOTIONS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Button, Table, Tag, Space, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Gift } from 'lucide-react';

const PromotionsManagement: React.FC = () => {
    const columns = [
        {
            title: 'Promo Code',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => (
                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{text}</code>
            ),
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
            render: (discount: number, record: any) => (
                record.type === 'percentage' ? `${discount}%` : `₹${discount}`
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
        },
        {
            title: 'Used/Limit',
            dataIndex: 'usage',
            key: 'usage',
            render: (used: number, record: any) => `${used}/${record.limit}`,
        },
        {
            title: 'Valid Until',
            dataIndex: 'validUntil',
            key: 'validUntil',
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
            code: 'NEWUSER50',
            discount: 50,
            type: 'percentage',
            usage: 145,
            limit: 500,
            validUntil: '2024-02-28',
            active: true,
        },
        {
            key: '2',
            code: 'SAVE100',
            discount: 100,
            type: 'fixed',
            usage: 67,
            limit: 200,
            validUntil: '2024-01-31',
            active: true,
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Gift className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Promotions Management</h1>
                        <p className="text-gray-500">Manage promo codes and offers</p>
                    </div>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large">
                    Create Promo Code
                </Button>
            </div>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default PromotionsManagement;
