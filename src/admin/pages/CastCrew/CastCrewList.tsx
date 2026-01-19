import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Avatar,
  Upload,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
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
import "./CastCrewList.css";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { TextArea } = Input;

interface CastCrewMember {
  id: string;
  name: string;
  role: string;
  type: "cast" | "crew";
  imageUrl?: string;
  bio?: string;
  contentCount?: number;
}

const CastCrewList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<CastCrewMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<CastCrewMember[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<CastCrewMember | null>(
    null,
  );
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [filterType, members]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "castCrew"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CastCrewMember[];
      setMembers(data);
      setFilteredMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
      message.error("Failed to fetch cast & crew");
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    if (filterType === "all") {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(members.filter((m) => m.type === filterType));
    }
  };

  const handleAdd = () => {
    setEditingMember(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (member: CastCrewMember) => {
    setEditingMember(member);
    form.setFieldsValue(member);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "castCrew", id));
      message.success("Member deleted successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      message.error("Failed to delete member");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingMember) {
        await updateDoc(doc(db, "castCrew", editingMember.id), values);
        message.success("Member updated successfully");
      } else {
        await addDoc(collection(db, "castCrew"), values);
        message.success("Member created successfully");
      }
      setModalVisible(false);
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
      message.error("Failed to save member");
    }
  };

  const columns: ColumnsType<CastCrewMember> = [
    {
      title: "Photo",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 80,
      render: (url: string) => (
        <Avatar size={48} src={url} icon={<UserOutlined />} />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="member-name">{text}</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "cast" ? "blue" : "green"}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag>{role}</Tag>,
    },
    {
      title: "Bio",
      dataIndex: "bio",
      key: "bio",
      ellipsis: true,
    },
    {
      title: "Content Count",
      dataIndex: "contentCount",
      key: "contentCount",
      render: (count: number) => <Tag color="purple">{count || 0} items</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: CastCrewMember) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this member?"
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
        className="castcrew-list-card"
        title={
          <Space>
            <TeamOutlined />
            <span className="card-title">Cast & Crew Management</span>
            <Tag color="blue">{filteredMembers.length} members</Tag>
          </Space>
        }
        extra={
          <Space>
            <Select
              placeholder="Filter by type"
              size="large"
              style={{ width: 150 }}
              onChange={setFilterType}
              defaultValue="all"
            >
              <Option value="all">All</Option>
              <Option value="cast">Cast</Option>
              <Option value="crew">Crew</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Add Member
            </Button>
          </Space>
        }
      >
        <Table
          loading={loading}
          dataSource={filteredMembers}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingMember ? "Edit Cast/Crew Member" : "Add Cast/Crew Member"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input size="large" placeholder="e.g., Amitabh Bachchan" />
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select size="large" placeholder="Select type">
              <Option value="cast">Cast (Actor/Actress)</Option>
              <Option value="crew">Crew (Director/Producer/etc)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please enter role" }]}
          >
            <Input
              size="large"
              placeholder="e.g., Lead Actor, Director, Producer"
            />
          </Form.Item>

          <Form.Item label="Bio" name="bio">
            <TextArea
              rows={4}
              placeholder="Enter biography"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item label="Photo URL" name="imageUrl">
            <Input.Group compact>
              <Input
                style={{ width: "calc(100% - 100px)" }}
                placeholder="Photo URL"
              />
              <Upload showUploadList={false}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Input.Group>
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingMember ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default CastCrewList;
