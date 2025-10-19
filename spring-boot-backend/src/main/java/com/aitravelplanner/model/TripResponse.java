package com.aitravelplanner.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * 旅行规划响应模型
 */
public class TripResponse {
    
    @JsonProperty("totalBudget")
    private Integer totalBudget;
    
    @JsonProperty("days")
    private List<DayItinerary> days;
    
    @JsonProperty("recommendations")
    private Recommendations recommendations;
    
    // 构造函数
    public TripResponse() {}
    
    public TripResponse(Integer totalBudget, List<DayItinerary> days, Recommendations recommendations) {
        this.totalBudget = totalBudget;
        this.days = days;
        this.recommendations = recommendations;
    }
    
    // Getters and Setters
    public Integer getTotalBudget() {
        return totalBudget;
    }
    
    public void setTotalBudget(Integer totalBudget) {
        this.totalBudget = totalBudget;
    }
    
    public List<DayItinerary> getDays() {
        return days;
    }
    
    public void setDays(List<DayItinerary> days) {
        this.days = days;
    }
    
    public Recommendations getRecommendations() {
        return recommendations;
    }
    
    public void setRecommendations(Recommendations recommendations) {
        this.recommendations = recommendations;
    }
    
    /**
     * 每日行程模型
     */
    public static class DayItinerary {
        @JsonProperty("day")
        private Integer day;
        
        @JsonProperty("title")
        private String title;
        
        @JsonProperty("dailyBudget")
        private Integer dailyBudget;
        
        @JsonProperty("activities")
        private List<Activity> activities;
        
        // 构造函数
        public DayItinerary() {}
        
        public DayItinerary(Integer day, String title, Integer dailyBudget, List<Activity> activities) {
            this.day = day;
            this.title = title;
            this.dailyBudget = dailyBudget;
            this.activities = activities;
        }
        
        // Getters and Setters
        public Integer getDay() {
            return day;
        }
        
        public void setDay(Integer day) {
            this.day = day;
        }
        
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public Integer getDailyBudget() {
            return dailyBudget;
        }
        
        public void setDailyBudget(Integer dailyBudget) {
            this.dailyBudget = dailyBudget;
        }
        
        public List<Activity> getActivities() {
            return activities;
        }
        
        public void setActivities(List<Activity> activities) {
            this.activities = activities;
        }
    }
    
    /**
     * 活动模型
     */
    public static class Activity {
        @JsonProperty("time")
        private String time;
        
        @JsonProperty("activity")
        private String activity;
        
        @JsonProperty("desc")
        private String desc;
        
        // 构造函数
        public Activity() {}
        
        public Activity(String time, String activity, String desc) {
            this.time = time;
            this.activity = activity;
            this.desc = desc;
        }
        
        // Getters and Setters
        public String getTime() {
            return time;
        }
        
        public void setTime(String time) {
            this.time = time;
        }
        
        public String getActivity() {
            return activity;
        }
        
        public void setActivity(String activity) {
            this.activity = activity;
        }
        
        public String getDesc() {
            return desc;
        }
        
        public void setDesc(String desc) {
            this.desc = desc;
        }
    }
    
    /**
     * 推荐模型
     */
    public static class Recommendations {
        @JsonProperty("restaurants")
        private List<String> restaurants;
        
        @JsonProperty("tips")
        private List<String> tips;
        
        // 构造函数
        public Recommendations() {}
        
        public Recommendations(List<String> restaurants, List<String> tips) {
            this.restaurants = restaurants;
            this.tips = tips;
        }
        
        // Getters and Setters
        public List<String> getRestaurants() {
            return restaurants;
        }
        
        public void setRestaurants(List<String> restaurants) {
            this.restaurants = restaurants;
        }
        
        public List<String> getTips() {
            return tips;
        }
        
        public void setTips(List<String> tips) {
            this.tips = tips;
        }
    }
}
