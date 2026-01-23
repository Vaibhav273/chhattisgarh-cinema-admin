// ═══════════════════════════════════════════════════════════════
// 👥 USER ANALYTICS
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { Users, UserPlus, UserMinus, Activity } from 'lucide-react';

const UserAnalytics: React.FC = () => {
    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Users className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">User Analytics</h1>
                    <p className="text-gray-500">User behavior and engagement metrics</p>
                </div>
            </div>

            {/* User Stats */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="New Users (This Month)"
                            value={1248}
                            prefix={<UserPlus size={20} />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                        <div className="text-xs text-green-600 mt-2">+18.5% from last month</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Churned Users"
                            value={156}
                            prefix={<UserMinus size={20} />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                        <div className="text-xs text-red-600 mt-2">-2.3% churn rate</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Sessions"
                            value={3456}
                            prefix={<Activity size={20} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div className="text-xs text-blue-600 mt-2">Current online users</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Avg. Session Time"
                            value={45}
                            suffix="min"
                            valueStyle={{ color: '#52c41a' }}
                        />
                        <div className="text-xs text-green-600 mt-2">+5 min from last month</div>
                    </Card>
                </Col>
            </Row>

            {/* User Behavior */}
            <Card title="User Behavior" className="mb-6">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <div className="space-y-4">
                            <h4 className="font-semibold">Most Active Time</h4>
                            <div className="flex justify-between items-center">
                                <span>8 PM - 11 PM</span>
                                <span className="font-semibold">45% of users</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span>6 PM - 8 PM</span>
                                <span className="font-semibold">30% of users</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} md={12}>
                        <div className="space-y-4">
                            <h4 className="font-semibold">Device Usage</h4>
                            <div className="flex justify-between items-center">
                                <span>Mobile</span>
                                <span className="font-semibold">60%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span>Desktop</span>
                                <span className="font-semibold">30%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span>TV/Other</span>
                                <span className="font-semibold">10%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Retention */}
            <Card title="User Retention">
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Day 1', 'Day 7', 'Day 14', 'Day 30', 'Day 60', 'Day 90', 'Day 180'].map((day, index) => (
                        <div key={day} className="text-center">
                            <div className="text-xs text-gray-500 mb-1">{day}</div>
                            <div className="h-20 bg-blue-500 rounded" style={{
                                height: `${80 - index * 10}px`,
                                opacity: 1 - (index * 0.1)
                            }}></div>
                            <div className="text-xs font-semibold mt-1">{90 - index * 10}%</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default UserAnalytics;
