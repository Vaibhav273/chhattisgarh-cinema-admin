// ═══════════════════════════════════════════════════════════════
// 📋 SYSTEM LOGS
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Table, Tag, Input, Select, Space, Button } from 'antd';
import { SearchOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { FileText } from 'lucide-react';

const { Search } = Input;

const SystemLogs: React.FC = () => {
    const columns = [
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 180,
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            width: 100,
            render: (level: string) => {
                const colors: any = {
                    error: 'red',
                    warning: 'orange',
                    info: 'blue',
                    success: 'green',
                };
                return <Tag color={colors[level]}>{level.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Module',
            dataIndex: 'module',
            key: 'module',
            width: 150,
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            width: 150,
        },
    ];

    const data = [
        {
            key: '1',
            timestamp: '2024-01-23 14:30:45',
            level: 'info',
            module: 'Auth',
            message: 'User logged in successfully',
            user: 'admin@example.com',
        },
        {
            key: '2',
            timestamp: '2024-01-23 14:28:12',
            level: 'warning',
            module: 'CDN',
            message: 'High bandwidth usage detected',
            user: 'system',
        },
        {
            key: '3',
            timestamp: '2024-01-23 14:25:33',
            level: 'error',
            module: 'Payment',
            message: 'Payment gateway timeout',
            user: 'user123@example.com',
        },
        {
            key: '4',
            timestamp: '2024-01-23 14:20:01',
            level: 'success',
            module: 'Content',
            message: 'Video encoding completed',
            user: 'system',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                        <FileText className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">System Logs</h1>
                        <p className="text-gray-500">Monitor system activity and errors</p>
                    </div>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />}>Refresh</Button>
                    <Button icon={<DownloadOutlined />}>Export</Button>
                </Space>
            </div>

            <Card>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Space>
                        <Search
                            placeholder="Search logs..."
                            prefix={<SearchOutlined />}
                            style={{ width: 300 }}
                            size="large"
                        />
                        <Select defaultValue="all" size="large" style={{ width: 150 }}>
                            <Select.Option value="all">All Levels</Select.Option>
                            <Select.Option value="error">Errors</Select.Option>
                            <Select.Option value="warning">Warnings</Select.Option>
                            <Select.Option value="info">Info</Select.Option>
                        </Select>
                        <Select defaultValue="all" size="large" style={{ width: 150 }}>
                            <Select.Option value="all">All Modules</Select.Option>
                            <Select.Option value="auth">Auth</Select.Option>
                            <Select.Option value="payment">Payment</Select.Option>
                            <Select.Option value="content">Content</Select.Option>
                            <Select.Option value="cdn">CDN</Select.Option>
                        </Select>
                    </Space>

                    <Table
                        columns={columns}
                        dataSource={data}
                        pagination={{ pageSize: 20 }}
                        scroll={{ x: 1000 }}
                    />
                </Space>
            </Card>
        </div>
    );
};

export default SystemLogs;
