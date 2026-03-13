import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/service/:slug',
      name: 'service-detail',
      component: () => import('../views/ServiceDetailView.vue')
    },
    {
      path: '/category/:slug',
      name: 'category-detail',
      component: () => import('../views/CategoryView.vue')
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/AccountView.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue')
    },
    {
      path: '/intro',
      name: 'introduction',
      component: () => import('../views/IntroductionView.vue')
    },
    {
      path: '/services',
      name: 'services-list',
      component: () => import('../views/ServiceListView.vue')
    },
    {
      path: '/guide',
      name: 'guide',
      component: () => import('../views/GuideView.vue')
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('../views/NewsView.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue')
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Dashboard.vue')
        },
        {
          path: 'services',
          name: 'admin-services',
          component: () => import('../views/admin/ServiceManager.vue')
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('../views/admin/OrderManager.vue')
        },

        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('../views/admin/CategoryManager.vue')
        },
     {
        path: '/admin/banners',
        name: 'AdminBanners',
        component: () => import('@/views/admin/BannerManager.vue')
      }
        
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (token && (user.is_admin === true || user.is_admin === 1)) {
      next()
    } else {
      next({ 
        name: 'auth', 
        query: { redirect: to.fullPath } 
      })
    }
  } else {
    next()
  }
})

export default router