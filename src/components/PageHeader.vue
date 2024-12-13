<template>
    <header>
        <nav class="menu-bar">
            <div class="start">
                <!-- <RouterLink to="/dashboard" class="nav-link" active-class="router-link-active"
                    exact-active-class="router-link-exact-active">
                    <img src="../assets/header/gradation.png" class="garadation" />
                    <span class="title">영업관리</span>
                </RouterLink> -->
                <div class="nav-link" @click="handleNavigation">
                    <img src="../assets/header/gradation.png" class="gradation" />
                    <span class="title">영업관리</span>
                </div>
            </div>

            <div class="end">
                <div class="left-time">
                    <i class="pi pi-clock" style="margin-right: 8px; color: #ff4d4f;">{{ blank }}{{ formattedTime }}</i>
                    <button class="extend-button" @click="extendTime">연장</button>
                </div>
                <!-- 로그인 유저 -->
                <div class="name">반갑습니다. {{ userStore.name }} {{ translatedRole }}님</div>
                <div class="right-logo">
                    <img v-if="userStore.imageUrl" :src="userStore.imageUrl" alt="User Profile" class="profile-image"
                        @click="goMypage" />
                    <i v-else="userStore.imageurl" class="pi pi-user profile" @click="goMypage"></i>
                    <div class="alarm-container">
                        <i class="pi pi-bell alarm" @click="toggleAlarmDropdown"></i>
                        <span class="alarm-badge" v-show="totalUnreadAlarms >= 0">
                            {{ totalUnreadAlarms }}
                        </span>
                        <!-- Alarm Dropdown -->
                        <div v-if="showAlarmDropdown" class="alarm-dropdown">
                            <div class="alarm-categories">
                                <div v-for="(category, index) in alarmCategories" :key="index" class="alarm-category"
                                    @click="showAlarmModal(category.value)">
                                    <div class="category-info">
                                        <span class="category-name">{{ category.name }}</span>
                                        <span v-if="category.unreadCount >= 0" class="category-unread-count">
                                            {{ category.unreadCount }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <i class="pi pi-sitemap organization-logo" @click="showOrganizationModal"></i>
                    <i class="pi pi-sign-out logout-logo" @click="logout"></i>
                </div>
            </div>
        </nav>
    </header>

    <Modal v-model="showOrganizationChart" header="조직도" width="70rem" height="100rem">
        <!-- Custom Modal -->
        <div v-if="showOrganizationChart" class="modal-overlay">
            <div class="modal">
                <div class="aside">
                    <!-- Tree 컴포넌트 -->
                    <Tree v-model:expandedKeys="expandedKeys" :value="organization" :filter="true" filterMode="lenient"
                        filterPlaceholder="부서 검색" selectionMode="single" class="tree-component"
                        @node-select="handleNodeSelect" @node-expand="onNodeExpand" @node-collapse="onNodeCollapse" />
                </div>
                <div class="body">
                    <OrganizationEmployee :organizationId="organizationId" @closeModal="closeModal" />
                </div>
            </div>
        </div>
    </Modal>

    <Modal v-model="showAlarmChart" header="알림" width="63rem" height="37rem" class="alarm-modal-header">
        <div class="alarm-modal-container" @click.self="closeAlarmModal">
            <div class="sidebar-container">
                <Sidebar @menu-clicked="showAlarms" />
            </div>
            <div class="alarm-list-container" @scroll="handleScroll">
                <div v-if="alarms.length === 0 && !loading" class="no-alarms">
                    해당 카테고리에 알림이 없습니다.
                </div>
                <div v-for="alarm in alarms" :key="alarm.redirectUrl || 'no-alarms'" :class="[
                    'alarm-item',
                    {
                        'read': alarm.readStatus,
                        'no-alarms-message': alarm.isNoAlarmsMessage
                    }
                ]" @click="!alarm.isNoAlarmsMessage && showAlarmDetail(alarm)" style="cursor: pointer;">
                    <!-- Only show tag and other details for actual alarms -->
                    <template v-if="!alarm.isNoAlarmsMessage">
                        <span class="tag" :style="{
                            backgroundColor: getTagColor(alarm.tag),
                        }">
                            {{ alarm.tag }}
                        </span>
                        <h4 class="message">{{ truncateMessage(alarm.message) }}</h4>
                        <p class="created-at">{{ alarm.createdAt }}</p>
                    </template>

                    <!-- No alarms message -->
                    <template v-else>
                        <div class="no-alarms-content">{{ alarm.message }}</div>
                    </template>
                </div>
                <div v-if="loading" class="alarm-item">
                </div>
            </div>

            <div v-if="selectedAlarm" class="alarm-detail-container">
                <AlarmScheduleDetail :alarm="selectedAlarm" @closeModal="closeAlarmModal" />
            </div>
        </div>
    </Modal>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watchEffect } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import Modal from './common/Modal.vue';
