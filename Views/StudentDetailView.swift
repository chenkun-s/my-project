import SwiftUI

struct StudentDetailView: View {
    @EnvironmentObject private var dataStore: DataStore
    @Environment(\.presentationMode) var presentationMode
    @State private var showingEditSheet = false
    
    let student: Student
    
    // 获取该学生的所有请假记录
    private var studentLeaveRecords: [LeaveRecord] {
        dataStore.leaveRecords.filter { $0.student.id == student.id }
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // 学生信息卡片
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("学生信息")
                            .font(.headline)
                        Spacer()
                        Text(student.grade)
                            .font(.subheadline)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.blue.opacity(0.2))
                            .foregroundColor(.blue)
                            .cornerRadius(5)
                    }
                    
                    Divider()
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("姓名: \(student.name)")
                        Text("学号: \(student.studentId)")
                        Text("班级: \(student.className)")
                        Text("年级: \(student.grade)")
                        
                        if let phone = student.phoneNumber, !phone.isEmpty {
                            Text("电话: \(phone)")
                        }
                        
                        if let parentName = student.parentName, !parentName.isEmpty {
                            Text("家长姓名: \(parentName)")
                        }
                        
                        if let parentPhone = student.parentPhone, !parentPhone.isEmpty {
                            Text("家长电话: \(parentPhone)")
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(10)
                .shadow(color: Color.black.opacity(0.1), radius: 5)
                
                // 请假记录卡片
                VStack(alignment: .leading, spacing: 10) {
                    Text("请假记录")
                        .font(.headline)
                    
                    Divider()
                    
                    if studentLeaveRecords.isEmpty {
                        Text("暂无请假记录")
                            .foregroundColor(.secondary)
                            .padding(.vertical, 10)
                    } else {
                        ForEach(studentLeaveRecords) { record in
                            NavigationLink(destination: LeaveRecordDetailView(record: record)) {
                                VStack(alignment: .leading, spacing: 5) {
                                    HStack {
                                        Text(formatDate(record.startDate) + " - " + formatDate(record.endDate))
                                            .font(.subheadline)
                                        
                                        Spacer()
                                        
                                        Text(record.type.rawValue)
                                            .font(.caption)
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(record.type.color.opacity(0.2))
                                            .foregroundColor(record.type.color)
                                            .cornerRadius(4)
                                    }
                                    
                                    Text("原因: \(record.reason)")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                        .lineLimit(1)
                                }
                                .padding(.vertical, 5)
                            }
                            .buttonStyle(PlainButtonStyle())
                            
                            if studentLeaveRecords.last?.id != record.id {
                                Divider()
                            }
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(10)
                .shadow(color: Color.black.opacity(0.1), radius: 5)
                
                // 请假统计卡片
                VStack(alignment: .leading, spacing: 10) {
                    Text("请假统计")
                        .font(.headline)
                    
                    Divider()
                    
                    HStack {
                        VStack {
                            Text("\(studentLeaveRecords.count)")
                                .font(.title)
                                .fontWeight(.bold)
                            Text("总次数")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                        
                        Divider()
                            .frame(height: 40)
                        
                        VStack {
                            Text("\(totalLeaveDays)")
                                .font(.title)
                                .fontWeight(.bold)
                            Text("总天数")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                        
                        Divider()
                            .frame(height: 40)
                        
                        VStack {
                            Text("\(sickLeaveCount)")
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(.red)
                            Text("病假次数")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(10)
                .shadow(color: Color.black.opacity(0.1), radius: 5)
            }
            .padding()
        }
        .navigationTitle(student.name)
        .navigationBarItems(trailing: Button(action: {
            showingEditSheet = true
        }) {
            Text("编辑")
        })
        .sheet(isPresented: $showingEditSheet) {
            StudentFormView(mode: .edit(student))
        }
        .background(Color(.systemGroupedBackground).edgesIgnoringSafeArea(.all))
    }
    
    private var totalLeaveDays: Int {
        studentLeaveRecords.reduce(0) { $0 + $1.duration }
    }
    
    private var sickLeaveCount: Int {
        studentLeaveRecords.filter { $0.type == .sick }.count
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MM-dd"
        return formatter.string(from: date)
    }
}

struct StudentDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            StudentDetailView(student: Student.example)
                .environmentObject(DataStore())
        }
    }
}