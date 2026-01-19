import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Input,
  Select,
  DatePicker,
  Button,
  Statistic,
  Row,
  Col,
  Modal,
  Descriptions,
  message,
} from "antd";
import {
  DollarOutlined,
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { Transaction } from "../../types";
import "./PaymentList.css";
import type { ColumnsType } from "antd/es/table";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PaymentList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, filterStatus, dateRange, transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const transactionsRef = collection(db, "transactions");
      const q = query(transactionsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (searchText) {
      filtered = filtered.filter(
        (t) =>
          t.userEmail?.toLowerCase().includes(searchText.toLowerCase()) ||
          t.razorpayOrderId?.toLowerCase().includes(searchText.toLowerCase()) ||
          t.razorpayPaymentId?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter((t) => {
        if (!t.createdAt) return false;
        const date = t.createdAt.toDate
          ? t.createdAt.toDate()
          : t.createdAt instanceof Date
            ? t.createdAt
            : new Date(t.createdAt);
        return date >= start.toDate() && date <= end.toDate();
      });
    }

    setFilteredTransactions(filtered);
  };

  const showTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "User Email",
      "Plan",
      "Amount",
      "Order ID",
      "Payment ID",
      "Status",
    ];
    const rows = filteredTransactions.map((t) => {
      let dateStr = "-";
      if (t.createdAt) {
        const d = t.createdAt.toDate
          ? t.createdAt.toDate()
          : t.createdAt instanceof Date
            ? t.createdAt
            : new Date(t.createdAt);
        dateStr = d.toLocaleDateString();
      }
      return [
        dateStr,
        t.userEmail || "-",
        t.planName || "-",
        `₹${(t.amount / 100).toFixed(2)}`,
        t.razorpayOrderId || "-",
        t.razorpayPaymentId || "-",
        t.status || "-",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const stats = {
    totalRevenue:
      filteredTransactions
        .filter((t) => t.status === "success")
        .reduce((sum, t) => sum + t.amount, 0) / 100,
    successCount: filteredTransactions.filter((t) => t.status === "success")
      .length,
    failedCount: filteredTransactions.filter((t) => t.status === "failed")
      .length,
    pendingCount: filteredTransactions.filter((t) => t.status === "pending")
      .length,
  };

  const columns: ColumnsType<Transaction> = [
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: any) => {
        if (!date) return "-";
        const d = date.toDate
          ? date.toDate()
          : date instanceof Date
            ? date
            : new Date(date);
        return (
          <div>
            <div>{d.toLocaleDateString()}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              {d.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      title: "User Email",
      dataIndex: "userEmail",
      key: "userEmail",
      width: 220,
      render: (email: string) => <span className="user-email">{email}</span>,
    },
    {
      title: "Plan",
      dataIndex: "planName",
      key: "planName",
      width: 150,
      render: (plan: string) => <Tag color="blue">{plan}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number) => (
        <span className="amount-text">₹{(amount / 100).toLocaleString()}</span>
      ),
    },
    {
      title: "Order ID",
      dataIndex: "razorpayOrderId",
      key: "razorpayOrderId",
      width: 200,
      render: (id: string) => <code className="order-id">{id}</code>,
    },
    {
      title: "Payment ID",
      dataIndex: "razorpayPaymentId",
      key: "razorpayPaymentId",
      width: 200,
      render: (id: string) => <code className="payment-id">{id || "-"}</code>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const config: any = {
          success: { color: "success", icon: <CheckCircleOutlined /> },
          failed: { color: "error", icon: <CloseCircleOutlined /> },
          pending: { color: "warning", icon: <ClockCircleOutlined /> },
        };
        return (
          <Tag icon={config[status]?.icon} color={config[status]?.color}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      render: (_: any, record: Transaction) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => showTransactionDetails(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-payment">
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix="₹"
              precision={2}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-payment">
            <Statistic
              title="Successful"
              value={stats.successCount}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-payment">
            <Statistic
              title="Failed"
              value={stats.failedCount}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-payment">
            <Statistic
              title="Pending"
              value={stats.pendingCount}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Card */}
      <Card
        className="payment-list-card"
        title={
          <Space>
            <DollarOutlined />
            <span className="card-title">Payment History</span>
            <Tag color="blue">{filteredTransactions.length} transactions</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
        }
      >
        {/* Filters */}
        <div className="filters-container">
          <Search
            placeholder="Search by email, order ID, payment ID..."
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 350 }}
          />
          <Select
            placeholder="Filter by status"
            size="large"
            style={{ width: 200 }}
            onChange={setFilterStatus}
            defaultValue="all"
          >
            <Option value="all">All Status</Option>
            <Option value="success">Success</Option>
            <Option value="failed">Failed</Option>
            <Option value="failed">Pending</Option>
          </Select>
          <RangePicker
            size="large"
            onChange={setDateRange}
            style={{ width: 300 }}
          />
        </div>

        {/* Table */}
        <Table
          loading={loading}
          dataSource={filteredTransactions}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} transactions`,
          }}
          scroll={{ x: 1400 }}
          className="payment-table"
        />
      </Card>

      {/* Transaction Details Modal */}
      <Modal
        title="Transaction Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedTransaction && (
          <div className="transaction-details">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Transaction ID">
                {selectedTransaction.id}
              </Descriptions.Item>
              <Descriptions.Item label="User Email">
                {selectedTransaction.userEmail}
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                {selectedTransaction.userId}
              </Descriptions.Item>
              <Descriptions.Item label="Plan Name">
                <Tag color="blue">{selectedTransaction.planName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Plan ID">
                {selectedTransaction.planId}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                <span className="amount-large">
                  ₹{(selectedTransaction.amount / 100).toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Razorpay Order ID">
                <code>{selectedTransaction.razorpayOrderId}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Razorpay Payment ID">
                <code>{selectedTransaction.razorpayPaymentId || "-"}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Razorpay Signature">
                <code style={{ fontSize: 11 }}>
                  {selectedTransaction.razorpaySignature || "-"}
                </code>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedTransaction.status === "success"
                      ? "success"
                      : selectedTransaction.status === "failed"
                        ? "error"
                        : "warning"
                  }
                  style={{ fontSize: 14, padding: "4px 12px" }}
                >
                  {selectedTransaction.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {(() => {
                  const date = selectedTransaction.createdAt;
                  if (!date) return "-";
                  const d = date.toDate
                    ? date.toDate()
                    : date instanceof Date
                      ? date
                      : new Date(date);
                  return d.toLocaleString();
                })()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default PaymentList;
