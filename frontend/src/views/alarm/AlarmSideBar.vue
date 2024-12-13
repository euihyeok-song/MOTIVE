<template>
    <div class="sidebar">
        <button
            v-for="menu in menus"
            :key="menu.id"
            @click="handleMenuClick(menu)"
            :class="['menu-button', { 'active': selectedMenu === menu.value }]"
        >
            {{ menu.name }}
        </button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            menus: [
                { id: 1, name: '계약 알림', value: 'CONTRACT' },
                { id: 2, name: '공지 알림', value: 'NOTICE' },
                { id: 3, name: '일정 알림', value: 'SCHEDULE' }
            ],
            selectedMenu: null
        };
    },
    methods: {
        handleMenuClick(menu) {
            this.selectedMenu = menu.value; // 클릭된 메뉴의 value를 selectedMenu에 저장
            this.$emit('menu-clicked', menu.value); // 전달할 value
        }
    }
};
</script>

<style scoped>
.sidebar {
    display: flex;
    flex-direction: column;
    gap: 30px; /* 버튼 간격 */
    padding-top: 0;
    padding-left: 0;
    padding-right: 1rem;
    width: 5rem;
}

.menu-button {
    background-color: white;
    color: black;
    border-color: gray;
    border-width: 1.5px;
    border-radius: 5px;
    cursor: pointer;
    text-align: center;
    font-size: 16px;
    padding-top: 1.7rem;
    padding-bottom: 1.7rem;
    padding-left: 1rem;
    padding-right: 1rem;
    transition: background-color 0.3s;

    writing-mode: vertical-rl;
}

.menu-button:hover {
    background-color: #F1F1FD;
}

.menu-button.active {
    background-color: #F1F1FD;
}

/* .menu-button:active {
    background-color: #3e3e99;
} */
</style>
