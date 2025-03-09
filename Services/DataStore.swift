import Foundation
import Combine

class DataStore: ObservableObject {
    @Published var students: [Student] = []
    @Published var leaveRecords: [LeaveRecord] = []
    
    private let studentsKey = "students"
    private let leaveRecordsKey = "leaveRecords"
    
    init() {
        loadData()
    }
    
    // MARK: - 数据加载与保存
    
    private func loadData() {
        students = loadFromUserDefaults(forKey: studentsKey) ?? [Student.example]
        leaveRecords = loadFromUserDefaults(forKey: leaveRecordsKey) ?? [LeaveRecord.example]
    }
    
    private func saveData() {
        saveToUserDefaults(students, forKey: studentsKey)
        saveToUserDefaults(leaveRecords, forKey: leaveRecordsKey)
    }
    
    private func loadFromUserDefaults<T: Decodable>(forKey key: String) -> T? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        
        do {
            let decoder = JSONDecoder()
            return try decoder.decode(T.self, from: data)
        } catch {
            print("从UserDefaults加载数据失败: \(error)")
            return nil
        }
    }
    
    private func saveToUserDefaults<T: Encodable>(_ value: T, forKey key: String) {
        do {
            let encoder = JSONEncoder()
            let data = try encoder.encode(value)
            UserDefaults.standard.set(data, forKey: key)
        } catch {
            print("保存数据到UserDefaults失败: \(error)")
        }
    }
    
    // MARK: - 学生管理
    
    func addStudent(_ student: Student) {
        students.append(student)
        saveData()
    }
    
    func importStudents(_ newStudents: [Student]) -> Int {
        let originalCount = students.count
        students.append(contentsOf: newStudents)
        saveData()
        return students.count - originalCount
    }
    
    func updateStudent(_ student: Student) {
        if let index = students.firstIndex(where: { $0.id == student.id }) {
            students[index] = student
            
            // 更新相关的请假记录
            for i in 0..<leaveRecords.count {
                if leaveRecords[i].student.id == student.id {
                    leaveRecords[i].student = student
                }
            }
            
            saveData()
        }
    }
    
    func deleteStudent(at indexSet: IndexSet) {
        let studentsToDelete = indexSet.map { students[$0] }
        students.remove(atOffsets: indexSet)
        
        // 删除相关的请假记录
        for student in studentsToDelete {
            leaveRecords.removeAll { $0.student.id == student.id }
        }
        
        saveData()
    }
    
    // MARK: - 请假记录管理
    
    func addLeaveRecord(_ record: LeaveRecord) {
        leaveRecords.append(record)
        saveData()
    }
    
    func updateLeaveRecord(_ record: LeaveRecord) {
        if let index = leaveRecords.firstIndex(where: { $0.id == record.id }) {
            leaveRecords[index] = record
            saveData()
        }
    }
    
    func deleteLeaveRecord(at indexSet: IndexSet) {
        leaveRecords.remove(atOffsets: indexSet)
        saveData()
    }
    
    // MARK: - 数据筛选
    
    func leaveRecords(forClass className: String?) -> [LeaveRecord] {
        guard let className = className, !className.isEmpty else {
            return leaveRecords
        }
        
        return leaveRecords.filter { $0.student.className == className }
    }
    
    func leaveRecords(forType type: LeaveType?) -> [LeaveRecord] {
        guard let type = type else {
            return leaveRecords
        }
        
        return leaveRecords.filter { $0.type == type }
    }
    
    func leaveRecords(forDateRange start: Date, end: Date) -> [LeaveRecord] {
        return leaveRecords.filter { record in
            // 检查请假时间段是否与给定日期范围有重叠
            return (record.startDate <= end && record.endDate >= start)
        }
    }
    
    // MARK: - 统计分析
    
    func leaveCountByType() -> [LeaveType: Int] {
        var counts: [LeaveType: Int] = [:]
        
        for type in LeaveType.allCases {
            counts[type] = leaveRecords.filter { $0.type == type }.count
        }
        
        return counts
    }
    
    func leaveCountByClass() -> [String: Int] {
        var counts: [String: Int] = [:]
        
        let classNames = Set(students.map { $0.className })
        for className in classNames {
            counts[className] = leaveRecords.filter { $0.student.className == className }.count
        }
        
        return counts
    }
}