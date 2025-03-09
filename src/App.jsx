import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import './App.css';

// 导入页面组件
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentForm from './pages/StudentForm';
import StudentDetail from './pages/StudentDetail';
import LeaveRecordList from './pages/LeaveRecordList';
import LeaveRecordForm from './pages/LeaveRecordForm';
import LeaveRecordDetail from './pages/LeaveRecordDetail';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
// 不再需要登录页面
// import Login from './pages/Login';

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // 用户菜单
  const userMenu = (
    <Menu items={[
      {
        key: '1',
        label: '设置',
        onClick: () => window.location.href = '/settings'
      }
    ]} />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          selectedKeys={[location.pathname]}
          items={[
            {
              key: '/',
              icon: <UserOutlined />,
              label: <Link to="/">首页</Link>,
            },
            {
              key: '/students',
              icon: <UserOutlined />,
              label: <Link to="/students">学生管理</Link>,
            },
            {
              key: '/leave-records',
              icon: <UserOutlined />,
              label: <Link to="/leave-records">请假记录</Link>,
            },
            {
              key: '/statistics',
              icon: <UserOutlined />,
              label: <Link to="/statistics">统计分析</Link>,
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-header" style={{ padding: 0 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div className="header-right">
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span className="username">教师</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content className="site-layout-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/add" element={<StudentForm />} />
            <Route path="/students/edit/:id" element={<StudentForm />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route path="/leave-records" element={<LeaveRecordList />} />
            <Route path="/leave-records/add" element={<LeaveRecordForm />} />
            <Route path="/leave-records/edit/:id" element={<LeaveRecordForm />} />
            <Route path="/leave-records/:id" element={<LeaveRecordDetail />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;