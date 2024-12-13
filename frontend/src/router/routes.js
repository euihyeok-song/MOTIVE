import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import useToastMessage from '@/hooks/useToastMessage';

const routes = [
    {
        path: '/',
        children: [
            {
                path: '',
                component: () => import('@/views/Login.vue'),
                meta: { requiresAuth: false }             
            },
            {
                path: 'commingsoon',
                component: () => import('@/views/ComingSoon.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'mypage',
                component: () => import('@/views/member/Mypage.vue'),              
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'EDashboard',
                component: () => import ('@/views/EDashBoard.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE'] }
            },
            {
                path: 'ADashboard',
                component: () => import ('@/views/ADashBoard.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN'] }
            },
            {
                path: 'DDashboard',
                component: () => import ('@/views/DDashBoard.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            },
            {
                path: 'SDashboard',
                component: () => import ('@/views/SDashBoard.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            }
        ]
    },
    {
        path: '/log',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                component: () => import ('@/views/log/Log.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            }
        ]
    },
    {
        path: '/alarm',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'notice',
                component: () => import('@/views/alarm/AlarmScheduleDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/center',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'list',
                component: () => import('@/views/center/CenterList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'detail',
                component: () => import('@/views/center/CenterDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/contract',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'list',
                component: () => import('@/views/contract/ContractList.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'detail',
                component: () => import('@/views/contract/ContractDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'Elist',
                component: () => import('@/views/contract/edit/ContractAdminList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN'] }
            },
            {
                path: 'Edetail',
                component: () => import('@/views/contract/edit/ContractAdminDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN'] }
            },
            {
                path: 'modify',
                component: () => import('@/views/contract/edit/EContractModify.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN'] }
            },
            {
                path: 'register',
                component: () => import('@/views/contract/edit/EContractRegister.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN'] }
            },
            {
                path: 'progress',
                component: () => import('@/views/contract/ContractProgress.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'emdetail',
                component: () => import('@/views/contract/edit/ContractEmployeeDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE'] }
            },
            {
                path: 'emlist',
                component: () => import('@/views/contract/edit/ContractEmployeeList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE'] }
            },
            {
                path: 'ddetail',
                component: () => import('@/views/contract/edit/ContractDDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            },
            {
                path: 'dlist',
                component: () => import('@/views/contract/edit/ContractDList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/customer',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'list',
                component: () => import('@/views/customer/CustomerList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'detail',
                component: () => import('@/views/customer/CustomerDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/employee',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'list',
                component: () => import('@/views/employee/EmployeeList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'detail',
                component: () => import('@/views/employee/EmployeeDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/notice',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'list',
                name: 'NoticeList',
                component: () => import('@/views/notice/NoticeList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'detail',
                name: 'NoticeDetail',
                component: () => import('@/views/notice/NoticeDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'Elist',
                name: 'ENoticeList',
                component: () => import('@/views/notice/edit/ENoticeList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            },
            {
                path: 'Edetail',
                name: 'ENoticeDetail',
                component: () => import('@/views/notice/edit/ENoticeDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            },
            {
                path: 'modify',
                name: 'ENoticeModify',
                component: () => import('@/views/notice/edit/ENoticeModify.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            },
            {
                path: 'register',
                name: 'ENoticeRegister',
                component: () => import('@/views/notice/edit/ENoticeRegister.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/order',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'list',
                component: () => import('@/views/order/OrderList.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'detail',
                component: () => import('@/views/order/OrderDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'modify',
                component: () => import('@/views/order/OrderModify.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN'] }
            },
            {
                path: 'register',
                component: () => import('@/views/order/OrderRegister.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN'] }
            },
            {
                path: 'adDetail',
                component: () => import('@/views/order/edit/OrderAdminDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN'] }
            },
            {
                path: 'adList',
                component: () => import('@/views/order/edit/OrderAdminList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN'] }
            },
            {
                path: 'emDetail',
                component: () => import('@/views/order/edit/OrderEmployeeDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE'] }
            },
            {
                path: 'emList',
                component: () => import('@/views/order/edit/OrderEmployeeList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE'] }
            },
            {
                path: 'dDetail',
                component: () => import('@/views/order/edit/OrderDDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            },
            {
                path: 'dList',
                component: () => import('@/views/order/edit/OrderDList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            },
            {
                path: 'emregister',
                component: () => import('@/views/order/edit/OrderEmployeeRegister.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE'] }
            },
            {
                path: 'emmodify',
                component: () => import('@/views/order/edit/OrderEmployeeModify.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE'] }
            },
            {
                path: 'dmodify',
                component: () => import('@/views/order/edit/OrderAdminModify.vue')
            },
            {
                path: 'dregister',
                component: () => import('@/views/order/edit/OrderAdminRegister.vue')
            }
        ]
    },
    {
        path: '/problem',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'list',
                component: () => import('@/views/problem/ProblemList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'detail',
                name: 'ProblemDetail',
                component: () => import('@/views/problem/ProblemDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'modify',
                name: 'EProblemModify',
                component: () => import('@/views/problem/ProblemModify.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'register',
                name: 'EProblemRegister',
                component: () => import('@/views/problem/ProblemRegister.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/product',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'list',
                component: () => import('@/views/product/ProductList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'detail',
                component: () => import('@/views/product/ProductDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/promotion',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'list',
                name: 'PromotionList',
                component: () => import('@/views/promotion/PromotionList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'detail',
                name: 'PromotionDetail',
                component: () => import('@/views/promotion/PromotionDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'Elist',
                name: 'EPromotionList',
                component: () => import('@/views/promotion/edit/EPromotionList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            },
            {
                path: 'Edetail',
                name: 'EPromotionDetail',
                component: () => import('@/views/promotion/edit/EPromotionDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            },
            {
                path: 'modify',
                name: 'EPromotionModify',
                component: () => import('@/views/promotion/edit/EPromotionModify.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            },
            {
                path: 'register',
                name: 'EPromotionRegister',
                component: () => import('@/views/promotion/edit/EPromotionRegister.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/purchase-order',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'list',
                component: () => import('@/views/purchase-order/PuchaseOrderList.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'detail',
                component: () => import('@/views/purchase-order/PuchaseOrderDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'modify',
                component: () => import('@/views/purchase-order/PuchaseOrderModify.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN'] }
            },
            {
                path: 'register',
                component: () => import('@/views/purchase-order/PuchaseOrderRegister.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN'] }
            },
            {
                path: 'adlist',
                component: () => import('@/views/purchase-order/edit/PuchaseOrderAdminList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN'] }
            },
            {
                path: 'adDetail',
                component: () => import('@/views/purchase-order/edit/PuchaseOrderAdminDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN'] }
            },
            {
                path: 'ddlist',
                component: () => import('@/views/purchase-order/edit/PuchaseOrderDList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            },
            {
                path: 'dDetail',
                component: () => import('@/views/purchase-order/edit/PuchaseOrderDDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/sales-history',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'list',
                component: () => import('@/views/sales-history/SalesHistoryList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'chart',
                component: () => import('@/views/sales-history/SalesHistoryChart.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'Elist',
                component: () => import('@/views/sales-history/ESalesHistoryList.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN'] }
            },
            {
                path: 'Echart',
                component: () => import('@/views/sales-history/ESalesHistoryChart.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN'] }
            }
        ]
    },
    {
        path: '/schedule',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                component: () => import('@/views/schedule/Schedule.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'detail',
                component: () => import('@/views/schedule/ScheduleDetail.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'modify',
                component: () => import('@/views/schedule/ScheduleModify.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            },
            {
                path: 'register',
                component: () => import('@/views/schedule/ScheduleRegister.vue'),
                meta: { requiresAuth: true, auth: ['GOD', 'EMPLOYEE', 'ADMIN', 'DIRECTOR'] }
            }
        ]
    },
    {
        path: '/sample',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: 'searchform',
                component: () => import('@/views/sample/SearchFormTest.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'tabledata',
                component: () => import('@/views/sample/TableDataTest.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'tableform',
                component: () => import('@/views/sample/TableFormTest.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'tableview',
                component: () => import('@/views/sample/TableViewTest.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'dashboard',
                component: () => import('@/views/sample/DashBoard.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'ckeditor',
                component: () => import('@/views/sample/CKEditorTest.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'f12',
                component: () => import('@/views/sample/F12.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: 'sample-api',
                component: () => import('@/views/sample/SampleApiTest.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            },
            {
                path: '',
                component: () => import('@/views/sample/Confort.vue'),
                meta: { requiresAuth: true, auth: ['GOD'] }
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 통합 네비게이션 가드 설정
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    const { isLoggined, auth } = userStore;
    const { showError } = useToastMessage();


    if (to.meta.requiresAuth) {
        if (!isLoggined) {
            showError('접근 차단', '로그인이 필요합니다.');
            return next('/'); // 로그인 페이지로 이동
        }

        if (to.meta.auth) {
            const allowedRoles = Array.isArray(to.meta.auth) ? to.meta.auth : [to.meta.auth];
            if (!allowedRoles.includes(auth)) { // auth가 허용되지 않은 경우
                showError('접근 차단', `해당 페이지는 ${allowedRoles.join(', ')} 권한이 필요합니다.`);
                return next(from.fullPath || '/'); // 이전 페이지 또는 기본 경로로 이동
            }
        }
    }

    next(); // 정상 접근 허용
});

export default router;
