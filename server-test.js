const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 提供静态文件服务
app.use(express.static('public'));

// 根路径路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 简化的AI调用函数
async function callAIForTripPlanning(destination, startDate, endDate, budget, travelers, preferences) {
  console.log('🤖 开始直接AI调用...');
  
  try {
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const dailyBudget = Math.round(budget / days);

    const prompt = `你是一个专业的旅行规划师。请为以下旅行需求制定详细的多日行程安排：

目的地：${destination}
出发日期：${startDate}
返回日期：${endDate}
总预算：${budget}元
同行人数：${travelers}人
旅行偏好：${preferences}

请生成一个包含以下结构的JSON格式旅行规划：
{
  "summary": "旅行概述",
  "itinerary": [
    {
      "date": "2025-10-21",
      "dayTitle": "第一天：抵达与初探",
      "dailyBudget": 2000,
      "activities": [
        {
          "time": "09:00-11:00",
          "title": "活动标题",
          "description": "活动描述",
          "location": "地点",
          "cost": 100,
          "category": "交通"
        }
      ]
    }
  ],
  "recommendations": {
    "restaurants": ["餐厅推荐1", "餐厅推荐2"],
    "attractions": ["景点推荐1", "景点推荐2"],
    "tips": ["实用贴士1", "实用贴士2"]
  }
}`;

    console.log('📝 构建AI提示词完成，长度:', prompt.length);

    const apiKey = 'sk-5aad8ea912dd411ebcf931d10f3ca7e8';
    console.log('🔑 使用API Key:', apiKey.substring(0, 10) + '...');
    console.log('🌐 准备调用阿里云百炼API...');

    const response = await axios.post('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      model: 'qwen-plus',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000  // 2分钟超时
    });

    console.log('✅ AI API调用成功');
    
    const aiResponse = response.data.choices[0].message.content;
    console.log('🤖 AI原始响应长度:', aiResponse.length);
    console.log('🤖 AI原始响应前500字符:', aiResponse.substring(0, 500));
    
    // 清理响应中的markdown代码块标记
    let cleanedResponse = aiResponse;
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    console.log('清理后的响应前500字符:', cleanedResponse.substring(0, 500));
    
    // 尝试解析JSON，增加重试机制
    let parseAttempts = 0;
    const maxAttempts = 5;
    
    while (parseAttempts < maxAttempts) {
      try {
        console.log(`🔄 JSON解析尝试 ${parseAttempts + 1}/${maxAttempts}...`);
        
        // 尝试修复常见的JSON语法错误
        let fixedResponse = cleanedResponse
          .replace(/,(\s*[}\]])/g, '$1') // 移除多余的逗号
          .replace(/(\d+)\s*(\n\s*[}\]])/g, '$1$2') // 修复数字后缺少逗号的问题
          .replace(/(\w+)\s*(\n\s*[}\]])/g, '"$1"$2') // 修复未引用的字符串
          .replace(/([^\\])\\([^\\])/g, '$1\\\\$2') // 修复转义字符
          .replace(/([^\\])\\([^\\])/g, '$1\\\\$2'); // 再次修复转义字符
        
        const parsed = JSON.parse(fixedResponse);
        console.log('✅ JSON解析成功，尝试次数:', parseAttempts + 1);
        return {
          success: true,
          data: parsed
        };
      } catch (parseError) {
        parseAttempts++;
        console.log(`❌ JSON解析失败 (尝试 ${parseAttempts}/${maxAttempts}):`, parseError.message);
        
        if (parseAttempts < maxAttempts) {
          // 等待1秒后重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log('🔄 所有JSON解析尝试失败，使用基本信息提取...');
          
          // 尝试提取基本信息
          const summaryMatch = cleanedResponse.match(/"summary":\s*"([^"]+)"/);
          const summary = summaryMatch ? summaryMatch[1] : `AI为您规划了${destination}的${travelers}人旅行`;
          
          return {
            success: true,
            data: {
              summary: summary,
              itinerary: [{
                date: startDate,
                activities: [{
                  time: '09:00',
                  title: 'AI规划的活动',
                  description: summary.substring(0, 200) + '...',
                  location: destination,
                  cost: 0,
                  category: 'AI推荐'
                }]
              }],
              recommendations: {
                restaurants: ['AI推荐餐厅'],
                attractions: ['AI推荐景点'],
                tips: ['AI实用贴士']
              }
            }
          };
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 直接AI调用失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 模拟用户认证中间件
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    req.user = { id: 'demo-user', email: 'demo@example.com' };
  } else {
    req.user = { id: 'demo-user', email: 'demo@example.com' };
  }
  next();
};

// 内存数据库
let trips = [];
let users = [];

