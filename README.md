# AI旅行规划师 (AI Travel Planner)

一个基于AI的智能旅行规划Web应用，支持语音输入、智能行程生成、费用管理和云端同步。

## 🌟 核心功能

### 1. 智能行程规划
- **语音输入**：支持语音输入旅行需求，AI智能理解并生成个性化行程
- **AI规划**：基于OpenAI GPT模型，自动生成详细的旅行路线和建议
- **个性化推荐**：根据用户偏好、预算、时间等因素定制行程

### 2. 费用预算与管理
- **智能预算分析**：AI分析预算分配，提供合理的费用建议
- **实时费用记录**：支持语音和手动记录旅行开销
- **预算监控**：实时显示已花费和剩余预算

### 3. 用户管理与数据存储
- **用户注册登录**：安全的用户认证系统
- **多计划管理**：保存和管理多份旅行计划
- **云端同步**：数据云端存储，支持多设备访问

### 4. 设置与配置
- **API Key管理**：用户可配置自己的OpenAI API Key
- **多语言支持**：支持中文、英文、日文、韩文
- **货币设置**：支持多种货币单位

## 🚀 快速开始

### 方法一：使用Docker（推荐）

1. **克隆项目**
```bash
git clone https://github.com/your-username/ai-travel-planner.git
cd ai-travel-planner
```

2. **配置环境变量**
```bash
cp env.example .env
# 编辑 .env 文件，设置您的配置
```

3. **启动服务**
```bash
docker-compose up -d
```

4. **访问应用**
打开浏览器访问：http://localhost:5000

### 方法二：本地开发

1. **安装依赖**
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

2. **配置环境**
```bash
cp env.example .env
# 编辑 .env 文件
```

3. **启动MongoDB**
```bash
# 使用Docker启动MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

4. **启动应用**
```bash
# 启动后端服务
npm run dev

# 在另一个终端启动前端服务
cd client
npm start
```

## 📋 环境配置

### 必需的环境变量

```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/ai-travel-planner

# JWT密钥（生产环境请使用强密钥）
JWT_SECRET=your_jwt_secret_key_here

# OpenAI API配置（用户可在设置中配置）
OPENAI_API_KEY=your_openai_api_key_here

# 服务器配置
PORT=5000
NODE_ENV=development

# 前端URL
CLIENT_URL=http://localhost:3000
```

### OpenAI API Key 获取

1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 注册/登录账户
3. 创建新的API Key
4. 在应用设置中配置API Key

## 🛠️ 技术栈

### 后端
- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **MongoDB** - 数据库
- **Mongoose** - ODM
- **JWT** - 身份认证
- **OpenAI API** - AI服务
- **Socket.io** - 实时通信

### 前端
- **React** - UI框架
- **React Router** - 路由管理
- **Tailwind CSS** - 样式框架
- **Axios** - HTTP客户端
- **React Hot Toast** - 通知组件
- **Web Speech API** - 语音识别

### 部署
- **Docker** - 容器化
- **Docker Compose** - 多容器编排

## 📱 功能截图

### 主页面
- 现代化的响应式设计
- 功能特性介绍
- 使用流程说明

### 语音输入
- 实时语音识别
- 智能信息提取
- 语音转文字显示

### 行程规划
- AI智能生成行程
- 详细的活动安排
- 费用预算建议

### 费用管理
- 实时费用记录
- 预算监控
- 费用分类统计

## 🔧 API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取用户信息
- `PUT /api/auth/settings` - 更新用户设置

### 旅行计划接口
- `GET /api/trips` - 获取用户所有旅行计划
- `POST /api/trips` - 创建新的旅行计划
- `GET /api/trips/:id` - 获取单个旅行计划
- `PUT /api/trips/:id` - 更新旅行计划
- `DELETE /api/trips/:id` - 删除旅行计划

### AI服务接口
- `POST /api/ai/generate-trip` - AI生成旅行计划
- `POST /api/ai/speech-to-text` - 语音转文字
- `POST /api/ai/chat` - AI智能问答

## 🐳 Docker 部署

### 构建镜像
```bash
docker build -t ai-travel-planner .
```

### 运行容器
```bash
docker run -d \
  --name ai-travel-planner \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://your-mongodb-uri \
  -e JWT_SECRET=your-secret \
  ai-travel-planner
```

### 使用Docker Compose
```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 🔒 安全考虑

- 用户密码使用bcrypt加密存储
- JWT token用于身份认证
- API Key安全存储在用户账户中
- 输入验证和错误处理
- CORS配置

## 📈 性能优化

- 数据库索引优化
- 前端代码分割
- 图片懒加载
- API响应缓存
- 数据库连接池

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目链接：[https://github.com/your-username/ai-travel-planner](https://github.com/your-username/ai-travel-planner)
- 问题反馈：[Issues](https://github.com/your-username/ai-travel-planner/issues)

## 🙏 致谢

- OpenAI 提供的AI服务
- React 社区的开源组件
- MongoDB 数据库支持
- 所有贡献者的支持

---

**注意**：使用本应用需要配置OpenAI API Key，请确保您有有效的API访问权限。
