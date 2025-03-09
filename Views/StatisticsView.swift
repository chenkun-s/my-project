import SwiftUI

struct StatisticsView: View {
    @EnvironmentObject private var dataStore: DataStore
    @State private var selectedTimeRange: TimeRange = .month
    
    enum TimeRange: String, CaseIterable {
        case week = "本周"
        case month = "本月"
        case semester = "本学期"
        case all = "全部"
        
        var dateRange: (Date, Date) {
            let now = Date()
            let calendar = Calendar.current
            
            switch self {
            case .week:
                let startOfWeek = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: now))!
                return (startOfWeek, now)
            case .month:
                let components = calendar.dateComponents([.year, .month], from: now)
                let startOfMonth = calendar.date(from: components)!
                return (startOfMonth, now)
            case .semester:
                // 假设学期从9月1日或2月1日开始
                let year = calendar.component(.year, from: now)
                let month = calendar.component(.month, from: now)
                
                let startDate: Date
                if month >= 9 || month < 2 {
                    // 第一学期 (9月-次年1月)
                    let startYear = month >= 9 ? year : year - 1
                    let startComponents = DateComponents(year: startYear, month: 9, day: 1)
                    startDate = calendar.date(from: startComponents)!
                } else {
                    // 第二学期 (2月-6月)
                    let startComponents = DateComponents(year: year, month: 2, day: 1)
                    startDate = calendar.date(from: startComponents)!
                }
                
                return (startDate, now)
            case .all:
                // 返回一个很早的日期作为开始
                let distantPast = Date.distantPast
                return (distantPast, now)
            }
        }
    }
    
    private var filteredRecords: [LeaveRecord] {
        let (startDate, endDate) = selectedTimeRange.dateRange
        return dataStore.leaveRecords(forDateRange: startDate, end: endDate)
    }
    
    private var leaveCountByType: [LeaveType: Int] {
        var counts: [LeaveType: Int] = [:]
        
        for type in LeaveType.allCases {
            counts[type] = filteredRecords.filter { $0.type == type }.count
        }
        
        return counts
    }
    
    private var leaveCountByClass: [String: Int] {
        var counts: [String: Int] = [:]
        
        let classNames = Set(dataStore.students.map { $0.className })
        for className in classNames {
            counts[className] = filteredRecords.filter { $0.student.className == className }.count
        }
        
        return counts.filter { $0.value > 0 } // 只显示有请假记录的班级
    }
    
    private var totalLeaveDays: Int {
        filteredRecords.reduce(0) { $0 + $1.duration }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // 时间范围选择器
                    Picker("时间范围", selection: $selectedTimeRange) {
                        ForEach(TimeRange.allCases, id: \.self) { range in
                            Text(range.rawValue).tag(range)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .padding(.horizontal)
                    
                    // 总览卡片
                    VStack(alignment: .leading, spacing: 10) {
                        Text("总览")
                            .font(.headline)
                        
                        Divider()
                        
                        HStack(spacing: 20) {
                            StatCard(title: "请假总人次", value: "\(filteredRecords.count)")
                            StatCard(title: "请假总天数", value: "\(totalLeaveDays)")
                        }
                        
                        HStack(spacing: 20) {
                            StatCard(title: "病假人次", value: "\(leaveCountByType[.sick] ?? 0)", color: .red)
                            StatCard(title: "事假人次", value: "\(leaveCountByType[.personal] ?? 0)", color: .blue)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(10)
                    .shadow(color: Color.black.opacity(0.1), radius: 5)
                    .padding(.horizontal)
                    
                    // 请假类型分布
                    VStack(alignment: .leading, spacing: 10) {
                        Text("请假类型分布")
                            .font(.headline)
                        
                        Divider()
                        
                        HStack(spacing: 0) {
                            ForEach(LeaveType.allCases, id: \.self) { type in
                                let count = leaveCountByType[type] ?? 0
                                let total = filteredRecords.count
                                let percentage = total > 0 ? Double(count) / Double(total) : 0
                                
                                VStack {
                                    Text("\(Int(percentage * 100))%")
                                        .font(.headline)
                                    Text(type.rawValue)
                                        .font(.caption)
                                    
                                    RoundedRectangle(cornerRadius: 5)
                                        .fill(type.color)
                                        .frame(width: 30, height: 100 * CGFloat(percentage))
                                        .padding(.top, 5)
                                    
                                    Text("\(count)次")
                                        .font(.caption)
                                }
                                .frame(maxWidth: .infinity)
                            }
                        }
                        .padding(.top, 10)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(10)
                    .shadow(color: Color.black.opacity(0.1), radius: 5)
                    .padding(.horizontal)
                    
                    // 班级请假情况
                    if !leaveCountByClass.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("班级请假情况")
                                .font(.headline)
                            
                            Divider()
                            
                            ForEach(leaveCountByClass.sorted(by: { $0.key < $1.key }), id: \.key) { className, count in
                                HStack {
                                    Text(className)
                                    Spacer()
                                    Text("\(count)次")
                                        .foregroundColor(.secondary)
                                }
                                
                                ProgressBar(value: Double(count) / Double(leaveCountByClass.values.max() ?? 1))
                                    .frame(height: 10)
                                    .padding(.bottom, 5)
                            }
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(10)
                        .shadow(color: Color.black.opacity(0.1), radius: 5)
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("统计分析")
            .background(Color(.systemGroupedBackground).edgesIgnoringSafeArea(.all))
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    var color: Color = .primary
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(value)
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(10)
    }
}

struct ProgressBar: View {
    var value: Double // 0.0 to 1.0
    var color: Color = .blue
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                Rectangle()
                    .frame(width: geometry.size.width, height: geometry.size.height)
                    .opacity(0.3)
                    .foregroundColor(color)
                
                Rectangle()
                    .frame(width: min(CGFloat(self.value) * geometry.size.width, geometry.size.width), height: geometry.size.height)
                    .foregroundColor(color)
            }
            .cornerRadius(45)
        }
    }
}

struct StatisticsView_Previews: PreviewProvider {
    static var previews: some View {
        StatisticsView()
            .environmentObject(DataStore())
    }
}