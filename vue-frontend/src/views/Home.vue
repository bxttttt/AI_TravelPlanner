<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>AI旅行规划师</h1>
        <p>智能语音规划，让旅行更简单</p>
        <el-button type="primary" size="large" @click="goToPlanner">
          <el-icon><Plus /></el-icon>
          开始规划
        </el-button>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="features">
      <div class="container">
        <h2>核心功能</h2>
        <p>让AI成为您的专属旅行顾问</p>
        
        <el-row :gutter="30">
          <el-col :span="8">
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon><Microphone /></el-icon>
              </div>
              <h3>语音输入</h3>
              <p>支持语音输入旅行需求，AI智能理解并生成个性化行程</p>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon><Magic /></el-icon>
              </div>
              <h3>智能规划</h3>
              <p>基于Spring AI和工具流技术，生成专业的多日行程安排</p>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="feature-card">
              <div class="feature-icon">
                <el-icon><Money /></el-icon>
              </div>
              <h3>预算管理</h3>
              <p>智能预算分配，合理控制旅行成本，让每一分钱都花在刀刃上</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>

    <!-- 技术架构 -->
    <section class="tech-stack">
      <div class="container">
        <h2>技术架构</h2>
        <p>基于Spring Boot + Spring AI + 工具流的现代化架构</p>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="tech-card">
              <h4>Spring Boot</h4>
              <p>后端服务框架</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="tech-card">
              <h4>Spring AI</h4>
              <p>AI模型集成</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="tech-card">
              <h4>工具流</h4>
              <p>智能编排执行</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="tech-card">
              <h4>Vue 3</h4>
              <p>现代化前端</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToPlanner = () => {
  router.push('/planner')
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 100px 20px;
}

.hero-content h1 {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.hero-content p {
  font-size: 1.5rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.features {
  padding: 80px 20px;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.features h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 16px;
}

.features p {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 60px;
}

.feature-card {
  text-align: center;
  padding: 40px 20px;
  border-radius: 12px;
  background: #f8f9fa;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 2rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 16px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.tech-stack {
  padding: 80px 20px;
  background: #f5f7fa;
}

.tech-stack h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 16px;
}

.tech-stack p {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 60px;
}

.tech-card {
  text-align: center;
  padding: 30px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.tech-card:hover {
  transform: translateY(-3px);
}

.tech-card h4 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 8px;
}

.tech-card p {
  color: #666;
  margin: 0;
}
</style>
