// src/pages/admin/content/ContentDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Image,
  Button,
  Space,
  Spin,
  Typography,
  Divider,
  Table,
  message,
  Collapse,
  Row,
  Col,
  Empty,
  Tabs,
  Statistic,
  Avatar,
  Badge,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EyeOutlined,
  TrophyOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  HeartOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import type {
  Movie,
  WebSeries,
  ShortFilm,
  Season,
  Episode,
} from "../../types/content";
import type { CastMember, CrewMember } from "../../types/common";
import type { ColumnsType } from "antd/es/table";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

type Content = Movie | WebSeries | ShortFilm;

const ContentDetail: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    if (id && type) {
      fetchContent();
    }
  }, [id, type]);

  const getCollectionName = (): string => {
    // Map route type to collection name
    const collectionMap: Record<string, string> = {
      movies: "movies",
      movie: "movies",
      "web-series": "webseries",
      webseries: "webseries",
      series: "webseries",
      "short-films": "shortfilms",
      shortfilms: "shortfilms",
      "short-film": "shortfilms",
    };
    return collectionMap[type || ""] || "movies";
  };

  const fetchContent = async (): Promise<void> => {
    if (!id) return;

    try {
      setLoading(true);
      const collectionName = getCollectionName();
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setContent({ id: docSnap.id, ...docSnap.data() } as Content);
      } else {
        message.error("Content not found");
        navigate(`/admin/content/${type}`);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      message.error("Failed to fetch content details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!id || !content) return;

    try {
      const collectionName = getCollectionName();
      await deleteDoc(doc(db, collectionName, id));
      message.success(`${getContentTypeLabel()} deleted successfully`);
      navigate(`/admin/content/${type}`);
    } catch (error) {
      console.error("Error deleting content:", error);
      message.error("Failed to delete content");
    }
  };

  const getContentTypeLabel = (): string => {
    if (!content) return "Content";

    const labels: Record<string, string> = {
      movie: "Movie",
      movies: "Movie",
      series: "Web Series",
      webseries: "Web Series",
      "short-film": "Short Film",
      shortfilms: "Short Film",
    };
    return labels[content.category] || "Content";
  };

  const getContentTypeColor = (): string => {
    if (!content) return "default";

    const colors: Record<string, string> = {
      movie: "blue",
      movies: "blue",
      series: "purple",
      webseries: "purple",
      "short-film": "cyan",
      shortfilms: "cyan",
    };
    return colors[content.category] || "default";
  };

  const getStatusColor = (status?: string): string => {
    if (!status) return "default";

    const colors: Record<string, string> = {
      published: "success",
      ongoing: "processing",
      completed: "success",
      upcoming: "warning",
      draft: "warning",
      archived: "default",
    };
    return colors[status] || "default";
  };

  const getTotalEpisodes = (): number => {
    if (content?.category !== "series" && content?.category !== "webseries")
      return 0;
    const webSeries = content as WebSeries;
    return webSeries.totalEpisodes || 0;
  };

  const getTotalDuration = (): number => {
    if (content?.category !== "series" && content?.category !== "webseries")
      return 0;
    const webSeries = content as WebSeries;
    if (!webSeries.seasons) return 0;

    return webSeries.seasons.reduce((total, season) => {
      const seasonDuration =
        season.episodes?.reduce((episodeTotal, episode) => {
          const duration =
            typeof episode.duration === "string"
              ? parseInt(episode.duration) || 0
              : episode.duration || 0;
          return episodeTotal + duration;
        }, 0) || 0;
      return total + seasonDuration;
    }, 0);
  };

  const formatDuration = (duration?: string | number): string => {
    if (!duration) return "N/A";
    if (typeof duration === "string") return duration;
    return `${duration} min`;
  };

  const formatDate = (date?: string | Date): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Cast Table Columns
  const castColumns: ColumnsType<CastMember> = [
    {
      title: "#",
      dataIndex: "order",
      key: "order",
      width: 60,
      sorter: (a, b) => (a.order || 0) - (b.order || 0),
      render: (order: number) => (
        <Badge count={order} style={{ backgroundColor: "#52c41a" }} />
      ),
    },
    {
      title: "Actor",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string, record: CastMember) => (
        <Space>
          <Avatar size={40} icon={<TeamOutlined />} src={record.profileImage}>
            {name?.charAt(0)}
          </Avatar>
          <div>
            <Text strong className="block">
              {name}
            </Text>
            {record.nameHindi && (
              <Text type="secondary" className="text-xs">
                {record.nameHindi}
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Character",
      dataIndex: "characterName",
      key: "characterName",
      ellipsis: true,
      render: (characterName?: string, record?: CastMember) => (
        <div>
          <Text>{characterName || "N/A"}</Text>
          {record?.characterNameHindi && (
            <Text type="secondary" className="block text-xs">
              {record.characterNameHindi}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 150,
      render: (role: string) => (
        <Tag
          color={
            role?.includes("Actor") || role?.includes("Actress")
              ? "gold"
              : "blue"
          }
        >
          {role?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  // Crew Table Columns
  const crewColumns: ColumnsType<CrewMember> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: CrewMember) => (
        <Space>
          <Avatar size={40} icon={<TeamOutlined />} src={record.profileImage}>
            {name?.charAt(0)}
          </Avatar>
          <div>
            <Text strong className="block">
              {name}
            </Text>
            {record.nameHindi && (
              <Text type="secondary" className="text-xs">
                {record.nameHindi}
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color="purple">{role?.toUpperCase()}</Tag>,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department?: string) => department || "N/A",
    },
  ];

  // Episode Table Columns (for Web Series)
  const episodeColumns: ColumnsType<Episode> = [
    {
      title: "Ep",
      dataIndex: "episodeNumber",
      key: "episodeNumber",
      width: 60,
      sorter: (a, b) => a.episodeNumber - b.episodeNumber,
      render: (num: number) => (
        <Badge count={num} style={{ backgroundColor: "#1890ff" }} />
      ),
    },
    {
      title: "Thumbnail",
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 120,
      render: (url: string) =>
        url ? (
          <Image
            src={url}
            alt="Episode"
            width={100}
            height={56}
            className="rounded-lg object-cover"
            preview={true}
          />
        ) : (
          <div className="w-[100px] h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-gray-500">
            <VideoCameraOutlined className="text-2xl" />
          </div>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (title: string, record: Episode) => (
        <div>
          <Text strong className="block">
            {title}
          </Text>
          {record.titleHindi && (
            <Text type="secondary" className="text-xs">
              {record.titleHindi}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: (duration: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{duration}</Text>
        </Space>
      ),
    },
    {
      title: "Video",
      dataIndex: "videoUrl",
      key: "videoUrl",
      width: 100,
      render: (url: string) =>
        url ? (
          <Tag icon={<PlayCircleOutlined />} color="success">
            Available
          </Tag>
        ) : (
          <Tag icon={<WarningOutlined />} color="error">
            Missing
          </Tag>
        ),
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      width: 100,
      render: (views?: number) => (
        <Space>
          <EyeOutlined />
          <Text>{views?.toLocaleString() || 0}</Text>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spin size="large" tip="Loading content details..." />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Empty description="Content not found" />
      </div>
    );
  }

  const webSeries =
    content.category === "series" || content.category === "webseries"
      ? (content as WebSeries)
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Section */}
      <div
        className="relative bg-cover bg-center bg-no-repeat py-16"
        style={{
          backgroundImage:
            content.backdropUrl || content.banner
              ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9)), url(${content.backdropUrl || content.banner})`
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <Row gutter={[32, 32]} align="middle">
            {/* Poster */}
            <Col xs={24} md={8} lg={6}>
              <div className="relative rounded-xl overflow-hidden shadow-2xl transition-transform hover:-translate-y-2">
                {content.posterUrl ||
                content.thumbnailUrl ||
                content.thumbnail ? (
                  <Image
                    src={
                      content.posterUrl ||
                      content.thumbnailUrl ||
                      content.thumbnail
                    }
                    alt={content.title}
                    className="w-full rounded-xl aspect-[2/3] object-cover"
                    preview={true}
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <VideoCameraOutlined className="text-6xl text-white/60" />
                  </div>
                )}
              </div>
            </Col>

            {/* Content Info */}
            <Col xs={24} md={16} lg={18}>
              <div className="space-y-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  <Tag
                    color={getContentTypeColor()}
                    className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide border-0"
                  >
                    {getContentTypeLabel()}
                  </Tag>
                  {webSeries?.status && (
                    <Tag
                      color={getStatusColor(webSeries.status)}
                      className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide border-0"
                    >
                      {webSeries.status.toUpperCase()}
                    </Tag>
                  )}
                  {content.isPremium && (
                    <Tag
                      icon={<TrophyOutlined />}
                      color="gold"
                      className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide border-0"
                    >
                      PREMIUM
                    </Tag>
                  )}
                  {content.isFeatured && (
                    <Tag
                      color="magenta"
                      className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide border-0"
                    >
                      FEATURED
                    </Tag>
                  )}
                  {content.isTrending && (
                    <Tag
                      color="red"
                      className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide border-0"
                    >
                      TRENDING
                    </Tag>
                  )}
                  {content.isNewRelease && (
                    <Tag
                      color="green"
                      className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide border-0"
                    >
                      NEW
                    </Tag>
                  )}
                </div>

                {/* Title */}
                <div>
                  <Title level={1} className="!text-white !mb-2 !mt-0">
                    {content.title}
                  </Title>
                  {content.titleHindi && (
                    <Text className="text-white/70 text-lg block mb-2">
                      {content.titleHindi}
                    </Text>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-6 items-center">
                  {content.year && (
                    <Space className="text-white">
                      <CalendarOutlined className="text-lg" />
                      <Text strong className="text-white text-base">
                        {content.year}
                      </Text>
                    </Space>
                  )}

                  {content.category !== "series" &&
                    content.category !== "webseries" && (
                      <Space className="text-white">
                        <ClockCircleOutlined className="text-lg" />
                        <Text strong className="text-white text-base">
                          {formatDuration(
                            (content as Movie | ShortFilm).duration,
                          )}
                        </Text>
                      </Space>
                    )}

                  {webSeries && (
                    <>
                      <Space className="text-white">
                        <Text strong className="text-white text-base">
                          {webSeries.totalSeasons ||
                            webSeries.seasons?.length ||
                            0}{" "}
                          Seasons
                        </Text>
                      </Space>
                      <Space className="text-white">
                        <Text strong className="text-white text-base">
                          {getTotalEpisodes()} Episodes
                        </Text>
                      </Space>
                    </>
                  )}

                  {content.ageRating && (
                    <Tag
                      color="red"
                      className="px-3 py-1.5 text-sm font-bold border-0"
                    >
                      {content.ageRating}
                    </Tag>
                  )}

                  {content.maturityRating && (
                    <Tag
                      color="orange"
                      className="px-3 py-1.5 text-sm font-bold border-0"
                    >
                      {content.maturityRating}
                    </Tag>
                  )}

                  <Space className="text-white">
                    <EyeOutlined className="text-lg" />
                    <Text strong className="text-white text-base">
                      {content.views?.toLocaleString() || 0} views
                    </Text>
                  </Space>

                  {content.likes && (
                    <Space className="text-white">
                      <HeartOutlined className="text-lg text-red-400" />
                      <Text strong className="text-white text-base">
                        {content.likes.toLocaleString()}
                      </Text>
                    </Space>
                  )}
                </div>

                {/* Genres & Language */}
                <div className="flex flex-wrap gap-3 items-center">
                  {content.genre?.map((genre) => (
                    <Tag
                      key={genre}
                      color="blue"
                      className="px-3 py-1 text-sm border-0"
                    >
                      {genre}
                    </Tag>
                  ))}
                  {content.language && (
                    <>
                      <Divider
                        type="vertical"
                        className="border-white/30 h-5"
                      />
                      <Tag color="green" className="px-3 py-1 text-sm border-0">
                        {content.language}
                      </Tag>
                      {content.languageHindi && (
                        <Tag
                          color="green"
                          className="px-3 py-1 text-sm border-0"
                        >
                          {content.languageHindi}
                        </Tag>
                      )}
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Button
                    type="primary"
                    size="large"
                    icon={<EditOutlined />}
                    onClick={() =>
                      navigate(`/admin/content/${type}/edit/${id}`)
                    }
                    className="h-12"
                  >
                    Edit Content
                  </Button>
                  <Button
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(`/admin/content/${type}`)}
                    className="h-12 bg-white/10 text-white border-white/30 hover:bg-white/20"
                  >
                    Back to List
                  </Button>
                  <Popconfirm
                    title="Delete Content"
                    description="Are you sure you want to delete this content?"
                    onConfirm={handleDelete}
                    okText="Yes, Delete"
                    cancelText="Cancel"
                  >
                    <Button
                      danger
                      size="large"
                      icon={<DeleteOutlined />}
                      className="h-12"
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                  {(content as Movie | WebSeries).trailerUrl && (
                    <Button
                      size="large"
                      icon={<PlayCircleOutlined />}
                      href={(content as Movie | WebSeries).trailerUrl}
                      target="_blank"
                      className="h-12 bg-white/10 text-white border-white/30 hover:bg-white/20"
                    >
                      Watch Trailer
                    </Button>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Content Body */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="large"
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              {/* Overview Tab */}
              <Tabs.TabPane tab="Overview" key="overview">
                <div className="space-y-6">
                  {/* Description */}
                  {content.description && (
                    <div>
                      <Title level={4}>Description</Title>
                      <Paragraph className="text-base leading-relaxed text-gray-700">
                        {content.description}
                      </Paragraph>
                      {content.descriptionHindi && (
                        <Paragraph className="text-base leading-relaxed text-gray-600 mt-2">
                          {content.descriptionHindi}
                        </Paragraph>
                      )}
                    </div>
                  )}

                  {/* Plot Summary */}
                  {((content as Movie).plotSummary ||
                    (content as ShortFilm).plotSummary ||
                    (content as WebSeries).plotSummary) && (
                    <>
                      <Divider />
                      <div>
                        <Title level={4}>Plot Summary</Title>
                        <Paragraph className="text-base leading-relaxed text-gray-700">
                          {(content as Movie).plotSummary ||
                            (content as ShortFilm).plotSummary ||
                            (content as WebSeries).plotSummary}
                        </Paragraph>
                      </div>
                    </>
                  )}

                  {/* Production Details */}
                  <Divider />
                  <div>
                    <Title level={4}>Production Details</Title>
                    <Row gutter={[16, 16]}>
                      {(content as Movie | ShortFilm).director && (
                        <Col xs={24} sm={12}>
                          <Text type="secondary" className="block mb-1">
                            Director
                          </Text>
                          <Text strong className="text-base">
                            {(() => {
                              const director = (content as Movie | ShortFilm)
                                .director;
                              if (Array.isArray(director)) {
                                return director.join(", ");
                              }
                              return director as string;
                            })()}
                          </Text>
                        </Col>
                      )}
                      {(content as Movie).producer && (
                        <Col xs={24} sm={12}>
                          <Text type="secondary" className="block mb-1">
                            Producer
                          </Text>
                          <Text strong className="text-base">
                            {(content as Movie).producer}
                          </Text>
                        </Col>
                      )}
                      {(content as Movie).writer && (
                        <Col xs={24} sm={12}>
                          <Text type="secondary" className="block mb-1">
                            Writer
                          </Text>
                          <Text strong className="text-base">
                            {(content as Movie).writer}
                          </Text>
                        </Col>
                      )}
                      {(content as Movie).musicDirector && (
                        <Col xs={24} sm={12}>
                          <Text type="secondary" className="block mb-1">
                            Music Director
                          </Text>
                          <Text strong className="text-base">
                            {(content as Movie).musicDirector}
                          </Text>
                        </Col>
                      )}
                      {(content as Movie).studio && (
                        <Col xs={24} sm={12}>
                          <Text type="secondary" className="block mb-1">
                            Studio
                          </Text>
                          <Text strong className="text-base">
                            {(content as Movie).studio}
                          </Text>
                        </Col>
                      )}
                      {(content as Movie).budget && (
                        <Col xs={24} sm={12}>
                          <Text type="secondary" className="block mb-1">
                            Budget
                          </Text>
                          <Text strong className="text-base">
                            {(content as Movie).budget}
                          </Text>
                        </Col>
                      )}
                      {(content as Movie).boxOfficeCollection && (
                        <Col xs={24} sm={12}>
                          <Text type="secondary" className="block mb-1">
                            Box Office
                          </Text>
                          <Text strong className="text-base">
                            {(content as Movie).boxOfficeCollection}
                          </Text>
                        </Col>
                      )}
                      {(content as Movie).certification && (
                        <Col xs={24} sm={12}>
                          <Text type="secondary" className="block mb-1">
                            Certification
                          </Text>
                          <Text strong className="text-base">
                            {(content as Movie).certification}
                          </Text>
                        </Col>
                      )}
                    </Row>
                  </div>

                  {/* Awards */}
                  {(content as Movie).awards &&
                    (content as Movie).awards!.length > 0 && (
                      <>
                        <Divider />
                        <div>
                          <Title level={4}>Awards & Recognition</Title>
                          <div className="flex flex-wrap gap-2">
                            {(content as Movie).awards!.map((award, index) => (
                              <Tag
                                key={index}
                                icon={<TrophyOutlined />}
                                color={award.won ? "gold" : "blue"}
                                className="px-3 py-1.5 text-sm"
                              >
                                {award.name} - {award.category} ({award.year})
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                  {/* Festival Screenings */}
                  {(content as ShortFilm).festivalScreenings &&
                    (content as ShortFilm).festivalScreenings!.length > 0 && (
                      <>
                        <Divider />
                        <div>
                          <Title level={4}>Festival Screenings</Title>
                          <div className="space-y-2">
                            {(content as ShortFilm).festivalScreenings!.map(
                              (festival, index) => (
                                <Card
                                  key={index}
                                  size="small"
                                  className="bg-gray-50"
                                >
                                  <Text strong className="block">
                                    {festival.festivalName}
                                  </Text>
                                  <Text type="secondary" className="text-sm">
                                    {festival.location} - {festival.date}
                                  </Text>
                                  {festival.award && (
                                    <Tag color="gold" className="mt-2">
                                      <TrophyOutlined /> {festival.award}
                                    </Tag>
                                  )}
                                </Card>
                              ),
                            )}
                          </div>
                        </div>
                      </>
                    )}

                  {/* Media Section */}
                  {((content as Movie | ShortFilm).videoUrl ||
                    (content as Movie | WebSeries).trailerUrl) && (
                    <>
                      <Divider />
                      <div>
                        <Title level={4}>Media</Title>
                        <div className="space-y-4">
                          {(content as Movie | ShortFilm).videoUrl &&
                            (content.category === "movie" ||
                              content.category === "movies" ||
                              content.category === "short-film" ||
                              content.category === "shortfilms") && (
                              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <Text strong className="block mb-2">
                                  Main Video
                                </Text>
                                <div className="flex items-center gap-3">
                                  <Text
                                    copyable={{
                                      text: (content as Movie).videoUrl,
                                    }}
                                    ellipsis
                                    className="text-sm text-gray-600 flex-1"
                                  >
                                    {(content as Movie).videoUrl}
                                  </Text>
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<PlayCircleOutlined />}
                                    href={(content as Movie).videoUrl}
                                    target="_blank"
                                  >
                                    Play
                                  </Button>
                                </div>
                              </div>
                            )}

                          {(content as Movie | WebSeries).trailerUrl && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <Text strong className="block mb-2">
                                Trailer
                              </Text>
                              <div className="flex items-center gap-3">
                                <Text
                                  copyable={{
                                    text: (content as Movie | WebSeries)
                                      .trailerUrl,
                                  }}
                                  ellipsis
                                  className="text-sm text-gray-600 flex-1"
                                >
                                  {(content as Movie | WebSeries).trailerUrl}
                                </Text>
                                <Button
                                  type="link"
                                  size="small"
                                  icon={<PlayCircleOutlined />}
                                  href={
                                    (content as Movie | WebSeries).trailerUrl
                                  }
                                  target="_blank"
                                >
                                  Watch
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Tabs.TabPane>

              {/* Cast Tab */}
              {content.cast && content.cast.length > 0 && (
                <Tabs.TabPane tab={`Cast (${content.cast.length})`} key="cast">
                  <Table
                    dataSource={content.cast}
                    columns={castColumns}
                    pagination={{ pageSize: 10 }}
                    rowKey={(index) => `cast-${index}`}
                    className="rounded-lg overflow-hidden"
                  />
                </Tabs.TabPane>
              )}

              {/* Crew Tab */}
              {content.crew && content.crew.length > 0 && (
                <Tabs.TabPane tab={`Crew (${content.crew.length})`} key="crew">
                  <Table
                    dataSource={content.crew}
                    columns={crewColumns}
                    pagination={{ pageSize: 10 }}
                    rowKey={(index) => `crew-${index}`}
                    className="rounded-lg overflow-hidden"
                  />
                </Tabs.TabPane>
              )}

              {/* Seasons & Episodes Tab (Web Series Only) */}
              {webSeries &&
                webSeries.seasons &&
                webSeries.seasons.length > 0 && (
                  <Tabs.TabPane
                    tab={`Seasons (${webSeries.seasons.length})`}
                    key="seasons"
                  >
                    <Collapse
                      accordion
                      defaultActiveKey={["0"]}
                      className="bg-white"
                    >
                      {webSeries.seasons.map(
                        (season: Season, index: number) => (
                          <Panel
                            header={
                              <div className="flex items-center gap-4 flex-wrap">
                                <Text strong className="text-base">
                                  {season.title}
                                </Text>
                                {season.titleHindi && (
                                  <Text type="secondary" className="text-sm">
                                    ({season.titleHindi})
                                  </Text>
                                )}
                                <Tag color="blue">
                                  {season.totalEpisodes ||
                                    season.episodes?.length ||
                                    0}{" "}
                                  Episodes
                                </Tag>
                                {season.year && (
                                  <Text type="secondary">({season.year})</Text>
                                )}
                              </div>
                            }
                            key={index}
                            extra={
                              season.posterUrl && (
                                <Image
                                  src={season.posterUrl}
                                  alt={season.title}
                                  width={40}
                                  height={60}
                                  className="object-cover rounded"
                                  preview={false}
                                />
                              )
                            }
                          >
                            {season.description && (
                              <Paragraph className="mb-4 text-gray-600">
                                {season.description}
                              </Paragraph>
                            )}

                            {season.episodes && season.episodes.length > 0 ? (
                              <Table
                                dataSource={season.episodes}
                                columns={episodeColumns}
                                pagination={false}
                                rowKey={(record) =>
                                  `episode-${season.seasonNumber}-${record.episodeNumber}`
                                }
                                size="small"
                                className="rounded-lg overflow-hidden"
                                expandable={{
                                  expandedRowRender: (record: Episode) => (
                                    <div className="p-3 bg-gray-50 rounded">
                                      {record.description && (
                                        <Paragraph className="mb-3">
                                          {record.description}
                                        </Paragraph>
                                      )}
                                      {record.descriptionHindi && (
                                        <Paragraph className="mb-3 text-gray-600">
                                          {record.descriptionHindi}
                                        </Paragraph>
                                      )}
                                      <div className="space-y-2">
                                        {record.releaseDate && (
                                          <Text
                                            type="secondary"
                                            className="block"
                                          >
                                            <CalendarOutlined /> Release Date:{" "}
                                            {formatDate(record.releaseDate)}
                                          </Text>
                                        )}
                                        {record.director && (
                                          <Text
                                            type="secondary"
                                            className="block"
                                          >
                                            Director: {record.director}
                                          </Text>
                                        )}
                                        {record.writer && (
                                          <Text
                                            type="secondary"
                                            className="block"
                                          >
                                            Writer: {record.writer}
                                          </Text>
                                        )}
                                        {record.videoUrl && (
                                          <div className="flex items-center gap-2">
                                            <Text type="secondary">
                                              Video URL:
                                            </Text>
                                            <Text
                                              copyable={{
                                                text: record.videoUrl,
                                              }}
                                              ellipsis
                                              className="text-xs flex-1"
                                            >
                                              {record.videoUrl}
                                            </Text>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ),
                                  rowExpandable: (record: Episode) =>
                                    !!record.description || !!record.videoUrl,
                                }}
                              />
                            ) : (
                              <Empty description="No episodes added yet" />
                            )}
                          </Panel>
                        ),
                      )}
                    </Collapse>
                  </Tabs.TabPane>
                )}
            </Tabs>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Statistics Card */}
            <Card className="mb-6 rounded-xl shadow-sm">
              <Title level={4} className="mb-4">
                Statistics
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Total Views"
                    value={content.views || 0}
                    prefix={<EyeOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Likes"
                    value={content.likes || 0}
                    prefix={<HeartOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Col>
                {webSeries && (
                  <>
                    <Col span={12}>
                      <Statistic
                        title="Total Seasons"
                        value={
                          webSeries.totalSeasons ||
                          webSeries.seasons?.length ||
                          0
                        }
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Total Episodes"
                        value={getTotalEpisodes()}
                        valueStyle={{ color: "#722ed1" }}
                      />
                    </Col>
                    {getTotalDuration() > 0 && (
                      <Col span={12}>
                        <Statistic
                          title="Total Duration"
                          value={Math.round(getTotalDuration() / 60)}
                          suffix="hrs"
                          valueStyle={{ color: "#13c2c2" }}
                        />
                      </Col>
                    )}
                  </>
                )}
              </Row>
            </Card>

            {/* Metadata Card */}
            <Card
              className="mb-6 rounded-xl shadow-sm"
              title={<Title level={4}>Metadata</Title>}
            >
              <div className="space-y-4">
                <div>
                  <Text type="secondary" className="block mb-1">
                    Content ID
                  </Text>
                  <Text copyable className="text-sm break-all">
                    {content.id}
                  </Text>
                </div>

                {content.slug && (
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Slug
                    </Text>
                    <Text copyable className="text-sm">
                      {content.slug}
                    </Text>
                  </div>
                )}

                {((content as Movie).releaseDate ||
                  (content as ShortFilm).releaseDate) && (
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Release Date
                    </Text>
                    <Text strong>
                      {formatDate(
                        (content as Movie).releaseDate ||
                          (content as ShortFilm).releaseDate,
                      )}
                    </Text>
                  </div>
                )}

                {webSeries?.lastAirDate && (
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Last Air Date
                    </Text>
                    <Text strong>{formatDate(webSeries.lastAirDate)}</Text>
                  </div>
                )}

                {webSeries?.nextEpisodeDate && (
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Next Episode Date
                    </Text>
                    <Text strong>{formatDate(webSeries.nextEpisodeDate)}</Text>
                  </div>
                )}

                {content.createdAt && (
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Created At
                    </Text>
                    <Text>
                      {typeof content.createdAt === "object" &&
                      "toDate" in content.createdAt
                        ? content.createdAt.toDate().toLocaleString("en-IN")
                        : new Date(content.createdAt).toLocaleString("en-IN")}
                    </Text>
                  </div>
                )}

                {content.updatedAt && (
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Last Updated
                    </Text>
                    <Text>
                      {typeof content.updatedAt === "object" &&
                      "toDate" in content.updatedAt
                        ? content.updatedAt.toDate().toLocaleString("en-IN")
                        : new Date(content.updatedAt).toLocaleString("en-IN")}
                    </Text>
                  </div>
                )}
              </div>
            </Card>

            {/* Channel Info Card */}
            {content.channelId && (
              <Card
                className="mb-6 rounded-xl shadow-sm"
                title={<Title level={4}>Channel Info</Title>}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size={48}
                      src={content.channelAvatar}
                      icon={<TeamOutlined />}
                    >
                      {content.channelName?.charAt(0)}
                    </Avatar>
                    <div>
                      <Text strong className="block">
                        {content.channelName}
                      </Text>
                      {content.channelVerified && (
                        <Tag color="blue" className="text-xs">
                          Verified
                        </Tag>
                      )}
                    </div>
                  </div>
                  {content.channelSubscribers && (
                    <div>
                      <Text type="secondary" className="block mb-1">
                        Subscribers
                      </Text>
                      <Text strong>{content.channelSubscribers}</Text>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Actions Card */}
            <Card
              className="rounded-xl shadow-sm"
              title={<Title level={4}>Quick Actions</Title>}
            >
              <div className="space-y-3">
                <Button
                  block
                  size="large"
                  icon={<ShareAltOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    message.success("Link copied to clipboard");
                  }}
                  className="h-11"
                >
                  Share Content
                </Button>
                <Button
                  block
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={() => message.info("Download feature coming soon")}
                  className="h-11"
                >
                  Download Report
                </Button>
                {(content.posterUrl || content.thumbnailUrl) && (
                  <Button
                    block
                    size="large"
                    icon={<DownloadOutlined />}
                    href={content.posterUrl || content.thumbnailUrl}
                    target="_blank"
                    className="h-11"
                  >
                    Download Poster
                  </Button>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ContentDetail;
