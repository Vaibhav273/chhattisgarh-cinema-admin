import React, { useState } from "react";
import { Card, Row, Col, Statistic, Select, DatePicker, Space } from "antd";
import {
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Column, Pie, Area } from "@ant-design/charts";
import "./Analytics.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics: React.FC = () => {
  const [period, setPeriod] = useState("month");

  // Mock data - will be replaced with real Firebase data later
  const revenueData = [
    { date: "2026-01-01", revenue: 45000 },
    { date: "2026-01-02", revenue: 52000 },
    { date: "2026-01-03", revenue: 48000 },
    { date: "2026-01-04", revenue: 61000 },
    { date: "2026-01-05", revenue: 58000 },
    { date: "2026-01-06", revenue: 71000 },
    { date: "2026-01-07", revenue: 85000 },
  ];

  const userGrowthData = [
    { month: "Jan", users: 120 },
    { month: "Feb", users: 145 },
    { month: "Mar", users: 135 },
    { month: "Apr", users: 178 },
    { month: "May", users: 165 },
    { month: "Jun", users: 205 },
  ];

  const contentViewsData = [
    { title: "Movie A", views: 15000 },
    { title: "Movie B", views: 12000 },
    { title: "Series C", views: 18000 },
    { title: "Movie D", views: 9000 },
    { title: "Short E", views: 7000 },
  ];

  const planDistributionData = [
    { type: "Free", value: 45 },
    { type: "Monthly", value: 30 },
    { type: "Annual", value: 25 },
  ];

  const revenueConfig = {
    data: revenueData,
    xField: "date",
    yField: "revenue",
    smooth: true,
    color: "#1890ff",
    areaStyle: {
      fill: "l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff",
    },
  };

  const userGrowthConfig = {
    data: userGrowthData,
    xField: "month",
    yField: "users",
    color: "#52c41a",
  };

  const contentViewsConfig = {
    data: contentViewsData,
    xField: "title",
    yField: "views",
    color: "#722ed1",
  };

  const planDistributionConfig = {
    data: planDistributionData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name} {percentage}",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Filters */}
      <Card className="analytics-filter-card">
        <Space size="middle">
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 150 }}
            size="large"
          >
            <Option value="day">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="year">This Year</Option>
          </Select>
          <RangePicker size="large" />
        </Space>
      </Card>

      {/* Revenue Chart */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <span>Revenue Trend</span>
              </Space>
            }
            className="analytics-card"
          >
            <Area {...revenueConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* User Growth & Content Views */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RiseOutlined />
                <span>User Growth</span>
              </Space>
            }
            className="analytics-card"
          >
            <Column {...userGrowthConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <span>Top Content by Views</span>
              </Space>
            }
            className="analytics-card"
          >
            <Column {...contentViewsConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Plan Distribution */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                <span>Subscription Plan Distribution</span>
              </Space>
            }
            className="analytics-card"
          >
            <Pie {...planDistributionConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Key Metrics" className="analytics-card">
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <Statistic
                title="Average Revenue Per User"
                value={450}
                prefix="₹"
              />
              <Statistic title="Conversion Rate" value={12.5} suffix="%" />
              <Statistic title="Churn Rate" value={3.2} suffix="%" />
              <Statistic
                title="Average Watch Time"
                value={45}
                suffix=" min/day"
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default Analytics;
