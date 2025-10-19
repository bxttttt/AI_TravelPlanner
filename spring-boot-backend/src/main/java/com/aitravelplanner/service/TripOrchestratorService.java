package com.aitravelplanner.service;

import com.aitravelplanner.model.TripRequest;
import com.aitravelplanner.model.TripResponse;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * 旅行规划编排器服务
 * 使用工具流（Tool Flow）串联AI生成流程
 */
@Service
public class TripOrchestratorService {
    
    private static final Logger logger = LoggerFactory.getLogger(TripOrchestratorService.class);
    
    @Autowired
    private ChatClient chatClient;
    
    @Autowired
    private BudgetEstimationTool budgetEstimationTool;
    
    @Autowired
    private ItineraryPlanningTool itineraryPlanningTool;
    
    @Autowired
    private RecommendationExtractionTool recommendationExtractionTool;
    
    /**
     * 执行完整的旅行规划工具流
     * 
     * 工具流执行顺序：
     * 1. estimateBudget() - 计算每日预算
     * 2. planItinerary() - 生成行程安排
     * 3. extractRecommendations() - 提取推荐内容
     * 4. 汇总返回结构化数据
     */
    public TripResponse executeTripPlanning(TripRequest request) {
        logger.info("🚀 开始执行旅行规划工具流...");
        logger.info("📋 用户请求: {}", request);
        
        try {
            // 步骤1: 计算旅行天数
            int days = calculateTripDays(request.getStartDate(), request.getEndDate());
            logger.info("📅 旅行天数: {} 天", days);
            
            // 步骤2: 调用预算估算工具
            logger.info("💰 步骤1: 调用预算估算工具");
            Map<String, Object> budgetResult = budgetEstimationTool.estimateBudget(
                request.getBudget(), 
                days, 
                request.getCompanions(), 
                request.getDestination()
            );
            logger.info("✅ 预算估算完成: {}", budgetResult);
            
            // 步骤3: 调用行程规划工具
            logger.info("🗺️ 步骤2: 调用行程规划工具");
            Map<String, Object> itineraryResult = itineraryPlanningTool.planItinerary(
                request.getDestination(),
                request.getStartDate(),
                request.getEndDate(),
                budgetResult,
                request.getPreferences()
            );
            logger.info("✅ 行程规划完成: {} 天行程", itineraryResult.get("days"));
            
            // 步骤4: 调用推荐提取工具
            logger.info("💡 步骤3: 调用推荐提取工具");
            Map<String, Object> recommendationsResult = recommendationExtractionTool.extractRecommendations(
                request.getDestination(),
                request.getPreferences(),
                itineraryResult
            );
            logger.info("✅ 推荐提取完成: 餐厅{}个, 贴士{}个", 
                recommendationsResult.get("restaurants"), 
                recommendationsResult.get("tips"));
            
            // 步骤5: 构建最终响应
            logger.info("📦 步骤4: 构建最终响应");
            TripResponse response = buildTripResponse(request, budgetResult, itineraryResult, recommendationsResult);
            
            logger.info("✅ 工具流执行完成，返回结构化数据");
            return response;
            
        } catch (Exception e) {
            logger.error("❌ 工具流执行失败: {}", e.getMessage(), e);
            throw new RuntimeException("旅行规划生成失败: " + e.getMessage(), e);
        }
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
            return 5; // 默认5天
        }
    }
    
    /**
     * 构建最终响应
     */
    private TripResponse buildTripResponse(TripRequest request, 
                                        Map<String, Object> budgetResult,
                                        Map<String, Object> itineraryResult,
                                        Map<String, Object> recommendationsResult) {
        
        // 构建每日行程
        List<TripResponse.DayItinerary> days = new ArrayList<>();
        List<Map<String, Object>> itineraryDays = (List<Map<String, Object>>) itineraryResult.get("days");
        
        for (int i = 0; i < itineraryDays.size(); i++) {
            Map<String, Object> dayData = itineraryDays.get(i);
            
            List<TripResponse.Activity> activities = new ArrayList<>();
            List<Map<String, Object>> dayActivities = (List<Map<String, Object>>) dayData.get("activities");
            
            for (Map<String, Object> activityData : dayActivities) {
                activities.add(new TripResponse.Activity(
                    (String) activityData.get("time"),
                    (String) activityData.get("activity"),
                    (String) activityData.get("desc")
                ));
            }
            
            days.add(new TripResponse.DayItinerary(
                i + 1,
                (String) dayData.get("title"),
                (Integer) dayData.get("dailyBudget"),
                activities
            ));
        }
        
        // 构建推荐
        TripResponse.Recommendations recommendations = new TripResponse.Recommendations(
            (List<String>) recommendationsResult.get("restaurants"),
            (List<String>) recommendationsResult.get("tips")
        );
        
        return new TripResponse(
            request.getBudget(),
            days,
            recommendations
        );
    }
}
