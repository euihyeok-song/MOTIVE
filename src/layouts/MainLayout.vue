<template>
    <div class="header">
        <PageHeader />
    </div>
    <main class="main">
        <div class="aside" :class="{ hidden: isSidebarCollapsed }">
            <PageAside :nodes="asideMenu" />
        </div>
        <div class="body">
            <div class="body-content">
                <RouterView />
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { RouterView } from 'vue-router';
import { getMenuByRole } from '@/utils/constants'
import PageHeader from '@/components/PageHeader.vue';
import PagePath from '@/components/common/PagePath.vue';
import PageAside from '@/components/PageAside.vue';


const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const asideMenu = ref([]);

// 사용자 권한에 따른 메뉴 설정
const userStore = useUserStore();
onMounted(() => {
    asideMenu.value = getMenuByRole(userStore.auth); // 권한에 맞는 메뉴 설정
});
</script>

<style scoped>
.main {
    display: flex;
    flex-direction: row;
}

.body {
    flex: 1;
    padding: 1rem;
    width: calc(100% - 260px);
}

.path {
    margin-bottom: 1rem;
}

.aside {
    transition: width 0.3s ease;
    width: 260px;
}

.aside.hidden {
    width: 0;
    overflow: hidden;
}

.toggle-button {
    margin: 10px;
    padding: 5px 10px;
    font-size: 1rem;
    background-color: #6360AB;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}
</style>