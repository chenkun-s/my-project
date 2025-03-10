const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  className: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    default: null
  },
  parentName: {
    type: String,
    default: null
  },
  parentPhone: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);