import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Select, Button, Space, Popconfirm, Card, Upload, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import DataService from '../services/DataService';
import * as XLSX from 'xlsx';

const { Option } = Select;

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const navigate = useNavigate();
  
  // 处理Excel文件导入
  const handleExcelImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 获取第一个工作表
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // 将工作表转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          message.error('Excel文件中没有数据！');
          return;
        }
        
        // 验证数据格式
        const requiredFields = ['姓名', '学号', '班级', '年级'];
        const firstRow = jsonData[0];
        const missingFields = requiredFields.filter(field => !(field in firstRow));
        
        if (missingFields.length > 0) {
          message.error(`Excel文件缺少必要的字段: ${missingFields.join(', ')}`);
          return;
        }
        
        // 转换数据格式以匹配Student模型
        const studentsData = jsonData.map(row => ({
          name: row['姓名'],
          studentId: row['学号'].toString(),
          className: row['班级'],
          grade: row['年级'],
          phoneNumber: row['联系电话'] || null,
          parentName: row['家长姓名'] || null,
          parentPhone: row['家长电话'] || null
        }));
        
        // 导入学生数据
        const dataService = DataService.getInstance();
        const count = dataService.importStudents(studentsData);
        
        message.success(`成功导入${count}名学生`);
      } catch (error) {
        console.error('解析Excel文件失败:', error);
        message.error('解析Excel文件失败，请检查文件格式是否正确');
      }
    };
    
    reader.onerror = () => {
      message.error('读取文件失败');
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  useEffect(() => {
    const dataService = DataService.getInstance();
    
    // 获取学生数据
    setStudents(dataService.getStudents());
    
    // 添加监听器，当数据变化时更新
    const unsubscribe = dataService.addListener(() => {
      setStudents(dataService.getStudents());
    });
    
    // 组件卸载时移除监听器
    return () => unsubscribe();
  }, []);

  // 获取所有年级
  const grades = [...new Set(students.map(student => student.grade))].sort();

  // 筛选学生
  const filteredStudents = students.filter(student => {
    const matchesGrade = !selectedGrade || student.grade === selectedGrade;
    const matchesSearch = !searchText || 
      student.name.toLowerCase().includes(searchText.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchText.toLowerCase()) ||
      student.className.toLowerCase().includes(searchText.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  // 删除学生
  const handleDelete = (studentId) => {
    const dataService = DataService.getInstance();
    dataService.deleteStudent(studentId);
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/students/${record.id}`}>{text}</Link>
    },
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId'
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className'
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade'
    },
    {
      title: '联系电话',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/students/edit/${record.id}`}>编辑</Link>
          <Popconfirm
            title="确定要删除这个学生吗？"
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
        title="学生管理"
        extra={
          <Space>
            <Upload
              beforeUpload={(file) => {
                const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                               file.type === 'application/vnd.ms-excel' ||
                               file.name.endsWith('.xlsx') || 
                               file.name.endsWith('.xls');
                if (!isExcel) {
                  message.error('只能上传Excel文件！');
                  return Upload.LIST_IGNORE;
                }
                handleExcelImport(file);
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>
                导入学生
              </Button>
            </Upload>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/students/add')}
            >
              添加学生
            </Button>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 120 }}
            placeholder="选择年级"
            allowClear
            value={selectedGrade}
            onChange={value => setSelectedGrade(value)}
          >
            {grades.map(grade => (
              <Option key={grade} value={grade}>{grade}</Option>
            ))}
          </Select>
          
          <Input
            placeholder="搜索学生姓名、学号或班级"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredStudents}
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

export default StudentList;