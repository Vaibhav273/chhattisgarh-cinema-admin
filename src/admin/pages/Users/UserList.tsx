import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Input,
  Select,
  Avatar,
  Button,
  Modal,
  Descriptions,
  message,
  Popconfirm,
  Badge,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { User } from "../../types";
import "./UserList.css";
import type { ColumnsType } from "antd/es/table";

const { Search } = Input;
const { Option } = Select;

const UserList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchText, filterPlan, filterStatus, userList]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];
      setUserList(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...userList];

    if (searchText) {
      filtered = filtered.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    if (filterPlan !== "all") {
      filtered = filtered.filter(
        (user) => user.subscription?.plan === filterPlan,
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (user) => user.subscription?.status === filterStatus,
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (uid: string) => {
    try {
      await deleteDoc(doc(db, "users", uid));
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Failed to delete user");
    }
  };

  const showUserDetails = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const columns: ColumnsType<User> = [
    {
      title: "User",
      key: "user",
      width: 250,
      render: (_: any, record: User) => (
        <Space>
          <Avatar
            size={48}
            src={record.photoURL}
            icon={<UserOutlined />}
            className="user-avatar"
          />
          <div>
            <div className="user-name">{record.displayName || "Unknown"}</div>
            <div className="user-email">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Subscription",
      key: "subscription",
      width: 150,
      render: (_: any, record: User) => {
        const plan = record.subscription?.plan || "free";
        const colors: any = {
          free: "default",
          monthly: "blue",
          annual: "gold",
        };
        return (
          <Tag
            icon={plan !== "free" ? <CrownOutlined /> : undefined}
            color={colors[plan]}
          >
            {plan.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_: any, record: User) => {
        const status = record.subscription?.status || "expired";
        const colors: any = {
          active: "success",
          expired: "error",
          cancelled: "default",
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Profiles",
      dataIndex: "profiles",
      key: "profiles",
      width: 100,
      render: (profiles: any[]) => (
        <Badge count={profiles?.length || 0} showZero color="#1890ff" />
      ),
    },
    {
      title: "Watch History",
      dataIndex: "watchHistory",
      key: "watchHistory",
      width: 120,
      render: (watchHistory: any[]) => (
        <Space>
          <EyeOutlined />
          {watchHistory?.length || 0}
        </Space>
      ),
    },
    {
      title: "My List",
      dataIndex: "myList",
      key: "myList",
      width: 100,
      render: (myList: string[]) => myList?.length || 0,
    },
    {
      title: "Joined Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: any) => {
        if (!date) return "-";
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
      },
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
      width: 150,
      render: (date: any) => {
        if (!date) return "-";
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showUserDetails(record)}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.uid)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className="user-list-card"
        title={
          <Space>
            <UserOutlined />
            <span className="card-title">User Management</span>
            <Tag color="blue">{filteredUsers.length} users</Tag>
          </Space>
        }
      >
        {/* Filters */}
        <div className="filters-container">
          <Search
            placeholder="Search by name or email..."
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by plan"
            size="large"
            style={{ width: 200 }}
            onChange={setFilterPlan}
            defaultValue="all"
          >
            <Option value="all">All Plans</Option>
            <Option value="free">Free</Option>
            <Option value="monthly">Monthly</Option>
            <Option value="annual">Annual</Option>
          </Select>
          <Select
            placeholder="Filter by status"
            size="large"
            style={{ width: 200 }}
            onChange={setFilterStatus}
            defaultValue="all"
          >
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="expired">Expired</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>

        {/* Table */}
        <Table
          loading={loading}
          dataSource={filteredUsers}
          columns={columns}
          rowKey="uid"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
          scroll={{ x: 1400 }}
          className="user-table"
        />
      </Card>

      {/* User Details Modal */}
      <Modal
        title="User Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedUser && (
          <div className="user-details">
            <div className="user-header">
              <Avatar
                size={80}
                src={selectedUser.photoURL}
                icon={<UserOutlined />}
              />
              <div className="user-info">
                <h3>{selectedUser.displayName || "Unknown"}</h3>
                <p>{selectedUser.email}</p>
                <Space>
                  <Tag
                    icon={<CrownOutlined />}
                    color={
                      selectedUser.subscription?.plan === "annual"
                        ? "gold"
                        : selectedUser.subscription?.plan === "monthly"
                          ? "blue"
                          : "default"
                    }
                  >
                    {selectedUser.subscription?.plan?.toUpperCase() || "FREE"}
                  </Tag>
                  <Tag
                    color={
                      selectedUser.subscription?.status === "active"
                        ? "success"
                        : "error"
                    }
                  >
                    {selectedUser.subscription?.status?.toUpperCase() ||
                      "EXPIRED"}
                  </Tag>
                </Space>
              </div>
            </div>

            <Descriptions bordered column={2} style={{ marginTop: 24 }}>
              <Descriptions.Item label="User ID" span={2}>
                {selectedUser.uid}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number" span={2}>
                {selectedUser.phoneNumber || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Profiles">
                {selectedUser.profiles?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Watch History">
                {selectedUser.watchHistory?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="My List">
                {selectedUser.myList?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Subscription Start">
                {selectedUser.subscription?.startDate
                  ? new Date(
                      selectedUser.subscription.startDate,
                    ).toLocaleDateString()
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Subscription End">
                {selectedUser.subscription?.endDate
                  ? new Date(
                      selectedUser.subscription.endDate,
                    ).toLocaleDateString()
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Joined Date">
                {selectedUser.createdAt
                  ? new Date(selectedUser.createdAt).toLocaleDateString()
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Last Active" span={2}>
                {selectedUser.lastActive
                  ? new Date(selectedUser.lastActive).toLocaleDateString()
                  : "-"}
              </Descriptions.Item>
            </Descriptions>

            {/* Profiles */}
            {selectedUser.profiles && selectedUser.profiles.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4>Profiles</h4>
                <Space size="large" style={{ marginTop: 12 }}>
                  {selectedUser.profiles.map((profile) => (
                    <div key={profile.id} className="profile-item">
                      <Avatar size={48} src={profile.avatar} />
                      <div className="profile-name">{profile.name}</div>
                      {profile.isKid && <Tag color="orange">Kids</Tag>}
                    </div>
                  ))}
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default UserList;
