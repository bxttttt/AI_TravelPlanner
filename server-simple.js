const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Bailian = require('@alicloud/bailian20231229');

// 导入新的服务
const OrchestratorService = require('./services/OrchestratorService');

// 加载环境变量
dotenv.config();

const app = express();

// 初始化工具流编排服务
const orchestrator = new OrchestratorService();

// 推荐内容生成函数
function getRestaurantRecommendations(destination) {
  if (destination.includes('日本') || destination.includes('东京')) {
    return [
      '银座寿司店 - 品尝正宗江户前寿司',
      '一兰拉面 - 体验经典日式拉面',
      '筑地市场 - 新鲜海鲜和寿司',
      '居酒屋 - 体验日本夜生活文化'
    ];
  } else if (destination.includes('北京')) {
    return [
      '全聚德烤鸭店 - 正宗北京烤鸭',
      '东来顺涮羊肉 - 老北京火锅',
      '护国寺小吃 - 传统北京小吃',
      '簋街麻辣小龙虾 - 夜宵好去处'
    ];
  } else if (destination.includes('上海')) {
    return [
      '老正兴 - 正宗本帮菜',
      '南翔小笼包 - 上海特色点心',
      '外滩18号 - 高端餐饮体验',
      '城隍庙小吃 - 传统上海味道'
    ];
  } else if (destination.includes('韩国') || destination.includes('首尔')) {
    return [
      '明洞烤肉店 - 正宗韩式烤肉体验',
      '弘大网红咖啡厅 - 打卡潮流文化',
      '东大门小吃街 - 地道韩式街头美食',
      '江南区米其林餐厅 - 高端韩式料理'
    ];
  } else {
    return [
      '当地特色餐厅 - 品尝地道风味',
      '网红打卡餐厅 - 拍照留念好去处',
      '传统老字号 - 体验历史文化',
      '街头小吃摊 - 感受当地生活'
    ];
  }
}

function getAttractionRecommendations(destination) {
  if (destination.includes('日本') || destination.includes('东京')) {
    return [
      '浅草寺 - 东京最古老的寺庙',
      '东京塔 - 城市地标建筑',
      '上野公园 - 樱花季必游景点',
      '秋叶原 - 动漫文化圣地'
    ];
  } else if (destination.includes('北京')) {
    return [
      '故宫博物院 - 明清皇家宫殿',
      '天安门广场 - 国家象征',
      '长城 - 世界文化遗产',
      '天坛公园 - 古代祭天建筑'
    ];
  } else if (destination.includes('上海')) {
    return [
      '外滩 - 万国建筑博览群',
      '东方明珠 - 上海地标',
      '豫园 - 江南古典园林',
      '新天地 - 时尚文化区'
    ];
  } else if (destination.includes('韩国') || destination.includes('首尔')) {
    return [
      '景福宫 - 朝鲜王朝宫殿建筑',
      '明洞购物街 - 韩国潮流文化中心',
      '弘大艺术区 - 青年文化聚集地',
      '汉江公园 - 首尔城市绿肺'
    ];
  } else {
    return [
      '历史古迹 - 了解当地文化',
      '自然景观 - 欣赏美丽风景',
      '文化博物馆 - 深度文化体验',
      '现代地标 - 城市新风貌'
    ];
  }
}

