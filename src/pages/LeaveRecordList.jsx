import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Select, DatePicker, Popconfirm, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import DataService from '../services/DataService';
import { LeaveTypeColors, getAllLeaveTypes } from '../models/LeaveRecord';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const LeaveRecordList = () => {
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const dataService = DataService.getInstance();
    
    // 获取请假记录和学生数据
    setLeaveRecords(dataService.getLeaveRecords());
    setStudents(dataService.getStudents());
    
    // 添加监听器，当数据变化时更新
    const unsubscribe = dataService.addListener(() => {
      setLeaveRecords(dataService.getLeaveRecords());
      setStudents(dataService.getStudents());
    });
    
    // 组件卸载时移除监听器
    return () => unsubscribe();
  }, []);

  // 获取所有班级
  const classes = [...new Set(students.map(student => student.className))].sort();

  // 筛选请假记录
  const filteredRecords = leaveRecords.filter(record => {
    // 按班级筛选
    const matchesClass = !selectedClass || record.student.className === selectedClass;
    
    // 按请假类型筛选
    const matchesType = !selectedType || record.type === selectedType;
    
    // 按日期范围筛选
    const matchesDateRange = !dateRange || (
      dayjs(record.startDate).isBefore(dateRange[1]) && 
      dayjs(record.endDate).isAfter(dateRange[0])
    );
    
    // 按搜索文本筛选（学生姓名或原因）
    const matchesSearch = !searchText || 
      record.student.name.toLowerCase().includes(searchText.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesClass && matchesType && matchesDateRange && matchesSearch;
  });

  // 删除请假记录
  const handleDelete = (recordId) => {
    const dataService = DataService.getInstance();
    dataService.deleteLeaveRecord(recordId);
  };

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
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/leave-records/${record.id}`}>查看</Link>
          <Link to={`/leave-records/edit/${record.id}`}>编辑</Link>
          <Popconfirm
            title="确定要删除这条请假记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="请假记录管理"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/leave-records/add')}
          >
            添加请假记录
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            style={{ width: 120 }}
            placeholder="选择班级"
            allowClear
            value={selectedClass}
            onChange={value => setSelectedClass(value)}
          >
            {classes.map(className => (
              <Option key={className} value={className}>{className}</Option>
            ))}
          </Select>
          
          <Select
            style={{ width: 120 }}
            placeholder="请假类型"
            allowClear
            value={selectedType}
            onChange={value => setSelectedType(value)}
          >
            {getAllLeaveTypes().map(type => (
              <Option key={type.value} value={type.value}>{type.label}</Option>
            ))}
          </Select>
          
          <RangePicker 
            onChange={(dates) => setDateRange(dates)}
            style={{ width: 240 }}
          />
          
          <Input
            placeholder="搜索学生姓名或请假原因"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 220 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条记录`
          }}
        />
      </Card>
    </div>
  );
};

export default LeaveRecordList;