package com.aitravelplanner.controller;

import com.aitravelplanner.model.TripRequest;
import com.aitravelplanner.model.TripResponse;
import com.aitravelplanner.service.TripOrchestratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;

/**
 * 旅行规划控制器
 * 提供基于Spring AI + 工具流的智能行程规划API
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class TripController {
    
    private static final Logger logger = LoggerFactory.getLogger(TripController.class);
    
    @Autowired
    private TripOrchestratorService tripOrchestratorService;
    
    /**
     * 生成旅行规划
     * 
     * 接口路径: POST /api/ai/plan
     * 
     * 工具流执行流程：
     * 1. 接收用户请求参数
     * 2. 调用TripOrchestratorService执行工具流
     * 3. 返回结构化的AI生成结果
     * 
     * @param request 旅行规划请求
     * @return 旅行规划响应
     */
    @PostMapping("/plan")
    public ResponseEntity<?> generateTripPlan(@Valid @RequestBody TripRequest request) {
        logger.info("🚀 收到旅行规划请求: {}", request);
        
        try {
            // 记录AI调用开始
            long startTime = System.currentTimeMillis();
            logger.info("🤖 开始调用AI生成旅行规划...");
            
            // 执行工具流编排
            TripResponse response = tripOrchestratorService.executeTripPlanning(request);
            
            // 记录AI调用完成
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            logger.info("✅ AI旅行规划生成成功，耗时: {}ms", duration);
            logger.info("📊 生成结果统计: 总预算={}, 天数={}, 活动总数={}", 
                       response.getTotalBudget(), 
                       response.getDays().size(),
                       response.getDays().stream()
                               .mapToInt(day -> day.getActivities().size())
                               .sum());
            
            // 返回成功响应
            return ResponseEntity.ok()
                    .header("X-AI-Processing-Time", String.valueOf(duration))
                    .header("X-AI-Status", "success")
                    .body(response);
                    
        } catch (Exception e) {
            logger.error("❌ AI旅行规划生成失败: {}", e.getMessage(), e);
            
            // 返回错误响应
            return ResponseEntity.status(500)
                    .header("X-AI-Status", "error")
                    .body(Map.of(
                        "error", "AI旅行规划生成失败",
                        "message", e.getMessage(),
                        "timestamp", System.currentTimeMillis()
                    ));
        }
    }
    
    /**
     * 健康检查接口
     * 
     * @return 服务状态
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        logger.info("🔍 健康检查请求");
        
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "AI Travel Planner",
            "version", "1.0.0",
            "aiEnabled", true,
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    /**
     * 获取AI服务信息
     * 
     * @return AI服务信息
     */
    @GetMapping("/info")
    public ResponseEntity<?> getAIInfo() {
        logger.info("ℹ️ 获取AI服务信息");
        
        return ResponseEntity.ok(Map.of(
            "aiProvider", "Spring AI",
            "model", "ChatClient",
            "tools", Arrays.asList(
                "BudgetEstimationTool",
                "ItineraryPlanningTool", 
                "RecommendationExtractionTool"
            ),
            "workflow", "Tool Flow Orchestration",
            "features", Arrays.asList(
                "智能预算分配",
                "多日行程规划",
                "个性化推荐提取",
                "结构化数据输出"
            )
        ));
    }
}
