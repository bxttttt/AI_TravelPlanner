import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, MapPin, Calendar, DollarSign, Users, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get('/api/trips');
      setTrips(response.data);
    } catch (error) {
      console.error('获取旅行计划失败:', error);
      toast.error('获取旅行计划失败');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId) => {
    if (!window.confirm('确定要删除这个旅行计划吗？')) {
      return;
    }

    try {
      await axios.delete(`/api/trips/${tripId}`);
      setTrips(trips.filter(trip => trip._id !== tripId));
      toast.success('旅行计划删除成功');
    } catch (error) {
      console.error('删除旅行计划失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">我的旅行计划</h1>
            <p className="text-gray-600 mt-2">管理和查看您的所有旅行计划</p>
          </div>
          <Link
            to="/planner"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>新建行程</span>
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有旅行计划</h3>
            <p className="text-gray-600 mb-6">开始创建您的第一个AI旅行计划吧！</p>
            <Link
              to="/planner"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>创建旅行计划</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div key={trip._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
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
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{trip.travelers}人</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>预算: ¥{trip.budget.toLocaleString()}</span>
                    </div>
                  </div>

                  {trip.expenses && trip.expenses.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        已花费: ¥{trip.expenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        剩余预算: ¥{(trip.budget - trip.expenses.reduce((sum, expense) => sum + expense.amount, 0)).toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Link
                      to={`/trip/${trip._id}`}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center justify-center space-x-1 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>查看</span>
                    </Link>
                    <Link
                      to={`/trip/${trip._id}/edit`}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center space-x-1 text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span>编辑</span>
                    </Link>
                    <button
                      onClick={() => deleteTrip(trip._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center space-x-1 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
