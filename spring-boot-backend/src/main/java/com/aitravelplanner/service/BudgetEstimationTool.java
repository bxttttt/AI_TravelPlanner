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
 * 预算估算工具
 * 使用Spring AI调用大模型进行智能预算分配
 */
@Service
public class BudgetEstimationTool {
    
    private static final Logger logger = LoggerFactory.getLogger(BudgetEstimationTool.class);
    
    @Autowired
    private ChatClient chatClient;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 估算旅行预算分配
     * 
     * @param totalBudget 总预算
     * @param days 旅行天数
     * @param companions 同行人数
     * @param destination 目的地
     * @return 预算分配结果
     */
    public Map<String, Object> estimateBudget(Integer totalBudget, Integer days, 
                                            Integer companions, String destination) {
        logger.info("💰 开始预算估算: 总预算={}, 天数={}, 人数={}, 目的地={}", 
                   totalBudget, days, companions, destination);
        
        try {
            // 构建预算估算提示词
            String prompt = buildBudgetPrompt(totalBudget, days, companions, destination);
            logger.info("📝 预算估算提示词: {}", prompt);
            
            // 调用AI进行预算估算
            ChatResponse response = chatClient.call(new Prompt(new UserMessage(prompt)));
            String aiResponse = response.getResult().getOutput().getContent();
            logger.info("🤖 AI预算估算响应: {}", aiResponse);
            
            // 解析AI响应
            Map<String, Object> budgetResult = parseBudgetResponse(aiResponse, totalBudget, days);
            logger.info("✅ 预算估算完成: {}", budgetResult);
            
            return budgetResult;
            
        } catch (Exception e) {
            logger.error("❌ 预算估算失败: {}", e.getMessage(), e);
            // 返回默认预算分配
            return getDefaultBudgetAllocation(totalBudget, days);
        }
    }
    
    /**
     * 构建预算估算提示词
     */
    private String buildBudgetPrompt(Integer totalBudget, Integer days, 
                                   Integer companions, String destination) {
        return String.format("""
            你是一个专业的旅行预算规划师。请为以下旅行需求制定详细的预算分配方案：
            
            旅行信息：
            - 目的地：%s
            - 旅行天数：%d天
            - 同行人数：%d人
            - 总预算：%d元人民币
            
            请按照以下格式返回JSON格式的预算分配：
            {
                "dailyBudget": 每日预算金额,
                "budgetAllocation": {
                    "transportation": "交通费用占比和金额",
                    "accommodation": "住宿费用占比和金额", 
                    "dining": "餐饮费用占比和金额",
                    "attractions": "景点门票占比和金额",
                    "shopping": "购物费用占比和金额",
                    "miscellaneous": "其他费用占比和金额"
                },
                "costFactors": {
                    "destination": "目的地消费水平评估",
                    "season": "季节因素影响",
                    "groupSize": "人数对成本的影响"
                },
                "recommendations": "预算优化建议"
            }
            
            要求：
            1. 预算分配要合理，考虑目的地消费水平
            2. 交通费用通常占30-40%
            3. 住宿费用通常占25-35%
            4. 餐饮费用通常占20-30%
            5. 景点门票通常占10-20%
            6. 购物和其他费用占剩余部分
            7. 给出具体的优化建议
            """, destination, days, companions, totalBudget);
    }
    
    /**
     * 解析AI预算响应
     */
    private Map<String, Object> parseBudgetResponse(String aiResponse, Integer totalBudget, Integer days) {
        try {
            // 尝试解析JSON响应
            Map<String, Object> result = objectMapper.readValue(aiResponse, Map.class);
            
            // 验证必要字段
            if (!result.containsKey("dailyBudget")) {
                result.put("dailyBudget", totalBudget / days);
            }
            
            return result;
            
        } catch (Exception e) {
            logger.warn("AI响应解析失败，使用默认预算分配: {}", e.getMessage());
            return getDefaultBudgetAllocation(totalBudget, days);
        }
    }
    
    /**
     * 获取默认预算分配
     */
    private Map<String, Object> getDefaultBudgetAllocation(Integer totalBudget, Integer days) {
        Map<String, Object> result = new HashMap<>();
        result.put("dailyBudget", totalBudget / days);
        
        Map<String, Object> allocation = new HashMap<>();
        allocation.put("transportation", "30% - " + (totalBudget * 0.3) + "元");
        allocation.put("accommodation", "25% - " + (totalBudget * 0.25) + "元");
        allocation.put("dining", "25% - " + (totalBudget * 0.25) + "元");
        allocation.put("attractions", "15% - " + (totalBudget * 0.15) + "元");
        allocation.put("shopping", "5% - " + (totalBudget * 0.05) + "元");
        
        result.put("budgetAllocation", allocation);
        result.put("recommendations", "建议提前预订住宿和交通以获得更好价格");
        
        return result;
    }
}
