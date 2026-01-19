import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GlobalOutlined,
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
import "./LanguageList.css";
import type { ColumnsType } from "antd/es/table";

interface Language {
  id: string;
  name: string;
  code: string;
  nativeName: string;
  contentCount?: number;
}

const LanguageList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "languages"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Language[];
      setLanguages(data);
    } catch (error) {
      console.error("Error fetching languages:", error);
      message.error("Failed to fetch languages");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingLanguage(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (language: Language) => {
    setEditingLanguage(language);
    form.setFieldsValue(language);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "languages", id));
      message.success("Language deleted successfully");
      fetchLanguages();
    } catch (error) {
      console.error("Error deleting language:", error);
      message.error("Failed to delete language");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingLanguage) {
        await updateDoc(doc(db, "languages", editingLanguage.id), values);
        message.success("Language updated successfully");
      } else {
        await addDoc(collection(db, "languages"), values);
        message.success("Language created successfully");
      }
      setModalVisible(false);
      fetchLanguages();
    } catch (error) {
      console.error("Error saving language:", error);
      message.error("Failed to save language");
    }
  };

  const columns: ColumnsType<Language> = [
    {
      title: "Language",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Language) => (
        <div>
          <div className="language-name">{text}</div>
          <div className="language-native">{record.nativeName}</div>
        </div>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <Tag color="blue">{text.toUpperCase()}</Tag>,
    },
    {
      title: "Content Count",
      dataIndex: "contentCount",
      key: "contentCount",
      render: (count: number) => <Tag color="green">{count || 0} items</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: Language) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this language?"
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
        className="language-list-card"
        title={
          <Space>
            <GlobalOutlined />
            <span className="card-title">Language Management</span>
            <Tag color="blue">{languages.length} languages</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Add Language
          </Button>
        }
      >
        <Table
          loading={loading}
          dataSource={languages}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingLanguage ? "Edit Language" : "Add Language"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Language Name (English)"
            name="name"
            rules={[{ required: true, message: "Please enter language name" }]}
          >
            <Input size="large" placeholder="e.g., Hindi, English" />
          </Form.Item>

          <Form.Item
            label="Native Name"
            name="nativeName"
            rules={[{ required: true, message: "Please enter native name" }]}
          >
            <Input size="large" placeholder="e.g., हिन्दी, English" />
          </Form.Item>

          <Form.Item
            label="Language Code"
            name="code"
            rules={[{ required: true, message: "Please enter language code" }]}
          >
            <Input size="large" placeholder="e.g., hi, en, cg" />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingLanguage ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default LanguageList;
