/**
 * 工具流编排服务
 * 负责协调各个工具的执行顺序和结果整合
 */

const RAGService = require('./RAGService');
const BudgetService = require('./BudgetService');
const ItineraryService = require('./ItineraryService');

class OrchestratorService {
    constructor() {
        this.ragService = new RAGService();
        this.budgetService = new BudgetService();
        this.itineraryService = new ItineraryService();
        
        this.executionSteps = [
            'retrieve_places',
            'estimate_budget', 
            'plan_itinerary',
            'summarize_recommendations'
        ];
    }

    /**
     * 执行完整的工具流
     * @param {Object} userInput - 用户输入
     * @returns {Object} 最终结果
     */
    async executeToolFlow(userInput) {
        console.log('🚀 开始执行工具流...');
        
        const context = {
            userInput,
            retrievedData: null,
            budgetEstimate: null,
            itinerary: null,
            recommendations: null
        };

        try {
            // 步骤1: 检索相关地点
            console.log('📋 步骤1: 检索相关地点');
            context.retrievedData = await this.retrievePlaces(userInput);
            
            // 步骤2: 估算预算
            console.log('💰 步骤2: 估算预算');
            context.budgetEstimate = await this.estimateBudget(userInput, context.retrievedData);
            
            // 步骤3: 规划行程
            console.log('🗺️ 步骤3: 规划行程');
            context.itinerary = await this.planItinerary(userInput, context.retrievedData, context.budgetEstimate);
            
            // 步骤4: 生成推荐
            console.log('💡 步骤4: 生成推荐');
            context.recommendations = await this.summarizeRecommendations(context.itinerary, context.retrievedData);
            
            // 整合最终结果
            const finalResult = this.integrateResults(context);
            
            console.log('✅ 工具流执行完成');
            return finalResult;
            
        } catch (error) {
            console.error('❌ 工具流执行失败:', error);
            return this.handleError(error, context);
        }
    }

    /**
     * 步骤1: 检索相关地点
     */
    async retrievePlaces(userInput) {
        const { destination, preferences } = userInput;
        
        // 提取兴趣标签
        const tags = this.extractTags(preferences);
        
        // 调用RAG服务检索
        const retrievedData = await this.ragService.retrievePlaces(destination, tags, preferences);
        
        // 获取城市信息
        const cityInfo = await this.ragService.getCityInfo(destination);
        
        return {
            ...retrievedData,
            cityInfo,
            searchMetadata: {
                destination,
                tags,
                timestamp: new Date().toISOString(),
                resultCount: {
                    attractions: retrievedData.attractions.length,
                    restaurants: retrievedData.restaurants.length,
                    shopping: retrievedData.shopping.length
                }
            }
        };
    }

    /**
     * 步骤2: 估算预算
     */
    async estimateBudget(userInput, retrievedData) {
        const { days, travelers, budget, preferences } = userInput;
        
        // 确定旅行风格
        const style = this.determineTravelStyle(budget, preferences);
        
        const budgetParams = {
            days: parseInt(days),
            style,
            travelers: parseInt(travelers),
            destination: userInput.destination,
            totalBudget: budget ? parseInt(budget) : null
        };
        
        // 调用预算服务
        const budgetEstimate = await this.budgetService.estimateBudget(budgetParams);
        
        // 验证预算合理性
        const validation = this.budgetService.validateBudget(budgetEstimate, days, travelers);
        
        // 如果预算不合理，进行优化
        if (!validation.isValid) {
            console.log('⚠️ 预算不合理，进行优化...');
            const optimizedBudget = this.budgetService.optimizeBudget(budgetEstimate, preferences);
            return { ...optimizedBudget, validation, optimized: true };
        }
        
        return { ...budgetEstimate, validation, optimized: false };
    }

    /**
     * 步骤3: 规划行程
     */
    async planItinerary(userInput, retrievedData, budgetEstimate) {
        const { days, preferences, destination } = userInput;
        
        const itineraryParams = {
            retrievedData,
            budget: budgetEstimate,
            preferences,
            days: parseInt(days),
            destination
        };
        
        // 调用行程规划服务
        const itineraryResult = await this.itineraryService.planItinerary(itineraryParams);
        
        return itineraryResult;
    }

