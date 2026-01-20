import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  message,
  Spin,
  Tag,
  Upload,
  Image,
} from "antd";
import type { UploadProps } from "antd";
import {
  CloseOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  RightOutlined,
  LeftOutlined,
  InboxOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../config/firebase";
import type { Movie, FirestoreGenre } from "../../types";

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const MovieForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [genres, setGenres] = useState<FirestoreGenre[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Image previews
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [posterPreview, setPosterPreview] = useState<string>("");
  const [_backdropPreview, setBackdropPreview] = useState<string>("");
  const [_bannerPreview, setBannerPreview] = useState<string>("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      fetchMovie(id);
    }
  }, [id, isEdit]);

  const fetchInitialData = async () => {
    setPageLoading(true);
    try {
      const genresSnapshot = await getDocs(collection(db, "genres"));
      const genresData = genresSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreGenre[];
      setGenres(genresData);

      try {
        const languagesSnapshot = await getDocs(collection(db, "languages"));
        const languagesData = languagesSnapshot.docs.map(
          (doc) => doc.data().language || doc.data().name,
        );
        setLanguages(languagesData);
      } catch {
        setLanguages([
          "Hindi",
          "English",
          "Tamil",
          "Telugu",
          "Malayalam",
          "Kannada",
          "Bengali",
          "Marathi",
          "Gujarati",
          "Punjabi",
          "Bhojpuri",
          "Chhattisgarhi",
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load form data");
    } finally {
      setPageLoading(false);
    }
  };

  const fetchMovie = async (movieId: string) => {
    try {
      const docRef = doc(db, "movies", movieId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        form.setFieldsValue(data);

        if (data.thumbnail) setThumbnailPreview(data.thumbnail);
        if (data.posterUrl) setPosterPreview(data.posterUrl);
        if (data.backdropUrl) setBackdropPreview(data.backdropUrl);
        if (data.banner) setBannerPreview(data.banner);

        message.success("✅ Movie loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching movie:", error);
      message.error("❌ Failed to load movie");
    }
  };

  const handleImageUpload = async (
    file: File,
    type: "thumbnail" | "poster" | "backdrop" | "banner",
  ): Promise<string> => {
    try {
      const timestamp = Date.now();
      const fileName = `movies/${type}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      message.success(`✅ ${type} uploaded successfully!`);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error(`❌ Failed to upload ${type}`);
      throw error;
    }
  };

  const uploadProps = (
    type: "thumbnail" | "poster" | "backdrop" | "banner",
  ): UploadProps => ({
    name: "file",
    multiple: false,
    accept: "image/*",
    maxCount: 1,
    showUploadList: false,
    beforeUpload: async (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return Upload.LIST_IGNORE;
      }

      try {
        const url = await handleImageUpload(file, type);

        if (type === "thumbnail") {
          setThumbnailPreview(url);
          form.setFieldValue("thumbnail", url);
        } else if (type === "poster") {
          setPosterPreview(url);
          form.setFieldValue("posterUrl", url);
        } else if (type === "backdrop") {
          setBackdropPreview(url);
          form.setFieldValue("backdropUrl", url);
        } else if (type === "banner") {
          setBannerPreview(url);
          form.setFieldValue("banner", url);
        }
      } catch (error) {
        console.error("Upload error:", error);
      }

      return false;
    },
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const movieData: Partial<Movie> = {
        ...values,
        category: "movie",
        updatedAt: serverTimestamp(),
        ...(isEdit ? {} : { createdAt: serverTimestamp() }),
      };

      if (isEdit && id) {
        await setDoc(doc(db, "movies", id), movieData, { merge: true });
        message.success("✅ Movie updated successfully!");
      } else {
        await addDoc(collection(db, "movies"), movieData);
        message.success("✅ Movie created successfully!");
      }

      navigate("/admin/movies");
    } catch (error) {
      console.error("Error saving movie:", error);
      message.error("❌ Failed to save movie");
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentStep = async () => {
    const fieldsToValidate: { [key: number]: string[] } = {
      0: ["title", "duration", "year", "language", "ageRating"],
      1: ["thumbnail", "videoUrl"],
      2: ["genre", "director"],
      3: [],
      4: [],
    };

    try {
      const fields = fieldsToValidate[currentStep];
      if (fields && fields.length > 0) {
        await form.validateFields(fields);
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();

    if (!isValid) {
      message.error(
        "❌ Please fill all required fields correctly before proceeding",
      );
      return;
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    setCurrentStep(currentStep + 1);
    message.success("✅ Step completed! Moving to next step");
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const goToStep = async (stepIndex: number) => {
    if (stepIndex > currentStep) {
      // Can't jump ahead without completing current step
      const isValid = await validateCurrentStep();
      if (!isValid) {
        message.warning("⚠️ Please complete current step first");
        return;
      }
    }
    setCurrentStep(stepIndex);
  };

  const steps = [
    {
      title: "Basic Info",
      icon: <InfoCircleOutlined />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Media & URLs",
      icon: <FileImageOutlined />,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Genres & Cast",
      icon: <TeamOutlined />,
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Production",
      icon: <TrophyOutlined />,
      color: "from-orange-500 to-amber-500",
    },
    {
      title: "Settings",
      icon: <SettingOutlined />,
      color: "from-green-500 to-emerald-500",
    },
  ];

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Spin size="large" />
          <p className="mt-4 text-lg font-semibold text-slate-700">
            Loading form data...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-12">
      <style>{`
        /* Force light background for all inputs */
        .ant-input,
        .ant-input-number-input,
        .ant-select-selector,
        .ant-picker,
        textarea.ant-input,
        .ant-input-affix-wrapper {
          background-color: #ffffff !important;
          color: #1e293b !important;
          border-color: #e2e8f0 !important;
        }
        
        .ant-input::placeholder,
        .ant-input-number-input::placeholder,
        textarea.ant-input::placeholder {
          color: #94a3b8 !important;
        }

        .ant-select-selection-placeholder {
          color: #94a3b8 !important;
        }

        .ant-input:hover,
        .ant-input-number:hover .ant-input-number-input,
        .ant-select:not(.ant-select-disabled):hover .ant-select-selector,
        .ant-input-affix-wrapper:hover {
          border-color: #3b82f6 !important;
        }

        .ant-input:focus,
        .ant-input-focused,
        .ant-input-number-focused .ant-input-number-input,
        .ant-select-focused .ant-select-selector,
        .ant-input-affix-wrapper-focused {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }

        .ant-upload.ant-upload-drag {
          background-color: #ffffff !important;
          border: 2px dashed #cbd5e1 !important;
        }

        .ant-upload.ant-upload-drag:hover {
          border-color: #3b82f6 !important;
        }

        .ant-upload.ant-upload-drag .ant-upload-drag-container {
          color: #475569 !important;
        }

        /* Switch colors */
        .ant-switch-checked {
          background-color: #10b981 !important;
        }

        /* Form labels */
        .ant-form-item-label > label {
          color: #1e293b !important;
        }

        /* Select dropdown */
        .ant-select-dropdown {
          background-color: #ffffff !important;
        }

        .ant-select-item {
          color: #1e293b !important;
        }

        .ant-select-item-option-selected {
          background-color: #eff6ff !important;
        }

        /* Input number controls */
        .ant-input-number-handler-wrap {
          background-color: #f8fafc !important;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 pb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {isEdit ? "✏️ Edit Movie" : "🎬 Add New Movie"}
              </h1>
              <p className="text-slate-600 text-base sm:text-lg">
                Complete each step to create your movie
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/movies")}
              className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-slate-200"
            >
              <CloseOutlined className="text-xl text-slate-600" />
            </motion.button>
          </div>
        </motion.div>

        {/* Steps Progress Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {steps.map((step, index) => {
              const isCompleted =
                completedSteps.includes(index) || index < currentStep;
              const isCurrent = currentStep === index;
              const isDisabled =
                index > currentStep && !completedSteps.includes(currentStep);

              return (
                <motion.div
                  key={index}
                  whileHover={!isDisabled ? { scale: 1.05, y: -5 } : {}}
                  className={`relative ${!isDisabled ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                  onClick={() => !isDisabled && goToStep(index)}
                >
                  <div
                    className={`
                    p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all
                    ${
                      isCurrent
                        ? `bg-gradient-to-br ${step.color} shadow-2xl transform scale-105`
                        : isCompleted
                          ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg"
                          : "bg-white border-2 border-slate-200 shadow-md"
                    }
                  `}
                  >
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                      <div
                        className={`text-xl sm:text-2xl ${isCurrent || isCompleted ? "text-white" : "text-slate-400"}`}
                      >
                        {isCompleted && !isCurrent ? (
                          <CheckCircleOutlined />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold text-center hidden sm:block ${
                          isCurrent || isCompleted
                            ? "text-white"
                            : "text-slate-600"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: "movie",
            year: new Date().getFullYear(),
            rating: 0,
            views: 0,
            likes: 0,
            isPremium: false,
            isFeatured: false,
            isTrending: false,
            isNewRelease: false,
            isActive: true,
            isPublished: false,
            isDownloadable: false,
            genre: [],
            cast: [],
            crew: [],
            awards: [],
          }}
        >
          <AnimatePresence mode="wait">
            {/* ==================== STEP 0: BASIC INFO ==================== */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-blue-100">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <InfoCircleOutlined className="text-white text-xl sm:text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                        Basic Information
                      </h2>
                      <p className="text-slate-500 text-sm sm:text-base">
                        Essential movie details
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <Form.Item
                      label={
                        <span className="text-sm sm:text-base font-bold text-slate-700">
                          🎬 Title (English) *
                        </span>
                      }
                      name="title"
                      rules={[
                        { required: true, message: "Title is required" },
                        {
                          min: 2,
                          message: "Title must be at least 2 characters",
                        },
                        {
                          max: 200,
                          message: "Title must be less than 200 characters",
                        },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="Enter movie title"
                        className="rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-sm sm:text-base font-bold text-slate-700">
                          📝 Title (Hindi)
                        </span>
                      }
                      name="titleHindi"
                    >
                      <Input
                        size="large"
                        placeholder="हिंदी शीर्षक"
                        className="rounded-xl"
                      />
                    </Form.Item>

                    <div className="md:col-span-2">
                      <Form.Item
                        label={
                          <span className="text-sm sm:text-base font-bold text-slate-700">
                            📖 Description (English)
                          </span>
                        }
                        name="description"
                      >
                        <TextArea
                          rows={4}
                          placeholder="Enter movie description"
                          className="rounded-xl"
                          showCount
                          maxLength={2000}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      label={
                        <span className="text-sm sm:text-base font-bold text-slate-700">
                          ⏱️ Duration *
                        </span>
                      }
                      name="duration"
                      rules={[
                        { required: true, message: "Duration is required" },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="e.g., 2h 30m"
                        className="rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-sm sm:text-base font-bold text-slate-700">
                          📅 Year *
                        </span>
                      }
                      name="year"
                      rules={[{ required: true, message: "Year is required" }]}
                    >
                      <InputNumber
                        size="large"
                        style={{ width: "100%" }}
                        min={1900}
                        max={2100}
                        className="rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-sm sm:text-base font-bold text-slate-700">
                          📆 Release Date
                        </span>
                      }
                      name="releaseDate"
                    >
                      <Input size="large" type="date" className="rounded-xl" />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-sm sm:text-base font-bold text-slate-700">
                          🌐 Language *
                        </span>
                      }
                      name="language"
                      rules={[
                        { required: true, message: "Language is required" },
                      ]}
                    >
                      <Select
                        size="large"
                        placeholder="Select language"
                        showSearch
                        className="w-full"
                      >
                        {languages.map((lang) => (
                          <Option key={lang} value={lang}>
                            {lang}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-sm sm:text-base font-bold text-slate-700">
                          🔞 Age Rating *
                        </span>
                      }
                      name="ageRating"
                      rules={[
                        { required: true, message: "Age rating is required" },
                      ]}
                    >
                      <Select
                        size="large"
                        placeholder="Select age rating"
                        className="w-full"
                      >
                        <Option value="U">U (Universal)</Option>
                        <Option value="U/A">U/A (Parental Guidance)</Option>
                        <Option value="A">A (Adults Only)</Option>
                        <Option value="18+">18+ (Restricted)</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-sm sm:text-base font-bold text-slate-700">
                          ⭐ Rating (0-10)
                        </span>
                      }
                      name="rating"
                    >
                      <InputNumber
                        size="large"
                        style={{ width: "100%" }}
                        min={0}
                        max={10}
                        step={0.1}
                        className="rounded-xl"
                      />
                    </Form.Item>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==================== STEP 1: MEDIA & URLs ==================== */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-purple-100">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileImageOutlined className="text-white text-xl sm:text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                        Media & URLs
                      </h2>
                      <p className="text-slate-500 text-sm sm:text-base">
                        Upload or add image/video URLs
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Thumbnail */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border-2 border-purple-200">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
                        🖼️ Thumbnail Image *
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Dragger
                            {...uploadProps("thumbnail")}
                            className="rounded-xl"
                          >
                            <p className="ant-upload-drag-icon">
                              <InboxOutlined
                                style={{ color: "#a855f7", fontSize: "48px" }}
                              />
                            </p>
                            <p className="ant-upload-text font-semibold text-slate-700">
                              Click or drag to upload
                            </p>
                            <p className="ant-upload-hint text-slate-500">
                              JPG, PNG, WebP (Max 5MB)
                            </p>
                          </Dragger>

                          <Form.Item
                            label={
                              <span className="font-semibold text-slate-700">
                                Or Paste URL
                              </span>
                            }
                            name="thumbnail"
                            rules={[
                              {
                                required: true,
                                message: "Thumbnail is required",
                              },
                              {
                                type: "url",
                                message: "Please enter a valid URL",
                              },
                            ]}
                            className="mt-4 mb-0"
                          >
                            <Input
                              size="large"
                              placeholder="https://example.com/image.jpg"
                              className="rounded-xl"
                              onChange={(e) =>
                                setThumbnailPreview(e.target.value)
                              }
                            />
                          </Form.Item>
                        </div>

                        {thumbnailPreview && (
                          <div className="flex items-center justify-center">
                            <div className="relative">
                              <Image
                                src={thumbnailPreview}
                                alt="Thumbnail"
                                className="rounded-2xl shadow-xl"
                                style={{
                                  maxHeight: "200px",
                                  objectFit: "cover",
                                }}
                                preview={{
                                  mask: (
                                    <div>
                                      <EyeOutlined /> Preview
                                    </div>
                                  ),
                                }}
                              />
                              <Tag
                                color="green"
                                className="absolute top-2 right-2"
                              >
                                ✓ Preview
                              </Tag>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Poster (Optional) */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 border-2 border-blue-200">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
                        🎨 Poster Image (Optional)
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Dragger
                            {...uploadProps("poster")}
                            className="rounded-xl"
                          >
                            <p className="ant-upload-drag-icon">
                              <InboxOutlined
                                style={{ color: "#3b82f6", fontSize: "48px" }}
                              />
                            </p>
                            <p className="ant-upload-text font-semibold text-slate-700">
                              Click or drag to upload
                            </p>
                            <p className="ant-upload-hint text-slate-500">
                              JPG, PNG, WebP (Max 5MB)
                            </p>
                          </Dragger>

                          <Form.Item
                            label={
                              <span className="font-semibold text-slate-700">
                                Or Paste URL
                              </span>
                            }
                            name="posterUrl"
                            rules={[
                              {
                                type: "url",
                                message: "Please enter a valid URL",
                              },
                            ]}
                            className="mt-4 mb-0"
                          >
                            <Input
                              size="large"
                              placeholder="https://example.com/poster.jpg"
                              className="rounded-xl"
                              onChange={(e) => setPosterPreview(e.target.value)}
                            />
                          </Form.Item>
                        </div>

                        {posterPreview && (
                          <div className="flex items-center justify-center">
                            <div className="relative">
                              <Image
                                src={posterPreview}
                                alt="Poster"
                                className="rounded-2xl shadow-xl"
                                style={{
                                  maxHeight: "200px",
                                  objectFit: "cover",
                                }}
                                preview={{
                                  mask: (
                                    <div>
                                      <EyeOutlined /> Preview
                                    </div>
                                  ),
                                }}
                              />
                              <Tag
                                color="blue"
                                className="absolute top-2 right-2"
                              >
                                ✓ Preview
                              </Tag>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Video URL */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-4 sm:p-6 border-2 border-red-200">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
                        🎥 Video URLs
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                          label={
                            <span className="font-bold text-slate-700">
                              Video URL *
                            </span>
                          }
                          name="videoUrl"
                          rules={[
                            {
                              required: true,
                              message: "Video URL is required",
                            },
                            {
                              type: "url",
                              message: "Please enter a valid URL",
                            },
                          ]}
                          className="mb-0"
                        >
                          <Input
                            size="large"
                            prefix={
                              <VideoCameraOutlined className="text-red-500" />
                            }
                            placeholder="https://example.com/video.mp4"
                            className="rounded-xl"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span className="font-bold text-slate-700">
                              Trailer URL (Optional)
                            </span>
                          }
                          name="trailerUrl"
                          rules={[
                            {
                              type: "url",
                              message: "Please enter a valid URL",
                            },
                          ]}
                          className="mb-0"
                        >
                          <Input
                            size="large"
                            prefix={
                              <VideoCameraOutlined className="text-red-500" />
                            }
                            placeholder="https://example.com/trailer.mp4"
                            className="rounded-xl"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==================== STEP 2: GENRES & CAST ==================== */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-pink-100">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <TeamOutlined className="text-white text-xl sm:text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                        Genres & Cast
                      </h2>
                      <p className="text-slate-500 text-sm sm:text-base">
                        Categories and team members
                      </p>
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 border-2 border-blue-200 mb-6">
                    <Form.Item
                      label={
                        <span className="text-lg font-black text-slate-800">
                          🎭 Select Genres *
                        </span>
                      }
                      name="genre"
                      rules={[
                        {
                          required: true,
                          message: "Please select at least one genre",
                        },
                        {
                          type: "array",
                          min: 1,
                          message: "Please select at least one genre",
                        },
                      ]}
                      className="mb-2"
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        placeholder="Select genres"
                        showSearch
                        className="w-full"
                      >
                        {genres.map((genre) => (
                          <Option key={genre.id} value={genre.name}>
                            {genre.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {genres.slice(0, 10).map((genre) => (
                        <Tag
                          key={genre.id}
                          color="blue"
                          className="px-3 py-1 rounded-full"
                        >
                          {genre.name}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  {/* Director */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Form.Item
                      label={
                        <span className="font-bold text-slate-700">
                          🎬 Director *
                        </span>
                      }
                      name="director"
                      rules={[
                        {
                          required: true,
                          message: "Director name is required",
                        },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="Director name"
                        className="rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-slate-700">
                          🎥 Producer
                        </span>
                      }
                      name="producer"
                    >
                      <Input
                        size="large"
                        placeholder="Producer name"
                        className="rounded-xl"
                      />
                    </Form.Item>
                  </div>

                  {/* Cast Members */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border-2 border-purple-200">
                    <h3 className="text-lg font-black text-slate-800 mb-4">
                      👥 Cast Members (Optional)
                    </h3>
                    <Form.List name="cast">
                      {(fields, { add, remove }) => (
                        <div className="space-y-3">
                          {fields.map(({ key, name, ...restField }) => (
                            <div
                              key={key}
                              className="bg-white rounded-xl p-3 border-2 border-purple-200"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Form.Item
                                  {...restField}
                                  name={[name, "name"]}
                                  noStyle
                                >
                                  <Input
                                    placeholder="Actor Name"
                                    className="rounded-lg"
                                  />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, "role"]}
                                  noStyle
                                >
                                  <Input
                                    placeholder="Role"
                                    className="rounded-lg"
                                  />
                                </Form.Item>
                                <Button
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => remove(name)}
                                  className="rounded-lg"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                            size="large"
                            className="rounded-xl"
                          >
                            Add Cast Member
                          </Button>
                        </div>
                      )}
                    </Form.List>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==================== STEP 3: PRODUCTION ==================== */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-orange-100">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrophyOutlined className="text-white text-xl sm:text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                        Production Info
                      </h2>
                      <p className="text-slate-500 text-sm sm:text-base">
                        Studio, budget, awards (All Optional)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Form.Item
                      label={
                        <span className="font-bold text-slate-700">
                          🏢 Studio
                        </span>
                      }
                      name="studio"
                    >
                      <Input
                        size="large"
                        placeholder="Production studio"
                        className="rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="font-bold text-slate-700">
                          💰 Budget
                        </span>
                      }
                      name="budget"
                    >
                      <Input
                        size="large"
                        placeholder="e.g., ₹50 Crores"
                        className="rounded-xl"
                      />
                    </Form.Item>

                    <div className="md:col-span-2">
                      <Form.Item
                        label={
                          <span className="font-bold text-slate-700">
                            📖 Plot Summary
                          </span>
                        }
                        name="plotSummary"
                      >
                        <TextArea
                          rows={4}
                          placeholder="Detailed plot summary"
                          className="rounded-xl"
                          showCount
                          maxLength={5000}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==================== STEP 4: SETTINGS ==================== */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-green-100">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <SettingOutlined className="text-white text-xl sm:text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                        Settings & Status
                      </h2>
                      <p className="text-slate-500 text-sm sm:text-base">
                        Configure visibility and features
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      {
                        label: "Premium",
                        name: "isPremium",
                        icon: "💎",
                        color: "from-orange-100 to-pink-100",
                      },
                      {
                        label: "Featured",
                        name: "isFeatured",
                        icon: "⭐",
                        color: "from-blue-100 to-cyan-100",
                      },
                      {
                        label: "Trending",
                        name: "isTrending",
                        icon: "🔥",
                        color: "from-purple-100 to-pink-100",
                      },
                      {
                        label: "Active",
                        name: "isActive",
                        icon: "✅",
                        color: "from-green-100 to-emerald-100",
                      },
                      {
                        label: "Published",
                        name: "isPublished",
                        icon: "📢",
                        color: "from-amber-100 to-orange-100",
                      },
                      {
                        label: "New Release",
                        name: "isNewRelease",
                        icon: "🆕",
                        color: "from-pink-100 to-rose-100",
                      },
                      {
                        label: "Downloadable",
                        name: "isDownloadable",
                        icon: "📥",
                        color: "from-indigo-100 to-purple-100",
                      },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-center border-2 border-slate-200`}
                      >
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <Form.Item
                          label={
                            <span className="font-bold text-slate-800 text-sm">
                              {item.label}
                            </span>
                          }
                          name={item.name}
                          valuePropName="checked"
                          className="mb-0"
                        >
                          <Switch />
                        </Form.Item>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border-2 border-slate-200">
                    <h3 className="text-lg font-black text-slate-800 mb-4">
                      📊 Statistics (Optional)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Form.Item
                        label={
                          <span className="font-bold text-slate-700">
                            👁️ Views
                          </span>
                        }
                        name="views"
                      >
                        <InputNumber
                          size="large"
                          style={{ width: "100%" }}
                          min={0}
                          className="rounded-xl"
                        />
                      </Form.Item>
                      <Form.Item
                        label={
                          <span className="font-bold text-slate-700">
                            👍 Likes
                          </span>
                        }
                        name="likes"
                      >
                        <InputNumber
                          size="large"
                          style={{ width: "100%" }}
                          min={0}
                          className="rounded-xl"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200"
          >
            <div className="flex justify-between items-center gap-4">
              <Button
                size="large"
                icon={<LeftOutlined />}
                onClick={prevStep}
                disabled={currentStep === 0}
                className="rounded-xl font-bold"
              >
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="primary"
                  size="large"
                  icon={<RightOutlined />}
                  onClick={nextStep}
                  className="rounded-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 border-none"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  icon={<CheckCircleOutlined />}
                  className="rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 border-none"
                >
                  {loading
                    ? "Saving..."
                    : isEdit
                      ? "Update Movie"
                      : "Create Movie"}
                </Button>
              )}
            </div>
          </motion.div>
        </Form>
      </div>
    </div>
  );
};

export default MovieForm;
