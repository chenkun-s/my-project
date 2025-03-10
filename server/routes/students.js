const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Student = require('../models/Student');

// @route   GET api/students
// @desc    获取所有学生
// @access  Public
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/students/:id
// @desc    获取单个学生
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ msg: '未找到该学生' });
    }
    
    res.json(student);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '未找到该学生' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   POST api/students
// @desc    添加学生
// @access  Public
router.post(
  '/',
  [
    check('name', '姓名是必填项').not().isEmpty(),
    check('studentId', '学号是必填项').not().isEmpty(),
    check('className', '班级是必填项').not().isEmpty(),
    check('grade', '年级是必填项').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, studentId, className, grade, phoneNumber, parentName, parentPhone } = req.body;

    try {
      // 检查学号是否已存在
      let student = await Student.findOne({ studentId });
      
      if (student) {
        return res.status(400).json({ msg: '该学号已存在' });
      }
      
      // 创建新学生
      student = new Student({
        name,
        studentId,
        className,
        grade,
        phoneNumber,
        parentName,
        parentPhone
      });
      
      await student.save();
      
      res.json(student);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   PUT api/students/:id
// @desc    更新学生信息
// @access  Public
router.put('/:id', async (req, res) => {
  const { name, studentId, className, grade, phoneNumber, parentName, parentPhone } = req.body;
  
  // 构建学生对象
  const studentFields = {};
  if (name) studentFields.name = name;
  if (studentId) studentFields.studentId = studentId;
  if (className) studentFields.className = className;
  if (grade) studentFields.grade = grade;
  if (phoneNumber !== undefined) studentFields.phoneNumber = phoneNumber;
  if (parentName !== undefined) studentFields.parentName = parentName;
  if (parentPhone !== undefined) studentFields.parentPhone = parentPhone;
  
  try {
    let student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ msg: '未找到该学生' });
    }
    
    // 如果更改了学号，检查新学号是否已存在
    if (studentId && studentId !== student.studentId) {
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ msg: '该学号已存在' });
      }
    }
    
    // 更新学生信息
    student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: studentFields },
      { new: true }
    );
    
    res.json(student);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '未找到该学生' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   DELETE api/students/:id
// @desc    删除学生
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ msg: '未找到该学生' });
    }
    
    await student.deleteOne();
    
    res.json({ msg: '学生已删除' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: '未找到该学生' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   POST api/students/batch
// @desc    批量导入学生
// @access  Public
router.post('/batch', async (req, res) => {
  try {
    const studentsData = req.body;
    
    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return res.status(400).json({ msg: '无效的数据格式' });
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // 批量处理学生数据
    for (const data of studentsData) {
      try {
        // 检查必填字段
        if (!data.name || !data.studentId || !data.className || !data.grade) {
          results.failed++;
          results.errors.push({
            studentId: data.studentId || '未知',
            error: '缺少必填字段'
          });
          continue;
        }
        
        // 检查学号是否已存在
        const existingStudent = await Student.findOne({ studentId: data.studentId });
        if (existingStudent) {
          results.failed++;
          results.errors.push({
            studentId: data.studentId,
            error: '学号已存在'
          });
          continue;
        }
        
        // 创建新学生
        const student = new Student({
          name: data.name,
          studentId: data.studentId,
          className: data.className,
          grade: data.grade,
          phoneNumber: data.phoneNumber || null,
          parentName: data.parentName || null,
          parentPhone: data.parentPhone || null
        });
        
        await student.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          studentId: data.studentId || '未知',
          error: error.message
        });
      }
    }
    
    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;