const express = require('express');
const OpenAI = require('openai');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// 获取用户的OpenAI API Key
const getUserApiKey = async (userId) => {
  const user = await User.findById(userId);
  return user?.preferences?.openaiApiKey || process.env.OPENAI_API_KEY;
};

// AI生成旅行计划
router.post('/generate-trip', auth, async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, travelers, preferences, voiceInput } = req.body;
    
    const apiKey = await getUserApiKey(req.userId);
    if (!apiKey) {
      return res.status(400).json({ 
        message: '请先在设置中配置OpenAI API Key' 
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    // 计算旅行天数
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const daysDiff = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
    
    // 构建提示词
    const prompt = `
作为专业的旅行规划师，请为以下需求生成详细的${daysDiff}天旅行计划：

目的地：${destination}
出发日期：${startDate}
返回日期：${endDate}
旅行天数：${daysDiff}天
总预算：${budget}元
同行人数：${travelers}人
旅行偏好：${preferences}
${voiceInput ? `语音输入内容：${voiceInput}` : ''}

请严格按照以下JSON格式返回，确保数据结构完整：

{
  "summary": {
    "destination": "${destination}",
    "totalDays": ${daysDiff},
    "totalBudget": ${budget},
    "dailyBudget": ${Math.round(budget / daysDiff)},
    "travelers": ${travelers}
  },
  "itinerary": [
    {
      "day": 1,
      "date": "${startDate}",
      "title": "第1天 - 抵达与初探",
      "dailyBudget": ${Math.round(budget / daysDiff)},
      "activities": [
        {
          "time": "09:00-10:00",
          "title": "活动名称",
          "description": "详细描述",
          "location": "具体地址",
          "cost": 100,
          "category": "景点"
        }
      ],
      "meals": {
        "breakfast": "早餐建议",
        "lunch": "午餐建议", 
        "dinner": "晚餐建议"
      },
      "accommodation": "住宿建议",
      "transportation": "交通建议",
      "tips": "当日实用贴士"
    }
  ],
  "recommendations": {
    "restaurants": [
      {
        "name": "餐厅名称",
        "specialty": "特色菜",
        "priceRange": "价格范围",
        "location": "地址"
      }
    ],
    "attractions": [
      {
        "name": "景点名称",
        "description": "景点描述",
        "bestTime": "最佳游览时间",
        "ticketPrice": "门票价格"
      }
    ],
    "tips": {
      "cultural": "文化注意事项",
      "transportation": "交通建议",
      "safety": "安全提醒",
      "weather": "天气建议"
    }
  }
}

重要要求：
1. 必须返回完整的JSON格式，不要包含任何其他文字
2. 每日活动控制在2-4个主要活动，避免过于紧凑
3. 每日预算要合理分配，总预算不超过${budget}元
4. 活动时间要合理，考虑交通时间和景点开放时间
5. 包含餐饮、住宿、交通建议
6. 为每一天生成${daysDiff}天的完整行程
7. 每个活动必须包含cost字段（费用估算）
8. 活动类别必须是：景点、餐厅、交通、住宿、购物、其他
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `你是一个专业的旅行规划师，擅长制定合理、舒适的旅行计划。请严格遵循以下原则：

1. 必须返回完整的JSON格式，不要包含任何其他文字或解释
2. 每日活动控制在2-4个主要活动，避免过于紧凑
3. 预算分配要科学：住宿30-40%，餐饮25-30%，交通15-20%，景点门票10-15%，其他5-10%
4. 活动时间要合理，考虑交通时间和景点开放时间
5. 每个活动必须包含cost字段（费用估算）
6. 活动类别必须是：景点、餐厅、交通、住宿、购物、其他
7. 为每一天生成完整的行程安排，包含餐饮、住宿、交通建议
8. 确保JSON格式正确，可以被直接解析

请严格按照用户提供的JSON模板格式返回数据。`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.5
    });

    const aiResponse = completion.choices[0].message.content;
    
    // 清理AI返回的文本，提取JSON部分
    let jsonText = aiResponse;
    
    // 尝试提取JSON部分（去除可能的markdown格式）
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    // 尝试解析AI返回的JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonText);
      
      // 验证必要字段
      if (!parsedResponse.itinerary || !Array.isArray(parsedResponse.itinerary)) {
        throw new Error('AI返回数据格式不正确：缺少itinerary数组');
      }
      
      // 确保每个行程日都有必要的字段
      parsedResponse.itinerary = parsedResponse.itinerary.map((day, index) => {
        if (!day.activities) day.activities = [];
        if (!day.meals) day.meals = {};
        if (!day.dailyBudget) day.dailyBudget = Math.round(budget / daysDiff);
        if (!day.day) day.day = index + 1;
        return day;
      });
      
    } catch (parseError) {
      console.error('AI返回数据解析失败:', parseError);
      console.error('原始AI响应:', aiResponse);
      
      // 如果解析失败，返回错误信息
      return res.status(500).json({ 
        message: 'AI返回数据格式不正确，请重试',
        error: parseError.message,
        rawResponse: aiResponse
      });
    }

    res.json({
      message: 'AI旅行计划生成成功',
      data: parsedResponse,
      success: true
    });

  } catch (error) {
    console.error('AI生成旅行计划错误:', error);
    res.status(500).json({ 
      message: 'AI服务暂时不可用，请稍后重试',
      error: error.message 
    });
  }
});

// 语音转文字
router.post('/speech-to-text', auth, async (req, res) => {
  try {
    const { audioData } = req.body;
    
    const apiKey = await getUserApiKey(req.userId);
    if (!apiKey) {
      return res.status(400).json({ 
        message: '请先在设置中配置OpenAI API Key' 
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    // 这里需要处理音频数据
    // 实际实现中需要将base64音频数据转换为适当的格式
    const transcription = await openai.audio.transcriptions.create({
      file: audioData,
      model: "whisper-1",
      language: "zh"
    });

    res.json({
      message: '语音识别成功',
      text: transcription.text
    });

  } catch (error) {
    console.error('语音识别错误:', error);
    res.status(500).json({ 
      message: '语音识别服务暂时不可用',
      error: error.message 
    });
  }
});

// 智能问答
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, tripId } = req.body;
    
    const apiKey = await getUserApiKey(req.userId);
    if (!apiKey) {
      return res.status(400).json({ 
        message: '请先在设置中配置OpenAI API Key' 
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个专业的旅行助手，可以帮助用户解答旅行相关问题，提供实用的旅行建议。"
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;

    res.json({
      message: 'AI回复成功',
      response: response
    });

  } catch (error) {
    console.error('AI聊天错误:', error);
    res.status(500).json({ 
      message: 'AI服务暂时不可用',
      error: error.message 
    });
  }
});

// 获取AI推荐内容（餐厅、景点、贴士）
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { destination, type = 'all' } = req.query;
    
    const apiKey = await getUserApiKey(req.userId);
    if (!apiKey) {
      return res.status(400).json({ 
        message: '请先在设置中配置OpenAI API Key' 
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    let prompt = '';
    if (type === 'restaurants') {
      prompt = `请为目的地"${destination}"推荐5个优质餐厅，包括：
      1. 餐厅名称和特色
      2. 推荐菜品
      3. 人均消费范围
      4. 地址和营业时间
      5. 预订建议
      
      请以JSON格式返回，包含name, specialty, recommended_dishes, price_range, address, hours, booking_tips字段。`;
    } else if (type === 'attractions') {
      prompt = `请为目的地"${destination}"推荐5个必游景点，包括：
      1. 景点名称和简介
      2. 最佳游览时间
      3. 门票价格
      4. 游览时长建议
      5. 交通方式
      6. 游览贴士
      
      请以JSON格式返回，包含name, description, best_time, ticket_price, duration, transportation, tips字段。`;
    } else if (type === 'tips') {
      prompt = `请为目的地"${destination}"提供实用的旅行贴士，包括：
      1. 当地文化注意事项
      2. 交通出行建议
      3. 安全提醒
      4. 最佳旅行时间
      5. 必备物品清单
      6. 紧急联系方式
      
      请以JSON格式返回，包含cultural_notes, transportation_tips, safety_reminders, best_season, essentials, emergency_contacts字段。`;
    } else {
      // 获取所有类型的推荐
      prompt = `请为目的地"${destination}"提供全面的旅行推荐，包括：
      
      餐厅推荐（3个）：
      - 餐厅名称、特色、推荐菜品、价格范围
      
      景点推荐（3个）：
      - 景点名称、简介、最佳时间、门票价格
      
      实用贴士：
      - 文化注意事项、交通建议、安全提醒、最佳季节
      
      请以JSON格式返回，包含restaurants, attractions, tips三个数组。`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个专业的旅行顾问，擅长为不同目的地提供详细的餐厅、景点和实用建议。请以JSON格式返回结构化的推荐内容。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    
    // 尝试解析AI返回的JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      // 如果解析失败，返回原始文本
      parsedResponse = { rawResponse: aiResponse };
    }

    res.json({
      message: 'AI推荐内容生成成功',
      data: parsedResponse,
      destination: destination,
      type: type
    });

  } catch (error) {
    console.error('AI推荐内容生成错误:', error);
    res.status(500).json({ 
      message: 'AI推荐服务暂时不可用，请稍后重试',
      error: error.message 
    });
  }
});

module.exports = router;
