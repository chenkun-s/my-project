import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var dataStore: DataStore
    @State private var showingExportAlert = false
    @State private var showingImportAlert = false
    @State private var showingAboutSheet = false
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("数据管理")) {
                    Button(action: {
                        showingExportAlert = true
                    }) {
                        Label("导出数据", systemImage: "square.and.arrow.up")
                    }
                    .alert(isPresented: $showingExportAlert) {
                        Alert(
                            title: Text("导出数据"),
                            message: Text("此功能将在完整版中提供，可导出Excel或CSV格式的请假记录。"),
                            dismissButton: .default(Text("确定"))
                        )
                    }
                    
                    Button(action: {
                        showingImportAlert = true
                    }) {
                        Label("导入数据", systemImage: "square.and.arrow.down")
                    }
                    .alert(isPresented: $showingImportAlert) {
                        Alert(
                            title: Text("导入数据"),
                            message: Text("此功能将在完整版中提供，可从Excel或CSV文件导入学生和请假记录。"),
                            dismissButton: .default(Text("确定"))
                        )
                    }
                }
                
                Section(header: Text("通知设置")) {
                    Toggle("请假到期提醒", isOn: .constant(true))
                    Toggle("新学期自动归档", isOn: .constant(false))
                }
                
                Section(header: Text("关于")) {
                    Button(action: {
                        showingAboutSheet = true
                    }) {
                        Label("关于应用", systemImage: "info.circle")
                    }
                    .sheet(isPresented: $showingAboutSheet) {
                        AboutView()
                    }
                    
                    HStack {
                        Text("版本")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("设置")
        }
    }
}

struct AboutView: View {
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(systemName: "doc.text.magnifyingglass")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 100, height: 100)
                    .foregroundColor(.blue)
                    .padding()
                
                Text("学生请假管理系统")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("版本 1.0.0")
                    .foregroundColor(.secondary)
                
                Divider()
                
                VStack(alignment: .leading, spacing: 10) {
                    Text("功能特点：")
                        .font(.headline)
                    
                    Text("• 学生信息管理")
                    Text("• 请假记录管理")
                    Text("• 请假统计分析")
                    Text("• 数据导入导出")
                }
                .padding()
                
                Spacer()
                
                Text("© 2023 学生请假管理系统")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding()
            }
            .padding()
            .navigationBarItems(trailing: Button("关闭") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(DataStore())
    }
}