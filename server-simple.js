const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

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
app.post('/api/ai/generate-trip', auth, async (req, res) => {
  const { destination, startDate, endDate, budget, travelers, preferences } = req.body;
  
  // 检查是否有API Key配置
  const userApiKey = req.headers['x-api-key'] || req.body.apiKey;
  
  // 使用默认的API Key（您的API Key）
  const defaultApiKey = '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';
  const finalApiKey = userApiKey || defaultApiKey;
  
  // 在演示模式下，如果没有API Key，使用演示数据
  const isDemoMode = !userApiKey && !defaultApiKey;
  
  // 由于网络问题，暂时使用增强的演示模式
  const useDemoMode = true; // 强制使用演示模式
  
  if (isDemoMode || useDemoMode) {
    // 智能演示模式：根据用户输入生成个性化规划
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const dailyBudget = Math.round(budget / days);
    
    // 根据偏好生成不同的活动
    const activities = [];
    const preferences = (preferences || '').toLowerCase();
    
    if (preferences.includes('美食') || preferences.includes('food')) {
      activities.push({
        time: '12:00',
        title: '美食探索',
        description: '品尝当地特色美食，体验地道风味',
        location: '特色餐厅',
        cost: Math.round(dailyBudget * 0.3),
        category: '餐饮'
      });
    }
    
    if (preferences.includes('文化') || preferences.includes('历史')) {
      activities.push({
        time: '14:00',
        title: '文化探索',
        description: '参观博物馆和历史古迹，了解当地文化',
        location: '文化景点',
        cost: Math.round(dailyBudget * 0.2),
        category: '文化'
      });
    }
    
    if (preferences.includes('自然') || preferences.includes('风景')) {
      activities.push({
        time: '16:00',
        title: '自然风光',
        description: '欣赏自然美景，呼吸新鲜空气',
        location: '自然景区',
        cost: Math.round(dailyBudget * 0.15),
        category: '自然'
      });
    }
    
    // 默认活动
    if (activities.length === 0) {
      activities.push(
        {
          time: '12:00',
          title: '午餐时间',
          description: '品尝当地特色美食',
          location: '市中心餐厅',
          cost: Math.round(dailyBudget * 0.2),
          category: '餐饮'
        },
        {
          time: '14:00',
          title: '城市观光',
          description: '游览当地著名景点',
          location: '市中心',
          cost: Math.round(dailyBudget * 0.25),
          category: '景点'
        },
        {
          time: '16:00',
          title: '购物体验',
          description: '购买当地特色商品',
          location: '商业街',
          cost: Math.round(dailyBudget * 0.2),
          category: '购物'
        }
      );
    }
    
    // 添加晚餐
    activities.push({
      time: '18:00',
      title: '晚餐',
      description: '享受当地特色晚餐',
      location: '特色餐厅',
      cost: Math.round(dailyBudget * 0.3),
      category: '餐饮'
    });
    
    const mockResponse = {
      message: '智能演示模式：为您生成了个性化旅行规划',
      data: {
        destination,
        summary: `为您规划了${destination}的${travelers}人${days}天旅行，总预算${budget}元，人均预算${Math.round(budget/travelers)}元`,
        itinerary: Array.from({length: days}, (_, i) => ({
          date: new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          activities: [
            {
              time: '09:00',
              title: i === 0 ? '抵达目的地' : '开始新的一天',
              description: i === 0 ? '到达机场，办理入住手续' : '享用早餐，准备出发',
              location: i === 0 ? '机场' : '酒店',
              cost: i === 0 ? 0 : Math.round(dailyBudget * 0.1),
              category: '交通'
            },
            ...activities
          ]
        })),
        recommendations: {
          restaurants: [
            '当地特色餐厅',
            '网红打卡餐厅',
            '传统老字号',
            '街头小吃摊'
          ],
          attractions: [
            '历史古迹',
            '自然景观',
            '文化博物馆',
            '现代地标建筑'
          ],
          tips: [
            '提前预订热门景点门票',
            '了解当地交通方式',
            '准备常用药品',
            '学习基本当地语言',
            '关注天气预报',
            '准备充电宝和相机'
          ]
        }
      }
    };
    return res.json(mockResponse);
  }
  
  try {
    // 使用真实的OpenAI API
    const openai = new OpenAI({
      apiKey: finalApiKey,
      timeout: 10000, // 10秒超时
      maxRetries: 1
    });
    
    console.log('正在调用OpenAI API...');
    
    // 构建详细的提示词
    const prompt = `作为专业的旅行规划师，请为以下需求制定详细的旅行计划：

目的地：${destination}
出发日期：${startDate}
返回日期：${endDate}
预算：${budget}元
人数：${travelers}人
特殊偏好：${preferences || '无特殊要求'}

请生成一个详细的旅行计划，包括：
1. 每日行程安排（时间、地点、活动、费用）
2. 推荐的餐厅和美食
3. 必游景点和活动
4. 交通建议
5. 住宿推荐
6. 预算分配建议
7. 实用贴士

请以JSON格式返回，包含以下结构：
{
  "summary": "旅行概述",
  "itinerary": [
    {
      "date": "日期",
      "activities": [
        {
          "time": "时间",
          "title": "活动标题",
          "description": "详细描述",
          "location": "地点",
          "cost": 费用,
          "category": "类别"
        }
      ]
    }
  ],
  "recommendations": {
    "restaurants": ["餐厅推荐"],
    "attractions": ["景点推荐"],
    "tips": ["实用贴士"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个专业的旅行规划师，擅长制定详细、实用的旅行计划。请根据用户需求提供个性化的旅行建议。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // 尝试解析AI返回的JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      // 如果解析失败，使用原始响应
      parsedResponse = {
        summary: `AI为您规划了${destination}的${travelers}人旅行`,
        itinerary: [
          {
            date: startDate,
            activities: [
              {
                time: '09:00',
                title: 'AI规划的活动',
                description: aiResponse.substring(0, 200) + '...',
                location: destination,
                cost: 0,
                category: 'AI推荐'
              }
            ]
          }
        ]
      };
    }
    
    res.json({
      message: 'AI旅行计划生成成功',
      data: parsedResponse
    });
    
  } catch (error) {
    console.error('OpenAI API错误:', error);
    
    // 如果API调用失败，返回增强的演示数据
    const fallbackResponse = {
      message: 'AI服务暂时不可用，为您提供智能演示规划',
      data: {
        summary: `为您规划了${destination}的${travelers}人旅行，预算${budget}元`,
        itinerary: [
          {
            date: startDate,
            activities: [
              {
                time: '09:00',
                title: '抵达目的地',
                description: '到达机场，办理入住手续，熟悉周边环境',
                location: '机场',
                cost: 0,
                category: '交通'
              },
              {
                time: '12:00',
                title: '午餐时间',
                description: '品尝当地特色美食，体验当地文化',
                location: '市中心餐厅',
                cost: Math.round(budget * 0.1),
                category: '餐饮'
              },
              {
                time: '14:00',
                title: '城市观光',
                description: '游览当地著名景点，拍照留念',
                location: '市中心景点',
                cost: Math.round(budget * 0.15),
                category: '景点'
              },
              {
                time: '16:00',
                title: '购物体验',
                description: '购买当地特色商品和纪念品',
                location: '商业街',
                cost: Math.round(budget * 0.2),
                category: '购物'
              },
              {
                time: '18:00',
                title: '晚餐',
                description: '享受当地特色晚餐，体验夜生活',
                location: '特色餐厅',
                cost: Math.round(budget * 0.15),
                category: '餐饮'
              }
            ]
          }
        ],
        recommendations: {
          restaurants: [
            '当地特色餐厅',
            '网红打卡餐厅',
            '传统老字号',
            '街头小吃摊'
          ],
          attractions: [
            '历史古迹',
            '自然景观',
            '文化博物馆',
            '现代地标建筑'
          ],
          tips: [
            '提前预订热门景点门票',
            '了解当地交通方式',
            '准备常用药品',
            '学习基本当地语言'
          ]
        }
      }
    };
    
    res.json(fallbackResponse);
  }
});

// API测试路由
app.get('/api/test-openai', auth, async (req, res) => {
  const defaultApiKey = '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';
  
  try {
    const openai = new OpenAI({
      apiKey: defaultApiKey,
      timeout: 5000
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "请简单回复：API连接测试成功"
        }
      ],
      max_tokens: 10
    });
    
    res.json({
      success: true,
      message: 'OpenAI API连接正常',
      response: completion.choices[0].message.content
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'OpenAI API连接失败',
      error: error.message,
      type: error.constructor.name
    });
  }
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