function getTravelTips(destination, preferences) {
  const baseTips = [
    '提前预订热门景点门票，避免排队',
    '下载当地交通APP，方便出行',
    '准备常用药品，注意身体健康',
    '关注天气预报，准备合适衣物'
  ];
  
  if (destination.includes('日本')) {
    baseTips.push('学习基本日语礼貌用语', '准备现金，很多地方不支持刷卡', '了解垃圾分类规则');
  } else if (destination.includes('北京')) {
    baseTips.push('下载北京地铁APP', '准备身份证件', '了解北京交通限行政策');
  } else if (destination.includes('上海')) {
    baseTips.push('下载上海地铁APP', '准备身份证件', '了解上海交通规则');
  } else if (destination.includes('韩国') || destination.includes('首尔')) {
    baseTips.push('学习基本韩语礼貌用语', '准备T-money交通卡', '了解韩国文化礼仪', '关注K-pop演出信息');
  }
  
  if (preferences.includes('美食')) {
    baseTips.push('提前了解当地特色美食', '准备肠胃药以防不适应');
  }
  
  if (preferences.includes('文化')) {
    baseTips.push('提前了解当地历史文化', '准备相机记录文化体验');
  }
  
  if (preferences.includes('自然')) {
    baseTips.push('准备户外装备', '关注天气变化');
  }
  
  return baseTips;
}

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
  if (token === 'demo-token' || token) {
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
  console.log('📋 获取旅行规划列表，当前用户:', req.userId);
  console.log('📋 旅行规划数量:', trips.length);
  console.log('📋 旅行规划列表:', trips.map(t => ({ id: t._id, title: t.title, user: t.user })));
  res.json(trips);
});

