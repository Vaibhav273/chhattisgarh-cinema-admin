import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  DatePicker,
  InputNumber,
  Switch,
  Space,
  message,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import {
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  collection,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../config/firebase";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "./ContentForm.css";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const ContentForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchContent = async () => {
    try {
      const docRef = doc(db, "content", id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as any;

        // Fix: Handle both Timestamp and Date objects
        let releaseDate = null;
        if (data.releaseDate) {
          const date =
            typeof data.releaseDate.toDate === "function"
              ? data.releaseDate.toDate()
              : data.releaseDate instanceof Date
                ? data.releaseDate
                : new Date(data.releaseDate);
          releaseDate = dayjs(date);
        }

        form.setFieldsValue({
          ...data,
          releaseDate: releaseDate,
        });
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      message.error("Failed to fetch content");
    }
  };

  const handleImageUpload = async (file: File, field: string) => {
    try {
      setUploading(true);
      const storageRef = ref(
        storage,
        `content/${field}/${Date.now()}_${file.name}`,
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      form.setFieldsValue({ [field]: url });
      message.success("Image uploaded successfully");
      return url;
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Failed to upload image");
      return "";
    } finally {
      setUploading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const contentData: any = {
        ...values,
        releaseDate: values.releaseDate
          ? Timestamp.fromDate((values.releaseDate as Dayjs).toDate())
          : Timestamp.now(),
        updatedAt: Timestamp.now(),
        views: values.views || 0,
        likes: values.likes || 0,
      };

      if (isEdit) {
        await updateDoc(doc(db, "content", id!), contentData);
        message.success("Content updated successfully");
      } else {
        const newDocRef = doc(collection(db, "content"));
        contentData.createdAt = Timestamp.now();
        await setDoc(newDocRef, contentData);
        message.success("Content created successfully");
      }

      navigate("/admin/content");
    } catch (error) {
      console.error("Error saving content:", error);
      message.error("Failed to save content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className="content-form-card"
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/content")}
            />
            <Title level={4} style={{ margin: 0 }}>
              {isEdit ? "Edit Content" : "Add New Content"}
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button onClick={() => navigate("/admin/content")}>Cancel</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => form.submit()}
            >
              Save Content
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            type: "movie",
            status: "draft",
            isPremium: false,
            rating: 0,
            duration: 0,
          }}
        >
          <Row gutter={24}>
            {/* Basic Information */}
            <Col span={24}>
              <Divider orientation="horizontal">Basic Information</Divider>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Please enter title" }]}
              >
                <Input size="large" placeholder="Enter content title" />
              </Form.Item>
            </Col>

            <Col xs={24} lg={6}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: "Please select type" }]}
              >
                <Select size="large" placeholder="Select type">
                  <Option value="movie">Movie</Option>
                  <Option value="series">Web Series</Option>
                  <Option value="short_film">Short Film</Option>
                  <Option value="event">Event</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} lg={6}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select size="large" placeholder="Select status">
                  <Option value="draft">Draft</Option>
                  <Option value="published">Published</Option>
                  <Option value="archived">Archived</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Description"
                name="description"
                rules={[
                  { required: true, message: "Please enter description" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter content description"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>

            {/* Media & Metadata */}
            <Col span={24}>
              <Divider orientation="horizontal">Media & Metadata</Divider>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                label="Thumbnail URL"
                name="thumbnailUrl"
                rules={[{ required: true, message: "Please upload thumbnail" }]}
              >
                <Input.Group compact>
                  <Input
                    style={{ width: "calc(100% - 120px)" }}
                    placeholder="Thumbnail URL"
                  />
                  <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleImageUpload(file, "thumbnailUrl");
                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />} loading={uploading}>
                      Upload
                    </Button>
                  </Upload>
                </Input.Group>
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                label="Banner URL"
                name="bannerUrl"
                rules={[{ required: true, message: "Please upload banner" }]}
              >
                <Input.Group compact>
                  <Input
                    style={{ width: "calc(100% - 120px)" }}
                    placeholder="Banner URL"
                  />
                  <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleImageUpload(file, "bannerUrl");
                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />} loading={uploading}>
                      Upload
                    </Button>
                  </Upload>
                </Input.Group>
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                label="Video URL (HLS)"
                name="videoUrl"
                rules={[{ required: true, message: "Please enter video URL" }]}
              >
                <Input
                  size="large"
                  placeholder="https://example.com/video.m3u8"
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item label="Trailer URL" name="trailerUrl">
                <Input
                  size="large"
                  placeholder="https://example.com/trailer.m3u8"
                />
              </Form.Item>
            </Col>

            {/* Categories */}
            <Col span={24}>
              <Divider orientation="horizontal">Categories</Divider>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                label="Genres"
                name="genre"
                rules={[{ required: true, message: "Please select genres" }]}
              >
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Select genres"
                  options={[
                    { value: "Action", label: "Action" },
                    { value: "Comedy", label: "Comedy" },
                    { value: "Drama", label: "Drama" },
                    { value: "Horror", label: "Horror" },
                    { value: "Romance", label: "Romance" },
                    { value: "Thriller", label: "Thriller" },
                    { value: "Sci-Fi", label: "Sci-Fi" },
                    { value: "Fantasy", label: "Fantasy" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                label="Languages"
                name="language"
                rules={[{ required: true, message: "Please select languages" }]}
              >
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Select languages"
                  options={[
                    { value: "Hindi", label: "Hindi" },
                    { value: "English", label: "English" },
                    { value: "Chhattisgarhi", label: "Chhattisgarhi" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* Details */}
            <Col span={24}>
              <Divider orientation="horizontal">Details</Divider>
            </Col>

            <Col xs={24} lg={6}>
              <Form.Item
                label="Duration (minutes)"
                name="duration"
                rules={[{ required: true, message: "Please enter duration" }]}
              >
                <InputNumber
                  size="large"
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="120"
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={6}>
              <Form.Item
                label="Rating"
                name="rating"
                rules={[{ required: true, message: "Please enter rating" }]}
              >
                <InputNumber
                  size="large"
                  min={0}
                  max={5}
                  step={0.1}
                  style={{ width: "100%" }}
                  placeholder="4.5"
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={6}>
              <Form.Item label="Release Date" name="releaseDate">
                <DatePicker size="large" style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} lg={6}>
              <Form.Item
                label="Premium Content"
                name="isPremium"
                valuePropName="checked"
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>

            {/* Cast */}
            <Col span={24}>
              <Divider orientation="horizontal">Cast & Crew</Divider>
            </Col>

            <Col span={24}>
              <Form.List name="cast">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row gutter={16} key={key} align="middle">
                        <Col xs={24} sm={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "name"]}
                            rules={[{ required: true, message: "Enter name" }]}
                          >
                            <Input placeholder="Actor Name" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "role"]}
                            rules={[{ required: true, message: "Enter role" }]}
                          >
                            <Input placeholder="Character Role" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                          <Form.Item {...restField} name={[name, "imageUrl"]}>
                            <Input placeholder="Image URL" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={2}>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Cast Member
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Col>
          </Row>
        </Form>
      </Card>
    </motion.div>
  );
};

export default ContentForm;
