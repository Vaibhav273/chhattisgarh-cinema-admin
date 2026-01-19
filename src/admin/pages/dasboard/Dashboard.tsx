import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Typography,
  Spin,
} from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  DollarOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CrownOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Line, Pie } from "@ant-design/charts";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { DashboardStats, Content, Transaction } from "../../types";
import "./Dashboard.css";

const { Text } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalContent: 0,
    totalViews: 0,
    revenueGrowth: 0,
    userGrowth: 0,
    subscriberGrowth: 0,
    contentGrowth: 0,
  });
  const [recentContent, setRecentContent] = useState<Content[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = usersSnapshot.size;

      // Fetch active subscribers
      const subscribersQuery = query(
        collection(db, "users"),
        where("subscription.status", "==", "active"),
      );
      const subscribersSnapshot = await getDocs(subscribersQuery);
      const activeSubscribers = subscribersSnapshot.size;

      // Fetch total content
      const contentSnapshot = await getDocs(collection(db, "content"));
      const totalContent = contentSnapshot.size;

      // Calculate total views
      const totalViews = contentSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().views || 0),
        0,
      );

      // Fetch transactions
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("status", "==", "success"),
        orderBy("createdAt", "desc"),
        limit(10),
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];

      // Calculate total revenue
      const totalRevenue =
        transactions.reduce((sum, t) => sum + t.amount, 0) / 100;

      // Fetch recent content
      const recentQuery = query(
        collection(db, "content"),
        orderBy("createdAt", "desc"),
        limit(5),
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recent = recentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Content[];

      setStats({
        totalUsers,
        activeSubscribers,
        totalRevenue,
        monthlyRevenue: totalRevenue * 0.3, // Mock monthly revenue
        totalContent,
        totalViews,
        revenueGrowth: 12.5,
        userGrowth: 8.3,
        subscriberGrowth: 15.7,
        contentGrowth: 5.2,
      });

      setRecentContent(recent);
      setRecentTransactions(transactions);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      prefix: <UserOutlined />,
      suffix: "",
      precision: 0,
      growth: stats.userGrowth,
      color: "#1890ff",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Active Subscribers",
      value: stats.activeSubscribers,
      prefix: <CrownOutlined />,
      suffix: "",
      precision: 0,
      growth: stats.subscriberGrowth,
      color: "#52c41a",
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      prefix: "₹",
      suffix: "",
      precision: 0,
      growth: stats.revenueGrowth,
      color: "#722ed1",
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "Total Content",
      value: stats.totalContent,
      prefix: <VideoCameraOutlined />,
      suffix: "",
      precision: 0,
      growth: stats.contentGrowth,
      color: "#fa8c16",
      bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      prefix: <EyeOutlined />,
      suffix: "",
      precision: 0,
      growth: 23.1,
      color: "#eb2f96",
      bgGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
  ];

  const revenueData = [
    { month: "Jan", revenue: 45000, users: 120 },
    { month: "Feb", revenue: 52000, users: 145 },
    { month: "Mar", revenue: 48000, users: 135 },
    { month: "Apr", revenue: 61000, users: 178 },
    { month: "May", revenue: 58000, users: 165 },
    { month: "Jun", revenue: 71000, users: 205 },
    { month: "Jul", revenue: 85000, users: 235 },
    { month: "Aug", revenue: 78000, users: 218 },
    { month: "Sep", revenue: 92000, users: 267 },
    { month: "Oct", revenue: 88000, users: 245 },
    { month: "Nov", revenue: 95000, users: 278 },
    { month: "Dec", revenue: 105000, users: 312 },
  ];

  const contentTypeData = [
    { type: "Movies", value: 45 },
    { type: "Web Series", value: 30 },
    { type: "Short Films", value: 15 },
    { type: "Events", value: 10 },
  ];

  const revenueConfig = {
    data: revenueData,
    xField: "month",
    yField: "revenue",
    smooth: true,
    height: 300,
    color: "#1890ff",
    areaStyle: {
      fill: "l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff",
    },
    animation: {
      appear: {
        animation: "wave-in",
        duration: 2000,
      },
    },
  };

  const contentTypeConfig = {
    data: contentTypeData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    height: 300,
    label: {
      type: "outer",
      content: "{name} {percentage}",
    },
    interactions: [{ type: "element-active" }],
    animation: {
      appear: {
        animation: "fade-in",
        duration: 1500,
      },
    },
  };

  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "thumbnailUrl",
      key: "thumbnailUrl",
      width: 100,
      render: (url: string) => (
        <img src={url} alt="thumbnail" className="content-thumbnail" />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag
          color={
            type === "movie"
              ? "blue"
              : type === "series"
                ? "green"
                : type === "short_film"
                  ? "orange"
                  : "purple"
          }
        >
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      render: (views: number) => (
        <Space>
          <EyeOutlined />
          {views?.toLocaleString() || 0}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "published"
              ? "success"
              : status === "draft"
                ? "warning"
                : "default"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: "User Email",
      dataIndex: "userEmail",
      key: "userEmail",
    },
    {
      title: "Plan",
      dataIndex: "planName",
      key: "planName",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `₹${(amount / 100).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "success" ? "success" : "error"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: any) => new Date(date.seconds * 1000).toLocaleDateString(),
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} xl={4.8} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card
                className="stat-card"
                style={{
                  background: stat.bgGradient,
                }}
                bordered={false}
              >
                <div className="stat-content">
                  <div className="stat-header">
                    <Text className="stat-title">{stat.title}</Text>
                    <div className="stat-icon">{stat.prefix}</div>
                  </div>
                  <Statistic
                    value={stat.value}
                    precision={stat.precision}
                    valueStyle={{
                      color: "#fff",
                      fontSize: 28,
                      fontWeight: 700,
                    }}
                    prefix={typeof stat.prefix === "string" ? stat.prefix : ""}
                  />
                  <div className="stat-growth">
                    {stat.growth > 0 ? (
                      <ArrowUpOutlined style={{ color: "#fff" }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: "#fff" }} />
                    )}
                    <Text className="growth-text">
                      {Math.abs(stat.growth)}% from last month
                    </Text>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card
              title={
                <Space>
                  <DollarOutlined />
                  <span>Revenue Overview</span>
                </Space>
              }
              bordered={false}
              className="chart-card"
            >
              <Line {...revenueConfig} />
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Card
              title={
                <Space>
                  <TrophyOutlined />
                  <span>Content Distribution</span>
                </Space>
              }
              bordered={false}
              className="chart-card"
            >
              <Pie {...contentTypeConfig} />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Recent Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{ marginTop: 24 }}
      >
        <Card
          title={
            <Space>
              <PlayCircleOutlined />
              <span>Recent Content</span>
            </Space>
          }
          bordered={false}
          className="table-card"
        >
          <Table
            dataSource={recentContent}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        style={{ marginTop: 24 }}
      >
        <Card
          title={
            <Space>
              <DollarOutlined />
              <span>Recent Transactions</span>
            </Space>
          }
          bordered={false}
          className="table-card"
        >
          <Table
            dataSource={recentTransactions}
            columns={transactionColumns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
