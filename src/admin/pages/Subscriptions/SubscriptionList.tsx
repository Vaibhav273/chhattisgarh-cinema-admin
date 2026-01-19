import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CrownOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { SubscriptionPlan } from "../../types";
import "./SubscriptionList.css";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

const SubscriptionList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "subscriptionPlans"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SubscriptionPlan[];
      setPlans(data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      console.error("Error fetching plans:", error);
      message.error("Failed to fetch subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPlan(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    form.setFieldsValue(plan);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "subscriptionPlans", id));
      message.success("Plan deleted successfully");
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
      message.error("Failed to delete plan");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingPlan) {
        await updateDoc(doc(db, "subscriptionPlans", editingPlan.id), values);
        message.success("Plan updated successfully");
      } else {
        await addDoc(collection(db, "subscriptionPlans"), values);
        message.success("Plan created successfully");
      }
      setModalVisible(false);
      fetchPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
      message.error("Failed to save plan");
    }
  };

  const columns: ColumnsType<SubscriptionPlan> = [
    {
      title: "Plan Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: SubscriptionPlan) => (
        <Space>
          <CrownOutlined
            style={{
              color: record.duration === "annual" ? "#faad14" : "#1890ff",
            }}
          />
          <span className="plan-name">{text}</span>
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <Space>
          <DollarOutlined />
          <span className="plan-price">₹{price.toLocaleString()}</span>
        </Space>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration: string) => (
        <Tag color={duration === "annual" ? "gold" : "blue"}>
          {duration === "annual" ? "YEARLY" : "MONTHLY"}
        </Tag>
      ),
    },
    {
      title: "Features",
      dataIndex: "features",
      key: "features",
      render: (features: string[]) => (
        <div className="features-list">
          {features?.slice(0, 2).map((feature, index) => (
            <div key={index}>✓ {feature}</div>
          ))}
          {features?.length > 2 && <div>+{features.length - 2} more</div>}
        </div>
      ),
    },
    {
      title: "Razorpay Plan ID",
      dataIndex: "razorpayPlanId",
      key: "razorpayPlanId",
      render: (id: string) => <code className="plan-id">{id}</code>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Display Order",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: SubscriptionPlan) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this plan?"
            onConfirm={() => handleDelete(record.id)}
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
        className="subscription-list-card"
        title={
          <Space>
            <CrownOutlined />
            <span className="card-title">Subscription Plans</span>
            <Tag color="blue">{plans.length} plans</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Add Plan
          </Button>
        }
      >
        <Table
          loading={loading}
          dataSource={plans}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingPlan ? "Edit Subscription Plan" : "Add Subscription Plan"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            displayOrder: 1,
            duration: "monthly",
          }}
        >
          <Form.Item
            label="Plan Name"
            name="name"
            rules={[{ required: true, message: "Please enter plan name" }]}
          >
            <Input size="large" placeholder="e.g., Premium Monthly" />
          </Form.Item>

          <Form.Item
            label="Price (₹)"
            name="price"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber
              size="large"
              style={{ width: "100%" }}
              min={0}
              placeholder="299"
            />
          </Form.Item>

          <Form.Item
            label="Duration"
            name="duration"
            rules={[{ required: true, message: "Please select duration" }]}
          >
            <Select size="large" placeholder="Select duration">
              <Option value="monthly">Monthly</Option>
              <Option value="annual">Annual</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Razorpay Plan ID"
            name="razorpayPlanId"
            rules={[
              { required: true, message: "Please enter Razorpay plan ID" },
            ]}
          >
            <Input size="large" placeholder="plan_xxxxxxxxxxxxx" />
          </Form.Item>

          <Form.Item label="Features" name="features">
            <Select
              mode="tags"
              size="large"
              placeholder="Add features (press Enter to add)"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Display Order"
            name="displayOrder"
            rules={[{ required: true, message: "Please enter display order" }]}
          >
            <InputNumber size="large" style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingPlan ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default SubscriptionList;
