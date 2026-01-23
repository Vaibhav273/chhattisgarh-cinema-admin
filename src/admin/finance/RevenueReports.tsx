// ═══════════════════════════════════════════════════════════════
// 📊 REVENUE REPORTS
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { TrendingUp } from 'lucide-react';

const RevenueReports: React.FC = () => {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Revenue Reports</h1>
                        <p className="text-gray-500">Financial analytics and reports</p>
                    </div>
                </div>
                <Button type="primary" icon={<DownloadOutlined />}>
                    Export Report
                </Button>
            </div>

            {/* Revenue Stats */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={5678900}
                            prefix="₹"
                            valueStyle={{ color: '#3f8600' }}
                            suffix={<ArrowUpOutlined />}
                        />
                        <div className="text-xs text-green-600 mt-2">+12.5% from last month</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="This Month"
                            value={456789}
                            prefix="₹"
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div className="text-xs text-blue-600 mt-2">Jan 2024</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Subscriptions"
                            value={234567}
                            prefix="₹"
                            valueStyle={{ color: '#faad14' }}
                        />
                        <div className="text-xs text-gray-500 mt-2">1,248 active users</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Events"
                            value={89012}
                            prefix="₹"
                            valueStyle={{ color: '#52c41a' }}
                        />
                        <div className="text-xs text-gray-500 mt-2">156 bookings</div>
                    </Card>
                </Col>
            </Row>

            {/* Monthly Breakdown */}
            <Card title="Monthly Revenue Breakdown" className="mb-6">
                <div className="space-y-4">
                    {['Jan', 'Dec', 'Nov', 'Oct'].map((month, index) => (
                        <div key={month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h4 className="font-semibold">{month} 2024</h4>
                                <p className="text-sm text-gray-500">Subscriptions + Events + Ads</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold">₹{(456789 - index * 50000).toLocaleString()}</div>
                                <div className={`text-xs ${index === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {index === 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {index === 0 ? '+12.5%' : '-5.2%'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Tax Report */}
            <Card title="Tax Information">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Statistic title="Total GST Collected" value={102340} prefix="₹" />
                    </Col>
                    <Col xs={24} md={8}>
                        <Statistic title="TDS Deducted" value={45678} prefix="₹" />
                    </Col>
                    <Col xs={24} md={8}>
                        <Statistic title="Net Payable" value={408771} prefix="₹" />
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default RevenueReports;
