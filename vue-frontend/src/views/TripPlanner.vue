<template>
  <div class="trip-planner">
    <div class="container">
      <div class="header">
        <h1>AI旅行规划师</h1>
        <p>智能语音规划，让旅行更简单</p>
      </div>

      <el-card class="planner-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Calendar /></el-icon>
            <span>旅行信息</span>
          </div>
        </template>

        <el-form 
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          label-width="100px"
          @submit.prevent="generateTrip"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="目的地" prop="destination">
                <el-input 
                  v-model="form.destination" 
                  placeholder="请输入目的地，如：韩国、日本东京"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="同行人数" prop="companions">
                <el-input-number 
                  v-model="form.companions" 
                  :min="1" 
                  :max="10"
                  placeholder="人数"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="出发日期" prop="startDate">
                <el-date-picker
                  v-model="form.startDate"
                  type="date"
                  placeholder="选择出发日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="返回日期" prop="endDate">
                <el-date-picker
                  v-model="form.endDate"
                  type="date"
                  placeholder="选择返回日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="预算" prop="budget">
                <el-input-number 
                  v-model="form.budget" 
                  :min="100" 
                  :max="100000"
                  placeholder="预算金额"
                />
                <span class="budget-unit">元</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="旅行偏好">
                <el-input 
                  v-model="form.preferences" 
                  placeholder="如：美食、动漫、购物、文化体验"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              :loading="loading"
              @click="generateTrip"
              class="generate-btn"
            >
              <el-icon v-if="!loading"><Magic /></el-icon>
              <span v-if="loading">AI正在生成行程...</span>
              <span v-else>生成AI旅行规划</span>
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- AI生成状态 -->
      <el-card v-if="loading" class="status-card" shadow="hover">
        <div class="ai-status">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <h3>AI正在为您生成个性化旅行规划</h3>
          <p>这可能需要几秒钟时间，请耐心等待...</p>
          <el-progress :percentage="progress" :show-text="false" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { tripApi } from '../api/tripApi'

const router = useRouter()

// 表单数据
const form = reactive({
  destination: '',
  startDate: '',
  endDate: '',
  budget: 10000,
  companions: 1,
  preferences: ''
})

// 表单验证规则
const rules = {
  destination: [
    { required: true, message: '请输入目的地', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择出发日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择返回日期', trigger: 'change' }
  ],
  budget: [
    { required: true, message: '请输入预算', trigger: 'blur' }
  ],
  companions: [
    { required: true, message: '请输入同行人数', trigger: 'blur' }
  ]
}

// 状态管理
const loading = ref(false)
const progress = ref(0)
const formRef = ref()

// 生成旅行规划
const generateTrip = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    // 开始AI生成
    loading.value = true
    progress.value = 0
    
    // 模拟进度
    const progressInterval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += Math.random() * 10
      }
    }, 200)
    
    // 调用AI接口
    const response = await tripApi.generateTripPlan({
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      budget: form.budget,
      companions: form.companions,
      preferences: form.preferences
    })
    
    // 完成进度
    clearInterval(progressInterval)
    progress.value = 100
    
    // 显示成功消息
    ElMessage.success('AI旅行规划生成成功！')
    
    // 跳转到结果页面
    router.push({
      name: 'TripResult',
      state: { tripData: response.data }
    })
    
  } catch (error) {
    console.error('生成旅行规划失败:', error)
    ElMessage.error('生成失败，请重试')
  } finally {
    loading.value = false
    progress.value = 0
  }
}

// 页面加载时设置默认值
onMounted(() => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  form.startDate = today.toISOString().split('T')[0]
  form.endDate = tomorrow.toISOString().split('T')[0]
})
</script>

<style scoped>
.trip-planner {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 16px;
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.planner-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.budget-unit {
  margin-left: 8px;
  color: #666;
}

.generate-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
}

.status-card {
  text-align: center;
}

.ai-status {
  padding: 20px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-status h3 {
  margin: 16px 0 8px;
  color: #333;
}

.ai-status p {
  color: #666;
  margin-bottom: 20px;
}
</style>
