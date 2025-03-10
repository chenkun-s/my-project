const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const LeaveRecord = require('../models/LeaveRecord');
const Student = require('../models/Student');

// @route   GET api/leave-records
// @desc    获取所有请假记录
// @access  Public
router.get('/', async (req, res) => {
  try {
    const leaveRecords = await LeaveRecord.find()
      .populate('student')
      .sort({ createdAt: -1 });
    res.json(leaveRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/leave-records/:id
// @desc    获取单个请假记录
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const leaveRecord = await LeaveRecord.findById(req.params.id).populate('student');
    
    if (!leaveRecord) {
      return res.status(404).json({ msg: '未找到该请假记录' });
    }
    
    res.json(leaveRecord);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '未找到该请假记录' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   POST api/leave-records
// @desc    添加请假记录
// @access  Public
router.post(
  '/',
  [
    check('student', '学生ID是必填项').not().isEmpty(),
    check('type', '请假类型是必填项').not().isEmpty(),
    check('startDate', '开始日期是必填项').not().isEmpty(),
    check('endDate', '结束日期是必填项').not().isEmpty(),
    check('reason', '请假原因是必填项').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student, type, startDate, endDate, reason, approved, notes } = req.body;

    try {
      // 检查学生是否存在
      const studentExists = await Student.findById(student);
      if (!studentExists) {
        return res.status(404).json({ msg: '未找到该学生' });
      }
      
      // 创建新请假记录
      const leaveRecord = new LeaveRecord({
        student,
        type,
        startDate,
        endDate,
        reason,
        approved: approved !== undefined ? approved : true,
        notes
      });
      
      await leaveRecord.save();
      
      // 返回包含学生信息的请假记录
      const populatedRecord = await LeaveRecord.findById(leaveRecord._id).populate('student');
      
      res.json(populatedRecord);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   PUT api/leave-records/:id
// @desc    更新请假记录
// @access  Public
router.put('/:id', async (req, res) => {
  const { student, type, startDate, endDate, reason, approved, notes } = req.body;
  
  // 构建请假记录对象
  const recordFields = {};
  if (student) recordFields.student = student;
  if (type) recordFields.type = type;
  if (startDate) recordFields.startDate = startDate;
  if (endDate) recordFields.endDate = endDate;
  if (reason) recordFields.reason = reason;
  if (approved !== undefined) recordFields.approved = approved;
  if (notes !== undefined) recordFields.notes = notes;
  
  try {
    let leaveRecord = await LeaveRecord.findById(req.params.id);
    
    if (!leaveRecord) {
      return res.status(404).json({ msg: '未找到该请假记录' });
    }
    
    // 如果更改了学生，检查学生是否存在
    if (student && student !== leaveRecord.student.toString()) {
      const studentExists = await Student.findById(student);
      if (!studentExists) {
        return res.status(404).json({ msg: '未找到该学生' });
      }
    }
    
    // 更新请假记录
    leaveRecord = await LeaveRecord.findByIdAndUpdate(
      req.params.id,
      { $set: recordFields },
      { new: true }
    ).populate('student');
    
    res.json(leaveRecord);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '未找到该请假记录' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   DELETE api/leave-records/:id
// @desc    删除请假记录
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const leaveRecord = await LeaveRecord.findById(req.params.id);
    
    if (!leaveRecord) {
      return res.status(404).json({ msg: '未找到该请假记录' });
    }
    
    await leaveRecord.deleteOne();
    
    res.json({ msg: '请假记录已删除' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '未找到该请假记录' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/leave-records/student/:studentId
// @desc    获取指定学生的所有请假记录
// @access  Public
router.get('/student/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ msg: '未找到该学生' });
    }
    
    const leaveRecords = await LeaveRecord.find({ student: req.params.studentId })
      .populate('student')
      .sort({ createdAt: -1 });
    
    res.json(leaveRecords);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '未找到该学生' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/leave-records/class/:className
// @desc    获取指定班级的所有请假记录
// @access  Public
router.get('/class/:className', async (req, res) => {
  try {
    // 先找到该班级的所有学生
    const students = await Student.find({ className: req.params.className });
    
    if (students.length === 0) {
      return res.json([]);
    }
    
    // 获取这些学生的所有请假记录
    const studentIds = students.map(student => student._id);
    const leaveRecords = await LeaveRecord.find({ student: { $in: studentIds } })
      .populate('student')
      .sort({ createdAt: -1 });
    
    res.json(leaveRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;