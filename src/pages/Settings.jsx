import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, Select, Divider, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // 模拟保存设置
  const handleSave = (values) => {
    setLoading(true);
    
    // 模拟API请求
    setTimeout(() => {
      console.log('保存设置:', values);
      localStorage.setItem('appSettings', JSON.stringify(values));
      message.success('设置保存成功');
      setLoading(false);
    }, 1000);
  };
  
  // 从localStorage加载设置
  React.useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        form.setFieldsValue(settings);
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }, [form]);

  return (
    <div style={{ padding: '24px' }}>
      <Card title="系统设置">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            notificationEnabled: true,
            theme: 'light',
            pageSize: 10,
            autoSave: true
          }}
        >
          <Divider orientation="left">基本设置</Divider>
          
          <Form.Item
            name="theme"
            label="界面主题"
          >
            <Select>
              <Option value="light">浅色</Option>
              <Option value="dark">深色</Option>
              <Option value="system">跟随系统</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="pageSize"
            label="每页显示记录数"
          >
            <Select>
              <Option value={10}>10条/页</Option>
              <Option value={20}>20条/页</Option>
              <Option value={50}>50条/页</Option>
              <Option value={100}>100条/页</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="autoSave"
            label="自动保存"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          
          <Divider orientation="left">通知设置</Divider>
          
          <Form.Item
            name="notificationEnabled"
            label="启用通知"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          
          <Form.Item
            name="notificationEmail"
            label="通知邮箱"
            rules={[
              {
                type: 'email',
                message: '请输入有效的邮箱地址',
              },
            ]}
          >
            <Input placeholder="请输入接收通知的邮箱地址" />
          </Form.Item>
          
          <Divider orientation="left">个人信息</Divider>
          
          <Form.Item
            name="teacherName"
            label="教师姓名"
          >
            <Input placeholder="请输入您的姓名" />
          </Form.Item>
          
          <Form.Item
            name="teacherPhone"
            label="联系电话"
          >
            <Input placeholder="请输入您的联系电话" />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={loading}
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;