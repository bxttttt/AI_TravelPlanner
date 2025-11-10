# AI旅行规划师课程作业

GitHub 仓库地址: https://github.com/bxttttt/AI_TravelPlanner

---

# 🗺️ AI旅行规划师 (AI Travel Planner)

一个基于人工智能的智能旅行规划系统，使用阿里云百炼API生成个性化的旅行计划。

## ✨ 主要功能

- 🤖 **智能AI规划**: 使用阿里云百炼通义千问模型生成个性化旅行计划
- 📅 **多日行程安排**: 支持多天旅行规划，合理安排每日活动
- 💰 **智能预算分配**: 自动分配交通、住宿、餐饮、景点、购物预算
- 🎯 **个性化推荐**: 根据用户偏好生成餐厅、景点、实用贴士推荐
- 🎤 **语音输入**: 支持语音输入旅行需求
- 📱 **响应式设计**: 适配各种设备屏幕
- 🔄 **实时状态**: 显示AI调用状态和进度

## 🚀 技术栈

- **后端**: Node.js + Express.js
- **前端**: HTML + Tailwind CSS + JavaScript
- **AI服务**: 阿里云百炼通义千问模型
- **数据库**: 内存存储（可扩展为MongoDB）

## 📦 安装和运行

### 环境要求
- Node.js 14.0 或更高版本
- npm 或 yarn

### 快速开始

1. **克隆项目**
```bash
git clone https://github.com/bxttttt/AI_TravelPlanner.git
cd AI_TravelPlanner
```

2. **安装依赖**
```bash
npm install express cors axios
```

3. **配置API Key**
在 `server-test.js` 文件中，将您的阿里云百炼API Key替换：
```javascript
const apiKey = 'your-aliyun-bailian-api-key';
```

4. **启动服务器**
```bash
PORT=3001 node server-test.js
```

5. **访问应用**
打开浏览器访问: http://localhost:3001

## 🔧 配置说明

### API Key配置
1. 获取阿里云百炼API Key
2. 在 `server-test.js` 中替换 `apiKey` 变量
3. 重启服务器

### 超时设置
- AI调用超时: 2分钟 (120秒)
- 支持降级处理，确保系统稳定性

## 📱 使用指南

### 创建旅行规划
1. 填写目的地、出发日期、返回日期
2. 设置预算和同行人数
3. 输入旅行偏好（如：美食、动漫、购物等）
4. 点击"生成旅行规划"按钮
5. 等待AI生成结果（通常1-2分钟）

### 管理旅行计划
- **查看详情**: 点击"查看详情"查看完整行程安排
- **编辑计划**: 点击"编辑"修改旅行计划
- **删除计划**: 点击"删除"移除不需要的计划

## 🎯 功能特性

### AI智能规划
- 根据用户偏好生成个性化行程
- 合理安排每日活动（2-4个主要活动）
- 智能预算分配和费用估算
- 提供实用的旅行贴士

### 用户体验
- 实时显示AI调用状态
- 支持语音输入需求
- 响应式界面设计
- 完整的CRUD操作

### 系统稳定性
- 2分钟超时机制
- 降级处理确保服务可用
- 完善的错误处理
- 用户友好的提示信息

## 🔍 API接口

### 旅行规划相关
- `POST /api/ai/generate-trip-rag` - 生成AI旅行规划
- `POST /api/trips` - 创建旅行计划
- `GET /api/trips` - 获取旅行计划列表
- `GET /api/trips/:id` - 获取单个旅行计划
- `PUT /api/trips/:id` - 更新旅行计划
- `DELETE /api/trips/:id` - 删除旅行计划

## 📊 项目结构

```
AI_TravelPlanner/
├── public/
│   └── index.html          # 前端页面
├── server-test.js          # 主服务器文件
├── server-simple.js       # 备用服务器文件
├── package.json           # 项目依赖
└── README.md              # 项目说明
```

## 🛠️ 开发说明

### 本地开发
1. 修改代码后重启服务器
2. 使用浏览器开发者工具调试前端
3. 查看控制台日志了解API调用状态

### 部署建议
- 使用PM2管理Node.js进程
- 配置Nginx反向代理
- 使用MongoDB替代内存存储
- 配置环境变量管理API Key

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 阿里云百炼平台提供AI能力
- Tailwind CSS提供样式框架
- Express.js提供后端框架

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues: [项目Issues页面](https://github.com/bxttttt/AI_TravelPlanner/issues)
- Email: [您的邮箱]

---

⭐ 如果这个项目对您有帮助，请给个Star支持一下！