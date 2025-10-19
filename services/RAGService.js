/**
 * RAG (Retrieval-Augmented Generation) 服务
 * 负责知识库检索和向量化处理
 */

const axios = require('axios');

class RAGService {
    constructor() {
        this.knowledgeBase = new Map();
        this.vectorStore = new Map();
        this.initializeKnowledgeBase();
    }

    /**
     * 初始化知识库
     */
    initializeKnowledgeBase() {
        // 景点知识库
        this.knowledgeBase.set('attractions', {
            '首尔': [
                {
                    name: '景福宫',
                    category: '文化',
                    rating: 4.5,
                    cost: 3000,
                    duration: '2-3小时',
                    description: '朝鲜王朝宫殿，体验韩国传统文化',
                    tags: ['历史', '文化', '宫殿'],
                    location: '钟路区',
                    coordinates: { lat: 37.5796, lng: 126.9770 }
                },
                {
                    name: '明洞',
                    category: '购物',
                    rating: 4.3,
                    cost: 0,
                    duration: '3-4小时',
                    description: '首尔最繁华的购物区，化妆品和时尚商品',
                    tags: ['购物', '时尚', '化妆品'],
                    location: '中区',
                    coordinates: { lat: 37.5636, lng: 126.9826 }
                },
                {
                    name: '弘大',
                    category: '娱乐',
                    rating: 4.4,
                    cost: 0,
                    duration: '4-5小时',
                    description: '年轻人聚集地，K-pop文化和潮流购物',
                    tags: ['K-pop', '潮流', '夜生活'],
                    location: '麻浦区',
                    coordinates: { lat: 37.5563, lng: 126.9236 }
                }
            ],
            '东京': [
                {
                    name: '浅草寺',
                    category: '文化',
                    rating: 4.2,
                    cost: 0,
                    duration: '2-3小时',
                    description: '东京最古老的寺庙，体验传统日本文化',
                    tags: ['寺庙', '传统', '文化'],
                    location: '台东区',
                    coordinates: { lat: 35.7148, lng: 139.7967 }
                }
            ]
        });

        // 餐厅知识库
        this.knowledgeBase.set('restaurants', {
            '首尔': [
                {
                    name: '明洞烤肉店',
                    category: '韩式烤肉',
                    rating: 4.6,
                    cost: 15000,
                    duration: '1-2小时',
                    description: '正宗韩式烤肉，体验韩国饮食文化',
                    tags: ['烤肉', '传统', '韩式'],
                    location: '明洞',
                    specialties: ['韩牛', '五花肉', '泡菜']
                },
                {
                    name: '弘大网红咖啡厅',
                    category: '咖啡',
                    rating: 4.4,
                    cost: 8000,
                    duration: '1小时',
                    description: '潮流咖啡厅，K-pop主题装饰',
                    tags: ['咖啡', 'K-pop', '潮流'],
                    location: '弘大',
                    specialties: ['拿铁', '甜品', '拍照']
                }
            ]
        });

        // 购物知识库
        this.knowledgeBase.set('shopping', {
            '首尔': [
                {
                    name: '东大门设计广场',
                    category: '设计',
                    rating: 4.3,
                    cost: 0,
                    duration: '2-3小时',
                    description: '现代设计建筑，时尚购物中心',
                    tags: ['设计', '时尚', '建筑'],
                    location: '东大门区'
                }
            ]
        });
    }

    /**
     * 检索相关地点
     * @param {string} city - 城市名称
     * @param {Array} tags - 兴趣标签
     * @param {Object} preferences - 用户偏好
     * @returns {Object} 检索结果
     */
    async retrievePlaces(city, tags = [], preferences = {}) {
        console.log(`🔍 检索地点: ${city}, 标签: ${tags.join(', ')}`);
        
        const results = {
            attractions: [],
            restaurants: [],
            shopping: []
        };

        // 检索景点
        const cityAttractions = this.knowledgeBase.get('attractions')[city] || [];
        results.attractions = this.filterByTags(cityAttractions, tags);

        // 检索餐厅
        const cityRestaurants = this.knowledgeBase.get('restaurants')[city] || [];
        results.restaurants = this.filterByTags(cityRestaurants, tags);

        // 检索购物
        const cityShopping = this.knowledgeBase.get('shopping')[city] || [];
        results.shopping = this.filterByTags(cityShopping, tags);

        // 根据用户偏好进一步筛选
        if (preferences.interests) {
            results.attractions = this.filterByPreferences(results.attractions, preferences.interests);
            results.restaurants = this.filterByPreferences(results.restaurants, preferences.interests);
            results.shopping = this.filterByPreferences(results.shopping, preferences.interests);
        }

        console.log(`✅ 检索完成: 景点${results.attractions.length}个, 餐厅${results.restaurants.length}个, 购物${results.shopping.length}个`);
        return results;
    }

    /**
     * 根据标签筛选
     */
    filterByTags(items, tags) {
        if (!tags || tags.length === 0) return items;
        
        return items.filter(item => {
            return tags.some(tag => 
                item.tags && item.tags.some(itemTag => 
                    itemTag.toLowerCase().includes(tag.toLowerCase())
                )
            );
        });
    }

    /**
     * 根据用户偏好筛选
     */
    filterByPreferences(items, interests) {
        if (!interests || interests.length === 0) return items;
        
        return items.filter(item => {
            return interests.some(interest => 
                item.name.toLowerCase().includes(interest.toLowerCase()) ||
                item.description.toLowerCase().includes(interest.toLowerCase()) ||
                (item.tags && item.tags.some(tag => 
                    tag.toLowerCase().includes(interest.toLowerCase())
                ))
            );
        });
    }

    /**
     * 获取城市基本信息
     */
    async getCityInfo(city) {
        const cityInfo = {
            '首尔': {
                name: '首尔',
                country: '韩国',
                currency: 'KRW',
                language: '韩语',
                timezone: 'Asia/Seoul',
                bestTime: '春秋两季',
                avgCost: {
                    budget: 80000,    // 经济型日预算 (KRW)
                    midrange: 150000, // 中等日预算
                    luxury: 300000    // 豪华日预算
                }
            },
            '东京': {
                name: '东京',
                country: '日本',
                currency: 'JPY',
                language: '日语',
                timezone: 'Asia/Tokyo',
                bestTime: '春秋两季',
                avgCost: {
                    budget: 8000,     // 经济型日预算 (JPY)
                    midrange: 15000,  // 中等日预算
                    luxury: 30000     // 豪华日预算
                }
            }
        };

        return cityInfo[city] || {
            name: city,
            country: '未知',
            currency: 'USD',
            language: '英语',
            timezone: 'UTC',
            bestTime: '全年',
            avgCost: {
                budget: 50,
                midrange: 100,
                luxury: 200
            }
        };
    }
}

module.exports = RAGService;
