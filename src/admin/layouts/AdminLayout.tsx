import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Button,
  Space,
  Typography,
  type MenuProps,
} from "antd";
import {
  DashboardOutlined,
  VideoCameraOutlined,
  UserOutlined,
  CreditCardOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SearchOutlined,
  TagOutlined,
  TeamOutlined,
  BarChartOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import "./AdminLayout.css";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/content",
      icon: <VideoCameraOutlined />,
      label: "Content",
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: "Users",
    },
    {
      key: "/admin/subscriptions",
      icon: <CreditCardOutlined />,
      label: "Subscriptions",
    },
    {
      key: "/admin/payments",
      icon: <DollarOutlined />,
      label: "Payments",
    },
    {
      key: "/admin/genres",
      icon: <TagOutlined />,
      label: "Genres",
    },
    {
      key: "/admin/cast-crew",
      icon: <TeamOutlined />,
      label: "Cast & Crew",
    },
    {
      key: "/admin/analytics",
      icon: <BarChartOutlined />,
      label: "Analytics",
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="admin-layout">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        className="admin-sider"
        width={260}
        collapsedWidth={isMobile ? 0 : 80}
      >
        {/* Logo */}
        <motion.div
          className="logo-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="logo-icon">🎬</span>
            {!collapsed && (
              <motion.span
                className="logo-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                CG Cinema
              </motion.span>
            )}
          </motion.div>
        </motion.div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="admin-menu"
        />

        {/* Collapse Button */}
        {!isMobile && (
          <motion.div
            className="collapse-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger-button"
            />
          </motion.div>
        )}
      </Sider>

      {/* Main Layout */}
      <Layout className="site-layout">
        {/* Header */}
        <Header className="admin-header">
          <div className="header-left">
            {isMobile && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="mobile-trigger"
              />
            )}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Text className="page-title">
                {menuItems.find((item) => item.key === location.pathname)
                  ?.label || "Admin Panel"}
              </Text>
            </motion.div>
          </div>

          <div className="header-right">
            <Space size="middle">
              {/* Search */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="text"
                  icon={<SearchOutlined />}
                  className="header-icon-button"
                />
              </motion.div>

              {/* Notifications */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge count={5} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    className="header-icon-button"
                  />
                </Badge>
              </motion.div>

              {/* Language */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="text"
                  icon={<GlobalOutlined />}
                  className="header-icon-button"
                />
              </motion.div>

              {/* User Menu */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <motion.div
                  className="user-profile"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar
                    src={auth.currentUser?.photoURL}
                    icon={<UserOutlined />}
                    className="user-avatar"
                  />
                  {!isMobile && (
                    <div className="user-info">
                      <Text className="user-name">
                        {auth.currentUser?.displayName || "Admin"}
                      </Text>
                      <Text className="user-role">Super Admin</Text>
                    </div>
                  )}
                </motion.div>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* Content */}
        <Content className="admin-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="content-wrapper"
          >
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
