// 直接测试AI API调用
const axios = require('axios');

async function testAIDirectly() {
    console.log('🤖 直接测试AI API调用');
    
    const prompt = `请从以下语音输入中提取旅行信息，并返回JSON格式的结构化数据：

当前日期：2025年10月19日 星期六（2025-10-19）
语音输入："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"

请提取以下信息：
1. destination: 目的地（国家或城市名称）
2. travelers: 同行人数（数字）
3. startDate: 出发日期（YYYY-MM-DD格式，如果未指定则使用今天：2025-10-19）
4. endDate: 返回日期（YYYY-MM-DD格式，如果未指定则根据天数从今天开始计算）
5. budget: 预算（数字，单位：元）
6. preferences: 旅行偏好（数组，如["美食", "购物", "文化"]）

注意：
- 今天是2025年10月19日 星期六（2025-10-19）
- 如果语音中提到天数但没有具体日期，请从今天（2025-10-19）开始计算
- 预算请统一转换为元为单位
- 偏好请从以下选项中选择：美食、购物、文化、自然、动漫、娱乐、亲子
- 如果信息不明确，请使用合理的默认值

请只返回JSON格式的数据，不要包含其他文字。`;

    try {
        console.log('📤 发送AI请求...');
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
                'Authorization': 'Bearer sk-5aad8ea912dd411ebcf931d10f3ca7e8',
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('📊 AI响应状态:', response.status);
        console.log('📊 AI响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.output && response.data.output.text) {
            console.log('✅ AI返回文本:', response.data.output.text);
        } else {
            console.log('❌ AI响应格式错误');
        }
        
    } catch (error) {
        console.error('❌ AI API调用失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testAIDirectly().then(() => {
    console.log('\n✅ AI API测试完成！');
}).catch(error => {
    console.error('❌ 测试失败:', error);
});
