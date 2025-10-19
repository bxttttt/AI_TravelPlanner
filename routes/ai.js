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

    // 构建提示词
    const prompt = `
作为专业的旅行规划师，请为以下需求生成详细的旅行计划：

目的地：${destination}
出发日期：${startDate}
返回日期：${endDate}
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

请以JSON格式返回，包含itinerary数组，每个元素包含date、activities等字段。
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个专业的旅行规划师，擅长根据用户需求制定详细的旅行计划。请以JSON格式返回结构化的旅行计划。"
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

module.exports = router;
