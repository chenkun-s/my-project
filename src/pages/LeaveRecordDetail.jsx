import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Tag, Divider } from 'antd';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import DataService from '../services/DataService';
import { LeaveTypeColors } from '../models/LeaveRecord';

const LeaveRecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const dataService = DataService.getInstance();
    const leaveRecord = dataService.getLeaveRecordById(id);
    
    if (leaveRecord) {
      setRecord(leaveRecord);
    } else {
      navigate('/leave-records');
    }
    
    setLoading(false);
    
    // 添加监听器，当数据变化时更新
    const unsubscribe = dataService.addListener(() => {
      const updatedRecord = dataService.getLeaveRecordById(id);
      if (updatedRecord) {
        setRecord(updatedRecord);
      }
    });
    
    // 组件卸载时移除监听器
    return () => unsubscribe();
  }, [id, navigate]);
  
  if (loading || !record) {
    return <div>加载中...</div>;
  }
  
  // 格式化日期
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long'
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/leave-records')}
        >
          返回列表
        </Button>
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => navigate(`/leave-records/edit/${id}`)}
        >
          编辑记录
        </Button>
      </Space>
      
      <Card 
        title="请假记录详情"
        extra={
          <Tag color={LeaveTypeColors[record.type]} key={record.type}>
            {record.type}
          </Tag>
        }
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="学生姓名">
            <Link to={`/students/${record.student.id}`}>{record.student.name}</Link>
          </Descriptions.Item>
          <Descriptions.Item label="班级">{record.student.className}</Descriptions.Item>
          <Descriptions.Item label="年级">{record.student.grade}</Descriptions.Item>
          <Descriptions.Item label="请假类型">{record.type}</Descriptions.Item>
          <Descriptions.Item label="开始日期">{formatDate(record.startDate)}</Descriptions.Item>
          <Descriptions.Item label="结束日期">{formatDate(record.endDate)}</Descriptions.Item>
          <Descriptions.Item label="请假天数">{record.duration} 天</Descriptions.Item>
          <Descriptions.Item label="请假原因">{record.reason}</Descriptions.Item>
          {record.notes && (
            <Descriptions.Item label="备注">{record.notes}</Descriptions.Item>
          )}
          <Descriptions.Item label="审批状态">
            <Tag color={record.approved ? 'green' : 'orange'}>
              {record.approved ? '已批准' : '待审批'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => navigate('/leave-records')}>返回列表</Button>
          <Space>
            <Button type="primary" onClick={() => navigate(`/leave-records/edit/${id}`)}>
              编辑记录
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LeaveRecordDetail;