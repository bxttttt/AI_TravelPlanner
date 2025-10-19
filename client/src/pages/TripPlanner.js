import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VoiceInput from '../components/VoiceInput';
import { MapPin, Calendar, DollarSign, Users, Mic, Brain, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const TripPlanner = () => {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: 1,
    preferences: ''
  });
  const [voiceInput, setVoiceInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVoiceTranscript = (transcript) => {
    setVoiceInput(transcript);
    // 尝试从语音输入中提取信息
    const destinationMatch = transcript.match(/去(.+?)(?:，|$)/);
    const budgetMatch = transcript.match(/(\d+)(?:元|万|千)/);
    const daysMatch = transcript.match(/(\d+)(?:天|日)/);
    
    if (destinationMatch) {
      setFormData(prev => ({ ...prev, destination: destinationMatch[1] }));
    }
    if (budgetMatch) {
      setFormData(prev => ({ ...prev, budget: budgetMatch[1] }));
    }
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);
      setFormData(prev => ({
        ...prev,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
    
    setFormData(prev => ({ ...prev, preferences: transcript }));
  };

  const isFormValid = () => {
    return formData.destination && formData.startDate && formData.endDate && formData.budget;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('请填写所有必填字段');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await axios.post('/api/ai/generate-trip', {
        ...formData,
        voiceInput: voiceInput
      });

      if (response.data.data) {
        // 创建新的旅行计划，包含AI生成的行程
        const tripData = {
          title: `${formData.destination} ${formData.startDate} 旅行`,
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: parseInt(formData.budget),
          travelers: parseInt(formData.travelers),
          preferences: {
            interests: formData.preferences.split(',').map(s => s.trim()),
            specialRequirements: voiceInput
          },
          aiGenerated: true
        };

        // 如果AI返回了行程数据，添加到旅行计划中
        if (response.data.data.itinerary && Array.isArray(response.data.data.itinerary)) {
          tripData.itinerary = response.data.data.itinerary;
        }

        const tripResponse = await axios.post('/api/trips', tripData);

        toast.success('AI旅行计划生成成功！');
        navigate(`/trip/${tripResponse.data.trip._id}`);
      }
    } catch (error) {
      console.error('生成旅行计划失败:', error);
      toast.error(error.response?.data?.message || '生成旅行计划失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI智能旅行规划
          </h1>
          <p className="text-lg text-gray-600">
            告诉AI您的旅行需求，让AI为您规划完美的旅行
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 语音输入区域 */}
            <div className="border-2 border-dashed border-primary-300 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">语音输入</h3>
              </div>
              
              {!showVoiceInput ? (
                <button
                  type="button"
                  onClick={() => setShowVoiceInput(true)}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Mic className="h-5 w-5" />
                  <span>开始语音输入</span>
                </button>
              ) : (
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  onRecordingStart={() => setShowVoiceInput(true)}
                  onRecordingStop={() => setShowVoiceInput(false)}
                />
              )}
              
              {voiceInput && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>语音识别结果：</strong> {voiceInput}
                  </p>
                </div>
              )}
            </div>

            {/* 基本信息表单 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  目的地 *
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="请输入目的地，如：日本东京"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  同行人数
                </label>
                <input
                  type="number"
                  name="travelers"
                  value={formData.travelers}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  出发日期 *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  返回日期 *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  预算 (元) *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="请输入预算金额"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                旅行偏好
              </label>
              <textarea
                name="preferences"
                value={formData.preferences}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="请描述您的旅行偏好，如：喜欢美食、文化景点、购物等"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!isFormValid() || isGenerating}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Brain className="h-5 w-5 animate-spin" />
                    <span>AI正在规划中...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    <span>生成AI旅行计划</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
