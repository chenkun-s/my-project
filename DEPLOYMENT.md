# 学生请假管理系统 - 部署指南

## 部署到互联网

您已经成功构建了学生请假管理系统的Web版本，现在可以将其部署到互联网上供远程访问。以下是几种部署方法：

### 方法一：使用静态网站托管服务（推荐）

#### GitHub Pages（免费）

1. 在GitHub上创建一个新仓库
2. 将整个项目推送到该仓库
3. 在仓库设置中启用GitHub Pages，选择分支（通常是main或master）
4. 设置构建目录为`dist`
5. 几分钟后，您的应用将在`https://<您的用户名>.github.io/<仓库名>/`上可用

#### Netlify（免费）

1. 注册Netlify账号：https://www.netlify.com/
2. 点击"New site from Git"或直接拖放部署：
   - **方法A：Git连接**
     1. 连接您的GitHub/GitLab/Bitbucket账号
     2. 选择您的项目仓库
     3. 设置构建命令为`npm run build`（如果需要）
     4. 设置发布目录为`dist`
     5. 点击"Deploy site"
   - **方法B：直接上传（更简单）**
     1. 在Netlify控制面板中点击"Sites"标签
     2. 将您的`dist`文件夹直接拖放到指定区域
     3. 等待上传完成，Netlify会自动部署您的网站
     4. 部署完成后，您将获得一个随机生成的URL（例如：https://random-name-123456.netlify.app）
     5. 您可以在网站设置中自定义域名（可选）

#### Vercel（免费）

1. 注册Vercel账号：https://vercel.com/
2. 点击"New Project"
3. 导入您的Git仓库或直接上传项目文件
4. 设置构建命令为`npm run build`
5. 设置输出目录为`dist`
6. 点击"Deploy"

### 方法二：使用传统虚拟主机

如果您已有虚拟主机服务，只需将`dist`文件夹中的所有文件上传到您的Web服务器根目录即可。

### 方法三：使用Docker容器（适合有经验的用户）

1. 创建Dockerfile：
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
```

2. 构建Docker镜像：
```bash
docker build -t student-leave-system .
```

3. 运行容器：
```bash
docker run -d -p 80:80 student-leave-system
```

## 注意事项

- 确保您的应用使用相对路径而非绝对路径
- 如果部署后出现路由问题，请检查您的`vite.config.js`文件中的`base`配置
- 对于GitHub Pages和某些托管服务，您可能需要在`vite.config.js`中设置正确的`base`路径：

```javascript
export default {
  base: '/your-repo-name/',  // 对于GitHub Pages
  // 其他配置...
}
```

祝您部署顺利！