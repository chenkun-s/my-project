import { v4 as uuidv4 } from 'uuid';

class Student {
  constructor({
    id = uuidv4(),
    name,
    studentId,
    className,
    grade,
    phoneNumber = null,
    parentName = null,
    parentPhone = null
  }) {
    this.id = id;
    this.name = name;
    this.studentId = studentId;
    this.className = className;
    this.grade = grade;
    this.phoneNumber = phoneNumber;
    this.parentName = parentName;
    this.parentPhone = parentPhone;
  }

  static fromJSON(json) {
    return new Student(json);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      studentId: this.studentId,
      className: this.className,
      grade: this.grade,
      phoneNumber: this.phoneNumber,
      parentName: this.parentName,
      parentPhone: this.parentPhone
    };
  }

  // 示例数据
  static get example() {
    return new Student({
      name: "张三",
      studentId: "20230001",
      className: "一班",
      grade: "一年级"
    });
  }
}

export default Student;