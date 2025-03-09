import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import Student from './Student';

// 请假类型枚举
export const LeaveType = {
  SICK: '病假',
  PERSONAL: '事假',
  OTHER: '其他'
};

// 请假类型对应的颜色
export const LeaveTypeColors = {
  [LeaveType.SICK]: '#f5222d',     // 红色
  [LeaveType.PERSONAL]: '#1890ff', // 蓝色
  [LeaveType.OTHER]: '#8c8c8c'     // 灰色
};

// 获取所有请假类型
export const getAllLeaveTypes = () => [
  { value: LeaveType.SICK, label: LeaveType.SICK },
  { value: LeaveType.PERSONAL, label: LeaveType.PERSONAL },
  { value: LeaveType.OTHER, label: LeaveType.OTHER }
];

class LeaveRecord {
  constructor({
    id = uuidv4(),
    student,
    type = LeaveType.SICK,
    startDate = new Date(),
    endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 默认一天后
    reason = '',
    approved = true, // 默认为已批准
    notes = null
  }) {
    this.id = id;
    this.student = student;
    this.type = type;
    this.startDate = startDate instanceof Date ? startDate : new Date(startDate);
    this.endDate = endDate instanceof Date ? endDate : new Date(endDate);
    this.reason = reason;
    this.approved = approved;
    this.notes = notes;
  }

  // 计算请假天数
  get duration() {
    const start = dayjs(this.startDate);
    const end = dayjs(this.endDate);
    return end.diff(start, 'day') + 1; // 包含开始和结束日
  }

  // 从JSON对象创建实例
  static fromJSON(json) {
    return new LeaveRecord({
      ...json,
      student: json.student instanceof Student ? json.student : Student.fromJSON(json.student)
    });
  }

  // 转换为JSON对象
  toJSON() {
    return {
      id: this.id,
      student: this.student instanceof Student ? this.student.toJSON() : this.student,
      type: this.type,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      reason: this.reason,
      approved: this.approved,
      notes: this.notes
    };
  }

  // 示例数据
  static get example() {
    return new LeaveRecord({
      student: Student.example,
      type: LeaveType.SICK,
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      reason: '感冒发烧',
      notes: '已通知家长'
    });
  }
}

export default LeaveRecord;