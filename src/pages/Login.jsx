import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    setLoading(true);
    
    // 模拟登录请求
    setTimeout(() => {
      // 这里简化处理，实际应用中应该与后端API交互验证
      if (values.username === 'teacher' && values.password === '123456') {
        // 登录成功
        localStorage.setItem('user', JSON.stringify({ username: values.username, role: 'teacher' }));
        message.success('登录成功');
        onLogin();
        // 登录成功后重定向到首页
        navigate('/');
      } else {
        // 登录失败
        message.error('用户名或密码错误');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#f0f2f5'
    }}>
      <Card
        title="学生请假管理系统"
        style={{ width: 350, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        headStyle={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
      >
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名 (teacher)" 
              size="large" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码 (123456)" 
              size="large" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;