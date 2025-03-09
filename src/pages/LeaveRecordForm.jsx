import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import DataService from '../services/DataService';
import LeaveRecord, { getAllLeaveTypes } from '../models/LeaveRecord';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const LeaveRecordForm = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [initialValues, setInitialValues] = useState(null);
  
  // 判断是新增还是编辑模式
  const isEditMode = !!id;
  
  useEffect(() => {
    const dataService = DataService.getInstance();
    
    // 获取所有学生
    setStudents(dataService.getStudents());
    
    if (isEditMode) {
      const record = dataService.getLeaveRecordById(id);
      
      if (record) {
        // 设置初始值
        setInitialValues({
          studentId: record.student.id,
          type: record.type,
          dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
          reason: record.reason,
          approved: record.approved,
          notes: record.notes || ''
        });
        
        form.setFieldsValue({
          studentId: record.student.id,
          type: record.type,
          dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
          reason: record.reason,
          approved: record.approved,
          notes: record.notes || ''
        });
      } else {
        message.error('未找到请假记录');
        navigate('/leave-records');
      }
    }
    
    // 添加监听器，当数据变化时更新学生列表
    const unsubscribe = dataService.addListener(() => {
      setStudents(dataService.getStudents());
    });
    
    // 组件卸载时移除监听器
    return () => unsubscribe();
  }, [id, form, isEditMode, navigate]);
  
  const onFinish = (values) => {
    setLoading(true);
    const dataService = DataService.getInstance();
    
    try {
      const { studentId, type, dateRange, reason, notes } = values;
      const student = dataService.getStudentById(studentId);
      
      if (!student) {
        message.error('学生不存在');
        setLoading(false);
        return;
      }
      
      const recordData = {
        student,
        type,
        startDate: dateRange[0].toDate(),
        endDate: dateRange[1].toDate(),
        reason,
        approved: true, // 默认批准
        notes: notes || null
      };
      
      if (isEditMode) {
        // 编辑模式
        recordData.id = id;
        dataService.updateLeaveRecord(new LeaveRecord(recordData));
        message.success('请假记录更新成功');
      } else {
        // 新增模式
        dataService.addLeaveRecord(recordData);
        message.success('请假记录添加成功');
      }
      
      navigate('/leave-records');
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('请检查表单填写是否正确');
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <Card title={isEditMode ? '编辑请假记录' : '添加请假记录'}>
        <Form
          form={form}
          name="leaveRecordForm"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          initialValues={initialValues || {}}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="学生"
            name="studentId"
            rules={[{ required: true, message: '请选择学生' }]}
          >
            <Select placeholder="请选择学生">
              {students.map(student => (
                <Option key={student.id} value={student.id}>
                  {student.name} ({student.className})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="请假类型"
            name="type"
            rules={[{ required: true, message: '请选择请假类型' }]}
          >
            <Select placeholder="请选择请假类型">
              {getAllLeaveTypes().map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="请假时间"
            name="dateRange"
            rules={[{ required: true, message: '请选择请假时间' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            label="请假原因"
            name="reason"
            rules={[{ required: true, message: '请输入请假原因' }]}
          >
            <TextArea rows={4} placeholder="请输入请假原因" />
          </Form.Item>
          
          <Form.Item
            label="备注"
            name="notes"
          >
            <TextArea rows={2} placeholder="请输入备注（选填）" />
          </Form.Item>
          
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditMode ? '保存修改' : '添加记录'}
            </Button>
            <Button 
              style={{ marginLeft: 8 }} 
              onClick={() => navigate('/leave-records')}
            >
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LeaveRecordForm;