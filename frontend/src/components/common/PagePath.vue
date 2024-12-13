<template>
    <div class="path" v-if="breadcrumbs.length">
        <div class="breadcrumb" v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.key">
            <i v-if="index === 0" class="pi pi-home" style="margin-right: 0.5rem; color: #6360AB;"></i>
            <span class="name">{{ breadcrumb.label }}</span>
            <span v-if="index < breadcrumbs.length - 1" class="fork"> > </span>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getMenuByRole } from '@/utils/constants'

const route = useRoute();

const asideMenu = ref([]);

// 사용자 권한에 따른 메뉴 설정
const userStore = useUserStore();

const findMenuPath = (menu, path) => {
    for (const item of menu) {
        if (item.url === path) return [item];
        if (item.children) {
            const subPath = findMenuPath(item.children, path);
            if (subPath.length) return [item, ...subPath];
        }
    }
    return [];
};

const breadcrumbs = computed(() => {
    const path = route.path;
    return findMenuPath(asideMenu.value, path);
});

onMounted(() => {
    asideMenu.value = getMenuByRole(userStore.auth); // 권한에 맞는 메뉴 설정
});
</script>

<style scoped>
.path {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.breadcrumb {
    display: inline-flex;
    align-items: center;
}

.name {
    color: #AAAAAA;
    font-size: 16px;
}

.fork {
    color: #AAAAAA;
    font-size: 16px;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}
</style>