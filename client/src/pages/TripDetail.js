import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, DollarSign, Users, Plus, Edit, Trash2, Clock, Utensils, Car, Home, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const TripDetail = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await axios.get(`/api/trips/${id}`);
      setTrip(response.data);
    } catch (error) {
      console.error('获取旅行计划失败:', error);
      toast.error('获取旅行计划失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`/api/trips/${id}/expenses`, newExpense);
      setTrip(response.data.trip);
      setNewExpense({
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddExpense(false);
      toast.success('费用记录添加成功');
    } catch (error) {
      console.error('添加费用记录失败:', error);
      toast.error('添加费用记录失败');
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm('确定要删除这条费用记录吗？')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/trips/${id}/expenses/${expenseId}`);
      setTrip(response.data.trip);
      toast.success('费用记录删除成功');
    } catch (error) {
      console.error('删除费用记录失败:', error);
      toast.error('删除费用记录失败');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case '交通':
        return <Car className="h-4 w-4" />;
      case '住宿':
        return <Home className="h-4 w-4" />;
      case '餐饮':
        return <Utensils className="h-4 w-4" />;
      case '购物':
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">旅行计划未找到</h2>
          <Link
            to="/dashboard"
            className="text-primary-600 hover:text-primary-700"
          >
            返回仪表板
          </Link>
        </div>
      </div>
    );
  }

  const totalExpenses = trip.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const remainingBudget = trip.budget - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 头部信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{trip.travelers}人</span>
                </div>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="text-primary-600 hover:text-primary-700"
            >
              返回列表
            </Link>
          </div>

          {/* 预算信息 */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">总预算</span>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">¥{trip.budget.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-800">已花费</span>
                <DollarSign className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900">¥{totalExpenses.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-lg ${remainingBudget >= 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${remainingBudget >= 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                  剩余预算
                </span>
                <DollarSign className={`h-4 w-4 ${remainingBudget >= 0 ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-900' : 'text-yellow-900'}`}>
                ¥{remainingBudget.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 预算分配分析 */}
          {trip.budgetSummary && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">预算分配分析</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">总预算概览</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">总预算:</span>
                      <span className="font-medium">¥{trip.budgetSummary.totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">预计总花费:</span>
                      <span className="font-medium text-blue-600">¥{trip.budgetSummary.estimatedTotalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">剩余预算:</span>
                      <span className={`font-medium ${trip.budgetSummary.totalBudget - trip.budgetSummary.estimatedTotalCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ¥{(trip.budgetSummary.totalBudget - trip.budgetSummary.estimatedTotalCost).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">预算分配建议</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">住宿 (35%):</span>
                      <span className="font-medium">¥{trip.budgetSummary.budgetAllocation.accommodation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">餐饮 (25%):</span>
                      <span className="font-medium">¥{trip.budgetSummary.budgetAllocation.meals.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">交通 (20%):</span>
                      <span className="font-medium">¥{trip.budgetSummary.budgetAllocation.transportation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">景点 (15%):</span>
                      <span className="font-medium">¥{trip.budgetSummary.budgetAllocation.attractions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">其他 (5%):</span>
                      <span className="font-medium">¥{trip.budgetSummary.budgetAllocation.others.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 每日预算详情 */}
          {trip.itinerary && trip.itinerary.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">每日预算详情</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trip.itinerary.map((day, index) => {
                  const dailyBudget = day.dailyBudget || Math.round(trip.budget / trip.itinerary.length);
                  const dailyExpenses = day.estimatedCost || (day.activities?.reduce((sum, act) => sum + (act.cost || 0), 0) || 0);
                  const remaining = dailyBudget - dailyExpenses;
                  const budgetStatus = remaining >= 0 ? 'within' : 'over';
                  
                  return (
                    <div key={index} className={`bg-white p-4 rounded-lg border ${budgetStatus === 'over' ? 'border-red-200 bg-red-50' : 'border-green-200'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-900">第{index + 1}天</span>
                        <span className="text-sm text-gray-500">{formatDate(day.date)}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">每日预算:</span>
                          <span className="font-medium">¥{dailyBudget}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">预计花费:</span>
                          <span className="font-medium text-blue-600">¥{dailyExpenses}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">剩余预算:</span>
                          <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ¥{remaining}
                          </span>
                        </div>
                        {day.activities && day.activities.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">活动预算分布:</p>
                            {day.activities.map((activity, actIndex) => (
                              <div key={actIndex} className="flex justify-between text-xs">
                                <span className="text-gray-500 truncate">{activity.title}</span>
                                <span className="text-gray-600">¥{activity.cost || 0}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 行程安排 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">行程安排</h2>
              {trip.itinerary && trip.itinerary.length > 1 && (
                <span className="text-sm text-gray-500">
                  {trip.itinerary.length}天行程
                </span>
              )}
            </div>
            {trip.itinerary && trip.itinerary.length > 0 ? (
              <div className="space-y-6">
                {trip.itinerary.map((day, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        第{index + 1}天 - {formatDate(day.date)}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {day.activities?.length || 0}个活动
                      </span>
                    </div>
                    <div className="space-y-3">
                      {day.activities?.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Clock className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">{activity.title}</p>
                              {activity.cost && (
                                <span className="text-sm text-green-600 font-medium">¥{activity.cost}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            {activity.location && (
                              <p className="text-xs text-gray-500 mt-1">📍 {activity.location}</p>
                            )}
                            {activity.time && (
                              <p className="text-xs text-blue-600 mt-1">🕐 {activity.time}</p>
                            )}
                            {activity.category && (
                              <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {activity.category}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 餐饮建议 */}
                    {day.meals && (day.meals.breakfast || day.meals.lunch || day.meals.dinner) && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Utensils className="h-4 w-4 mr-2" />
                          餐饮建议
                        </h4>
                        <div className="space-y-1 text-sm">
                          {day.meals.breakfast && (
                            <p><span className="font-medium">早餐:</span> {day.meals.breakfast}</p>
                          )}
                          {day.meals.lunch && (
                            <p><span className="font-medium">午餐:</span> {day.meals.lunch}</p>
                          )}
                          {day.meals.dinner && (
                            <p><span className="font-medium">晚餐:</span> {day.meals.dinner}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* 住宿和交通建议 */}
                    {(day.accommodation || day.transportation) && (
                      <div className="mt-4 space-y-2">
                        {day.accommodation && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                              <Home className="h-4 w-4 mr-2" />
                              住宿建议
                            </h4>
                            <p className="text-sm text-gray-600">{day.accommodation}</p>
                          </div>
                        )}
                        {day.transportation && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                              <Car className="h-4 w-4 mr-2" />
                              交通建议
                            </h4>
                            <p className="text-sm text-gray-600">{day.transportation}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* 当日贴士 */}
                    {day.tips && (
                      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                          💡 当日贴士
                        </h4>
                        <p className="text-sm text-gray-600">{day.tips}</p>
                      </div>
                    )}
                    {/* 每日预算统计 */}
                    {day.activities && day.activities.some(act => act.cost) && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          第{index + 1}天预计费用: ¥{day.activities.reduce((sum, act) => sum + (act.cost || 0), 0)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">暂无行程安排</p>
                <p className="text-sm text-gray-400 mt-1">AI正在为您生成详细的旅行计划...</p>
              </div>
            )}
          </div>

          {/* 费用记录 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">费用记录</h2>
              <button
                onClick={() => setShowAddExpense(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>添加费用</span>
              </button>
            </div>

            {showAddExpense && (
              <form onSubmit={handleAddExpense} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">类别</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">选择类别</option>
                      <option value="交通">交通</option>
                      <option value="住宿">住宿</option>
                      <option value="餐饮">餐饮</option>
                      <option value="景点门票">景点门票</option>
                      <option value="购物">购物</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">金额</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="费用描述"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                  >
                    添加
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    取消
                  </button>
                </div>
              </form>
            )}

            {trip.expenses && trip.expenses.length > 0 ? (
              <div className="space-y-3">
                {trip.expenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(expense.category)}
                      <div>
                        <p className="font-medium text-gray-900">{expense.category}</p>
                        <p className="text-sm text-gray-600">{expense.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">¥{expense.amount}</span>
                      <button
                        onClick={() => deleteExpense(expense._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">暂无费用记录</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
