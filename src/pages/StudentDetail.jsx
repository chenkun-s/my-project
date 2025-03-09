import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Tabs, Table, Tag, Statistic, Row, Col, Space } from 'antd';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import DataService from '../services/DataService';
import { LeaveTypeColors } from '../models/LeaveRecord';

const { TabPane } = Tabs;

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const dataService = DataService.getInstance();
    const studentData = dataService.getStudentById(id);
    
    if (studentData) {
      setStudent(studentData);
      
      // 获取该学生的请假记录
      const records = dataService.getLeaveRecords().filter(
        record => record.student.id === id
      );
      setLeaveRecords(records);
    } else {
      navigate('/students');
    }
    
    setLoading(false);
    
    // 添加监听器，当数据变化时更新
    const unsubscribe = dataService.addListener(() => {
      const updatedStudent = dataService.getStudentById(id);
      if (updatedStudent) {
        setStudent(updatedStudent);
        
        const updatedRecords = dataService.getLeaveRecords().filter(
          record => record.student.id === id
        );
        setLeaveRecords(updatedRecords);
      }
    });
    
    // 组件卸载时移除监听器
    return () => unsubscribe();
  }, [id, navigate]);
  
  if (loading || !student) {
    return <div>加载中...</div>;
  }
  
  // 计算请假统计数据
  const totalLeaveDays = leaveRecords.reduce((total, record) => total + record.duration, 0);
  const sickLeaveCount = leaveRecords.filter(record => record.type === '病假').length;
  const personalLeaveCount = leaveRecords.filter(record => record.type === '事假').length;
  const otherLeaveCount = leaveRecords.filter(record => record.type === '其他').length;
  
  // 请假记录表格列定义
  const columns = [
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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: type => (
        <Tag color={LeaveTypeColors[type]} key={type}>
          {type}
        </Tag>
      )
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true
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
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/students')}
        >
          返回列表
        </Button>
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => navigate(`/students/edit/${id}`)}
        >
          编辑信息
        </Button>
      </Space>
      
      <Card title="学生详细信息">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="姓名">{student.name}</Descriptions.Item>
          <Descriptions.Item label="学号">{student.studentId}</Descriptions.Item>
          <Descriptions.Item label="班级">{student.className}</Descriptions.Item>
          <Descriptions.Item label="年级">{student.grade}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{student.phoneNumber || '无'}</Descriptions.Item>
          <Descriptions.Item label="家长姓名">{student.parentName || '无'}</Descriptions.Item>
          <Descriptions.Item label="家长电话">{student.parentPhone || '无'}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Tabs defaultActiveKey="1" style={{ marginTop: 16 }}>
        <TabPane tab="请假记录" key="1">
          <Card>
            <Table 
              columns={columns} 
              dataSource={leaveRecords} 
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: total => `共 ${total} 条记录`
              }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="请假统计" key="2">
          <Card>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="请假总次数" value={leaveRecords.length} />
              </Col>
              <Col span={6}>
                <Statistic title="请假总天数" value={totalLeaveDays} />
              </Col>
              <Col span={6}>
                <Statistic title="病假次数" value={sickLeaveCount} valueStyle={{ color: '#f5222d' }} />
              </Col>
              <Col span={6}>
                <Statistic title="事假次数" value={personalLeaveCount} valueStyle={{ color: '#1890ff' }} />
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StudentDetail;