    /**
     * 步骤4: 生成推荐
     */
    async summarizeRecommendations(itinerary, retrievedData) {
        // 从行程中提取推荐内容
        const recommendations = this.extractRecommendations(itinerary, retrievedData);
        
        // 生成个性化建议
        const personalizedTips = this.generatePersonalizedTips(itinerary, retrievedData);
        
        return {
            ...recommendations,
            personalizedTips,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * 整合最终结果
     */
    integrateResults(context) {
        const { userInput, retrievedData, budgetEstimate, itinerary, recommendations } = context;
        
        return {
            success: true,
            data: {
                summary: this.generateTripSummary(userInput, itinerary),
                itinerary: itinerary.itinerary,
                budgetSummary: budgetEstimate,
                recommendations: recommendations,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    totalDays: itinerary.itinerary.length,
                    totalBudget: budgetEstimate.total,
                    currency: budgetEstimate.currency,
                    searchResults: retrievedData.searchMetadata
                }
            },
            apiStatus: 'success',
            apiMessage: '✅ 基于RAG和工具流的智能规划生成成功'
        };
    }

    /**
     * 提取兴趣标签
     */
    extractTags(preferences) {
        const tags = [];
        
        if (preferences.interests) {
            preferences.interests.forEach(interest => {
                if (interest.includes('文化')) tags.push('文化');
                if (interest.includes('购物')) tags.push('购物');
                if (interest.includes('美食')) tags.push('美食');
                if (interest.includes('自然')) tags.push('自然');
                if (interest.includes('历史')) tags.push('历史');
                if (interest.includes('艺术')) tags.push('艺术');
            });
        }
        
        return tags.length > 0 ? tags : ['文化', '美食'];
    }

    /**
     * 确定旅行风格
     */
    determineTravelStyle(budget, preferences) {
        if (!budget) return '中等';
        
        const budgetNum = parseInt(budget);
        
        if (budgetNum < 5000) return '经济型';
        if (budgetNum > 20000) return '豪华';
        return '中等';
    }

    /**
     * 从行程中提取推荐内容
     */
    extractRecommendations(itinerary, retrievedData) {
        const restaurants = [];
        const attractions = [];
        const tips = [];
        
        // 从行程中提取餐厅推荐
        itinerary.itinerary.forEach(day => {
            day.activities.forEach(activity => {
                if (activity.category === '餐饮') {
                    restaurants.push(`${activity.title} - ${activity.description}`);
                }
            });
        });
        
        // 从检索数据中提取景点推荐
        retrievedData.attractions.forEach(attraction => {
            attractions.push(`${attraction.name} - ${attraction.description}`);
        });
        
        // 生成实用贴士
        tips.push('提前预订热门景点门票');
        tips.push('了解当地交通方式和票价');
        tips.push('准备常用药品和应急用品');
        tips.push('学习基本当地语言礼貌用语');
        
        return {
            restaurants: restaurants.slice(0, 4),
            attractions: attractions.slice(0, 4),
            tips: tips.slice(0, 4)
        };
    }

    /**
     * 生成个性化建议
     */
    generatePersonalizedTips(itinerary, retrievedData) {
        const tips = [];
        
        // 根据城市生成建议
        if (retrievedData.cityInfo) {
            tips.push(`当地货币: ${retrievedData.cityInfo.currency}`);
            tips.push(`最佳旅行时间: ${retrievedData.cityInfo.bestTime}`);
        }
        
        // 根据行程生成建议
        const totalDays = itinerary.itinerary.length;
        if (totalDays > 7) {
            tips.push('长期旅行建议准备更多换洗衣物');
        }
        
        return tips;
    }

    /**
     * 生成旅行总结
     */
    generateTripSummary(userInput, itinerary) {
        const { destination, days, travelers } = userInput;
        const totalDays = itinerary.itinerary.length;
        
        return `本次${totalDays}天${days-1}夜的${destination}之旅，专为${travelers}人设计，行程安排合理，兼顾文化体验、美食探索和休闲购物，确保旅途愉快且充实。`;
    }

    /**
     * 处理错误
     */
    handleError(error, context) {
        console.error('工具流执行错误:', error);
        
        return {
            success: false,
            error: error.message,
            fallback: context.retrievedData ? true : false,
            data: context.retrievedData ? this.generateFallbackResult(context) : null,
            apiStatus: 'error',
            apiMessage: '❌ 工具流执行失败，已启用降级模式'
        };
    }

    /**
     * 生成降级结果
     */
    generateFallbackResult(context) {
        // 如果RAG检索成功，至少可以提供基础信息
        if (context.retrievedData) {
            return {
                summary: '基于检索信息生成的旅行建议',
                recommendations: {
                    restaurants: context.retrievedData.restaurants.slice(0, 3).map(r => r.name),
                    attractions: context.retrievedData.attractions.slice(0, 3).map(a => a.name),
                    tips: ['建议提前了解当地情况', '准备必要的旅行用品']
                }
            };
        }
        
        return null;
    }

    /**
     * 验证工具流结果
     */
    validateResult(result) {
        const issues = [];
        
        if (!result.data) {
            issues.push('缺少核心数据');
        }
        
        if (result.data && !result.data.itinerary) {
            issues.push('缺少行程安排');
        }
        
        if (result.data && !result.data.budgetSummary) {
            issues.push('缺少预算信息');
        }
        
        return {
            isValid: issues.length === 0,
            issues
        };
    }
}

module.exports = OrchestratorService;
