import SwiftUI

enum FormMode {
    case add
    case edit(LeaveRecord)
}

struct LeaveRecordFormView: View {
    @EnvironmentObject private var dataStore: DataStore
    @Environment(\.presentationMode) var presentationMode
    
    let mode: FormMode
    
    @State private var selectedStudent: Student?
    @State private var selectedType: LeaveType = .sick
    @State private var startDate = Date()
    @State private var endDate = Date().addingTimeInterval(86400) // 默认一天
    @State private var reason = ""
    @State private var notes = ""
    @State private var approved = true
    
    private var isEditing: Bool {
        switch mode {
        case .add:
            return false
        case .edit:
            return true
        }
    }
    
    private var title: String {
        isEditing ? "编辑请假记录" : "添加请假记录"
    }
    
    init(mode: FormMode) {
        self.mode = mode
        
        // 如果是编辑模式，初始化表单数据
        switch mode {
        case .add:
            break
        case .edit(let record):
            _selectedStudent = State(initialValue: record.student)
            _selectedType = State(initialValue: record.type)
            _startDate = State(initialValue: record.startDate)
            _endDate = State(initialValue: record.endDate)
            _reason = State(initialValue: record.reason)
            _notes = State(initialValue: record.notes ?? "")
            _approved = State(initialValue: record.approved)
        }
    }
    
    var body: some View {
        NavigationView {
            Form {
                // 学生选择
                Section(header: Text("学生信息")) {
                    Picker("选择学生", selection: $selectedStudent) {
                        Text("请选择学生").tag(nil as Student?)
                        ForEach(dataStore.students) { student in
                            Text("\(student.name) (\(student.className))").tag(student as Student?)
                        }
                    }
                }
                
                // 请假信息
                Section(header: Text("请假信息")) {
                    Picker("请假类型", selection: $selectedType) {
                        ForEach(LeaveType.allCases, id: \.self) { type in
                            Text(type.rawValue).tag(type)
                        }
                    }
                    
                    DatePicker("开始日期", selection: $startDate, displayedComponents: .date)
                    
                    DatePicker("结束日期", selection: $endDate, in: startDate..., displayedComponents: .date)
                    
                    TextField("请假原因", text: $reason)
                }
                
                // 教师备注
                Section(header: Text("教师备注")) {
                    TextField("备注信息", text: $notes)
                    
                    Toggle("已批准", isOn: $approved)
                }
            }
            .navigationTitle(title)
            .navigationBarItems(
                leading: Button("取消") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: Button("保存") {
                    saveRecord()
                }
                .disabled(selectedStudent == nil || reason.isEmpty)
            )
        }
    }
    
    private func saveRecord() {
        guard let student = selectedStudent else { return }
        
        switch mode {
        case .add:
            let newRecord = LeaveRecord(
                student: student,
                type: selectedType,
                startDate: startDate,
                endDate: endDate,
                reason: reason,
                approved: approved,
                notes: notes.isEmpty ? nil : notes
            )
            dataStore.addLeaveRecord(newRecord)
            
        case .edit(let record):
            var updatedRecord = record
            updatedRecord.student = student
            updatedRecord.type = selectedType
            updatedRecord.startDate = startDate
            updatedRecord.endDate = endDate
            updatedRecord.reason = reason
            updatedRecord.approved = approved
            updatedRecord.notes = notes.isEmpty ? nil : notes
            
            dataStore.updateLeaveRecord(updatedRecord)
        }
        
        presentationMode.wrappedValue.dismiss()
    }
}

struct LeaveRecordFormView_Previews: PreviewProvider {
    static var previews: some View {
        LeaveRecordFormView(mode: .add)
            .environmentObject(DataStore())
    }
}