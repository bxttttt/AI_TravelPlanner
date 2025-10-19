<template>
  <div class="trip-result">
    <div class="container">
      <!-- 结果头部 -->
      <div class="result-header">
        <h1>您的AI旅行规划</h1>
        <p>{{ tripData.destination }} {{ formatDate(tripData.startDate) }} 旅行</p>
        <div class="trip-summary">
          <el-tag type="success" size="large">总预算 ¥{{ tripData.totalBudget }}</el-tag>
          <el-tag type="info" size="large">{{ tripData.days.length }} 天行程</el-tag>
        </div>
      </div>

      <!-- 行程详情 -->
      <el-card class="itinerary-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Calendar /></el-icon>
            <span>AI生成的行程安排</span>
          </div>
        </template>

        <el-tabs v-model="activeDay" type="card">
          <el-tab-pane 
            v-for="(day, index) in tripData.days" 
            :key="index"
            :label="`第${day.day}天`"
            :name="index.toString()"
          >
            <div class="day-content">
              <div class="day-header">
                <h3>{{ day.title }}</h3>
                <el-tag type="warning" size="small">每日预算: ¥{{ day.dailyBudget }}</el-tag>
              </div>
              
              <div class="activities">
                <el-timeline>
                  <el-timeline-item
                    v-for="(activity, actIndex) in day.activities"
                    :key="actIndex"
                    :timestamp="activity.time"
                    placement="top"
                  >
                    <el-card class="activity-card">
                      <h4>{{ activity.activity }}</h4>
                      <p>{{ activity.desc }}</p>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 推荐内容 -->
      <el-row :gutter="20" class="recommendations">
        <el-col :span="12">
          <el-card class="recommendation-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Food /></el-icon>
                <span>餐厅推荐</span>
              </div>
            </template>
            <ul class="recommendation-list">
              <li v-for="(restaurant, index) in tripData.recommendations.restaurants" :key="index">
                {{ restaurant }}
              </li>
            </ul>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="recommendation-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>实用贴士</span>
              </div>
            </template>
            <ul class="recommendation-list">
              <li v-for="(tip, index) in tripData.recommendations.tips" :key="index">
                {{ tip }}
              </li>
            </ul>
          </el-card>
        </el-col>
      </el-row>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="regenerateTrip">
          <el-icon><Refresh /></el-icon>
          重新生成
        </el-button>
        <el-button type="success" size="large" @click="saveTrip">
          <el-icon><Download /></el-icon>
          保存规划
        </el-button>
        <el-button size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeDay = ref('0')

// 从路由状态获取行程数据
let tripData = ref({
  destination: '韩国',
  startDate: '2025-10-21',
  endDate: '2025-10-25',
  totalBudget: 10000,
  days: [],
  recommendations: {
    restaurants: [],
    tips: []
  }
})

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 重新生成行程
const regenerateTrip = () => {
  ElMessage.info('重新生成功能开发中...')
}

// 保存行程
const saveTrip = () => {
  ElMessage.success('行程已保存到您的账户')
}

// 返回首页
const goBack = () => {
  router.push('/')
}

// 页面加载时获取数据
onMounted(() => {
  // 从路由状态获取数据
  const state = history.state
  if (state && state.tripData) {
    tripData.value = state.tripData
  } else {
    // 如果没有数据，显示示例数据
    tripData.value = {
      destination: '韩国',
      startDate: '2025-10-21',
      endDate: '2025-10-25',
      totalBudget: 10000,
      days: [
        {
          day: 1,
          title: '第一天：抵达与初探',
          dailyBudget: 2000,
          activities: [
            {
              time: '上午',
              activity: '抵达目的地',
              desc: '办理入境手续，熟悉周边环境'
            },
            {
              time: '下午',
              activity: '当地美食体验',
              desc: '品尝韩国特色美食，体验当地文化'
            }
          ]
        }
      ],
      recommendations: {
        restaurants: [
          '明洞小吃街 - 品尝地道韩式料理',
          '土俗村参鸡汤 - 传统滋补美食',
          '弘大网红咖啡厅 - 体验K-pop文化'
        ],
        tips: [
          '提前预订热门景点门票，避免排队',
          '了解当地交通方式，下载相关APP',
          '准备常用药品，注意饮食卫生'
        ]
      }
    }
  }
})
</script>

<style scoped>
.trip-result {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.result-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 16px;
}

.result-header p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 20px;
}

.trip-summary {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.itinerary-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
}

.day-content {
  padding: 20px 0;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.day-header h3 {
  margin: 0;
  color: #333;
}

.activities {
  margin-top: 20px;
}

.activity-card {
  margin-bottom: 16px;
}

.activity-card h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.activity-card p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.recommendations {
  margin-bottom: 30px;
}

.recommendation-card {
  height: 100%;
}

.recommendation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendation-list li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
  line-height: 1.6;
}

.recommendation-list li:last-child {
  border-bottom: none;
}

.action-buttons {
  text-align: center;
  padding: 30px 0;
}

.action-buttons .el-button {
  margin: 0 8px;
}
</style>
