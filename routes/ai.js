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
预算：${budget}元
同行人数：${travelers}人
旅行偏好：${preferences}
${voiceInput ? `语音输入内容：${voiceInput}` : ''}

请生成包含以下内容的详细旅行计划：
1. 每日行程安排（时间、地点、活动、费用估算）
2. 推荐住宿（考虑预算和位置）
3. 交通建议
4. 必游景点和推荐餐厅
5. 预算分配建议

重要要求：
- 必须为每一天生成详细的行程安排
- 每日活动数量控制在3-5个，避免过于紧凑
- 合理安排休息时间
- 考虑交通时间和景点开放时间
- 预算分配要合理，避免超支

请以JSON格式返回，包含itinerary数组，每个元素包含date、activities等字段。
itinerary数组应该包含${daysDiff}天的详细安排。
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `你是一个专业的旅行规划师，擅长制定合理、舒适的旅行计划。请遵循以下原则：

1. 行程安排要合理，每天不超过4-5个主要活动
2. 活动之间要预留充足的交通时间
3. 预算分配要科学：住宿30-40%，餐饮25-30%，交通15-20%，景点门票10-15%，其他5-10%
4. 考虑旅行者的体力和兴趣，安排适当的休息时间
5. 根据季节和天气调整活动安排
6. 提供实用的交通和住宿建议

请以JSON格式返回结构化的旅行计划，确保数据格式正确。`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.6
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
      message: 'AI旅行计划生成成功',
      data: parsedResponse
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
