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

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * 行程规划工具
 * 使用Spring AI调用大模型生成详细的多日行程安排
 */
@Service
public class ItineraryPlanningTool {
    
    private static final Logger logger = LoggerFactory.getLogger(ItineraryPlanningTool.class);
    
    @Autowired
    private ChatClient chatClient;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 生成旅行行程安排
     * 
     * @param destination 目的地
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param budgetResult 预算信息
     * @param preferences 用户偏好
     * @return 行程安排结果
     */
    public Map<String, Object> planItinerary(String destination, String startDate, String endDate,
                                           Map<String, Object> budgetResult, String preferences) {
        logger.info("🗺️ 开始行程规划: 目的地={}, 日期={} 到 {}", destination, startDate, endDate);
        
        try {
            // 计算旅行天数
            int days = calculateTripDays(startDate, endDate);
            logger.info("📅 旅行天数: {} 天", days);
            
            // 构建行程规划提示词
            String prompt = buildItineraryPrompt(destination, startDate, endDate, days, budgetResult, preferences);
            logger.info("📝 行程规划提示词长度: {} 字符", prompt.length());
            
            // 调用AI生成行程
            ChatResponse response = chatClient.call(new Prompt(new UserMessage(prompt)));
            String aiResponse = response.getResult().getOutput().getContent();
            logger.info("🤖 AI行程规划响应长度: {} 字符", aiResponse.length());
            
            // 解析AI响应
            Map<String, Object> itineraryResult = parseItineraryResponse(aiResponse, days);
            logger.info("✅ 行程规划完成: {} 天行程", itineraryResult.get("days"));
            
            return itineraryResult;
            
        } catch (Exception e) {
            logger.error("❌ 行程规划失败: {}", e.getMessage(), e);
            // 返回默认行程
            return getDefaultItinerary(destination, startDate, endDate);
        }
    }
    
    /**
     * 构建行程规划提示词
     */
    private String buildItineraryPrompt(String destination, String startDate, String endDate, 
                                      int days, Map<String, Object> budgetResult, String preferences) {
        return String.format("""
            你是一个专业的旅行规划师。请为以下旅行需求制定详细的多日行程安排：
            
            旅行信息：
            - 目的地：%s
            - 出发日期：%s
            - 返回日期：%s
            - 旅行天数：%d天
            - 用户偏好：%s
            - 每日预算：%s元
            
            请按照以下格式返回JSON格式的行程安排：
            {
                "summary": "行程总体概述",
                "days": [
                    {
                        "date": "YYYY-MM-DD",
                        "title": "第X天：标题",
                        "dailyBudget": 每日预算金额,
                        "activities": [
                            {
                                "time": "时间",
                                "activity": "活动名称",
                                "desc": "详细描述",
                                "location": "地点",
                                "cost": 预估费用,
                                "category": "活动类型"
                            }
                        ]
                    }
                ]
            }
            
            要求：
            1. 每天安排3-5个主要活动，避免过于紧凑
            2. 合理安排时间，考虑交通和休息时间
            3. 结合用户偏好和目的地特色
            4. 包含文化体验、美食、景点、购物等多样化活动
            5. 第一天和最后一天考虑抵达和离开的时间
            6. 活动描述要具体详细，包含实用信息
            7. 费用估算要合理，符合预算分配
            8. 考虑当地交通、天气、开放时间等实际因素
            """, destination, startDate, endDate, days, preferences, 
            budgetResult.get("dailyBudget"));
    }
    
    /**
     * 解析AI行程响应
     */
    private Map<String, Object> parseItineraryResponse(String aiResponse, int expectedDays) {
        try {
            // 清理AI响应，移除可能的markdown标记
            String cleanResponse = cleanAIResponse(aiResponse);
            
            // 尝试解析JSON响应
            Map<String, Object> result = objectMapper.readValue(cleanResponse, Map.class);
            
            // 验证行程天数
            List<Map<String, Object>> days = (List<Map<String, Object>>) result.get("days");
            if (days == null || days.size() != expectedDays) {
                logger.warn("行程天数不匹配，期望{}天，实际{}天", expectedDays, days != null ? days.size() : 0);
            }
            
            return result;
            
        } catch (Exception e) {
            logger.warn("AI响应解析失败，使用默认行程: {}", e.getMessage());
            return getDefaultItinerary("未知目的地", "2025-01-01", "2025-01-05");
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
     * 计算旅行天数
     */
    private int calculateTripDays(String startDate, String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            return (int) ChronoUnit.DAYS.between(start, end) + 1;
        } catch (Exception e) {
            logger.warn("日期解析失败，使用默认天数: {}", e.getMessage());
            return 5;
        }
    }
    
    /**
     * 获取默认行程
     */
    private Map<String, Object> getDefaultItinerary(String destination, String startDate, String endDate) {
        Map<String, Object> result = new HashMap<>();
        result.put("summary", "默认行程安排");
        
        List<Map<String, Object>> days = new ArrayList<>();
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        
        int dayCount = 1;
        LocalDate currentDate = start;
        while (!currentDate.isAfter(end)) {
            Map<String, Object> day = new HashMap<>();
            day.put("date", currentDate.toString());
            day.put("title", "第" + dayCount + "天：探索" + destination);
            day.put("dailyBudget", 2000);
            
            List<Map<String, Object>> activities = new ArrayList<>();
            activities.add(createActivity("上午", "城市探索", "游览当地著名景点", "市中心", 500, "景点"));
            activities.add(createActivity("下午", "美食体验", "品尝当地特色美食", "特色餐厅", 300, "餐饮"));
            activities.add(createActivity("晚上", "休闲时光", "体验当地夜生活", "商业区", 200, "娱乐"));
            
            day.put("activities", activities);
            days.add(day);
            
            currentDate = currentDate.plusDays(1);
            dayCount++;
        }
        
        result.put("days", days);
        return result;
    }
    
    /**
     * 创建活动
     */
    private Map<String, Object> createActivity(String time, String activity, String desc, 
                                             String location, Integer cost, String category) {
        Map<String, Object> activityMap = new HashMap<>();
        activityMap.put("time", time);
        activityMap.put("activity", activity);
        activityMap.put("desc", desc);
        activityMap.put("location", location);
        activityMap.put("cost", cost);
        activityMap.put("category", category);
        return activityMap;
    }
}
