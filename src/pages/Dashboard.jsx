import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button } from 'antd';
import { UserOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import DataService from '../services/DataService';
import { LeaveTypeColors } from '../models/LeaveRecord';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [leaveCountByType, setLeaveCountByType] = useState({});
  const [leaveCountByClass, setLeaveCountByClass] = useState({});
  
  useEffect(() => {
    const dataService = DataService.getInstance();
    
    // 获取数据
    setStudents(dataService.getStudents());
    setLeaveRecords(dataService.getLeaveRecords());
    setLeaveCountByType(dataService.getLeaveCountByType());
    setLeaveCountByClass(dataService.getLeaveCountByClass());
    
    // 添加监听器，当数据变化时更新
    const unsubscribe = dataService.addListener(() => {
      setStudents(dataService.getStudents());
      setLeaveRecords(dataService.getLeaveRecords());
      setLeaveCountByType(dataService.getLeaveCountByType());
      setLeaveCountByClass(dataService.getLeaveCountByClass());
    });
    
    // 组件卸载时移除监听器
    return () => unsubscribe();
  }, []);
  
  // 最近请假记录表格列定义
  const columns = [
    {
      title: '学生姓名',
      dataIndex: 'student',
      key: 'student',
      render: student => <Link to={`/students/${student.id}`}>{student.name}</Link>
    },
    {
      title: '班级',
      dataIndex: 'student',
      key: 'class',
      render: student => student.className
    },
    {
      title: '请假类型',
      dataIndex: 'type',
      key: 'type',
      render: type => (
        <Tag color={LeaveTypeColors[type]} key={type}>
          {type}
        </Tag>
      )
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: date => new Date(date).toLocaleDateString()
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      render: date => new Date(date).toLocaleDateString()
    },
    {
      title: '天数',
      key: 'duration',
      render: record => record.duration
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Link to={`/leave-records/${record.id}`}>查看详情</Link>
      )
    },
  ];

  return (
    <div className="dashboard-container" style={{ padding: '24px' }}>
      <h2>系统概览</h2>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic 
              title="学生总数" 
              value={students.length} 
              prefix={<UserOutlined />} 
            />
            <div style={{ marginTop: '12px' }}>
              <Button type="link">
                <Link to="/students">查看学生列表</Link>
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="请假记录总数" 
              value={leaveRecords.length} 
              prefix={<FileTextOutlined />} 
            />
            <div style={{ marginTop: '12px' }}>
              <Button type="link">
                <Link to="/leave-records">查看请假记录</Link>
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="当前请假学生数" 
              value={leaveRecords.filter(record => {
                const now = new Date();
                return new Date(record.startDate) <= now && new Date(record.endDate) >= now;
              }).length} 
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      
      {/* 最近请假记录 */}
      <Card 
        title="最近请假记录" 
        extra={<Link to="/leave-records">查看全部</Link>}
        style={{ marginBottom: '24px' }}
      >
        <Table 
          columns={columns} 
          dataSource={leaveRecords.slice(0, 5)} 
          rowKey="id" 
          pagination={false}
        />
      </Card>
      
      {/* 班级请假统计 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="班级请假统计">
            {Object.entries(leaveCountByClass).map(([className, count]) => (
              <div key={className} style={{ marginBottom: '8px' }}>
                <span>{className}: </span>
                <span>{count}条请假记录</span>
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="请假类型统计">
            {Object.entries(leaveCountByType).map(([type, count]) => (
              <div key={type} style={{ marginBottom: '8px' }}>
                <Tag color={LeaveTypeColors[type]}>{type}</Tag>
                <span>: {count}条请假记录</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;