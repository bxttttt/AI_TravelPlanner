import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, DollarSign, Users, Plus, Edit, Trash2, Clock, Utensils, Car, Home, Shopping } from 'lucide-react';
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
        return <Shopping className="h-4 w-4" />;
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
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 行程安排 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">行程安排</h2>
            {trip.itinerary && trip.itinerary.length > 0 ? (
              <div className="space-y-4">
                {trip.itinerary.map((day, index) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4">
                    <h3 className="font-semibold text-gray-900">{formatDate(day.date)}</h3>
                    <div className="mt-2 space-y-2">
                      {day.activities?.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-start space-x-3">
                          <Clock className="h-4 w-4 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            {activity.cost && (
                              <p className="text-sm text-green-600">¥{activity.cost}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">暂无行程安排</p>
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
