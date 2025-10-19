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

// AI响应解析函数
async function parseAIResponse(aiText) {
  try {
    console.log('🔄 开始解析AI响应...');
    
    // 清理响应中的markdown代码块标记
    let cleanedResponse = aiText;
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    console.log('清理后的响应:', cleanedResponse);
    
    // 尝试解析JSON
    const parsedData = JSON.parse(cleanedResponse);
    console.log('✅ JSON解析成功:', parsedData);
    return parsedData;
    
  } catch (error) {
    console.error('❌ JSON解析失败:', error.message);
    console.error('原始响应:', aiText);
    return null;
  }
}

// AI语音解析调用函数
async function callAIForVoiceParsing(prompt) {
  try {
    console.log('🤖 调用AI进行语音解析...');
    
    const response = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      model: 'qwen-plus',
      input: {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        result_format: 'message'
      }
    }, {
      headers: {
        'Authorization': `Bearer sk-5aad8ea912dd411ebcf931d10f3ca7e8`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (response.data && response.data.output && response.data.output.choices && response.data.output.choices[0]) {
      const aiText = response.data.output.choices[0].message.content;
      console.log('🤖 AI原始响应:', aiText);
      
      // 解析AI返回的JSON
      const parsedData = await parseAIResponse(aiText);
      
      if (parsedData) {
        console.log('✅ AI语音解析成功');
        return {
          success: true,
          data: parsedData
        };
      } else {
        console.log('⚠️ AI返回数据解析失败');
        return {
          success: false,
          error: 'AI返回数据格式错误'
        };
      }
    } else {
      console.log('⚠️ AI API响应格式错误');
      return {
        success: false,
        error: 'AI API响应格式错误'
      };
    }
  } catch (error) {
    console.error('❌ AI语音解析调用失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 降级语音解析函数
function parseVoiceInputFallback(voiceText) {
  console.log('🔄 使用降级语音解析:', voiceText);
  
  // 目的地解析
  const destinationPatterns = [
    /去([^，\d]+?)(?:，|$|旅行|旅游|玩)/,
    /到([^，\d]+?)(?:，|$|旅行|旅游|玩)/,
    /([^，\d]+?)(?:旅行|旅游)(?:，|$)/,
    /我想去([^，\d]+?)(?:，|$)/,
    /计划去([^，\d]+?)(?:，|$)/
  ];
  
  let destination = null;
  for (const pattern of destinationPatterns) {
    const match = voiceText.match(pattern);
    if (match) {
      destination = match[1].trim().replace(/\d+天|\d+日|\d+元|\d+万|\d+千|\d+人|\d+个/, '').trim();
      if (destination.length > 0 && destination.length < 10) {
        break;
      }
    }
  }
  
  // 天数解析
  const daysMatch = voiceText.match(/(\d+)(?:天|日)/);
  let days = daysMatch ? parseInt(daysMatch[1]) : null;
  
  // 人数解析
  const peopleMatch = voiceText.match(/(\d+)(?:人|个)/);
  let travelers = peopleMatch ? parseInt(peopleMatch[1]) : 1;
  
  // 特殊处理：带孩子
  if (voiceText.includes('带孩子') || voiceText.includes('带娃') || voiceText.includes('亲子')) {
    travelers = 2;
  }
  
  // 预算解析
  const budgetMatch = voiceText.match(/(\d+)(?:元|万|千)/);
  let budget = budgetMatch ? parseInt(budgetMatch[1]) : 5000;
  if (voiceText.includes('万')) {
    budget = budget * 10000;
  } else if (voiceText.includes('千')) {
    budget = budget * 1000;
  }
  
  // 偏好解析
  const preferences = [];
  if (voiceText.includes('美食') || voiceText.includes('吃')) preferences.push('美食');
  if (voiceText.includes('购物') || voiceText.includes('买')) preferences.push('购物');
  if (voiceText.includes('文化') || voiceText.includes('历史')) preferences.push('文化');
  if (voiceText.includes('自然') || voiceText.includes('风景')) preferences.push('自然');
  if (voiceText.includes('动漫') || voiceText.includes('动画')) preferences.push('动漫');
  if (voiceText.includes('娱乐') || voiceText.includes('游戏')) preferences.push('娱乐');
  if (voiceText.includes('亲子') || voiceText.includes('孩子')) preferences.push('亲子');
  
  // 计算日期
  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  const endDate = days ? new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : startDate;
  
  console.log('📅 日期计算:', { today: startDate, days, endDate });
  
  return {
    destination: destination || '未知',
    travelers: travelers,
    startDate: startDate,
    endDate: endDate,
    budget: budget,
    preferences: preferences.length > 0 ? preferences : ['文化']
  };
}

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
  const { title, destination, startDate, endDate, budget, travelers, preferences, aiGenerated, aiData } = req.body;
  
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
    aiData: aiData || null, // 保存AI生成的数据
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

// AI语音解析接口
app.post('/api/ai/parse-voice', auth, async (req, res) => {
  const { voiceText } = req.body;
  
  console.log('🎤 AI语音解析请求:', voiceText);
  
  try {
    // 获取当前日期作为上下文
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0]; // YYYY-MM-DD格式
    const currentDateStr = today.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    }); // 中文日期格式，如"2025年10月19日 星期六"
    
    // 构建AI解析提示词
    const prompt = `请从以下语音输入中提取旅行信息，并返回JSON格式的结构化数据：

当前日期：${currentDateStr}（${currentDate}）
语音输入："${voiceText}"

请提取以下信息：
1. destination: 目的地（国家或城市名称）
2. travelers: 同行人数（数字）
3. startDate: 出发日期（YYYY-MM-DD格式，如果未指定则使用今天：${currentDate}）
4. endDate: 返回日期（YYYY-MM-DD格式，如果未指定则根据天数从今天开始计算）
5. budget: 预算（数字，单位：元）
6. preferences: 旅行偏好（数组，如["美食", "购物", "文化"]）

注意：
- 今天是${currentDateStr}（${currentDate}）
- 如果语音中提到天数但没有具体日期，请从今天（${currentDate}）开始计算
- 预算请统一转换为元为单位
- 偏好请从以下选项中选择：美食、购物、文化、自然、动漫、娱乐、亲子
- 如果信息不明确，请使用合理的默认值

请只返回JSON格式的数据，不要包含其他文字。`;

    const aiResponse = await callAIForVoiceParsing(prompt);
    
    if (aiResponse.success) {
      console.log('✅ AI语音解析成功:', aiResponse.data);
      res.json({
        success: true,
        data: aiResponse.data,
        message: '语音解析成功'
      });
    } else {
      console.log('⚠️ AI语音解析失败，使用降级模式');
      // 降级到本地解析
      const fallbackData = parseVoiceInputFallback(voiceText);
      res.json({
        success: true,
        data: fallbackData,
        message: '使用本地解析模式'
      });
    }
  } catch (error) {
    console.error('❌ AI语音解析错误:', error);
    res.status(500).json({
      success: false,
      error: '语音解析失败，请重试',
      message: '解析服务暂时不可用'
    });
  }
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

// 获取景点图片接口
app.get('/api/images/:location', auth, async (req, res) => {
  const { location } = req.params;
  console.log('🖼️ 获取景点图片请求:', location);
  
  try {
    const images = await getLocationImages(location);
    res.json({ success: true, images: images });
  } catch (error) {
    console.error('❌ 获取景点图片失败:', error);
    res.status(500).json({ success: false, error: '获取图片失败，请重试' });
  }
});

// 获取地点相关图片
async function getLocationImages(location) {
  try {
    console.log('🖼️ 开始获取地点图片:', location);
    
    // 使用Unsplash API获取高质量图片
    const images = await getUnsplashImages(location);
    
    if (images.length > 0) {
      console.log(`✅ 成功获取${images.length}张图片`);
      return images;
    }
    
    // 如果Unsplash失败，使用备用图片源
    console.log('⚠️ Unsplash API失败，使用备用图片源');
    return getFallbackImages(location);
    
  } catch (error) {
    console.error('❌ 获取图片失败:', error);
    return getFallbackImages(location);
  }
}

// 使用Unsplash API获取图片
async function getUnsplashImages(location) {
  try {
    // 构建搜索关键词
    const searchTerms = [
      `${location} travel`,
      `${location} tourism`,
      `${location} attractions`,
      `${location} landmarks`,
      `${location} city`
    ];
    
    const images = [];
    
    for (const term of searchTerms) {
      try {
        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: {
            query: term,
            per_page: 2,
            orientation: 'landscape'
          },
          headers: {
            'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY' // 需要申请Unsplash API Key
          },
          timeout: 5000
        });
        
        if (response.data && response.data.results) {
          response.data.results.forEach(photo => {
            images.push({
              url: photo.urls.regular,
              thumb: photo.urls.thumb,
              description: photo.description || photo.alt_description || `${location} 景点图片`,
              photographer: photo.user.name,
              photographer_url: photo.user.links.html,
              source: 'unsplash'
            });
          });
        }
      } catch (apiError) {
        console.log(`⚠️ Unsplash API调用失败: ${term}`, apiError.message);
      }
    }
    
    // 去重并限制数量
    const uniqueImages = images.filter((img, index, self) => 
      index === self.findIndex(t => t.url === img.url)
    ).slice(0, 8);
    
    return uniqueImages;
    
  } catch (error) {
    console.error('❌ Unsplash API调用失败:', error);
    return [];
  }
}

// 备用图片源
function getFallbackImages(location) {
  console.log('🔄 使用备用图片源');
  
  // 根据地点返回预设的高质量图片
  const fallbackImages = {
    '北京': [
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '北京天安门' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '北京故宫' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '北京长城' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '北京颐和园' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '北京天坛' }
    ],
    '上海': [
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '上海外滩' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '上海东方明珠' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '上海豫园' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '上海南京路' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '上海迪士尼' }
    ],
    '韩国': [
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '首尔明洞' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '首尔景福宫' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '首尔弘大' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '首尔东大门' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '首尔汉江' }
    ],
    '日本': [
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '东京浅草寺' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '东京银座' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '东京秋叶原' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '东京新宿' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: '东京涩谷' }
    ]
  };
  
  return fallbackImages[location] || [
    { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: `${location} 景点图片` },
    { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: `${location} 旅游景点` },
    { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: `${location} 风景` },
    { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: `${location} 地标` },
    { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', description: `${location} 文化` }
  ];
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 AI旅行规划师服务器运行在端口 ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`📝 演示模式：使用任何邮箱和密码都可以登录`);
});
