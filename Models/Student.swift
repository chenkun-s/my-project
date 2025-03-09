import Foundation
import SwiftUI

struct Student: Identifiable, Codable {
    var id = UUID()
    var name: String
    var studentId: String
    var className: String
    var grade: String
    
    // 可选信息
    var phoneNumber: String?
    var parentName: String?
    var parentPhone: String?
    
    static var example: Student {
        Student(name: "张三", studentId: "20230001", className: "一班", grade: "一年级")
    }
}