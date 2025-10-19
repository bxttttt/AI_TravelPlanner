import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { MapPin, Mic, Brain, Cloud, ArrowRight, Play, Calendar, DollarSign, Users, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
    // 获取默认推荐内容（以北京为例）
    fetchRecommendations('北京');
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/trips');
      
      // 确保返回的是数组
      if (Array.isArray(response.data)) {
        setTrips(response.data.slice(0, 3)); // 只显示最新的3个旅行计划
      } else {
        console.warn('旅行计划数据格式不正确:', response.data);
        setTrips([]);
      }
    } catch (error) {
      console.error('获取旅行计划失败:', error);
      if (error.response?.status === 401) {
        // 未授权，用户需要登录
        toast.error('请先登录查看您的旅行计划');
      } else {
        toast.error('获取旅行计划失败，请稍后重试');
      }
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const fetchRecommendations = async (destination) => {
    try {
      setRecommendationsLoading(true);
      const response = await axios.get(`/api/ai/recommendations?destination=${encodeURIComponent(destination)}`);
      
      // 处理AI返回的数据
      if (response.data.data && response.data.success !== false) {
        setRecommendations(response.data.data);
      } else {
        throw new Error('AI推荐数据格式不正确');
      }
    } catch (error) {
      console.error('获取推荐内容失败:', error);
      toast.error('AI推荐服务暂时不可用，请稍后重试');
      setRecommendations(null);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '规划中':
        return 'bg-yellow-100 text-yellow-800';
      case '进行中':
        return 'bg-blue-100 text-blue-800';
      case '已完成':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI旅行规划师
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              智能语音规划，让旅行更简单
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/planner"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="h-5 w-5" />
                  <span>开始规划</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    立即注册
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    登录
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              核心功能
            </h2>
            <p className="text-xl text-gray-600">
              让AI成为您的专属旅行顾问
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">语音输入</h3>
              <p className="text-gray-600">
                支持语音输入旅行需求，AI智能理解并生成个性化行程
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">智能规划</h3>
              <p className="text-gray-600">
                AI分析您的偏好，自动生成详细的旅行路线和建议
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">费用管理</h3>
              <p className="text-gray-600">
                智能预算分析，实时记录旅行开销，让您轻松掌控预算
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cloud className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">云端同步</h3>
              <p className="text-gray-600">
                多设备同步，随时随地查看和修改您的旅行计划
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              如何使用
            </h2>
            <p className="text-xl text-gray-600">
              三步轻松规划完美旅行
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">语音输入需求</h3>
              <p className="text-gray-600">
                说出您的旅行目的地、时间、预算和偏好，AI会智能理解您的需求
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI生成行程</h3>
              <p className="text-gray-600">
                AI根据您的需求自动生成详细的旅行计划，包括景点、住宿、交通等
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">享受旅行</h3>
              <p className="text-gray-600">
                按照AI生成的行程开始您的完美旅行，实时记录费用和体验
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 用户旅行计划展示区域 */}
      {user && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                我的旅行计划
              </h2>
              <p className="text-xl text-gray-600">
                查看和管理您的旅行计划
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-600">正在加载您的旅行计划...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">还没有旅行计划</h3>
                <p className="text-gray-600 mb-6">开始创建您的第一个AI旅行计划吧！</p>
                <Link
                  to="/planner"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 inline-flex items-center space-x-2"
                >
                  <Play className="h-5 w-5" />
                  <span>创建旅行计划</span>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {trips.map((trip) => {
                  // 计算行程天数
                  const startDate = new Date(trip.startDate);
                  const endDate = new Date(trip.endDate);
                  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                  
                  // 计算每日预算
                  const dailyBudget = Math.round(trip.budget / daysDiff);
                  
                  return (
                    <div key={trip._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {trip.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                            {trip.status}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{trip.destination}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {daysDiff}天
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{trip.travelers}人</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span>预算: ¥{trip.budget.toLocaleString()}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              (每日¥{dailyBudget.toLocaleString()})
                            </span>
                          </div>
                          {trip.aiGenerated && (
                            <div className="flex items-center text-xs text-blue-600">
                              <Brain className="h-3 w-3 mr-1" />
                              <span>AI生成</span>
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/trip/${trip._id}`}
                          className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center justify-center space-x-1 text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span>查看详情</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {trips.length > 0 && (
              <div className="text-center">
                <Link
                  to="/dashboard"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  查看所有旅行计划 →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            开始您的智能旅行规划
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            让AI成为您的专属旅行顾问，规划完美的旅行体验
          </p>
          {!user && (
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>立即开始</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </section>

      {/* AI推荐内容区域 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI智能推荐
            </h2>
            <p className="text-xl text-gray-600">
              基于AI的个性化旅行建议
            </p>
          </div>

          {recommendationsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">AI正在为您生成个性化推荐...</p>
            </div>
          ) : recommendations ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* 餐厅推荐 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mr-3">
                    <span className="text-red-600 text-xl">🍽️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">餐厅推荐</h3>
                </div>
                <div className="space-y-4">
                  {recommendations.restaurants?.map((restaurant, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-medium text-gray-900">{restaurant.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{restaurant.specialty || restaurant.speciality}</p>
                      <p className="text-sm text-green-600">{restaurant.price_range || restaurant.priceRange}</p>
                      {restaurant.location && (
                        <p className="text-xs text-gray-500 mt-1">📍 {restaurant.location}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 景点推荐 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-xl">🏛️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">景点推荐</h3>
                </div>
                <div className="space-y-4">
                  {recommendations.attractions?.map((attraction, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900">{attraction.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{attraction.description}</p>
                      <p className="text-sm text-blue-600">门票: {attraction.ticket_price || attraction.ticketPrice}</p>
                      {attraction.best_time && (
                        <p className="text-xs text-gray-500 mt-1">⏰ 最佳时间: {attraction.best_time}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 实用贴士 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 text-xl">💡</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">实用贴士</h3>
                </div>
                <div className="space-y-4">
                  {recommendations.tips && (
                    <>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium text-gray-900 mb-1">文化注意事项</h4>
                        <p className="text-sm text-gray-600">{recommendations.tips.cultural || recommendations.tips.cultural_notes}</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium text-gray-900 mb-1">交通建议</h4>
                        <p className="text-sm text-gray-600">{recommendations.tips.transportation || recommendations.tips.transportation_tips}</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium text-gray-900 mb-1">安全提醒</h4>
                        <p className="text-sm text-gray-600">{recommendations.tips.safety || recommendations.tips.safety_reminders}</p>
                      </div>
                      {recommendations.tips.weather && (
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-medium text-gray-900 mb-1">天气建议</h4>
                          <p className="text-sm text-gray-600">{recommendations.tips.weather}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI推荐服务暂时不可用</h3>
              <p className="text-gray-600 mb-4">请稍后重试或联系管理员</p>
              <button
                onClick={() => fetchRecommendations('北京')}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                重新加载推荐
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
