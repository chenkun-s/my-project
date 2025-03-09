# Netlify部署指南 - 学生请假管理系统

本指南将帮助您使用Netlify的直接上传方法（拖放部署）将您的学生请假管理系统部署到互联网上。这是最简单的部署方式，不需要Git知识，只需简单的拖放操作即可完成。

## 准备工作

1. 确保您已经成功构建了应用（您的项目中已有`dist`文件夹）
2. 如果尚未构建，请运行以下命令：
   ```
   npm run build
   ```

## 部署步骤

### 1. 注册Netlify账号

1. 访问 [Netlify官网](https://www.netlify.com/)
2. 点击右上角的"Sign up"按钮
3. 选择您喜欢的注册方式（GitHub、GitLab、Bitbucket、Email）
4. 按照提示完成注册流程

### 2. 登录Netlify

1. 使用您刚刚创建的账号登录Netlify
2. 登录后，您将进入Netlify的控制面板

### 3. 创建新站点（直接上传方法）

1. 在Netlify控制面板中，点击"Sites"标签
2. 在页面中找到拖放区域（通常显示为"Drag and drop your site folder here"）
3. 打开您的项目文件夹，找到`dist`文件夹
4. 将整个`dist`文件夹直接拖放到Netlify的拖放区域
5. 等待上传完成，Netlify会自动开始部署您的网站

### 4. 访问您的网站

1. 部署完成后，Netlify会自动为您的网站分配一个随机域名（例如：https://random-name-123456.netlify.app）
2. 您可以点击生成的链接来访问您的网站

### 5. 自定义域名（可选）

如果您想使用自己的域名，而不是Netlify提供的随机域名：

1. 在您的网站控制面板中，点击"Site settings"
2. 找到"Domain management"部分
3. 点击"Add custom domain"
4. 输入您拥有的域名
5. 按照Netlify提供的DNS配置说明进行设置

### 6. 处理路由问题（如果需要）

如果您的应用使用了前端路由（如React Router），您可能需要配置Netlify的重定向规则：

1. 在您的项目根目录创建一个名为`_redirects`的文件（没有扩展名）
2. 在文件中添加以下内容：
   ```
   /* /index.html 200
   ```
3. 将此文件放入您的`dist`文件夹中
4. 重新部署您的网站

或者，您可以在`dist`文件夹中创建一个`netlify.toml`文件，内容如下：
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 结论

恭喜！您已成功将学生请假管理系统部署到Netlify上。现在，您的应用可以通过互联网访问，任何人都可以使用您提供的URL来访问您的系统。

如果您在部署过程中遇到任何问题，请参考[Netlify官方文档](https://docs.netlify.com/)或在Netlify社区论坛寻求帮助。