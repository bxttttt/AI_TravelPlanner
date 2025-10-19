import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Key, Globe, DollarSign, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateSettings } = useAuth();
  const [formData, setFormData] = useState({
    language: 'zh-CN',
    currency: 'CNY',
    openaiApiKey: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.preferences) {
      setFormData({
        language: user.preferences.language || 'zh-CN',
        currency: user.preferences.currency || 'CNY',
        openaiApiKey: user.preferences.openaiApiKey || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateSettings(formData);
      if (result.success) {
        toast.success('设置保存成功');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">设置</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* API Key 设置 */}
            <div className="border-b border-gray-200 pb-8">
              <div className="flex items-center mb-4">
                <Key className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">API 配置</h2>
              </div>
              <p className="text-gray-600 mb-4">
                配置您的 OpenAI API Key 以使用 AI 功能。您可以在{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  OpenAI 平台
                </a>{' '}
                获取 API Key。
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    name="openaiApiKey"
                    value={formData.openaiApiKey}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="请输入您的 OpenAI API Key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  您的 API Key 将安全存储在您的账户中，仅用于 AI 功能。
                </p>
              </div>
            </div>

            {/* 语言设置 */}
            <div className="border-b border-gray-200 pb-8">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">语言设置</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  界面语言
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                  <option value="ko-KR">한국어</option>
                </select>
              </div>
            </div>

            {/* 货币设置 */}
            <div className="border-b border-gray-200 pb-8">
              <div className="flex items-center mb-4">
                <DollarSign className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">货币设置</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  默认货币
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="CNY">人民币 (¥)</option>
                  <option value="USD">美元 ($)</option>
                  <option value="EUR">欧元 (€)</option>
                  <option value="JPY">日元 (¥)</option>
                  <option value="KRW">韩元 (₩)</option>
                </select>
              </div>
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? '保存中...' : '保存设置'}</span>
              </button>
            </div>
          </form>

          {/* 使用说明 */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">使用说明</h3>
            <div className="text-blue-800 space-y-2">
              <p>• 配置 OpenAI API Key 后，您可以使用 AI 智能规划功能</p>
              <p>• 支持语音输入旅行需求，AI 会自动生成个性化行程</p>
              <p>• 所有数据都会安全存储在云端，支持多设备同步</p>
              <p>• 您可以随时修改这些设置，更改会立即生效</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
