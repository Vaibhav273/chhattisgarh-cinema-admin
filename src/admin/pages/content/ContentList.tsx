import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  message,
  Popconfirm,
  Avatar,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
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
import type { Content } from "../../types";
import "./ContentList.css";
import type { ColumnsType } from "antd/es/table";

const { Search } = Input;
const { Option } = Select;

const ContentList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [contentList, setContentList] = useState<Content[]>([]);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [searchText, filterType, filterStatus, contentList]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const contentRef = collection(db, "content");
      const q = query(contentRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Content[];
      setContentList(data);
      setFilteredContent(data);
    } catch (error) {
      console.error("Error fetching content:", error);
      message.error("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = [...contentList];

    // Search filter
    if (searchText) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    setFilteredContent(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "content", id));
      message.success("Content deleted successfully");
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
      message.error("Failed to delete content");
    }
  };

  const columns: ColumnsType<Content> = [
    {
      title: "Thumbnail",
      dataIndex: "thumbnailUrl",
      key: "thumbnailUrl",
      width: 100,
      render: (url: string, _record: Content) => (
        <Avatar
          shape="square"
          size={64}
          src={url}
          icon={<EyeOutlined />}
          className="content-thumbnail"
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Content) => (
        <div>
          <div className="content-title">{text}</div>
          <div className="content-meta">
            {record.language?.join(", ")} • {record.duration} min
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => {
        const colors: any = {
          movie: "blue",
          series: "green",
          short_film: "orange",
          event: "purple",
        };
        return (
          <Tag color={colors[type] || "default"}>
            {type.replace("_", " ").toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Genre",
      dataIndex: "genre",
      key: "genre",
      width: 150,
      render: (genres: string[]) => (
        <div className="genre-tags">
          {genres?.slice(0, 2).map((genre, index) => (
            <Tag key={index}>{genre}</Tag>
          ))}
          {genres?.length > 2 && <Tag>+{genres.length - 2}</Tag>}
        </div>
      ),
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      width: 100,
      sorter: (a: Content, b: Content) => (a.views || 0) - (b.views || 0),
      render: (views: number) => (
        <Space>
          <EyeOutlined />
          {views?.toLocaleString() || 0}
        </Space>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 100,
      sorter: (a: Content, b: Content) => a.rating - b.rating,
      render: (rating: number) => (
        <Tag
          color={rating >= 4 ? "success" : rating >= 3 ? "warning" : "error"}
        >
          ⭐ {rating.toFixed(1)}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const colors: any = {
          published: "success",
          draft: "warning",
          archived: "default",
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Premium",
      dataIndex: "isPremium",
      key: "isPremium",
      width: 100,
      render: (isPremium: boolean) => (
        <Tag color={isPremium ? "gold" : "default"}>
          {isPremium ? "👑 Premium" : "Free"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: Content) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/admin/content/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure to delete this content?"
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
          </Tooltip>
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
        className="content-list-card"
        title={
          <Space>
            <span className="card-title">Content Management</span>
            <Tag color="blue">{filteredContent.length} items</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/content/new")}
            size="large"
          >
            Add Content
          </Button>
        }
      >
        {/* Filters */}
        <div className="filters-container">
          <Search
            placeholder="Search by title..."
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by type"
            size="large"
            style={{ width: 200 }}
            onChange={setFilterType}
            defaultValue="all"
          >
            <Option value="all">All Types</Option>
            <Option value="movie">Movies</Option>
            <Option value="series">Web Series</Option>
            <Option value="short_film">Short Films</Option>
            <Option value="event">Events</Option>
          </Select>
          <Select
            placeholder="Filter by status"
            size="large"
            style={{ width: 200 }}
            onChange={setFilterStatus}
            defaultValue="all"
          >
            <Option value="all">All Status</Option>
            <Option value="published">Published</Option>
            <Option value="draft">Draft</Option>
            <Option value="archived">Archived</Option>
          </Select>
        </div>

        {/* Table */}
        <Table
          loading={loading}
          dataSource={filteredContent}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
          }}
          scroll={{ x: 1400 }}
          className="content-table"
        />
      </Card>
    </motion.div>
  );
};

export default ContentList;
