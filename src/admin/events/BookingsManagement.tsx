// ═══════════════════════════════════════════════════════════════
// 🎟️ BOOKINGS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Table, Tag, Space, Button } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { Ticket } from 'lucide-react';

const BookingsManagement: React.FC = () => {
    const columns = [
        {
            title: 'Booking ID',
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
            title: 'Event',
            dataIndex: 'event',
            key: 'event',
        },
        {
            title: 'Tickets',
            dataIndex: 'tickets',
            key: 'tickets',
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
                <Tag color={status === 'confirmed' ? 'green' : 'orange'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Booking Date',
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
                        Ticket
                    </Button>
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            id: 'BK001234',
            user: 'john@example.com',
            event: 'Film Festival 2024',
            tickets: 2,
            amount: 1000,
            status: 'confirmed',
            date: '2024-01-20',
        },
        {
            key: '2',
            id: 'BK001235',
            user: 'jane@example.com',
            event: 'Cinema Awards',
            tickets: 4,
            amount: 2000,
            status: 'confirmed',
            date: '2024-01-21',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Ticket className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Bookings Management</h1>
                        <p className="text-gray-500">Manage event bookings and tickets</p>
                    </div>
                </div>
                <Button icon={<DownloadOutlined />}>Export Report</Button>
            </div>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default BookingsManagement;
