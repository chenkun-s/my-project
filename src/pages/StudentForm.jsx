import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import DataService from '../services/DataService';
import Student from '../models/Student';

const { Option } = Select;

const StudentForm = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  
  // 判断是新增还是编辑模式
  const isEditMode = !!id;
  
  useEffect(() => {
    if (isEditMode) {
      const dataService = DataService.getInstance();
      const student = dataService.getStudentById(id);
      
      if (student) {
        setInitialValues({
          name: student.name,
          studentId: student.studentId,
          className: student.className,
          grade: student.grade,
          phoneNumber: student.phoneNumber || '',
          parentName: student.parentName || '',
          parentPhone: student.parentPhone || ''
        });
        
        form.setFieldsValue({
          name: student.name,
          studentId: student.studentId,
          className: student.className,
          grade: student.grade,
          phoneNumber: student.phoneNumber || '',
          parentName: student.parentName || '',
          parentPhone: student.parentPhone || ''
        });
      } else {
        message.error('未找到学生信息');
        navigate('/students');
      }
    }
  }, [id, form, isEditMode, navigate]);
  
  const onFinish = (values) => {
    setLoading(true);
    const dataService = DataService.getInstance();
    
    try {
      if (isEditMode) {
        // 编辑模式
        const updatedStudent = new Student({
          id: id,
          ...values
        });
        
        dataService.updateStudent(updatedStudent);
        message.success('学生信息更新成功');
      } else {
        // 新增模式
        dataService.addStudent(values);
        message.success('学生添加成功');
      }
      
      navigate('/students');
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
  
  // 获取所有年级选项
  const gradeOptions = [
    '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
    '初一', '初二', '初三',
    '高一', '高二', '高三'
  ];
  
  return (
    <div style={{ padding: '24px' }}>
      <Card title={isEditMode ? '编辑学生信息' : '添加新学生'}>
        <Form
          form={form}
          name="studentForm"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          initialValues={initialValues || {}}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入学生姓名' }]}
          >
            <Input placeholder="请输入学生姓名" />
          </Form.Item>
          
          <Form.Item
            label="学号"
            name="studentId"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input placeholder="请输入学号" />
          </Form.Item>
          
          <Form.Item
            label="班级"
            name="className"
            rules={[{ required: true, message: '请输入班级' }]}
          >
            <Input placeholder="请输入班级，如：一班" />
          </Form.Item>
          
          <Form.Item
            label="年级"
            name="grade"
            rules={[{ required: true, message: '请选择年级' }]}
          >
            <Select placeholder="请选择年级">
              {gradeOptions.map(grade => (
                <Option key={grade} value={grade}>{grade}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="联系电话"
            name="phoneNumber"
          >
            <Input placeholder="请输入学生联系电话（选填）" />
          </Form.Item>
          
          <Form.Item
            label="家长姓名"
            name="parentName"
          >
            <Input placeholder="请输入家长姓名（选填）" />
          </Form.Item>
          
          <Form.Item
            label="家长电话"
            name="parentPhone"
          >
            <Input placeholder="请输入家长联系电话（选填）" />
          </Form.Item>
          
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditMode ? '保存修改' : '添加学生'}
            </Button>
            <Button 
              style={{ marginLeft: 8 }} 
              onClick={() => navigate('/students')}
            >
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default StudentForm;