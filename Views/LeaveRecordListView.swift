import SwiftUI

struct LeaveRecordListView: View {
    @EnvironmentObject private var dataStore: DataStore
    @State private var showingAddSheet = false
    @State private var selectedFilter: LeaveType? = nil
    @State private var selectedClass: String? = nil
    @State private var searchText = ""
    
    private var filteredRecords: [LeaveRecord] {
        var records = dataStore.leaveRecords
        
        // 按类型筛选
        if let type = selectedFilter {
            records = records.filter { $0.type == type }
        }
        
        // 按班级筛选
        if let className = selectedClass, !className.isEmpty {
            records = records.filter { $0.student.className == className }
        }
        
        // 按搜索文本筛选
        if !searchText.isEmpty {
            records = records.filter { record in
                record.student.name.contains(searchText) ||
                record.student.studentId.contains(searchText) ||
                record.reason.contains(searchText)
            }
        }
        
        return records
    }
    
    private var uniqueClassNames: [String] {
        Array(Set(dataStore.students.map { $0.className })).sorted()
    }
    
    var body: some View {
        NavigationView {
            VStack {
                // 筛选控件
                HStack {
                    Picker("类型", selection: $selectedFilter) {
                        Text("全部").tag(nil as LeaveType?)
                        ForEach(LeaveType.allCases, id: \.self) { type in
                            Text(type.rawValue).tag(type as LeaveType?)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                    .frame(width: 100)
                    
                    Picker("班级", selection: $selectedClass) {
                        Text("全部").tag(nil as String?)
                        ForEach(uniqueClassNames, id: \.self) { className in
                            Text(className).tag(className as String?)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                    .frame(width: 100)
                }
                .padding(.horizontal)
                
                // 搜索栏
                TextField("搜索学生姓名或请假原因", text: $searchText)
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
                
                // 请假记录列表
                List {
                    ForEach(filteredRecords) { record in
                        NavigationLink(destination: LeaveRecordDetailView(record: record)) {
                            LeaveRecordRow(record: record)
                        }
                    }
                    .onDelete(perform: deleteRecord)
                }
                .listStyle(InsetGroupedListStyle())
            }
            .navigationTitle("请假记录")
            .navigationBarItems(
                trailing: Button(action: {
                    showingAddSheet = true
                }) {
                    Image(systemName: "plus")
                }
            )
            .sheet(isPresented: $showingAddSheet) {
                LeaveRecordFormView(mode: .add)
            }
        }
    }
    
    private func deleteRecord(at offsets: IndexSet) {
        // 获取要删除的记录在原始数组中的索引
        let recordsToDelete = offsets.map { filteredRecords[$0] }
        
        for record in recordsToDelete {
            if let index = dataStore.leaveRecords.firstIndex(where: { $0.id == record.id }) {
                dataStore.leaveRecords.remove(at: index)
            }
        }
        
        dataStore.saveData()
    }
}

struct LeaveRecordRow: View {
    let record: LeaveRecord
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Text(record.student.name)
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
            
            Text("\(record.student.className) | \(record.student.studentId)")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Text("请假时间: \(formatDate(record.startDate)) - \(formatDate(record.endDate))")
                .font(.subheadline)
            
            Text("原因: \(record.reason)")
                .font(.subheadline)
                .lineLimit(1)
        }
        .padding(.vertical, 5)
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MM-dd"
        return formatter.string(from: date)
    }
}

struct LeaveRecordListView_Previews: PreviewProvider {
    static var previews: some View {
        LeaveRecordListView()
            .environmentObject(DataStore())
    }
}