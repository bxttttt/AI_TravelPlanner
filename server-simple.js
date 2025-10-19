const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 内存数据库（用于演示）
let users = [];
let trips = [];
let currentUserId = null;

// 简单的认证中间件
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token === 'demo-token') {
    req.userId = 'demo-user';
    next();
  } else {
    res.status(401).json({ message: '访问被拒绝，需要token' });
  }
};

// 认证路由
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // 检查用户是否已存在
  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: '用户名或邮箱已存在' });
  }

  const user = {
    id: 'demo-user',
    username,
    email,
    preferences: {
      language: 'zh-CN',
      currency: 'CNY',
      openaiApiKey: ''
    }
  };
  
  users.push(user);
  currentUserId = user.id;

  res.status(201).json({
    message: '注册成功',
    token: 'demo-token',
    user: { id: user.id, username: user.username, email: user.email }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // 演示模式，任何邮箱都可以登录
  const user = {
    id: 'demo-user',
    username: '演示用户',
    email,
    preferences: {
      language: 'zh-CN',
      currency: 'CNY',
      openaiApiKey: ''
    }
  };
  
  currentUserId = user.id;

  res.json({
    message: '登录成功',
    token: 'demo-token',
    user: { id: user.id, username: user.username, email: user.email }
  });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = {
    id: 'demo-user',
    username: '演示用户',
    email: 'demo@example.com',
    preferences: {
      language: 'zh-CN',
      currency: 'CNY',
      openaiApiKey: ''
    }
  };
  res.json(user);
});

app.put('/api/auth/settings', auth, (req, res) => {
  const { preferences } = req.body;
  
  // 在演示模式下，我们只是返回成功
  // 在实际应用中，这里会更新数据库中的用户设置
  res.json({
    success: true,
    message: '设置更新成功',
    user: {
      id: 'demo-user',
      username: '演示用户',
      email: 'demo@example.com',
      preferences: {
        openaiApiKey: preferences.openaiApiKey || '',
        language: preferences.language || 'zh-CN',
        currency: preferences.currency || 'CNY'
      }
    }
  });
});

// 旅行计划路由
app.get('/api/trips', auth, (req, res) => {
  res.json(trips);
});

app.post('/api/trips', auth, (req, res) => {
  const trip = {
    _id: Date.now().toString(),
    ...req.body,
    user: req.userId,
    createdAt: new Date(),
    expenses: []
  };
  trips.push(trip);
  res.status(201).json({ message: '旅行计划创建成功', trip });
});

app.get('/api/trips/:id', auth, (req, res) => {
  const trip = trips.find(t => t._id === req.params.id);
  if (!trip) {
    return res.status(404).json({ message: '旅行计划未找到' });
  }
  res.json(trip);
});

app.put('/api/trips/:id', auth, (req, res) => {
  const index = trips.findIndex(t => t._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: '旅行计划未找到' });
  }
  trips[index] = { ...trips[index], ...req.body };
  res.json({ message: '旅行计划更新成功', trip: trips[index] });
});

app.delete('/api/trips/:id', auth, (req, res) => {
  const index = trips.findIndex(t => t._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: '旅行计划未找到' });
  }
  trips.splice(index, 1);
  res.json({ message: '旅行计划删除成功' });
});

app.post('/api/trips/:id/expenses', auth, (req, res) => {
  const trip = trips.find(t => t._id === req.params.id);
  if (!trip) {
    return res.status(404).json({ message: '旅行计划未找到' });
  }
  
  const expense = {
    _id: Date.now().toString(),
    ...req.body,
    amount: parseFloat(req.body.amount)
  };
  
  if (!trip.expenses) trip.expenses = [];
  trip.expenses.push(expense);
  
  res.json({ message: '费用记录添加成功', trip });
});

app.delete('/api/trips/:id/expenses/:expenseId', auth, (req, res) => {
  const trip = trips.find(t => t._id === req.params.id);
  if (!trip) {
    return res.status(404).json({ message: '旅行计划未找到' });
  }
  
  const expenseIndex = trip.expenses.findIndex(e => e._id === req.params.expenseId);
  if (expenseIndex === -1) {
    return res.status(404).json({ message: '费用记录未找到' });
  }
  
  trip.expenses.splice(expenseIndex, 1);
  res.json({ message: '费用记录删除成功', trip });
});

// AI路由
app.post('/api/ai/generate-trip', auth, (req, res) => {
  const { destination, startDate, endDate, budget, travelers, preferences } = req.body;
  
  // 检查是否有API Key配置
  const userApiKey = req.headers['x-api-key'] || req.body.apiKey;
  
  if (!userApiKey) {
    return res.status(400).json({ 
      message: '请先在设置中配置OpenAI API Key',
      needApiKey: true
    });
  }
  
  // 模拟AI响应（在实际应用中，这里会调用OpenAI API）
  const mockResponse = {
    message: 'AI旅行计划生成成功',
    data: {
      destination,
      summary: `为您规划了${destination}的${travelers}人旅行，预算${budget}元`,
      itinerary: [
        {
          date: startDate,
          activities: [
            {
              time: '09:00',
              title: '抵达目的地',
              description: '到达机场，办理入住手续',
              location: '机场',
              cost: 0,
              category: '交通'
            },
            {
              time: '12:00',
              title: '午餐',
              description: '品尝当地特色美食',
              location: '市中心餐厅',
              cost: 200,
              category: '餐饮'
            },
            {
              time: '14:00',
              title: '城市观光',
              description: '游览当地著名景点',
              location: '市中心',
              cost: 150,
              category: '景点'
            },
            {
              time: '18:00',
              title: '晚餐',
              description: '享受当地特色晚餐',
              location: '特色餐厅',
              cost: 300,
              category: '餐饮'
            }
          ]
        }
      ]
    }
  };
  
  res.json(mockResponse);
});

app.post('/api/ai/speech-to-text', auth, (req, res) => {
  res.json({
    message: '语音识别成功',
    text: '这是一个演示的语音识别结果'
  });
});

app.post('/api/ai/chat', auth, (req, res) => {
  const { message } = req.body;
  res.json({
    message: 'AI回复成功',
    response: `这是对"${message}"的AI回复。在完整版本中，这里会调用OpenAI API。`
  });
});

// 生产环境路由
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/client/build/index.html');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AI旅行规划师服务器运行在端口 ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`📝 演示模式：使用任何邮箱和密码都可以登录`);
});