app.post('/api/trips', auth, (req, res) => {
  console.log('📝 创建旅行规划请求:', req.body);
  const trip = {
    _id: Date.now().toString(),
    ...req.body,
    user: req.userId,
    createdAt: new Date(),
    expenses: []
  };
  trips.push(trip);
  console.log('📝 旅行规划创建成功:', trip._id, trip.title);
  console.log('📝 当前旅行规划总数:', trips.length);
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

// RAG和工具流AI生成接口
app.post('/api/ai/generate-trip-rag', auth, async (req, res) => {
  const { destination, startDate, endDate, budget, travelers, preferences } = req.body;
  
  console.log('🚀 使用RAG和工具流生成旅行规划...');
  console.log('🔑 使用API Key:', process.env.BAILIAN_API_KEY?.substring(0, 10) + '...');
  
  try {
    // 准备用户输入
    const userInput = {
      destination,
      startDate,
      endDate,
      budget: parseInt(budget),
      travelers: parseInt(travelers),
      preferences: preferences || {},
      days: Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
    };
    
    console.log('📋 用户输入:', userInput);
    
    // 执行工具流
    const result = await orchestrator.executeToolFlow(userInput);
    
    if (result.success) {
      console.log('✅ RAG和工具流执行成功');
      res.json({
        message: 'AI旅行计划生成成功',
        data: result.data,
        apiStatus: result.apiStatus,
        apiMessage: result.apiMessage
      });
    } else {
      console.log('⚠️ 工具流执行失败，使用降级模式');
      // 降级到原有的AI生成逻辑
      const fallbackResult = await generateFallbackTrip(userInput);
      res.json({
        message: 'AI旅行计划生成成功（降级模式）',
        data: fallbackResult,
        apiStatus: 'fallback',
        apiMessage: '⚠️ 使用降级模式生成旅行规划'
      });
    }
    
  } catch (error) {
    console.error('❌ 工具流执行错误:', error);
    
    // 最终降级
    try {
      const fallbackResult = await generateFallbackTrip({
        destination,
        startDate,
        endDate,
        budget: parseInt(budget),
        travelers: parseInt(travelers),
        preferences: preferences || {}
      });
      
      res.json({
        message: 'AI旅行计划生成成功（降级模式）',
        data: fallbackResult,
        apiStatus: 'fallback',
        apiMessage: '⚠️ 系统降级，使用基础AI生成'
      });
    } catch (fallbackError) {
      console.error('❌ 降级模式也失败:', fallbackError);
      res.status(500).json({
        message: 'AI旅行计划生成失败',
        error: fallbackError.message,
        apiStatus: 'error',
        apiMessage: '❌ 系统错误，请稍后重试'
      });
    }
  }
});

// 降级模式生成函数
async function generateFallbackTrip(userInput) {
  const { destination, startDate, endDate, budget, travelers, preferences } = userInput;
  
  console.log('🔄 使用降级模式生成旅行规划...');
  
  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
  const dailyBudget = Math.round(budget / days);
  
  // 生成多日行程
  const itinerary = [];
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const dayActivities = generateDayActivities(destination, i, days, dailyBudget, preferences);
    
    itinerary.push({
      date: dateStr,
      dayTitle: `第${i + 1}天：${getDayTitle(i, days, destination)}`,
      dailyBudget: dailyBudget,
      activities: dayActivities
    });
  }
  
  return {
    summary: `AI为您规划了${destination}的${days}天${days-1}夜旅行，总预算${budget}元，每日预算约${dailyBudget}元`,
    itinerary: itinerary,
    recommendations: {
      restaurants: getRestaurantRecommendations(destination),
      attractions: getAttractionRecommendations(destination),
      tips: getTravelTips(destination, preferences)
    },
    budgetSummary: {
      total: budget,
      transportation: Math.floor(budget * 0.3),
      accommodation: Math.floor(budget * 0.25),
      dining: Math.floor(budget * 0.25),
      attractions: Math.floor(budget * 0.15),
      shopping: Math.floor(budget * 0.05)
    }
  };
}

// AI路由（保持原有接口兼容性）
app.post('/api/ai/generate-trip', auth, async (req, res) => {
  const { destination, startDate, endDate, budget, travelers, preferences } = req.body;
  
  // 检查是否有API Key配置
  const userApiKey = req.headers['x-api-key'] || req.body.apiKey;
  
  // 使用您的阿里云百炼API Key
  const defaultApiKey = 'sk-5aad8ea912dd411ebcf931d10f3ca7e8';
  const finalApiKey = userApiKey || defaultApiKey;
  
  console.log('🔑 使用API Key:', finalApiKey.substring(0, 10) + '...');
  
  // 在演示模式下，如果没有API Key，使用演示数据
  const isDemoMode = !userApiKey && !defaultApiKey;
  
  // 使用真实API调用
  const useDemoMode = false; // 使用真实API
  
  if (isDemoMode || useDemoMode) {
    // 智能演示模式：根据用户输入生成个性化规划
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const dailyBudget = Math.round(budget / days);
    const perPersonBudget = Math.round(dailyBudget / travelers);
    
    // 根据目的地和偏好生成更自然的活动
    const activities = [];
    const userPreferences = (preferences || '').toLowerCase();
    
    // 根据目的地生成特色活动
    const destinationLower = destination.toLowerCase();
    let destinationActivities = [];
    
    if (destinationLower.includes('日本') || destinationLower.includes('东京')) {
      destinationActivities = [
        { time: '12:00', title: '日式料理体验', description: '品尝正宗寿司和拉面，感受日本饮食文化', location: '银座寿司店', cost: Math.round(perPersonBudget * 0.3), category: '餐饮' },
        { time: '14:00', title: '浅草寺参拜', description: '参观东京最古老的寺庙，体验传统日本文化', location: '浅草寺', cost: 0, category: '文化' },
        { time: '16:00', title: '秋叶原购物', description: '探索动漫和电子产品天堂，购买特色纪念品', location: '秋叶原', cost: Math.round(perPersonBudget * 0.2), category: '购物' }
      ];
    } else if (destinationLower.includes('北京')) {
      destinationActivities = [
        { time: '12:00', title: '北京烤鸭', description: '品尝正宗北京烤鸭，体验老北京风味', location: '全聚德', cost: Math.round(perPersonBudget * 0.3), category: '餐饮' },
        { time: '14:00', title: '故宫游览', description: '参观紫禁城，感受明清皇家建筑之美', location: '故宫博物院', cost: Math.round(perPersonBudget * 0.2), category: '文化' },
        { time: '16:00', title: '王府井购物', description: '逛传统商业街，购买北京特产', location: '王府井大街', cost: Math.round(perPersonBudget * 0.15), category: '购物' }
      ];
    } else if (destinationLower.includes('上海')) {
      destinationActivities = [
        { time: '12:00', title: '本帮菜体验', description: '品尝正宗上海本帮菜，感受海派文化', location: '老正兴', cost: Math.round(perPersonBudget * 0.3), category: '餐饮' },
        { time: '14:00', title: '外滩观光', description: '漫步外滩，欣赏黄浦江两岸美景', location: '外滩', cost: 0, category: '景点' },
        { time: '16:00', title: '南京路购物', description: '逛中华商业第一街，体验上海繁华', location: '南京路步行街', cost: Math.round(perPersonBudget * 0.2), category: '购物' }
      ];
    } else if (destinationLower.includes('韩国') || destinationLower.includes('首尔')) {
      destinationActivities = [
        { time: '12:00', title: '韩式烤肉', description: '品尝正宗韩式烤肉，体验韩国饮食文化', location: '明洞烤肉店', cost: Math.round(perPersonBudget * 0.3), category: '餐饮' },
        { time: '14:00', title: '景福宫参观', description: '游览朝鲜王朝宫殿，感受韩国历史文化', location: '景福宫', cost: Math.round(perPersonBudget * 0.15), category: '文化' },
        { time: '16:00', title: '弘大购物', description: '探索韩国青年文化聚集地，购买潮流商品', location: '弘大艺术区', cost: Math.round(perPersonBudget * 0.2), category: '购物' }
      ];
    } else {
      // 通用活动
      destinationActivities = [
        { time: '12:00', title: '当地美食', description: '品尝当地特色美食，感受地方文化', location: '特色餐厅', cost: Math.round(perPersonBudget * 0.3), category: '餐饮' },
        { time: '14:00', title: '城市观光', description: '游览当地著名景点，了解历史文化', location: '市中心景点', cost: Math.round(perPersonBudget * 0.2), category: '景点' },
        { time: '16:00', title: '购物体验', description: '购买当地特色商品和纪念品', location: '商业街', cost: Math.round(perPersonBudget * 0.15), category: '购物' }
      ];
    }
    
    // 根据用户偏好调整活动
    if (userPreferences.includes('美食') || userPreferences.includes('food')) {
      destinationActivities[0].cost = Math.round(perPersonBudget * 0.4);
      destinationActivities[0].description += '，深度体验当地美食文化';
    }
    
    if (userPreferences.includes('文化') || userPreferences.includes('历史')) {
      destinationActivities[1].cost = Math.round(perPersonBudget * 0.3);
      destinationActivities[1].description += '，深入了解历史文化背景';
    }
    
    if (userPreferences.includes('自然') || userPreferences.includes('风景')) {
      destinationActivities.push({
        time: '17:00',
        title: '自然风光',
        description: '欣赏自然美景，呼吸新鲜空气',
        location: '自然景区',
        cost: Math.round(perPersonBudget * 0.1),
        category: '自然'
      });
    }
    
    activities.push(...destinationActivities);
    
    // 添加晚餐
    activities.push({
      time: '18:30',
      title: '特色晚餐',
      description: '享受当地特色晚餐，体验夜生活文化',
      location: '特色餐厅',
      cost: Math.round(perPersonBudget * 0.25),
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
          restaurants: getRestaurantRecommendations(destinationLower),
          attractions: getAttractionRecommendations(destinationLower),
          tips: getTravelTips(destinationLower, userPreferences)
        }
      }
    };
    return res.json(mockResponse);
  }
  
  try {
    console.log('正在调用真实API...');
    
    // 构建优化的多日行程提示词
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const dailyBudget = Math.floor(budget / days);
    
    const prompt = `作为专业旅行规划师，请为以下需求制定${days}天${days-1}夜的详细旅行计划：

【基本信息】
目的地：${destination}
出发日期：${startDate}
返回日期：${endDate}
总预算：${budget}元人民币
人数：${travelers}人
特殊偏好：${preferences || '无特殊要求'}

【核心要求】
1. 生成${days}天的完整行程，每天2-4个主要活动
2. 预算分配：交通30%、住宿25%、餐饮25%、景点15%、购物5%
3. 每日预算约${dailyBudget}元，合理分配到各项活动
4. 活动时间安排：上午9-12点、下午2-6点、晚上7-10点
5. 考虑交通时间和休息时间，避免过于紧凑
6. 根据目的地特色安排室内外活动

【输出格式】
请严格按照以下JSON格式返回，确保格式正确：

{
  "summary": "旅行概述，包含预算分配说明",
  "itinerary": [
    {
      "date": "2025-10-21",
      "dayTitle": "第一天：抵达与初探",
      "dailyBudget": 1250,
      "activities": [
        {
          "time": "09:00-11:00",
          "title": "活动名称",
          "description": "详细描述",
          "location": "具体地点",
          "cost": 300,
          "category": "交通"
        }
      ]
    }
  ],
  "recommendations": {
    "restaurants": ["餐厅1 - 特色", "餐厅2 - 推荐理由"],
    "attractions": ["景点1 - 亮点", "景点2 - 特色"],
    "tips": ["贴士1", "贴士2", "贴士3"]
  },
  "budgetSummary": {
    "total": ${budget},
    "transportation": ${Math.floor(budget * 0.3)},
    "accommodation": ${Math.floor(budget * 0.25)},
    "dining": ${Math.floor(budget * 0.25)},
    "attractions": ${Math.floor(budget * 0.15)},
    "shopping": ${Math.floor(budget * 0.05)}
  }
}

【重要提醒】
- 必须返回有效的JSON格式
- 所有字符串用双引号包围
- 数字不加引号
- 确保JSON结构完整，无语法错误`;

    // 使用HTTP请求调用API
    const axios = require('axios');
    
    console.log('🌐 正在调用阿里云百炼API...');
    console.log('📡 API端点: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions');
    console.log('🤖 模型: qwen-plus');
    console.log('🔑 API Key: ' + finalApiKey.substring(0, 10) + '...');
    
    // 尝试调用阿里云百炼API
    const response = await axios.post('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      model: "qwen-plus",
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
    }, {
      headers: {
        'Authorization': `Bearer ${finalApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });
    
    console.log('API调用成功！');
    const aiResponse = response.data.choices[0].message.content;
    console.log('AI原始响应:', aiResponse.substring(0, 200) + '...');
    
    // 解析AI响应
    let parsedResponse = parseAIResponse(aiResponse, destination, travelers, startDate, endDate, budget, preferences);
    
    function parseAIResponse(aiResponse, destination, travelers, startDate, endDate, budget, preferences) {
      // 清理可能的代码块标记
      let cleanResponse = aiResponse;
      if (cleanResponse.includes('```json')) {
        cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      if (cleanResponse.includes('```')) {
        cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // 尝试解析JSON
      try {
        // 尝试修复常见的JSON语法错误
        cleanResponse = cleanResponse
          .replace(/,(\s*[}\]])/g, '$1') // 移除多余的逗号
          .replace(/(\d+)\s*(\n\s*[}\]])/g, '$1$2') // 修复数字后缺少逗号的问题
          .replace(/(\w+)\s*(\n\s*[}\]])/g, '"$1"$2'); // 修复未引用的字符串
        
        const parsed = JSON.parse(cleanResponse);
        console.log('✅ JSON解析成功');
        return parsed;
      } catch (parseError) {
        console.log('❌ JSON解析失败:', parseError.message);
        console.log('清理后的响应:', cleanResponse.substring(0, 500) + '...');
        
        // 尝试提取基本信息
        console.log('🔄 尝试提取基本信息...');
        
        try {
          // 尝试提取summary
          const summaryMatch = cleanResponse.match(/"summary":\s*"([^"]+)"/);
          const summary = summaryMatch ? summaryMatch[1] : `AI为您规划了${destination}的${travelers}人旅行`;
          
          // 尝试提取itinerary
          let itinerary = [];
          
          // 查找所有活动标题
          const activityMatches = cleanResponse.match(/"title":\s*"([^"]+)"/g);
          if (activityMatches && activityMatches.length > 0) {
            const activities = activityMatches.map((match, index) => {
              const title = match.match(/"title":\s*"([^"]+)"/)[1];
              return {
                time: `${9 + index}:00`,
                title: title,
                description: `AI为您规划的${title}活动`,
                location: destination,
                cost: Math.floor(Math.random() * 200) + 50,
                category: 'AI推荐'
              };
            });
            
            itinerary = [{
              date: startDate,
              activities: activities
            }];
          }
          
          if (itinerary.length === 0) {
            itinerary = [{
              date: startDate,
              activities: [{
                time: '09:00',
                title: 'AI规划的活动',
                description: summary.substring(0, 200) + '...',
                location: destination,
                cost: 0,
                category: 'AI推荐'
              }]
            }];
          }
          
          const result = {
            summary: summary,
            itinerary: itinerary,
            recommendations: {
              restaurants: ['AI推荐餐厅'],
              attractions: ['AI推荐景点'],
              tips: ['AI实用贴士']
            }
          };
          
          console.log('✅ 基本信息提取成功');
          return result;
        } catch (extractError) {
          console.log('❌ 基本信息提取失败:', extractError.message);
          
          // 智能多日行程降级
          console.log('🔄 生成智能多日行程...');
          return generateMultiDayFallback(destination, travelers, startDate, endDate, budget, preferences);
        }
      }
    }
    
    // 生成智能多日行程降级方案
    function generateMultiDayFallback(destination, travelers, startDate, endDate, budget, preferences) {
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
      const dailyBudget = Math.floor(budget / days);
      
      const itinerary = [];
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const dayActivities = generateDayActivities(destination, i, days, dailyBudget, preferences);
        
        itinerary.push({
          date: dateStr,
          dayTitle: `第${i + 1}天：${getDayTitle(i, days, destination)}`,
          dailyBudget: dailyBudget,
          activities: dayActivities
        });
      }
      
      return {
        summary: `AI为您规划了${destination}的${days}天${days-1}夜旅行，总预算${budget}元，每日预算约${dailyBudget}元`,
        itinerary: itinerary,
        recommendations: {
          restaurants: getRestaurantRecommendations(destination),
          attractions: getAttractionRecommendations(destination),
          tips: getTravelTips(destination, preferences)
        },
        budgetSummary: {
          total: budget,
          transportation: Math.floor(budget * 0.3),
          accommodation: Math.floor(budget * 0.25),
          dining: Math.floor(budget * 0.25),
          attractions: Math.floor(budget * 0.15),
          shopping: Math.floor(budget * 0.05)
        }
      };
    }
    
    // 生成每日活动
    function generateDayActivities(destination, dayIndex, totalDays, dailyBudget, preferences) {
      const activities = [];
      
      if (dayIndex === 0) {
        // 第一天：抵达
        activities.push({
          time: '14:00-16:00',
          title: '抵达目的地',
          description: `抵达${destination}，办理入住手续，熟悉周边环境`,
          location: '机场/酒店',
          cost: 0,
          category: '交通'
        });
        activities.push({
          time: '18:00-20:00',
          title: '当地美食体验',
          description: `品尝${destination}特色美食，感受当地文化`,
          location: '特色餐厅',
          cost: Math.floor(dailyBudget * 0.3),
          category: '餐饮'
        });
      } else if (dayIndex === totalDays - 1) {
        // 最后一天：离开
        activities.push({
          time: '09:00-11:00',
          title: '最后购物',
          description: '购买纪念品和特产',
          location: '商业区',
          cost: Math.floor(dailyBudget * 0.2),
          category: '购物'
        });
        activities.push({
          time: '14:00-16:00',
          title: '前往机场',
          description: '前往机场，办理登机手续',
          location: '机场',
          cost: Math.floor(dailyBudget * 0.1),
          category: '交通'
        });
      } else {
        // 中间天数：游览
        const morningActivity = getDestinationActivity(destination, 'morning', dailyBudget);
        const afternoonActivity = getDestinationActivity(destination, 'afternoon', dailyBudget);
        const eveningActivity = getDestinationActivity(destination, 'evening', dailyBudget);
        
        activities.push(morningActivity, afternoonActivity, eveningActivity);
      }
      
      return activities;
    }
    
    // 获取目的地特色活动
    function getDestinationActivity(destination, timeOfDay, dailyBudget) {
      const destinationLower = destination.toLowerCase();
      const timeSlots = {
        morning: { time: '09:00-12:00', cost: Math.floor(dailyBudget * 0.3) },
        afternoon: { time: '14:00-17:00', cost: Math.floor(dailyBudget * 0.4) },
        evening: { time: '19:00-21:00', cost: Math.floor(dailyBudget * 0.3) }
      };
      
      const slot = timeSlots[timeOfDay];
      
      if (destinationLower.includes('韩国') || destinationLower.includes('首尔')) {
        const activities = {
          morning: { title: '景福宫参观', description: '游览朝鲜王朝宫殿，感受韩国历史文化', location: '景福宫', category: '文化' },
          afternoon: { title: '明洞购物', description: '探索韩国潮流购物区，购买特色商品', location: '明洞', category: '购物' },
          evening: { title: '韩式烤肉', description: '品尝正宗韩式烤肉，体验韩国饮食文化', location: '烤肉店', category: '餐饮' }
        };
        return { ...activities[timeOfDay], ...slot };
      } else {
        const activities = {
          morning: { title: '城市观光', description: '游览当地著名景点，了解历史文化', location: '市中心', category: '景点' },
          afternoon: { title: '文化体验', description: '参观博物馆或文化场所，深度了解当地', location: '文化区', category: '文化' },
          evening: { title: '当地美食', description: '品尝当地特色美食，感受地方文化', location: '特色餐厅', category: '餐饮' }
        };
        return { ...activities[timeOfDay], ...slot };
      }
    }
    
    // 获取每日标题
    function getDayTitle(dayIndex, totalDays, destination) {
      if (dayIndex === 0) return '抵达与初探';
      if (dayIndex === totalDays - 1) return '告别与返程';
      return '深度游览';
    }
    
    res.json({
      message: 'AI旅行计划生成成功',
      data: parsedResponse,
      apiStatus: 'success',
      apiMessage: '✅ 成功调用阿里云百炼API，使用通义千问模型生成智能规划'
    });
    
  } catch (error) {
    console.error('❌ API调用错误:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏰ API调用超时，请检查网络连接');
    } else if (error.response) {
      console.log('📊 HTTP错误:', error.response.status, error.response.data);
    }
    
    // 如果API调用失败，使用智能降级
    console.log('🔄 API调用失败，使用智能降级模式...');
    
    // 如果API调用失败，返回增强的演示数据
    const fallbackResponse = {
      message: 'AI服务暂时不可用，为您提供智能演示规划',
      apiStatus: 'timeout',
      apiMessage: '⏰ API调用超时，已使用智能降级模式生成规划',
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
          restaurants: getRestaurantRecommendations(destination),
          attractions: getAttractionRecommendations(destination),
          tips: getTravelTips(destination, preferences)
        }
      }
    };
    
    res.json(fallbackResponse);
  }
});

// API测试路由
app.get('/api/test-bailian', auth, async (req, res) => {
  const defaultApiKey = 'your-aliyun-bailian-api-key';
  
  try {
    const client = new Bailian({
      accessKeyId: 'your-access-key-id',
      accessKeySecret: defaultApiKey,
      endpoint: 'https://bailian.cn-beijing.aliyuncs.com'
    });
    
    // 测试API连接
    const response = await client.createTextEmbeddings({
      input: "API连接测试",
      model: "text-embedding-v1"
    });
    
    res.json({
      success: true,
      message: '阿里云百炼API连接正常',
      response: '连接测试成功'
    });
  } catch (error) {
    res.json({
      success: false,
      message: '阿里云百炼API连接失败',
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
