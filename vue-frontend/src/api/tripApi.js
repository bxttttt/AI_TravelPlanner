import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('🚀 发送请求:', config.url, config.data)
    return config
  },
  (error) => {
    console.error('❌ 请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('✅ 收到响应:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('❌ 响应错误:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

/**
 * 旅行规划API
 */
export const tripApi = {
  /**
   * 生成旅行规划
   * 调用Spring Boot后端的工具流编排服务
   * 
   * @param {Object} requestData 旅行规划请求数据
   * @returns {Promise} AI生成的旅行规划
   */
  async generateTripPlan(requestData) {
    try {
      console.log('🤖 开始调用AI生成旅行规划...')
      console.log('📋 请求参数:', requestData)
      
      const response = await api.post('/ai/plan', requestData)
      
      console.log('✅ AI旅行规划生成成功')
      console.log('📊 响应数据:', response.data)
      
      return response
    } catch (error) {
      console.error('❌ AI旅行规划生成失败:', error)
      throw error
    }
  },

  /**
   * 健康检查
   * 
   * @returns {Promise} 服务状态
   */
  async healthCheck() {
    try {
      const response = await api.get('/ai/health')
      return response.data
    } catch (error) {
      console.error('❌ 健康检查失败:', error)
      throw error
    }
  },

  /**
   * 获取AI服务信息
   * 
   * @returns {Promise} AI服务信息
   */
  async getAIInfo() {
    try {
      const response = await api.get('/ai/info')
      return response.data
    } catch (error) {
      console.error('❌ 获取AI信息失败:', error)
      throw error
    }
  }
}

export default api
