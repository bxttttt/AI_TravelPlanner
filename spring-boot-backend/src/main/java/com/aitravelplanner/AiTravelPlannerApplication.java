package com.aitravelplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * AI旅行规划师主应用类
 * 基于Spring Boot + Spring AI + 工具流的智能行程规划系统
 */
@SpringBootApplication
public class AiTravelPlannerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiTravelPlannerApplication.class, args);
        System.out.println("🚀 AI旅行规划师启动成功！");
        System.out.println("🌐 访问地址: http://localhost:8080");
        System.out.println("🤖 基于Spring AI + 工具流的智能行程规划系统");
    }
}