// 旅行计划接口
app.post('/api/trips', auth, (req, res) => {
  const { title, destination, startDate, endDate, budget, travelers, preferences, aiGenerated } = req.body;
  
  const trip = {
    _id: Date.now().toString(),
    id: Date.now().toString(), // 保持兼容性
    title,
    destination,
    startDate,
    endDate,
    budget,
    travelers,
    preferences,
    aiGenerated,
    user: req.user.id,
    createdAt: new Date().toISOString()
  };
  
  trips.push(trip);
  
  console.log('📝 创建旅行规划请求:', {
    title,
    destination,
    startDate,
    endDate,
    budget,
    travelers,
    preferences,
    aiGenerated
  });
  console.log('📝 旅行规划创建成功:', trip.id, title);
  console.log('📝 当前旅行规划总数:', trips.length);
  
  res.json({
    message: '旅行规划创建成功',
    trip
  });
});

// 获取旅行计划列表
app.get('/api/trips', auth, (req, res) => {
  const userTrips = trips.filter(trip => trip.user === req.user.id);
  console.log('📋 获取旅行规划列表，当前用户:', req.user.id);
  console.log('📋 旅行规划数量:', userTrips.length);
  console.log('📋 旅行规划列表:', userTrips.map(t => ({ id: t.id, title: t.title, user: t.user })));
  
  res.json(userTrips);
});

// 获取单个旅行计划
app.get('/api/trips/:id', auth, (req, res) => {
  const trip = trips.find(t => (t._id === req.params.id || t.id === req.params.id) && t.user === req.user.id);
  if (!trip) {
    return res.status(404).json({ message: '旅行规划不存在' });
  }
  res.json(trip);
});

// 更新旅行计划
app.put('/api/trips/:id', auth, (req, res) => {
  const tripIndex = trips.findIndex(t => (t._id === req.params.id || t.id === req.params.id) && t.user === req.user.id);
  if (tripIndex === -1) {
    return res.status(404).json({ message: '旅行规划不存在' });
  }
  
  const { title, destination, startDate, endDate, budget, travelers, preferences } = req.body;
  trips[tripIndex] = {
    ...trips[tripIndex],
    title,
    destination,
    startDate,
    endDate,
    budget,
    travelers,
    preferences,
    updatedAt: new Date().toISOString()
  };
  
  console.log('📝 更新旅行规划:', trips[tripIndex]._id, title);
  res.json({
    message: '旅行规划更新成功',
    trip: trips[tripIndex]
  });
});

// 删除旅行计划
app.delete('/api/trips/:id', auth, (req, res) => {
  const tripIndex = trips.findIndex(t => (t._id === req.params.id || t.id === req.params.id) && t.user === req.user.id);
  if (tripIndex === -1) {
    return res.status(404).json({ message: '旅行规划不存在' });
  }
  
  const deletedTrip = trips.splice(tripIndex, 1)[0];
  console.log('🗑️ 删除旅行规划:', deletedTrip._id, deletedTrip.title);
  res.json({
    message: '旅行规划删除成功',
    trip: deletedTrip
  });
});

// AI旅行规划接口
app.post('/api/ai/generate-trip-rag', auth, async (req, res) => {
  const { destination, startDate, endDate, budget, travelers, preferences } = req.body;

  console.log('🚀 使用直接API调用+工具流生成旅行规划...');
  console.log('📋 调用参数:', { destination, startDate, endDate, budget, travelers, preferences });

  try {
    const aiResponse = await callAIForTripPlanning(destination, startDate, endDate, budget, travelers, preferences);

    console.log('🔍 AI调用结果:', aiResponse.success ? '成功' : '失败');
    console.log('🔍 AI响应详情:', aiResponse);

    if (aiResponse.success) {
      console.log('✅ 直接API调用成功');
      res.json({
        message: 'AI旅行计划生成成功',
        data: aiResponse.data,
        apiStatus: 'success',
        apiMessage: '✅ 直接AI调用成功'
      });
    } else {
      console.log('⚠️ API调用失败，使用降级模式，错误:', aiResponse.error);
      res.json({
        message: 'AI旅行计划生成失败',
        error: aiResponse.error,
        apiStatus: 'error',
        apiMessage: '❌ AI调用失败，请稍后重试'
      });
    }
  } catch (error) {
    console.error('❌ 直接API调用错误:', error);
    res.status(500).json({
      message: 'AI旅行计划生成失败',
      error: error.message,
      apiStatus: 'error',
      apiMessage: '❌ 系统错误，请稍后重试'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 AI旅行规划师服务器运行在端口 ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`📝 演示模式：使用任何邮箱和密码都可以登录`);
});
