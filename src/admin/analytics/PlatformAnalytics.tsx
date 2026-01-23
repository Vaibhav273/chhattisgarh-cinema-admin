// ═══════════════════════════════════════════════════════════════
// 📊 PLATFORM ANALYTICS
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import { BarChart3, Users, Eye, Play, TrendingUp } from 'lucide-react';

const PlatformAnalytics: React.FC = () => {
    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Platform Analytics</h1>
                    <p className="text-gray-500">Overall platform performance metrics</p>
                </div>
            </div>

            {/* Key Metrics */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={12483}
                            prefix={<Users size={20} />}
                            suffix={<ArrowUpOutlined style={{ color: '#3f8600' }} />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                        <div className="text-xs text-green-600 mt-2">+8.5% from last month</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Views"
                            value={2456789}
                            prefix={<Eye size={20} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div className="text-xs text-blue-600 mt-2">+15.3% from last month</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Watch Hours"
                            value={345678}
                            prefix={<Play size={20} />}
                            suffix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                        <div className="text-xs text-green-600 mt-2">+12.1% from last month</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Engagement Rate"
                            value={67.8}
                            suffix="%"
                            prefix={<TrendingUp size={20} />}
                            valueStyle={{ color: '#faad14' }}
                        />
                        <div className="text-xs text-orange-600 mt-2">-2.3% from last month</div>
                    </Card>
                </Col>
            </Row>

            {/* Active Users */}
            <Card title="Active Users Overview" className="mb-6">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Statistic title="Daily Active Users" value={4523} />
                    </Col>
                    <Col xs={24} md={8}>
                        <Statistic title="Weekly Active Users" value={8976} />
                    </Col>
                    <Col xs={24} md={8}>
                        <Statistic title="Monthly Active Users" value={12483} />
                    </Col>
                </Row>
            </Card>

            {/* Content Performance */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Content Distribution">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Movies</span>
                                <span className="font-semibold">543 (45%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span>Series</span>
                                <span className="font-semibold">234 (35%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span>Short Films</span>
                                <span className="font-semibold">156 (20%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="User Demographics">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Premium Users</span>
                                <span className="font-semibold text-gold-600">1248 (10%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Free Users</span>
                                <span className="font-semibold">11235 (90%)</span>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <span>Male</span>
                                <span className="font-semibold">7489 (60%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Female</span>
                                <span className="font-semibold">4994 (40%)</span>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PlatformAnalytics;
