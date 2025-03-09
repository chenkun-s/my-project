import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { Tabs, Tag, Select, DatePicker } from 'antd';
import DataService from '../services/DataService';
import { LeaveTypeColors } from '../models/LeaveRecord';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Statistics = () => {
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  
  useEffect(() => {
    const dataService = DataService.getInstance();
    
    // 获取数据
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
  
  // 获取所有年级
  const grades = [...new Set(students.map(student => student.grade))].sort();
  
  // 筛选请假记录
  const filteredRecords = leaveRecords.filter(record => {
    // 按年级筛选
    const matchesGrade = !selectedGrade || record.student.grade === selectedGrade;
    
    // 按日期范围筛选
    const matchesDateRange = !dateRange || (
      dayjs(record.startDate).isBefore(dateRange[1]) && 
      dayjs(record.endDate).isAfter(dateRange[0])
    );
    
    return matchesGrade && matchesDateRange;
  });
  
  // 按请假类型统计
  const leaveTypeData = [];
  const typeCount = {};
  
  filteredRecords.forEach(record => {
    if (typeCount[record.type]) {
      typeCount[record.type]++;
    } else {
      typeCount[record.type] = 1;
    }
  });
  
  Object.keys(typeCount).forEach(type => {
    leaveTypeData.push({
      type: type,
      value: typeCount[type]
    });
  });
  
  // 按班级统计
  const leaveClassData = [];
  const classCount = {};
  
  filteredRecords.forEach(record => {
    const className = record.student.className;
    if (classCount[className]) {
      classCount[className]++;
    } else {
      classCount[className] = 1;
    }
  });
  
  Object.keys(classCount).forEach(className => {
    leaveClassData.push({
      className: className,
      count: classCount[className]
    });
  });
  
  // 按月份统计
  const leaveMonthData = [];
  const monthCount = {};
  
  filteredRecords.forEach(record => {
    const month = dayjs(record.startDate).format('YYYY-MM');
    if (monthCount[month]) {
      monthCount[month]++;
    } else {
      monthCount[month] = 1;
    }
  });
  
  Object.keys(monthCount).sort().forEach(month => {
    leaveMonthData.push({
      month: month,
      count: monthCount[month]
    });
  });
  
  // 请假类型表格列定义
  const typeColumns = [
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
      title: '请假次数',
      dataIndex: 'value',
      key: 'value'
    },
    {
      title: '占比',
      key: 'percentage',
      render: (_, record) => {
        const total = leaveTypeData.reduce((sum, item) => sum + item.value, 0);
        const percentage = total > 0 ? Math.round((record.value / total) * 100) : 0;
        return `${percentage}%`;
      }
    }
  ];
  
  // 班级表格列定义
  const classColumns = [
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className'
    },
    {
      title: '请假次数',
      dataIndex: 'count',
      key: 'count'
    }
  ];
  
  // 月份表格列定义
  const monthColumns = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month'
    },
    {
      title: '请假次数',
      dataIndex: 'count',
      key: 'count'
    }
  ];

  
  return (
    <div style={{ padding: '24px' }}>
      <Card title="请假统计分析">
        <div style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 120, marginRight: 16 }}
            placeholder="选择年级"
            allowClear
            value={selectedGrade}
            onChange={value => setSelectedGrade(value)}
          >
            {grades.map(grade => (
              <Option key={grade} value={grade}>{grade}</Option>
            ))}
          </Select>
          
          <RangePicker 
            onChange={(dates) => setDateRange(dates)}
            style={{ width: 240 }}
          />
        </div>
        
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic title="请假总次数" value={filteredRecords.length} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="请假总天数" 
                value={filteredRecords.reduce((total, record) => total + record.duration, 0)} 
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="请假学生数" 
                value={new Set(filteredRecords.map(record => record.student.id)).size} 
              />
            </Card>
          </Col>
        </Row>
        
        <Tabs defaultActiveKey="1">
          <TabPane tab="请假类型分布" key="1">
            <Table 
              dataSource={leaveTypeData} 
              columns={typeColumns} 
              rowKey="type"
              pagination={false}
            />
          </TabPane>
          
          <TabPane tab="班级请假统计" key="2">
            <Table 
              dataSource={leaveClassData} 
              columns={classColumns} 
              rowKey="className"
              pagination={false}
            />
          </TabPane>
          
          <TabPane tab="月度请假趋势" key="3">
            <Table 
              dataSource={leaveMonthData} 
              columns={monthColumns} 
              rowKey="month"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Statistics;