const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/users/register
// @desc    注册用户
// @access  Public
router.post(
  '/register',
  [
    check('username', '用户名是必填项').not().isEmpty(),
    check('password', '请输入6个或更多字符的密码').isLength({ min: 6 }),
    check('name', '姓名是必填项').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, name, role } = req.body;

    try {
      // 检查用户是否已存在
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ msg: '用户已存在' });
      }

      // 创建新用户
      user = new User({
        username,
        password,
        name,
        role: role || 'teacher'
      });

      // 保存用户（密码会在保存前通过中间件自动加密）
      await user.save();

      // 创建JWT令牌
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'mysecrettoken',
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   POST api/users/login
// @desc    用户登录
// @access  Public
router.post(
  '/login',
  [
    check('username', '请输入用户名').exists(),
    check('password', '密码是必填项').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // 检查用户是否存在
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ msg: '无效的凭据' });
      }

      // 验证密码
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ msg: '无效的凭据' });
      }

      // 创建JWT令牌
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'mysecrettoken',
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              username: user.username,
              name: user.name,
              role: user.role
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/users/me
// @desc    获取当前用户信息
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // 从请求头获取令牌
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ msg: '无令牌，授权被拒绝' });
    }
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecrettoken');
    
    // 获取用户信息
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: '未找到用户' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: '令牌无效' });
    }
    res.status(500).send('服务器错误');
  }
});

module.exports = router;