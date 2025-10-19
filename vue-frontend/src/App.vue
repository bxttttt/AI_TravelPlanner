<template>
  <div id="app">
    <el-container>
      <!-- 导航栏 -->
      <el-header class="header">
        <div class="header-content">
          <div class="logo">
            <el-icon><MapLocation /></el-icon>
            <span>AI旅行规划师</span>
          </div>
          <div class="nav-buttons">
            <el-button type="primary" @click="goToPlanner">
              <el-icon><Plus /></el-icon>
              开始规划
            </el-button>
          </div>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
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
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  gap: 8px;
}

.nav-buttons {
  display: flex;
  gap: 12px;
}

.main-content {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
  padding: 0;
}
</style>
