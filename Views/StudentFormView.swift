import SwiftUI

enum StudentFormMode {
    case add
    case edit(Student)
}

struct StudentFormView: View {
    @EnvironmentObject private var dataStore: DataStore
    @Environment(\.presentationMode) var presentationMode
    
    let mode: StudentFormMode
    
    @State private var name = ""
    @State private var studentId = ""
    @State private var className = ""
    @State private var grade = ""
    @State private var phoneNumber = ""
    @State private var parentName = ""
    @State private var parentPhone = ""
    
    private var isEditing: Bool {
        switch mode {
        case .add:
            return false
        case .edit:
            return true
        }
    }
    
    private var title: String {
        isEditing ? "编辑学生信息" : "添加学生"
    }
    
    init(mode: StudentFormMode) {
        self.mode = mode
        
        // 如果是编辑模式，初始化表单数据
        switch mode {
        case .add:
            break
        case .edit(let student):
            _name = State(initialValue: student.name)
            _studentId = State(initialValue: student.studentId)
            _className = State(initialValue: student.className)
            _grade = State(initialValue: student.grade)
            _phoneNumber = State(initialValue: student.phoneNumber ?? "")
            _parentName = State(initialValue: student.parentName ?? "")
            _parentPhone = State(initialValue: student.parentPhone ?? "")
        }
    }
    
    var body: some View {
        NavigationView {
            Form {
                // 基本信息
                Section(header: Text("基本信息")) {
                    TextField("姓名", text: $name)
                    TextField("学号", text: $studentId)
                    TextField("班级", text: $className)
                    TextField("年级", text: $grade)
                }
                
                // 联系信息
                Section(header: Text("联系信息（选填）")) {
                    TextField("学生电话", text: $phoneNumber)
                    TextField("家长姓名", text: $parentName)
                    TextField("家长电话", text: $parentPhone)
                }
            }
            .navigationTitle(title)
            .navigationBarItems(
                leading: Button("取消") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: Button("保存") {
                    saveStudent()
                }
                .disabled(name.isEmpty || studentId.isEmpty || className.isEmpty || grade.isEmpty)
            )
        }
    }
    
    private func saveStudent() {
        switch mode {
        case .add:
            let newStudent = Student(
                name: name,
                studentId: studentId,
                className: className,
                grade: grade,
                phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber,
                parentName: parentName.isEmpty ? nil : parentName,
                parentPhone: parentPhone.isEmpty ? nil : parentPhone
            )
            dataStore.addStudent(newStudent)
            
        case .edit(let student):
            var updatedStudent = student
            updatedStudent.name = name
            updatedStudent.studentId = studentId
            updatedStudent.className = className
            updatedStudent.grade = grade
            updatedStudent.phoneNumber = phoneNumber.isEmpty ? nil : phoneNumber
            updatedStudent.parentName = parentName.isEmpty ? nil : parentName
            updatedStudent.parentPhone = parentPhone.isEmpty ? nil : parentPhone
            
            dataStore.updateStudent(updatedStudent)
        }
        
        presentationMode.wrappedValue.dismiss()
    }
}

struct StudentFormView_Previews: PreviewProvider {
    static var previews: some View {
        StudentFormView(mode: .add)
            .environmentObject(DataStore())
    }
}