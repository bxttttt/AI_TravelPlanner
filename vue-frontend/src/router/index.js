import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import TripPlanner from '../views/TripPlanner.vue'
import TripResult from '../views/TripResult.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/planner',
    name: 'TripPlanner',
    component: TripPlanner
  },
  {
    path: '/result',
    name: 'TripResult',
    component: TripResult
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
