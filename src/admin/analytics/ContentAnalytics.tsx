// ═══════════════════════════════════════════════════════════════
// 📹 CONTENT ANALYTICS
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Table, Tag } from 'antd';
import { TrendingUp } from 'lucide-react';

const ContentAnalytics: React.FC = () => {
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
            render: (type: string) => (
                <Tag color={type === 'Movie' ? 'blue' : type === 'Series' ? 'purple' : 'pink'}>
                    {type}
                </Tag>
            ),
        },
        {
            title: 'Views',
            dataIndex: 'views',
            key: 'views',
            sorter: (a: any, b: any) => a.views - b.views,
            render: (views: number) => views.toLocaleString(),
        },
        {
            title: 'Watch Time (hrs)',
            dataIndex: 'watchTime',
            key: 'watchTime',
            sorter: (a: any, b: any) => a.watchTime - b.watchTime,
            render: (time: number) => time.toLocaleString(),
        },
        {
            title: 'Completion Rate',
            dataIndex: 'completion',
            key: 'completion',
            render: (rate: number) => `${rate}%`,
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: number) => (
                <span className="flex items-center gap-1">
                    ⭐ {rating.toFixed(1)}
                </span>
            ),
        },
        {
            title: 'Likes',
            dataIndex: 'likes',
            key: 'likes',
            render: (likes: number) => likes.toLocaleString(),
        },
    ];

    const data = [
        {
            key: '1',
            title: 'Sample Movie 1',
            type: 'Movie',
            views: 154200,
            watchTime: 12500,
            completion: 78,
            rating: 4.5,
            likes: 8920,
        },
        {
            key: '2',
            title: 'Sample Series 1',
            type: 'Series',
            views: 452300,
            watchTime: 45600,
            completion: 65,
            rating: 4.7,
            likes: 15400,
        },
        {
            key: '3',
            title: 'Short Film 1',
            type: 'Short Film',
            views: 84200,
            watchTime: 2100,
            completion: 82,
            rating: 4.2,
            likes: 5600,
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Content Analytics</h1>
                    <p className="text-gray-500">Performance metrics for all content</p>
                </div>
            </div>

            <Card title="Top Performing Content">
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    );
};

export default ContentAnalytics;
