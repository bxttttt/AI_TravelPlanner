package com.aitravelplanner.model;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 旅行规划请求模型
 */
public class TripRequest {
    
    @NotBlank(message = "目的地不能为空")
    @JsonProperty("destination")
    private String destination;
    
    @NotBlank(message = "开始日期不能为空")
    @JsonProperty("startDate")
    private String startDate;
    
    @NotBlank(message = "结束日期不能为空")
    @JsonProperty("endDate")
    private String endDate;
    
    @NotNull(message = "预算不能为空")
    @Min(value = 100, message = "预算不能少于100元")
    @JsonProperty("budget")
    private Integer budget;
    
    @NotNull(message = "同行人数不能为空")
    @Min(value = 1, message = "同行人数不能少于1人")
    @Max(value = 10, message = "同行人数不能超过10人")
    @JsonProperty("companions")
    private Integer companions;
    
    @JsonProperty("preferences")
    private String preferences;
    
    // 构造函数
    public TripRequest() {}
    
    public TripRequest(String destination, String startDate, String endDate, 
                     Integer budget, Integer companions, String preferences) {
        this.destination = destination;
        this.startDate = startDate;
        this.endDate = endDate;
        this.budget = budget;
        this.companions = companions;
        this.preferences = preferences;
    }
    
    // Getters and Setters
    public String getDestination() {
        return destination;
    }
    
    public void setDestination(String destination) {
        this.destination = destination;
    }
    
    public String getStartDate() {
        return startDate;
    }
    
    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }
    
    public String getEndDate() {
        return endDate;
    }
    
    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
    
    public Integer getBudget() {
        return budget;
    }
    
    public void setBudget(Integer budget) {
        this.budget = budget;
    }
    
    public Integer getCompanions() {
        return companions;
    }
    
    public void setCompanions(Integer companions) {
        this.companions = companions;
    }
    
    public String getPreferences() {
        return preferences;
    }
    
    public void setPreferences(String preferences) {
        this.preferences = preferences;
    }
    
    @Override
    public String toString() {
        return "TripRequest{" +
                "destination='" + destination + '\'' +
                ", startDate='" + startDate + '\'' +
                ", endDate='" + endDate + '\'' +
                ", budget=" + budget +
                ", companions=" + companions +
                ", preferences='" + preferences + '\'' +
                '}';
    }
}
