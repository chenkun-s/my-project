import SwiftUI

struct StudentListView: View {
    @EnvironmentObject private var dataStore: DataStore
    @State private var showingAddSheet = false
    @State private var searchText = ""
    @State private var selectedGrade: String? = nil
    
    private var filteredStudents: [Student] {
        var students = dataStore.students
        
        // 按年级筛选
        if let grade = selectedGrade, !grade.isEmpty {
            students = students.filter { $0.grade == grade }
        }
        
        // 按搜索文本筛选
        if !searchText.isEmpty {
            students = students.filter { student in
                student.name.contains(searchText) ||
                student.studentId.contains(searchText) ||
                student.className.contains(searchText)
            }
        }
        
        return students
    }
    
    private var uniqueGrades: [String] {
        Array(Set(dataStore.students.map { $0.grade })).sorted()
    }
    
    var body: some View {
        NavigationView {
            VStack {
                // 筛选控件
                HStack {
                    Picker("年级", selection: $selectedGrade) {
                        Text("全部").tag(nil as String?)
                        ForEach(uniqueGrades, id: \.self) { grade in
                            Text(grade).tag(grade as String?)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                    .frame(width: 100)
                }
                .padding(.horizontal)
                
                // 搜索栏
                TextField("搜索学生姓名、学号或班级", text: $searchText)
                    .padding(7)
                    .padding(.horizontal, 25)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
                    .padding(.horizontal, 10)
                    .overlay(
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.gray)
                                .frame(minWidth: 0, maxWidth: .infinity, alignment: .leading)
                                .padding(.leading, 15)
                            
                            if !searchText.isEmpty {
                                Button(action: {
                                    self.searchText = ""
                                }) {
                                    Image(systemName: "multiply.circle.fill")
                                        .foregroundColor(.gray)
                                        .padding(.trailing, 15)
                                }
                            }
                        }
                    )
                    .padding(.bottom, 10)
                
                // 学生列表
                List {
                    ForEach(filteredStudents) { student in
                        NavigationLink(destination: StudentDetailView(student: student)) {
                            StudentRow(student: student)
                        }
                    }
                    .onDelete(perform: deleteStudent)
                }
                .listStyle(InsetGroupedListStyle())
            }
            .navigationTitle("学生管理")
            .navigationBarItems(
                leading: Button(action: {
                    // 显示导入学生信息的提示
                    // 在实际应用中，这里应该打开文件选择器
                    let newStudents = [
                        Student(name: "李四", studentId: "20230002", className: "二班", grade: "一年级"),
                        Student(name: "王五", studentId: "20230003", className: "三班", grade: "二年级")
                    ]
                    
                    let count = dataStore.importStudents(newStudents)
                    // 这里应该显示导入成功的提示
                    print("成功导入\(count)名学生")
                }) {
                    Image(systemName: "square.and.arrow.down")
                },
                trailing: Button(action: {
                    showingAddSheet = true
                }) {
                    Image(systemName: "plus")
                }
            )
            .sheet(isPresented: $showingAddSheet) {
                StudentFormView(mode: .add)
            }
        }
    }
    
    private func deleteStudent(at offsets: IndexSet) {
        dataStore.deleteStudent(at: offsets)
    }
}

struct StudentRow: View {
    let student: Student
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Text(student.name)
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
            
            Text("\(student.className) | \(student.studentId)")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            if let phone = student.phoneNumber, !phone.isEmpty {
                Text("电话: \(phone)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 5)
    }
}

struct StudentListView_Previews: PreviewProvider {
    static var previews: some View {
        StudentListView()
            .environmentObject(DataStore())
    }
}