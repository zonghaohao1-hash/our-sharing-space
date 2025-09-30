# 我们的分享空间 - 部署指南

## 第一步：注册 Firebase

1. 访问 https://firebase.google.com
2. 用Gmail账号登录
3. 点击"创建项目"
   - 项目名称: `our-sharing-space` (或其他您喜欢的名字)
   - 不需要启用Google Analytics
4. 创建完成后，点击项目进入控制台

## 第二步：配置 Firestore 数据库

1. 在Firebase控制台，点击左侧菜单"Firestore Database"
2. 点击"创建数据库"
3. 选择"以测试模式启动"（这样在开发阶段无需认证）
4. 选择位置: `asia-east1` (台湾) 或 `asia-northeast1` (东京)
5. 点击"完成"

## 第三步：获取 Firebase 配置信息

1. 在Firebase控制台，点击左侧菜单"项目设置"（齿轮图标）
2. 在"您的应用"部分，点击"</>" 图标添加Web应用
3. 应用昵称: `web-app`
4. 不需要设置Firebase Hosting
5. 点击"注册应用"
6. 复制 `firebaseConfig` 配置对象（包含apiKey等字段）

## 第四步：更新配置文件

1. 用文本编辑器打开 `firebase-config.js` 文件
2. 找到 `const firebaseConfig = { ... }` 部分
3. 用您在第三步复制的配置替换其中的内容
4. 保存文件

## 第五步：创建 GitHub 仓库

1. 访问 https://github.com
2. 注册账号（如果还没有）
3. 点击右上角"+" → "New repository"
4. 仓库名称: `our-sharing-space`
5. 选择"Public"
6. 点击"Create repository"

## 第六步：上传文件到 GitHub

1. 在刚创建的仓库页面，点击"Add file" → "Upload files"
2. 将三个文件（index.html, firebase-config.js, README.md）拖拽到上传区域
3. 点击"Commit changes"

## 第七步：部署到 Vercel

1. 访问 https://vercel.com
2. 用GitHub账号登录
3. 点击"Add New..." → "Project"
4. 选择您刚创建的 `our-sharing-space` 仓库
5. 点击"Import"
6. 所有配置保持默认，点击"Deploy"
7. 等待部署完成（约2分钟）

## 第八步：获取访问链接

1. 部署完成后，Vercel会提供一个链接，如：`our-sharing-space.vercel.app`
2. 复制这个链接分享给您的朋友

## 使用说明

- 打开链接即可使用
- 选择身份（"我"或"朋友"）后发布内容
- 点击"刷新内容"按钮查看最新发布
- 所有内容会自动保存

## 故障排除

如果遇到问题：
1. 检查Firebase配置信息是否正确
2. 确认Firestore数据库已创建
3. 刷新页面重试
4. 检查浏览器控制台错误信息（按F12）

## 注意事项

- 当前为测试模式，任何人都可以读写数据
- 如需更安全，可在Firebase控制台设置安全规则
- 定期备份重要内容