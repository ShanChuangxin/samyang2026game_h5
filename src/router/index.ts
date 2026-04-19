import { createRouter, createWebHistory } from 'vue-router'
// lego cny
import Index from '../views/Index/index.vue'
import Check from '../views/Check/index.vue'
import Backup from '../views/Backup/index.vue'
import Game from '../views/Game/index.vue'
import Introduce from '../views/Introduce/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '/index',
      name: 'index',
      component: Index
    },
    {
      path: '/check',
      name: 'check',
      component: Check
    },
    {
      path: '/backup',
      name: 'backup',
      component: Backup
    },
    {
      path: '/introduce',
      name: 'introduce',
      component: Introduce
    },
    {
      path: '/game',
      name: 'game',
      component: Game
    }
  ]
})

export default router
