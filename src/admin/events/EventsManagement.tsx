// ═══════════════════════════════════════════════════════════════
// 🎭 EVENTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Button, Table, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Calendar } from 'lucide-react';

const EventsManagement: React.FC = () => {
    const columns = [
        {
            title: 'Event',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Venue',
            dataIndex: 'venue',
            key: 'venue',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (cat: string) => <Tag color="purple">{cat}</Tag>,
        },
        {
            title: 'Bookings',
            dataIndex: 'bookings',
            key: 'bookings',
            render: (bookings: number, record: any) => (
                `${bookings}/${record.capacity}`
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'upcoming' ? 'blue' : status === 'ongoing' ? 'green' : 'default'}>
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
                        View
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
            title: 'Chhattisgarh Film Festival 2024',
            date: '2024-02-15',
            venue: 'Science College Auditorium',
            category: 'Film Festival',
            bookings: 450,
            capacity: 500,
            status: 'upcoming',
        },
        {
            key: '2',
            title: 'Regional Cinema Awards',
            date: '2024-03-10',
            venue: 'Raipur Convention Center',
            category: 'Award Show',
            bookings: 780,
            capacity: 1000,
            status: 'upcoming',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <Calendar className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Events Management</h1>
                        <p className="text-gray-500">Manage all platform events</p>
                    </div>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large">
                    Create New Event
                </Button>
            </div>

            <Card>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default EventsManagement;
