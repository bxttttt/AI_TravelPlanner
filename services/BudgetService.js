/**
 * 预算估算服务
 * 负责智能预算分配和费用估算
 */

class BudgetService {
    constructor() {
        this.budgetTemplates = {
            '经济型': {
                transportation: 0.25,
                accommodation: 0.30,
                dining: 0.25,
                attractions: 0.15,
                shopping: 0.05
            },
            '中等': {
                transportation: 0.20,
                accommodation: 0.35,
                dining: 0.25,
                attractions: 0.15,
                shopping: 0.05
            },
            '豪华': {
                transportation: 0.15,
                accommodation: 0.40,
                dining: 0.25,
                attractions: 0.15,
                shopping: 0.05
            }
        };

        this.cityCostFactors = {
            '首尔': { factor: 1.0, currency: 'KRW', baseCost: 80000 },
            '东京': { factor: 1.2, currency: 'JPY', baseCost: 10000 },
            '北京': { factor: 0.8, currency: 'CNY', baseCost: 500 },
            '上海': { factor: 1.0, currency: 'CNY', baseCost: 600 },
            '纽约': { factor: 1.5, currency: 'USD', baseCost: 150 },
            '巴黎': { factor: 1.3, currency: 'EUR', baseCost: 120 }
        };
    }

    /**
     * 估算预算分配
     * @param {Object} params - 预算参数
     * @returns {Object} 预算分配结果
     */
    async estimateBudget(params) {
        const { days, style, travelers, destination, totalBudget } = params;
        
        console.log(`💰 估算预算: ${days}天, ${style}型, ${travelers}人, ${destination}`);
        
        // 获取城市成本因子
        const cityInfo = this.cityCostFactors[destination] || this.cityCostFactors['首尔'];
        
        // 计算基础预算
        let baseBudget;
        if (totalBudget) {
            baseBudget = totalBudget;
        } else {
            baseBudget = this.calculateBaseBudget(days, style, travelers, cityInfo);
        }

        // 获取预算模板
        const template = this.budgetTemplates[style] || this.budgetTemplates['中等'];
        
        // 计算各类别预算
        const budgetBreakdown = {
            total: baseBudget,
            daily: Math.round(baseBudget / days),
            transportation: Math.round(baseBudget * template.transportation),
            accommodation: Math.round(baseBudget * template.accommodation),
            dining: Math.round(baseBudget * template.dining),
            attractions: Math.round(baseBudget * template.attractions),
            shopping: Math.round(baseBudget * template.shopping)
        };

        // 生成每日预算分配
        const dailyBudgets = this.generateDailyBudgets(days, budgetBreakdown, style);
        
        const result = {
            ...budgetBreakdown,
            dailyBudgets,
            currency: cityInfo.currency,
            recommendations: this.generateBudgetRecommendations(budgetBreakdown, style, destination)
        };

        console.log(`✅ 预算估算完成: 总预算${result.total}${result.currency}`);
        return result;
    }

    /**
     * 计算基础预算
     */
    calculateBaseBudget(days, style, travelers, cityInfo) {
        const styleMultipliers = {
            '经济型': 0.8,
            '中等': 1.0,
            '豪华': 1.5
        };

        const multiplier = styleMultipliers[style] || 1.0;
        const baseCost = cityInfo.baseCost * multiplier * days * travelers;
        
        return Math.round(baseCost);
    }

    /**
     * 生成每日预算分配
     */
    generateDailyBudgets(days, budgetBreakdown, style) {
        const dailyBudgets = [];
        const baseDaily = budgetBreakdown.daily;
        
        for (let i = 0; i < days; i++) {
            let dailyBudget = baseDaily;
            
            // 第一天和最后一天调整预算
            if (i === 0) {
                // 第一天：交通费用较高
                dailyBudget = Math.round(baseDaily * 1.2);
            } else if (i === days - 1) {
                // 最后一天：购物费用较高
                dailyBudget = Math.round(baseDaily * 1.1);
            }
            
            dailyBudgets.push({
                day: i + 1,
                budget: dailyBudget,
                focus: this.getDayFocus(i, days, style)
            });
        }
        
        return dailyBudgets;
    }

    /**
     * 获取每日重点
     */
    getDayFocus(dayIndex, totalDays, style) {
        if (dayIndex === 0) return '抵达与适应';
        if (dayIndex === totalDays - 1) return '告别与返程';
        if (dayIndex === 1) return '文化探索';
        if (dayIndex === 2) return '深度体验';
        return '自由活动';
    }

    /**
     * 生成预算建议
     */
    generateBudgetRecommendations(budgetBreakdown, style, destination) {
        const recommendations = [];
        
        // 交通建议
        if (budgetBreakdown.transportation < 1000) {
            recommendations.push('建议使用公共交通，购买日票或周票更经济');
        } else {
            recommendations.push('可以考虑租车或使用出租车服务');
        }
        
        // 住宿建议
        if (budgetBreakdown.accommodation < 2000) {
            recommendations.push('推荐青年旅社或经济型酒店');
        } else if (budgetBreakdown.accommodation < 5000) {
            recommendations.push('可以选择中档酒店或民宿');
        } else {
            recommendations.push('可以考虑豪华酒店或度假村');
        }
        
        // 餐饮建议
        if (budgetBreakdown.dining < 1000) {
            recommendations.push('建议多尝试当地街头美食和小吃');
        } else {
            recommendations.push('可以体验当地特色餐厅和高端料理');
        }
        
        return recommendations;
    }

    /**
     * 验证预算合理性
     */
    validateBudget(budgetBreakdown, days, travelers) {
        const issues = [];
        
        // 检查总预算是否合理
        if (budgetBreakdown.total < days * 100) {
            issues.push('预算可能过低，建议增加预算');
        }
        
        // 检查各类别比例
        const total = budgetBreakdown.total;
        if (budgetBreakdown.transportation / total > 0.4) {
            issues.push('交通费用占比过高，建议优化交通方式');
        }
        
        if (budgetBreakdown.accommodation / total > 0.5) {
            issues.push('住宿费用占比过高，建议选择更经济的住宿');
        }
        
        return {
            isValid: issues.length === 0,
            issues
        };
    }

    /**
     * 优化预算分配
     */
    optimizeBudget(budgetBreakdown, preferences = {}) {
        const optimized = { ...budgetBreakdown };
        
        // 根据用户偏好调整
        if (preferences.shopping) {
            // 增加购物预算
            optimized.shopping = Math.round(optimized.shopping * 1.5);
            optimized.attractions = Math.round(optimized.attractions * 0.8);
        }
        
        if (preferences.food) {
            // 增加餐饮预算
            optimized.dining = Math.round(optimized.dining * 1.3);
            optimized.shopping = Math.round(optimized.shopping * 0.7);
        }
        
        // 重新计算总预算
        optimized.total = optimized.transportation + optimized.accommodation + 
                         optimized.dining + optimized.attractions + optimized.shopping;
        optimized.daily = Math.round(optimized.total / Math.ceil(optimized.total / optimized.daily));
        
        return optimized;
    }
}

module.exports = BudgetService;