import Tree from 'primevue/tree';
import ApiService from '@/services/api/config/ApiService';
import OrganizationEmployee from './common/OrganizationEmployee.vue';
import Sidebar from '@/views/alarm/AlarmSideBar.vue';
import AlarmScheduleDetail from '@/views/alarm/AlarmScheduleDetail.vue';

const blank = ' ';
const userStore = useUserStore();
const router = useRouter();

const showOrganizationChart = ref(false);
const organization = ref([]);
const expandedKeys = ref({});

const organizationId = ref('ORG_000000001');

const apiService = new ApiService('api/v1/organization');

const apiAlarmService = new ApiService('api/v1/alarm');
const alarms = ref([]);
const showAlarmChart = ref(false);
const showAlarmDropdown = ref(false);
const totalUnreadAlarms = ref(0);
const alarmCategories = ref([]);

const currentPage = ref(0);
const totalPages = ref(1);
const loading = ref(false);
const selectedCategory = ref('');

const selectedAlarm = ref(null)

const truncateMessage = (message) => {
    if (!message) return '';
    return message.length > 30 ? message.substring(0, 30) + '...' : message;
};

const tagColors = [
    { name: '미팅', color: '#AEC6CF' },
    { name: '교육', color: '#FFDAB9' },
    { name: '휴가', color: '#B0E57C' },
    { name: '회의', color: '#FFB7C5' },
    { name: '계약서', color: '#A7D8DE' },
    { name: '발주서', color: '#FFE4E1' },
    { name: '수주서', color: '#B9E4C9' },
    { name: '중요', color: '#FFB3B3' },
    { name: '일반', color: '#E0FFB3' },
];

const getTagColor = (tag) => {

    const tagData = tagColors.find(item => item.name === tag);
    return tagData ? tagData.color : '#DDD'; // 기본 회색
};

// 마이 페이지
const goMypage = () => {
    router.push('/mypage');
}

const logout = () => {
    userStore.logout();
    router.replace('/');
}

// 조직도
const showOrganizationModal = async () => {
    showOrganizationChart.value = true;
    await getOrganizationChart();
};

const closeModal = () => {
    showOrganizationChart.value = false;
};

const getOrganizationChart = async () => {
    try {
        const response = await apiService.get('', '');

        const result = response.result;

        organization.value = transformToTree(result);

    } catch (error) {
        console.error('부서 요청 실패: ', error);
    }
};

const transformToTree = (data) => {
    const map = {};
    const tree = [];

    // 각 항목을 map에 저장하고 children 속성 초기화
    data.forEach((item) => {
        map[item.organizationId] = {
            key: item.organizationId,
            label: item.name,
            data: item,
            children: item.children || []
        };
    });

    // 부모 자식 관계 형성
    data.forEach((item) => {
        if (!item.parent) {
            tree.push(map[item.organizationId]);
        } else if (map[item.parent]) {
            map[item.parent].children.push(map[item.organizationId]);
        }
    });
    return tree;
};

// 이벤트 핸들러
const handleNodeSelect = (event) => {

    if (expandedKeys.value[event.key]) {
        // 이미 열려 있으면 닫기
        expandedKeys.value[event.key] = false;
    } else {
        // 닫혀 있으면 열기
        expandedKeys.value[event.key] = true;
    }

    const selectedNode = event.data.organizationId;
    organizationId.value = selectedNode;
};

const onNodeExpand = (node) => {
    console.log('노드 확장:', node);
};

const onNodeCollapse = (node) => {
    console.log('노드 축소:', node);
};

const handleNavigation = () => {
    switch (userStore.auth) {
        case 'ADMIN':
            router.push('/ADashboard');
            break;
        case 'DIRECTOR':
            router.push('/DDashboard');
            break;
        case 'GOD':
            router.push('/SDashboard');
            break;
        default:
            router.push('/EDashboard');
            break;
    }
};

