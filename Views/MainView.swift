import SwiftUI

struct MainView: View {
    @StateObject private var dataStore = DataStore()
    
    var body: some View {
        TabView {
            LeaveRecordListView()
                .tabItem {
                    Label("请假记录", systemImage: "list.bullet")
                }
            
            StudentListView()
                .tabItem {
                    Label("学生管理", systemImage: "person.3")
                }
            
            StatisticsView()
                .tabItem {
                    Label("统计分析", systemImage: "chart.bar")
                }
            
            SettingsView()
                .tabItem {
                    Label("设置", systemImage: "gear")
                }
        }
        .environmentObject(dataStore)
    }
}

struct MainView_Previews: PreviewProvider {
    static var previews: some View {
        MainView()
    }
}