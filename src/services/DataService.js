import { v4 as uuidv4 } from 'uuid';
import Student from '../models/Student';
import LeaveRecord, { LeaveType } from '../models/LeaveRecord';

class DataService {
  constructor() {
    this.students = [];
    this.leaveRecords = [];
    this.listeners = [];
    this.loadData();
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

  // 从localStorage加载数据
  loadData() {
    try {
      const studentsData = localStorage.getItem('students');
      const leaveRecordsData = localStorage.getItem('leaveRecords');

      if (studentsData) {
        const parsedStudents = JSON.parse(studentsData);
        this.students = parsedStudents.map(data => Student.fromJSON(data));
      } else {
        // 如果没有数据，添加示例数据
        this.students = [Student.example];
      }

      if (leaveRecordsData) {
        const parsedRecords = JSON.parse(leaveRecordsData);
        this.leaveRecords = parsedRecords.map(data => LeaveRecord.fromJSON(data));
      } else {
        // 如果没有数据，添加示例数据
        this.leaveRecords = [LeaveRecord.example];
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      // 出错时使用默认数据
      this.students = [Student.example];
      this.leaveRecords = [LeaveRecord.example];
    }
  }

  // 保存数据到localStorage
  saveData() {
    try {
      localStorage.setItem('students', JSON.stringify(this.students.map(s => s.toJSON())));
      localStorage.setItem('leaveRecords', JSON.stringify(this.leaveRecords.map(r => r.toJSON())));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  }

  // 学生管理
  getStudents() {
    return [...this.students];
  }
  
  importStudents(studentsData) {
    const originalCount = this.students.length;
    const newStudents = studentsData.map(data => new Student(data));
    this.students.push(...newStudents);
    this.saveData();
    this.notifyChange();
    return this.students.length - originalCount;
  }

  getStudentById(id) {
    return this.students.find(student => student.id === id) || null;
  }

  addStudent(studentData) {
    const student = new Student(studentData);
    this.students.push(student);
    this.saveData();
    this.notifyChange();
    return student;
  }

  updateStudent(updatedStudent) {
    const index = this.students.findIndex(s => s.id === updatedStudent.id);
    if (index !== -1) {
      this.students[index] = updatedStudent;

      // 更新相关的请假记录
      this.leaveRecords.forEach((record, i) => {
        if (record.student.id === updatedStudent.id) {
          this.leaveRecords[i].student = updatedStudent;
        }
      });

      this.saveData();
      this.notifyChange();
      return true;
    }
    return false;
  }

  deleteStudent(id) {
    const initialLength = this.students.length;
    this.students = this.students.filter(student => student.id !== id);
    
    // 删除相关的请假记录
    this.leaveRecords = this.leaveRecords.filter(record => record.student.id !== id);
    
    if (this.students.length !== initialLength) {
      this.saveData();
      this.notifyChange();
      return true;
    }
    return false;
  }

  // 请假记录管理
  getLeaveRecords() {
    return [...this.leaveRecords];
  }

  getLeaveRecordById(id) {
    return this.leaveRecords.find(record => record.id === id) || null;
  }

  addLeaveRecord(recordData) {
    const record = new LeaveRecord(recordData);
    this.leaveRecords.push(record);
    this.saveData();
    this.notifyChange();
    return record;
  }

  updateLeaveRecord(updatedRecord) {
    const index = this.leaveRecords.findIndex(r => r.id === updatedRecord.id);
    if (index !== -1) {
      this.leaveRecords[index] = updatedRecord;
      this.saveData();
      this.notifyChange();
      return true;
    }
    return false;
  }

  deleteLeaveRecord(id) {
    const initialLength = this.leaveRecords.length;
    this.leaveRecords = this.leaveRecords.filter(record => record.id !== id);
    
    if (this.leaveRecords.length !== initialLength) {
      this.saveData();
      this.notifyChange();
      return true;
    }
    return false;
  }

  // 数据筛选
  getLeaveRecordsByClass(className) {
    if (!className) return this.getLeaveRecords();
    return this.leaveRecords.filter(record => record.student.className === className);
  }

  getLeaveRecordsByType(type) {
    if (!type) return this.getLeaveRecords();
    return this.leaveRecords.filter(record => record.type === type);
  }

  getLeaveRecordsByDateRange(startDate, endDate) {
    return this.leaveRecords.filter(record => {
      // 检查请假时间段是否与给定日期范围有重叠
      return (record.startDate <= endDate && record.endDate >= startDate);
    });
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