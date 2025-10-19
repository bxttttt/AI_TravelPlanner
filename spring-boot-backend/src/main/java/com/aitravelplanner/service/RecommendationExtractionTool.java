package com.aitravelplanner.service;

import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

/**
 * 推荐提取工具
 * 使用Spring AI从行程中提取餐厅推荐和实用贴士
 */
@Service
public class RecommendationExtractionTool {
    
    private static final Logger logger = LoggerFactory.getLogger(RecommendationExtractionTool.class);
    
    @Autowired
    private ChatClient chatClient;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 提取推荐内容
     * 
     * @param destination 目的地
     * @param preferences 用户偏好
     * @param itineraryResult 行程结果
     * @return 推荐内容
     */
    public Map<String, Object> extractRecommendations(String destination, String preferences,
                                                    Map<String, Object> itineraryResult) {
        logger.info("💡 开始提取推荐内容: 目的地={}, 偏好={}", destination, preferences);
        
        try {
            // 构建推荐提取提示词
            String prompt = buildRecommendationPrompt(destination, preferences, itineraryResult);
            logger.info("📝 推荐提取提示词长度: {} 字符", prompt.length());
            
            // 调用AI提取推荐
            ChatResponse response = chatClient.call(new Prompt(new UserMessage(prompt)));
            String aiResponse = response.getResult().getOutput().getContent();
            logger.info("🤖 AI推荐提取响应长度: {} 字符", aiResponse.length());
            
            // 解析AI响应
            Map<String, Object> recommendationResult = parseRecommendationResponse(aiResponse);
            logger.info("✅ 推荐提取完成: 餐厅{}个, 贴士{}个", 
                ((List<?>) recommendationResult.get("restaurants")).size(),
                ((List<?>) recommendationResult.get("tips")).size());
            
            return recommendationResult;
            
        } catch (Exception e) {
            logger.error("❌ 推荐提取失败: {}", e.getMessage(), e);
            // 返回默认推荐
            return getDefaultRecommendations(destination);
        }
    }
    
    /**
     * 构建推荐提取提示词
     */
    private String buildRecommendationPrompt(String destination, String preferences,
                                          Map<String, Object> itineraryResult) {
        return String.format("""
            你是一个专业的旅行顾问。请基于以下信息为旅行者提供个性化的推荐内容：
            
            旅行信息：
            - 目的地：%s
            - 用户偏好：%s
            - 行程安排：%s
            
            请按照以下格式返回JSON格式的推荐内容：
            {
                "restaurants": [
                    "餐厅名称1 - 特色菜和推荐理由",
                    "餐厅名称2 - 特色菜和推荐理由",
                    "餐厅名称3 - 特色菜和推荐理由"
                ],
                "attractions": [
                    "景点名称1 - 游览亮点和最佳时间",
                    "景点名称2 - 游览亮点和最佳时间",
                    "景点名称3 - 游览亮点和最佳时间"
                ],
                "tips": [
                    "实用贴士1 - 具体建议和注意事项",
                    "实用贴士2 - 具体建议和注意事项",
                    "实用贴士3 - 具体建议和注意事项"
                ],
                "localInsights": [
                    "当地文化洞察1",
                    "当地文化洞察2",
                    "当地文化洞察3"
                ]
            }
            
            要求：
            1. 餐厅推荐要结合用户偏好，包含具体名称、特色菜和推荐理由
            2. 景点推荐要包含游览亮点、最佳游览时间和实用信息
            3. 实用贴士要具体可操作，包含交通、语言、文化、安全等方面
            4. 当地文化洞察要深入，帮助旅行者更好地融入当地文化
            5. 所有推荐都要与目的地和用户偏好高度匹配
            6. 提供3-5个高质量的推荐项目
            """, destination, preferences, itineraryResult.get("summary"));
    }
    
    /**
     * 解析AI推荐响应
     */
    private Map<String, Object> parseRecommendationResponse(String aiResponse) {
        try {
            // 清理AI响应
            String cleanResponse = cleanAIResponse(aiResponse);
            
            // 尝试解析JSON响应
            Map<String, Object> result = objectMapper.readValue(cleanResponse, Map.class);
            
            // 验证必要字段
            if (!result.containsKey("restaurants")) {
                result.put("restaurants", Arrays.asList("当地特色餐厅"));
            }
            if (!result.containsKey("tips")) {
                result.put("tips", Arrays.asList("提前了解当地文化和习俗"));
            }
            
            return result;
            
        } catch (Exception e) {
            logger.warn("AI推荐响应解析失败，使用默认推荐: {}", e.getMessage());
            return getDefaultRecommendations("未知目的地");
        }
    }
    
    /**
     * 清理AI响应
     */
    private String cleanAIResponse(String response) {
        // 移除markdown代码块标记
        response = response.replaceAll("```json", "").replaceAll("```", "");
        // 移除可能的换行符和多余空格
        response = response.trim();
        return response;
    }
    
    /**
     * 获取默认推荐
     */
    private Map<String, Object> getDefaultRecommendations(String destination) {
        Map<String, Object> result = new HashMap<>();
        
        result.put("restaurants", Arrays.asList(
            destination + "当地特色餐厅 - 品尝地道美食",
            "网红打卡餐厅 - 体验当地文化",
            "传统老字号 - 感受历史韵味"
        ));
        
        result.put("attractions", Arrays.asList(
            destination + "著名景点 - 必游之地",
            "文化博物馆 - 了解当地历史",
            "自然景观 - 享受自然风光"
        ));
        
        result.put("tips", Arrays.asList(
            "提前预订热门景点门票，避免排队",
            "了解当地交通方式，下载相关APP",
            "准备常用药品，注意饮食卫生",
            "学习基本当地语言，便于沟通",
            "注意当地文化习俗，尊重当地传统"
        ));
        
        result.put("localInsights", Arrays.asList(
            "了解当地文化背景，更好地融入当地生活",
            "关注当地节日和活动，体验独特文化",
            "与当地人交流，获得更多实用建议"
        ));
        
        return result;
    }
}
