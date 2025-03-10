const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 连接MongoDB数据库
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-leave-management');
    console.log(`MongoDB 连接成功: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB 连接错误: ${error.message}`);
    process.exit(1);
  }
};

// API路由
app.use('/api/students', require('./routes/students'));
app.use('/api/leave-records', require('./routes/leaveRecords'));
app.use('/api/users', require('./routes/users'));

// 在生产环境中提供静态文件
if (process.env.NODE_ENV === 'production') {
  // 设置静态文件夹
  app.use(express.static(path.join(__dirname, '../dist')));

  // 所有未匹配的路由都返回index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
} else {
  // 开发环境的API根路由
  app.get('/', (req, res) => {
    res.send('学生请假管理系统API正在运行');
  });
}

// 定义端口
const PORT = process.env.PORT || 5000;

// 启动服务器
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
});