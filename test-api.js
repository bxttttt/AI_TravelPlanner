const axios = require('axios');

async function testAPI() {
  try {
    console.log('测试API调用...');
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "请简单回复：API测试成功"
        }
      ],
      max_tokens: 50
    }, {
      headers: {
        'Authorization': 'Bearer sk-5aad8ea912dd411ebcf931d10f3ca7e8',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('API调用成功！');
    console.log('响应:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('API调用失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testAPI();
