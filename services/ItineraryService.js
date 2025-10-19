/**
 * 行程规划服务
 * 负责生成智能多日行程安排
 */

class ItineraryService {
    constructor() {
        this.activityTemplates = {
            '文化': {
                morning: ['博物馆参观', '历史遗迹游览', '文化体验'],
                afternoon: ['艺术展览', '传统工艺体验', '文化街区漫步'],
                evening: ['文化表演', '传统餐厅', '文化夜游']
            },
            '购物': {
                morning: ['商业街购物', '品牌店探店', '购物中心'],
                afternoon: ['特色市场', '设计师店铺', '购物街区'],
                evening: ['夜市购物', '购物后休息', '购物总结']
            },
            '美食': {
                morning: ['早餐体验', '美食市场', '烹饪课程'],
                afternoon: ['特色餐厅', '美食街区', '甜品店'],
                evening: ['晚餐体验', '夜宵探索', '美食总结']
            },
            '自然': {
                morning: ['公园漫步', '自然景观', '户外活动'],
                afternoon: ['自然探索', '户外运动', '自然摄影'],
                evening: ['自然夜景', '户外休息', '自然总结']
            }
        };

        this.timeSlots = {
            morning: { start: '09:00', end: '12:00', duration: 3 },
            afternoon: { start: '14:00', end: '17:00', duration: 3 },
            evening: { start: '19:00', end: '21:00', duration: 2 }
        };
    }

    /**
     * 生成行程安排
     * @param {Object} params - 行程参数
     * @returns {Object} 行程安排结果
     */
    async planItinerary(params) {
        const { retrievedData, budget, preferences, days, destination } = params;
        
        console.log(`🗺️ 规划行程: ${days}天, ${destination}`);
        
        const itinerary = [];
        
        for (let dayIndex = 0; dayIndex < days; dayIndex++) {
            const dayPlan = await this.generateDayPlan({
                dayIndex,
                totalDays: days,
                retrievedData,
                budget,
                preferences,
                destination
            });
            
            itinerary.push(dayPlan);
        }
        
        // 优化行程节奏
        const optimizedItinerary = this.optimizeItineraryPace(itinerary);
        
        console.log(`✅ 行程规划完成: ${itinerary.length}天行程`);
        return {
            itinerary: optimizedItinerary,
            summary: this.generateItinerarySummary(optimizedItinerary, destination),
            recommendations: this.generateTravelRecommendations(optimizedItinerary, destination)
        };
    }

    /**
     * 生成单日行程
     */
    async generateDayPlan(params) {
        const { dayIndex, totalDays, retrievedData, budget, preferences, destination } = params;
        
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + dayIndex);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const dayTitle = this.getDayTitle(dayIndex, totalDays, destination);
        const dailyBudget = budget.dailyBudgets[dayIndex]?.budget || budget.daily;
        
        let activities = [];
        
        if (dayIndex === 0) {
            // 第一天：抵达与适应
            activities = this.generateArrivalDay(retrievedData, dailyBudget, destination);
        } else if (dayIndex === totalDays - 1) {
            // 最后一天：告别与返程
            activities = this.generateDepartureDay(retrievedData, dailyBudget, destination);
        } else {
            // 中间天数：游览
            activities = this.generateExplorationDay({
                dayIndex,
                retrievedData,
                dailyBudget,
                preferences,
                destination
            });
        }
        
