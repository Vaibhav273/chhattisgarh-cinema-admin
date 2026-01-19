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
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  UploadOutlined,
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
import "./GenreList.css";
import type { ColumnsType } from "antd/es/table";

interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  contentCount?: number;
}

const GenreList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "genres"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Genre[];
      setGenres(data);
    } catch (error) {
      console.error("Error fetching genres:", error);
      message.error("Failed to fetch genres");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGenre(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (genre: Genre) => {
    setEditingGenre(genre);
    form.setFieldsValue(genre);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "genres", id));
      message.success("Genre deleted successfully");
      fetchGenres();
    } catch (error) {
      console.error("Error deleting genre:", error);
      message.error("Failed to delete genre");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const genreData = {
        ...values,
        slug: values.name.toLowerCase().replace(/\s+/g, "-"),
      };

      if (editingGenre) {
        await updateDoc(doc(db, "genres", editingGenre.id), genreData);
        message.success("Genre updated successfully");
      } else {
        await addDoc(collection(db, "genres"), genreData);
        message.success("Genre created successfully");
      }
      setModalVisible(false);
      fetchGenres();
    } catch (error) {
      console.error("Error saving genre:", error);
      message.error("Failed to save genre");
    }
  };

  const columns: ColumnsType<Genre> = [
    {
      title: "Icon",
      dataIndex: "iconUrl",
      key: "iconUrl",
      width: 80,
      render: (url: string) => (
        <div className="genre-icon">
          {url ? (
            <img src={url} alt="icon" />
          ) : (
            <TagOutlined style={{ fontSize: 24 }} />
          )}
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="genre-name">{text}</span>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Content Count",
      dataIndex: "contentCount",
      key: "contentCount",
      render: (count: number) => <Tag color="blue">{count || 0} items</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: Genre) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this genre?"
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
        className="genre-list-card"
        title={
          <Space>
            <TagOutlined />
            <span className="card-title">Genre Management</span>
            <Tag color="blue">{genres.length} genres</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Add Genre
          </Button>
        }
      >
        <Table
          loading={loading}
          dataSource={genres}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingGenre ? "Edit Genre" : "Add Genre"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Genre Name"
            name="name"
            rules={[{ required: true, message: "Please enter genre name" }]}
          >
            <Input size="large" placeholder="e.g., Action, Comedy, Drama" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Enter genre description" />
          </Form.Item>

          <Form.Item label="Icon URL" name="iconUrl">
            <Input.Group compact>
              <Input
                style={{ width: "calc(100% - 100px)" }}
                placeholder="Icon URL"
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
                {editingGenre ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default GenreList;
