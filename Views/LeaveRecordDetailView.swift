import SwiftUI

struct LeaveRecordDetailView: View {
    @EnvironmentObject private var dataStore: DataStore
    @Environment(\.presentationMode) var presentationMode
    @State private var showingEditSheet = false
    
    let record: LeaveRecord
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // 学生信息卡片
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("学生信息")
                            .font(.headline)
                        Spacer()
                        Text(record.type.rawValue)
                            .font(.subheadline)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(record.type.color.opacity(0.2))
                            .foregroundColor(record.type.color)
                            .cornerRadius(5)
                    }
                    
                    Divider()
                    
                    HStack {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("姓名: \(record.student.name)")
                            Text("学号: \(record.student.studentId)")
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .leading, spacing: 5) {
                            Text("班级: \(record.student.className)")
                            Text("年级: \(record.student.grade)")
                        }
                    }
                    
                    if let phone = record.student.phoneNumber, !phone.isEmpty {
                        Text("电话: \(phone)")
                    }
                    
                    if let parentName = record.student.parentName, !parentName.isEmpty {
                        Text("家长姓名: \(parentName)")
                    }
                    
                    if let parentPhone = record.student.parentPhone, !parentPhone.isEmpty {
                        Text("家长电话: \(parentPhone)")
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(10)
                .shadow(color: Color.black.opacity(0.1), radius: 5)
                
                // 请假信息卡片
                VStack(alignment: .leading, spacing: 10) {
                    Text("请假信息")
                        .font(.headline)
                    
                    Divider()
                    
                    Text("请假类型: \(record.type.rawValue)")
                    Text("开始日期: \(formatDate(record.startDate, withFormat: "yyyy年MM月dd日"))")
                    Text("结束日期: \(formatDate(record.endDate, withFormat: "yyyy年MM月dd日"))")
                    Text("请假天数: \(record.duration)天")
                    Text("请假原因: \(record.reason)")
                    
                    if let notes = record.notes, !notes.isEmpty {
                        Text("教师备注: \(notes)")
                    }
                    
                    Text("状态: \(record.approved ? "已批准" : "未批准")")
                        .foregroundColor(record.approved ? .green : .red)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(10)
                .shadow(color: Color.black.opacity(0.1), radius: 5)
            }
            .padding()
        }
        .navigationTitle("请假详情")
        .navigationBarItems(trailing: Button(action: {
            showingEditSheet = true
        }) {
            Text("编辑")
        })
        .sheet(isPresented: $showingEditSheet) {
            LeaveRecordFormView(mode: .edit(record))
        }
        .background(Color(.systemGroupedBackground).edgesIgnoringSafeArea(.all))
    }
    
    private func formatDate(_ date: Date, withFormat format: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = format
        return formatter.string(from: date)
    }
}

struct LeaveRecordDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            LeaveRecordDetailView(record: LeaveRecord.example)
                .environmentObject(DataStore())
        }
    }
}