        return {
            date: dateStr,
            dayTitle,
            dailyBudget,
            activities,
            focus: this.getDayFocus(dayIndex, totalDays),
            tips: this.generateDayTips(dayIndex, totalDays, destination)
        };
    }

    /**
     * 生成抵达日行程
     */
    generateArrivalDay(retrievedData, dailyBudget, destination) {
        return [
            {
                time: '14:00-16:00',
                title: '抵达目的地',
                description: `抵达${destination}，办理入境手续，熟悉周边环境`,
                location: '机场/酒店',
                cost: 0,
                category: '交通',
                priority: 'high'
            },
            {
                time: '18:00-20:00',
                title: '当地美食体验',
                description: `品尝${destination}特色美食，感受当地文化`,
                location: this.selectRestaurant(retrievedData.restaurants),
                cost: Math.round(dailyBudget * 0.4),
                category: '餐饮',
                priority: 'high'
            }
        ];
    }

    /**
     * 生成离开日行程
     */
    generateDepartureDay(retrievedData, dailyBudget, destination) {
        return [
            {
                time: '09:00-11:00',
                title: '最后购物',
                description: '购买纪念品和特产',
                location: this.selectShopping(retrievedData.shopping),
                cost: Math.round(dailyBudget * 0.3),
                category: '购物',
                priority: 'medium'
            },
            {
                time: '14:00-16:00',
                title: '前往机场',
                description: '前往机场，办理登机手续',
                location: '机场',
                cost: Math.round(dailyBudget * 0.1),
                category: '交通',
                priority: 'high'
            }
        ];
    }

    /**
     * 生成探索日行程
     */
    generateExplorationDay(params) {
        const { dayIndex, retrievedData, dailyBudget, preferences, destination } = params;
        
        const activities = [];
        const timeSlots = ['morning', 'afternoon', 'evening'];
        
        timeSlots.forEach((slot, index) => {
            const activity = this.generateActivity({
                slot,
                dayIndex,
                retrievedData,
                dailyBudget,
                preferences,
                destination
            });
            
            if (activity) {
                activities.push(activity);
            }
        });
        
        return activities;
    }

    /**
     * 生成具体活动
     */
    generateActivity(params) {
        const { slot, dayIndex, retrievedData, dailyBudget, preferences, destination } = params;
        
        const timeSlot = this.timeSlots[slot];
        const costRatio = this.getCostRatio(slot, dailyBudget);
        
        // 根据用户偏好选择活动类型
        const activityType = this.selectActivityType(preferences, dayIndex);
        
        let activity = null;
        
        if (activityType === 'attraction') {
            activity = this.selectAttraction(retrievedData.attractions, preferences);
        } else if (activityType === 'restaurant') {
            activity = this.selectRestaurant(retrievedData.restaurants);
        } else if (activityType === 'shopping') {
            activity = this.selectShopping(retrievedData.shopping);
        }
        
        if (!activity) return null;
        
        return {
            time: `${timeSlot.start}-${timeSlot.end}`,
            title: activity.name,
            description: activity.description,
            location: activity.location || destination,
            cost: Math.round(dailyBudget * costRatio),
            category: activity.category,
            priority: this.getActivityPriority(activity, preferences),
            duration: timeSlot.duration
        };
    }

    /**
     * 选择活动类型
     */
    selectActivityType(preferences, dayIndex) {
        const types = ['attraction', 'restaurant', 'shopping'];
        
        // 根据用户偏好调整概率
        if (preferences.interests) {
            if (preferences.interests.some(interest => 
                interest.includes('美食') || interest.includes('餐厅'))) {
                return 'restaurant';
            }
            if (preferences.interests.some(interest => 
                interest.includes('购物') || interest.includes('商店'))) {
                return 'shopping';
            }
        }
        
        // 根据天数调整
        if (dayIndex % 3 === 0) return 'attraction';
        if (dayIndex % 3 === 1) return 'restaurant';
        return 'shopping';
    }

    /**
     * 选择景点
     */
    selectAttraction(attractions, preferences) {
        if (!attractions || attractions.length === 0) return null;
        
        // 根据评分和用户偏好排序
        const sorted = attractions.sort((a, b) => {
            const aScore = a.rating + (preferences.interests ? 
                preferences.interests.some(interest => 
                    a.name.includes(interest) || a.description.includes(interest)
                ) ? 1 : 0 : 0);
            const bScore = b.rating + (preferences.interests ? 
                preferences.interests.some(interest => 
                    b.name.includes(interest) || b.description.includes(interest)
                ) ? 1 : 0 : 0);
            return bScore - aScore;
        });
        
        return sorted[0];
    }

    /**
     * 选择餐厅
     */
    selectRestaurant(restaurants) {
        if (!restaurants || restaurants.length === 0) {
            return { name: '当地特色餐厅', location: '市中心' };
        }
        
        const sorted = restaurants.sort((a, b) => b.rating - a.rating);
        return sorted[0];
    }

    /**
     * 选择购物地点
     */
    selectShopping(shopping) {
        if (!shopping || shopping.length === 0) {
            return { name: '商业区', location: '市中心' };
        }
        
        const sorted = shopping.sort((a, b) => b.rating - a.rating);
        return sorted[0];
    }

    /**
     * 获取成本比例
     */
    getCostRatio(slot, dailyBudget) {
        const ratios = {
            morning: 0.3,
            afternoon: 0.4,
            evening: 0.3
        };
        return ratios[slot] || 0.3;
    }

    /**
     * 获取活动优先级
     */
    getActivityPriority(activity, preferences) {
        if (!activity || !activity.name || !activity.description) {
            return 'medium';
        }
        
        if (preferences && preferences.interests && preferences.interests.some(interest => 
            activity.name.includes(interest) || activity.description.includes(interest))) {
            return 'high';
        }
        return 'medium';
    }

    /**
     * 获取每日标题
     */
    getDayTitle(dayIndex, totalDays, destination) {
        if (dayIndex === 0) return '第一天：抵达与初探';
        if (dayIndex === totalDays - 1) return `第${totalDays}天：告别与返程`;
        return `第${dayIndex + 1}天：${destination}深度探索`;
    }

    /**
     * 获取每日重点
     */
    getDayFocus(dayIndex, totalDays) {
        const focuses = ['文化探索', '美食体验', '购物休闲', '自然风光', '深度体验'];
        return focuses[dayIndex % focuses.length];
    }

    /**
     * 生成每日贴士
     */
    generateDayTips(dayIndex, totalDays, destination) {
        const tips = [];
        
        if (dayIndex === 0) {
            tips.push('建议提前了解当地交通方式');
            tips.push('准备当地货币或信用卡');
        } else if (dayIndex === totalDays - 1) {
            tips.push('提前确认返程航班信息');
            tips.push('预留充足时间前往机场');
        } else {
            tips.push('合理安排休息时间');
            tips.push('注意当地天气变化');
        }
        
        return tips;
    }

    /**
     * 优化行程节奏
     */
    optimizeItineraryPace(itinerary) {
        return itinerary.map(day => {
            // 确保每天活动数量合理
            if (day.activities.length > 4) {
                day.activities = day.activities.slice(0, 4);
            }
            
            // 添加休息时间
            if (day.activities.length >= 3) {
                day.activities.push({
                    time: '15:00-16:00',
                    title: '休息时间',
                    description: '适当休息，调整状态',
                    location: '酒店或咖啡厅',
                    cost: 0,
                    category: '休息',
                    priority: 'low'
                });
            }
            
            return day;
        });
    }

    /**
     * 生成行程总结
     */
    generateItinerarySummary(itinerary, destination) {
        const totalDays = itinerary.length;
        const totalCost = itinerary.reduce((sum, day) => 
            sum + day.activities.reduce((daySum, activity) => daySum + (activity.cost || 0), 0), 0);
        
        return `本次${totalDays}天${destination}之旅，总预算约${totalCost}元，行程安排合理，兼顾文化体验、美食探索和休闲购物，确保旅途愉快且充实。`;
    }

    /**
     * 生成旅行建议
     */
    generateTravelRecommendations(itinerary, destination) {
        return {
            restaurants: [
                '当地特色餐厅 - 体验地道风味',
                '网红打卡餐厅 - 拍照留念',
                '传统老字号 - 感受历史文化'
            ],
            attractions: [
                '必游景点 - 不容错过的地标',
                '文化场所 - 深入了解当地文化',
                '自然景观 - 享受自然风光'
            ],
            tips: [
                '提前预订热门景点门票',
                '了解当地交通方式和票价',
                '准备常用药品和应急用品',
                '学习基本当地语言礼貌用语'
            ]
        };
    }
}

module.exports = ItineraryService;
