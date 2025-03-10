const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 请假类型枚举
const LeaveType = {
  SICK: '病假',
  PERSONAL: '事假',
  OTHER: '其他'
};

const LeaveRecordSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  type: {
    type: String,
    enum: Object.values(LeaveType),
    default: LeaveType.SICK,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 虚拟属性：请假天数
LeaveRecordSchema.virtual('duration').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // 包含开始和结束日
});

// 确保虚拟属性在JSON中可见
LeaveRecordSchema.set('toJSON', { virtuals: true });
LeaveRecordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LeaveRecord', LeaveRecordSchema);
module.exports.LeaveType = LeaveType;