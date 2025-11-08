# 音频分享应用

一个支持音频上传、播放和播放次数限制的Web应用。每个上传的音频最多可播放5次，超过后将自动删除。

## 功能特性

- 🎵 **音频上传**：支持MP3、WAV等常见音频格式上传
- ⏯️ **音频播放**：内置音频播放器，支持播放/暂停控制
- 🔒 **播放限制**：每个音频最多可播放5次，超过次数自动删除
- 📱 **响应式设计**：适配各种屏幕尺寸，支持移动设备
- 🎨 **现代UI**：使用Tailwind CSS构建的美观界面
- 📁 **本地存储**：使用localStorage存储音频数据
- 🎯 **拖放支持**：支持拖放上传音频文件

## 技术栈

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (原生)

## 快速开始

由于这是一个纯静态网站，您可以直接在浏览器中打开`index.html`文件使用：

1. 双击`index.html`文件
2. 或者使用任何静态文件服务器，如：
   - VS Code的Live Server插件
   - Python的`python -m http.server`
   - Node.js的`http-server`

## 部署到GitHub Pages

要将此项目部署到GitHub Pages，请按照以下步骤操作：

### 步骤1：创建GitHub仓库

1. 登录GitHub账号
2. 点击右上角的"+"图标，选择"New repository"
3. 填写仓库名称（例如：`audio-sharing-app`）
4. 选择仓库可见性（公开或私有）
5. 点击"Create repository"

### 步骤2：上传项目文件

1. 在新创建的仓库页面，点击"Add file" -> "Upload files"
2. 将项目文件夹中的所有文件（`index.html`, `style.css`, `script.js`, `.gitignore`, `README.md`）拖放到上传区域
3. 填写提交信息（例如："Initial commit"）
4. 点击"Commit changes"

### 步骤3：启用GitHub Pages

1. 在仓库页面，点击"Settings"选项卡
2. 向下滚动到"Pages"部分
3. 在"Source"下拉菜单中选择：
   - 分支：`main`（或`master`，取决于您的默认分支）
   - 文件夹：`/(root)`
4. 点击"Save"
5. 等待几分钟，您的网站将在`https://[your-username].github.io/[repository-name]/`上可用

## 使用说明

1. **上传音频**：
   - 点击"选择音频文件"按钮
   - 或者直接将音频文件拖放到上传区域
   - 支持的格式：MP3, WAV, OGG, WEBM
   - 文件大小限制：50MB

2. **播放音频**：
   - 在音频列表中找到您要播放的音频
   - 点击播放按钮开始播放
   - 每个音频最多可播放5次

3. **删除音频**：
   - 点击音频卡片上的删除图标可以手动删除音频

4. **清空所有**：
   - 点击"清空所有音频"按钮可以删除所有上传的音频

## 注意事项

- 音频数据存储在浏览器的localStorage中，每个浏览器的存储空间有限（通常约5MB）
- 清除浏览器缓存或使用不同的浏览器/设备将无法访问已上传的音频
- 音频文件会被转换为Base64编码存储，这可能会增加文件大小约33%
- 对于较大的音频文件，上传和加载可能需要一些时间

## 浏览器兼容性

- Chrome 42+
- Firefox 39+
- Safari 10+
- Edge 12+

## 开发说明

如果您想进一步开发此项目：

1. 克隆或下载项目文件
2. 使用任何代码编辑器（如VS Code）打开项目
3. 直接修改HTML、CSS和JavaScript文件
4. 在浏览器中刷新查看更改

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request！