// 알람
const fetchAlarmTypes = async () => {
    try {
        const response = await apiAlarmService.get('', '');

        if (response && response.result) {
            alarmCategories.value = [
                {
                    name: '계약 알림',
                    value: 'CONTRACT',
                    unreadCount: response.result.contractAlarmCount
                },
                {
                    name: '공지 알림',
                    value: 'NOTICE',
                    unreadCount: response.result.noticeAlarmCount
                },
                {
                    name: '일정 알림',
                    value: 'SCHEDULE',
                    unreadCount: response.result.scheduleAlarmCount
                }
            ];

            totalUnreadAlarms.value = alarmCategories.value.reduce(
                (total, category) => total + category.unreadCount,
                0
            );
        }
    } catch (error) {
        console.error('알림 타입 요청 실패: ', error);
    }
};

const showAlarms = async (categoryName) => {
    selectedCategory.value = categoryName;
    currentPage.value = 0;
    totalPages.value = 1;
    alarms.value = [];
    await fetchAlarmsByType();
};

const fetchAlarmsByType = async () => {
    if (loading.value || currentPage.value >= totalPages.value) {
        return;
    }

    loading.value = true;

    try {
        const query = {
            page: currentPage.value,
            size: 8,
        };

        const queryString = `?${new URLSearchParams(query).toString()}`;
        const response = await apiAlarmService.getParams(`${selectedCategory.value}`, queryString);

        if (response && response.result) {
            if (currentPage.value === 0 && response.result.content.length === 0) {
                
                alarms.value = [{
                    isNoAlarmsMessage: true,
                    message: '해당 카테고리에 알림이 없습니다.',
                }];
            } else {
                // Append new alarms to the list
                alarms.value.push(...response.result.content);
            }

            // Sort alarms by createdAt in descending order
            alarms.value.sort((a, b) => {
                // Keep the "no alarms" message at the top if it exists
                if (a.isNoAlarmsMessage) return -1;
                if (b.isNoAlarmsMessage) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            if (response.result.last) {
                totalPages.value = currentPage.value + 1; // Fix total pages
            }
            currentPage.value += 1;
        }

        // Handle no alarms case
        if (alarms.value.length === 0) {
            console.log(`${selectedCategory.value} 카테고리에 알람이 없습니다.`);
        }
    } catch (error) {
        console.error('알림 요청 실패: ', error);
    } finally {
        loading.value = false; // Reset loading state
    }
};


const handleScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;

    // 데이터가 더 이상 없으면 스크롤 이벤트 처리하지 않음
    if (currentPage.value >= totalPages.value) {
        console.log('모든 페이지를 로드했습니다.');
        return;
    }

    if (scrollTop + clientHeight >= scrollHeight - 10) {
        fetchAlarmsByType(); // 추가 데이터 요청
    }
};

const showAlarmModal = async (categoryName) => {
    showAlarmChart.value = true;
    await showAlarms(categoryName);
};

const toggleAlarmDropdown = async () => {
    showAlarmDropdown.value = !showAlarmDropdown.value;

    // Fetch alarm types when dropdown is opened
    if (showAlarmDropdown.value) {
        await fetchAlarmTypes();
    }
};

const handleClickOutside = (event) => {
    const alarmContainer = document.querySelector('.alarm-container');
    if (alarmContainer && !alarmContainer.contains(event.target)) {
        showAlarmDropdown.value = false;
    }
};

// 알림 클릭 핸들러
const showAlarmDetail = async (alarm) => {

    try {

        const updatedAlarms = alarms.value.map(a =>
            a.alarmId === alarm.alarmId
                ? { ...a, readStatus: true }
                : a
        );

        alarms.value = updatedAlarms;
        selectedAlarm.value = { ...alarm, readStatus: true };

        // Call API to mark the alarm as read
        const response = await apiAlarmService.put(
            '',
            `${alarm.alarmId}`
        );

        await fetchAlarmTypes();

    } catch (error) {
        alarms.value = alarms.value.map(a =>
            a.alarmId === alarm.alarmId
                ? { ...a, readStatus: false }
                : a
        );
        selectedAlarm.value = null;
        console.error('Failed to mark alarm as read:', error);
    }
};

// 로그인 남은 시간 로직
// 남은 시간을 MM:SS 형식으로 변환
const formattedTime = computed(() => {
    const minutes = Math.floor(userStore.remainingTime / (1000 * 60));
    const seconds = Math.floor((userStore.remainingTime % (1000 * 60)) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

// 남은 시간 연장 함수
const extendTime = () => {
    refreshTokenBtn();
};

const apiAuth = new ApiService('api/v1/auth');

const refreshTokenBtn = async () => {
    try {


        const response = await apiAuth.post(
            {
                refreshToken: userStore.refreshToken
            },
            'refresh'
        );

        userStore.refreshTheToken(response.result.newAccessToken);

    } catch (error) {
        alert('로그인 연장 실패하셨습니다.');
    }
}

const closeAlarmModal = () => {
    showAlarmChart.value = false; // 모달 닫기
};

// 역할 변환 함수
const roleMapping = {
    INTERN: '인턴',
    STAFF: '사원',
    ASSISTANT: '대리',
    MANAGER: '과장',
    SENIOR: '차장',
    EXECUTIVE: '부장',
    DIRECTOR: '임원',
    CEO: '대표이사',
};

const translatedRole = computed(() => roleMapping[userStore.role] || userStore.role);


// 헤더 컴포넌트가 마운트되었을 때 Pinia 상태를 계속 감시
watchEffect(() => {
    if (userStore.remainingTime <= 0) {
        router.push('/');
        logout();
    }
});

onMounted(() => {
    document.addEventListener('click', handleClickOutside);

    // Initial fetch of alarm types
    fetchAlarmTypes();

    // 1초마다 알람 타입 자동 업데이트
    const alarmTypesInterval = setInterval(fetchAlarmTypes, 30 * 1000);

    // 남은 시간이 0보다 크면 타이머 재시작
    if (userStore.remainingTime > 0) {
        userStore.startTimer();
    }

    // 컴포넌트 언마운트 시 인터벌 클리어
    return () => {
        clearInterval(alarmTypesInterval);
    };
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.nav-link {
    cursor: pointer;
}

.menu-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 65px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08);
}

.start {
    .nav-link {
        display: flex;
        align-items: center;
        color: #6360AB;
        text-decoration: none;
    }

    .router-link-exact-active {
        color: #6360AB;
        font-weight: bold;
    }
}

.start,
.end {
    display: flex;
    align-items: center;
}

.title {
    font-size: 20px;
    color: #6360AB;
    font-family: 'Pretendard';
    font-weight: 900;
}

.garadation {
    width: 90px;
    height: 65px;
    margin-right: 20px;
}

.name {
    font-size: 14px;
    color: #777777;
    padding-right: 20px;
}

.right-logo {
    display: flex;
    align-items: center;
    /* 세로 중심 정렬 */
    justify-content: center;
    /* 가로 중심 정렬 */
    gap: 20px;
    flex-direction: row;
}

.profile {
    padding: 20px 0px 20px 20px;
    border-left: 1px solid #e4e4e4;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #777777 !important;
}

.profile {
    cursor: pointer;
}

.profile-image {
    width: 30px;
    /* 이미지 크기 */
    height: 30px;
    /* 동일한 높이 */
    border-radius: 50%;
    /* 원형 이미지 */
    object-fit: cover;
    /* 이미지가 잘 맞도록 조정 */
    cursor: pointer;
    /* 클릭 가능 */
    border: 2px solid #e4e4e4;
    /* 테두리 추가 */
    transition: transform 0.2s ease;
    /* 마우스 오버 시 부드러운 확대 효과 */
}

.alarm {
    padding: 20px 0px 20px 20px;
    border-left: 1px solid #e4e4e4;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #777777 !important;
}

.organization-logo {
    padding: 20px 0px 20px 20px;
    border-left: 1px solid #e4e4e4;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #777777 !important;
}

.logout-logo {
    padding: 20px 20px 20px 20px;
    border-left: 1px solid #e4e4e4;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #777777 !important;
}

.modal-overlay {
    position: flex;
    height: 55rem;
    /* 지정된 높이 */
}

.modal {
    display: flex;
    flex-direction: row;
}

.modal>div:first-child {
    flex: 3;
}

.modal>div:nth-child(2) {
    flex: 7;
}

.body {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
}

.aside {
    transition: width 0.3s ease;
    width: 260px;
    padding: 1.5rem;

}

.aside.hidden {
    width: 0;
    overflow: hidden;
}

.tree-component {
    display: flex;
    flex-direction: column;
}

/* 트리 스타일 */
:deep(.tree-component .p-treenode-children) {
    background-color: #f3f3f3;
    border-radius: 8px;
    padding: 10px;
    /* margin: 5px 0; */
}

:deep(.tree-component .p-treenode-children .p-treenode-content) {
    background-color: transparent;
    color: #555;
}

/* 검색 필드 스타일 */
:deep(.tree-component .p-tree-filter-container) {
    display: flex;
    align-items: center;
    background-color: #F3F3F3;
    border-radius: 10px;
    padding: 0.5rem 1rem;
    width: 100%;
    height: 43px;
    margin-bottom: 1rem;
    /* 검색창과 트리 컴포넌트 사이의 여백 */
}

/* 검색 text 스타일 */
:deep(.tree-component .p-inputtext) {
    border: none;
    outline: none;
    background-color: transparent;
    font-size: 1rem;
    border-radius: 5px;
    color: #777777;
}

/* 돋보기 모양 스타일 */
:deep(.tree-component .p-tree-filter-icon) {
    color: #777777;
    font-size: 1.2rem;
    margin-left: -1.5rem;
}

.alarm-container {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.alarm-badge {
    position: absolute;
    top: 9px;
    right: -8px;
    background-color: red;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 10px;
}

.alarm-dropdown {
    position: absolute;
    top: 80%;
    left: -3rem;
    width: 10rem;
    max-height: 300px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow-y: auto;
    padding: 10px;
    padding-top: 3px;
    padding-bottom: 0;
}

.alarm-categories {
    display: flex;
    flex-direction: column;
}

.alarm-category {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
}

.category-info {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
}

.category-name {
    font-size: 14px;
    color: #333;
}

.category-unread-count {
    background-color: red;
    color: white;
    border-radius: 50%;
    padding: 2px 8px;
    font-size: 12px;
}

.left-time {
    margin-right: 16px;
}

.extend-button {
    padding: 5px 10px;
    font-size: 14px;
    background-color: #F1F1FD;
    color: #6360AB;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 8px;
    transition: background-color 0.3s ease;
}

.extend-button:hover {
    background-color: #4a48a2;
}

.main-content {
    display: grid;
    grid-template-columns: 200px 1fr;
    height: 100vh;
    overflow: hidden;
}

.alarm-item[data-v-628430e3] {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 15px;
    padding-bottom: 15px;
    padding-left: 15px;
    border-bottom: 1px solid #e4e4e4;
    background-color: #ffffff;
    width: 380px;
    height: 120px;
    box-sizing: border-box;
    transition: background-color 0.2s ease;
}

.alarm-item.read {
    /* background-color: #f4f4f4; */
    background-color: #fbfbfb;
    /* 회색 배경 */
}

.alarm-item:hover {
    background-color: #f5f5f5;
}


.alarm-item:active {
    transform: scale(1.01);
    /* 클릭 시 조금만 확대 */
}

.alarm-item:last-child {
    border-bottom: none;
}

.alarm-item h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #333;

    word-wrap: break-word;
    overflow-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;

    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.alarm-item p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #666;

    word-wrap: break-word;
    overflow-wrap: break-word;
}

.alarm-modal-container {
    display: flex;
    height: 100%;
    width: 100%;
}

.alarm-list-container {
    overflow-y: auto;
    overflow-x: hidden;
    height: 480px;
    width: 40%;
    height: 480px;
    border-left: 1px solid #e4e4e4;
    border-right: 1px solid #e4e4e4;
    border-left: 1px solid #e4e4e4;
    border-right: 1px solid #e4e4e4;
}

.no-alarms {
    /* text-align: center; */
    color: #777;
    padding: 20px;
    font-size: 16px;
    margin: auto;
}

.message {
    white-space: pre-line;
    margin-bottom: 0;
    /* 줄바꿈 간 여백 제거 */
    line-height: 1.5;
}

.created-at {
    color: #777;
    font-size: 10px;
    margin-top: 4px;
}

.tag {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 8px;
    width: 3.2rem;
    text-align: center;
    /* 텍스트 가로 정렬 */
    line-height: 1.5;
    /* 수직 정렬을 위한 줄 높이 */
    vertical-align: middle;
}

.no-alarms-message {
    text-align: center;
    color: #777;
    padding: 20px;
    font-size: 16px;
    cursor: default !important;
}

.no-alarms-content {
    width: 100%;
    text-align: center;
    color: #777;
    font-size: 16px;
}

:global(.p-dialog .p-dialog-header) {
    padding-bottom: 0.7rem !important;
}

:global(.p-dialog .p-dialog-content) {
    padding-bottom: 1rem !important;
}
</style>
