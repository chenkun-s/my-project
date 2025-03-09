import Foundation
import SwiftUI

enum LeaveType: String, Codable, CaseIterable {
    case sick = "病假"
    case personal = "事假"
    case other = "其他"
    
    var color: Color {
        switch self {
        case .sick:
            return .red
        case .personal:
            return .blue
        case .other:
            return .gray
        }
    }
}

struct LeaveRecord: Identifiable, Codable {
    var id = UUID()
    var student: Student
    var type: LeaveType
    var startDate: Date
    var endDate: Date
    var reason: String
    var approved: Bool = true // 默认为已批准，因为是教师直接记录
    var notes: String? // 教师备注
    
    var duration: Int {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day], from: startDate, to: endDate)
        return components.day ?? 0 + 1 // 包含开始和结束日
    }
    
    static var example: LeaveRecord {
        LeaveRecord(
            student: Student.example,
            type: .sick,
            startDate: Date(),
            endDate: Date().addingTimeInterval(86400), // 一天后
            reason: "感冒发烧",
            notes: "已通知家长"
        )
    }
}