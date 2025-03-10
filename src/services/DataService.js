import Student from '../models/Student';
import LeaveRecord, { LeaveType } from '../models/LeaveRecord';

class DataService {
  constructor() {
    this.listeners = [];
    // 修改API URL的获取方式，使其能够适应生产环境
    this.apiUrl = process.env.NODE_ENV === 'production' 
      ? '/api'  // 生产环境使用相对路径
      : 'http://localhost:5000/api'; // 开发环境使用localhost
    this.token = localStorage.getItem('token') || null;
  }

  // 添加状态变化监听器
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 通知所有监听器状态已更改
  notifyChange() {
    this.listeners.forEach(listener => listener());
  }

  // API请求辅助方法
  async fetchApi(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['x-auth-token'] = this.token;
    }

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        msg: '请求失败'
      }));
      throw new Error(error.msg || '请求失败');
    }

    return await response.json();
  }

  // 用户认证
  async login(username, password) {
    try {
      const data = await this.fetchApi('/users/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      this.token = data.token;
      localStorage.setItem('token', data.token);
      return data.user;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const data = await this.fetchApi('/users/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      this.token = data.token;
      localStorage.setItem('token', data.token);
      return true;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async getCurrentUser() {
    try {
      return await this.fetchApi('/users/me');
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  // 学生管理
  async getStudents() {
    try {
      const students = await this.fetchApi('/students');
      return students.map(student => new Student({
        ...student,
        id: student._id
      }));
    } catch (error) {
      console.error('获取学生列表失败:', error);
      throw error;
    }
  }
  
  async importStudents(studentsData) {
    try {
      const result = await this.fetchApi('/students/batch', {
        method: 'POST',
        body: JSON.stringify(studentsData)
      });
      
      this.notifyChange();
      return result.success;
    } catch (error) {
      console.error('批量导入学生失败:', error);
      throw error;
    }
  }

  async getStudentById(id) {
    try {
      const student = await this.fetchApi(`/students/${id}`);
      return new Student({
        ...student,
        id: student._id
      });
    } catch (error) {
      console.error(`获取学生(ID: ${id})失败:`, error);
      return null;
    }
  }

  async addStudent(studentData) {
    try {
      const student = await this.fetchApi('/students', {
        method: 'POST',
        body: JSON.stringify(studentData)
      });
      
      this.notifyChange();
      return new Student({
        ...student,
        id: student._id
      });
    } catch (error) {
      console.error('添加学生失败:', error);
      throw error;
    }
  }

  async updateStudent(updatedStudent) {
    try {
      const studentData = { ...updatedStudent };
      const id = studentData.id;
      delete studentData.id; // 移除id字段，因为API使用_id
      
      const student = await this.fetchApi(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(studentData)
      });
      
      this.notifyChange();
      return true;
    } catch (error) {
      console.error('更新学生失败:', error);
      throw error;
    }
  }

  async deleteStudent(id) {
    try {
      await this.fetchApi(`/students/${id}`, {
        method: 'DELETE'
      });
      
      this.notifyChange();
      return true;
    } catch (error) {
      console.error('删除学生失败:', error);
      throw error;
    }
  }

  // 请假记录管理
  async getLeaveRecords() {
    try {
      const records = await this.fetchApi('/leave-records');
      return records.map(record => new LeaveRecord({
        ...record,
        id: record._id,
        student: new Student({
          ...record.student,
          id: record.student._id
        })
      }));
    } catch (error) {
      console.error('获取请假记录失败:', error);
      throw error;
    }
  }

  async getLeaveRecordById(id) {
    try {
      const record = await this.fetchApi(`/leave-records/${id}`);
      return new LeaveRecord({
        ...record,
        id: record._id,
        student: new Student({
          ...record.student,
          id: record.student._id
        })
      });
    } catch (error) {
      console.error(`获取请假记录(ID: ${id})失败:`, error);
      return null;
    }
  }

  async addLeaveRecord(recordData) {
    try {
      // 确保student字段是ID而不是对象
      const data = { ...recordData };
      if (data.student && typeof data.student === 'object') {
        data.student = data.student.id;
      }
      
      const record = await this.fetchApi('/leave-records', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      this.notifyChange();
      return new LeaveRecord({
        ...record,
        id: record._id,
        student: new Student({
          ...record.student,
          id: record.student._id
        })
      });
    } catch (error) {
      console.error('添加请假记录失败:', error);
      throw error;
    }
  }

  async updateLeaveRecord(updatedRecord) {
    try {
      const data = { ...updatedRecord };
      const id = data.id;
      delete data.id; // 移除id字段，因为API使用_id
      
      // 确保student字段是ID而不是对象
      if (data.student && typeof data.student === 'object') {
        data.student = data.student.id;
      }
      
      const record = await this.fetchApi(`/leave-records/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      this.notifyChange();
      return true;
    } catch (error) {
      console.error('更新请假记录失败:', error);
      throw error;
    }
  }

  async deleteLeaveRecord(id) {
    try {
      await this.fetchApi(`/leave-records/${id}`, {
        method: 'DELETE'
      });
      
      this.notifyChange();
      return true;
    } catch (error) {
      console.error('删除请假记录失败:', error);
      throw error;
    }
  }

  // 数据筛选
  async getLeaveRecordsByClass(className) {
    try {
      if (!className) return this.getLeaveRecords();
      
      const records = await this.fetchApi(`/leave-records/class/${encodeURIComponent(className)}`);
      return records.map(record => new LeaveRecord({
        ...record,
        id: record._id,
        student: new Student({
          ...record.student,
          id: record.student._id
        })
      }));
    } catch (error) {
      console.error(`获取班级(${className})请假记录失败:`, error);
      throw error;
    }
  }

  async getLeaveRecordsByStudent(studentId) {
    try {
      const records = await this.fetchApi(`/leave-records/student/${studentId}`);
      return records.map(record => new LeaveRecord({
        ...record,
        id: record._id,
        student: new Student({
          ...record.student,
          id: record.student._id
        })
      }));
    } catch (error) {
      console.error(`获取学生(ID: ${studentId})请假记录失败:`, error);
      throw error;
    }
  }
  
  // 前端筛选方法 - 这些方法在前端处理数据筛选
  async getLeaveRecordsByType(type) {
    try {
      if (!type) return this.getLeaveRecords();
      const records = await this.getLeaveRecords();
      return records.filter(record => record.type === type);
    } catch (error) {
      console.error(`获取请假类型(${type})记录失败:`, error);
      throw error;
    }
  }

  async getLeaveRecordsByDateRange(startDate, endDate) {
    try {
      const records = await this.getLeaveRecords();
      return records.filter(record => {
        // 检查请假时间段是否与给定日期范围有重叠
        return (record.startDate <= endDate && record.endDate >= startDate);
      });
    } catch (error) {
      console.error('按日期范围获取请假记录失败:', error);
      throw error;
    }
  }

  // 统计分析
  getLeaveCountByType() {
    const counts = {};
    Object.values(LeaveType).forEach(type => {
      counts[type] = this.leaveRecords.filter(record => record.type === type).length;
    });
    return counts;
  }

  getLeaveCountByClass() {
    const counts = {};
    const classNames = [...new Set(this.students.map(student => student.className))];
    
    classNames.forEach(className => {
      counts[className] = this.leaveRecords.filter(
        record => record.student.className === className
      ).length;
    });
    
    return counts;
  }

  // 单例模式
  static getInstance() {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }
}

export default DataService;