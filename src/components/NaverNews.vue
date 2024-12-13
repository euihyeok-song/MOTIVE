<template>
    <div>
        <ul class="news-list">
            <li class="news-item" v-for="(item, index) in news" :key="index">
                <a :href="item.originallink" target="_blank" class="customer-name">{{ item.title }}</a>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { $api } from '@/services/api/api';

// 뉴스 저장 공간
const news = ref([]);

async function getNewsList() {
    try {
        const response = await $api.news.get('car', '');

        // API 응답 처리
        news.value = response.result; // 필요한 데이터가 result에 있다고 가정

    } catch (error) {
        console.error('뉴스 정보 가져오기 실패!', error);
    }
}

onMounted(() => {
    getNewsList();
})
</script>

<style scoped>
.news-list {
    list-style-type: none; /* 기본 불릿 제거 */
    padding: 0;            /* 기본 패딩 제거 */
    margin: 0;             /* 기본 마진 제거 */
}

.news-item {
    padding: 10px;         /* 뉴스 아이템의 내부 여백 */
    border-bottom: 1px solid #ddd; /* 뉴스 아이템 사이에 구분선 추가 */
}

.news-item:last-child {
    border-bottom: none;   /* 마지막 아이템은 구분선 제거 */
}

.customer-name {
    color: #007bff;             /* 링크 색상 (파란색 계열) */
    text-decoration: none;      /* 기본 밑줄 제거 */
    font-weight: bold;          /* 제목을 좀 더 강조 */
}

.customer-name:hover {
    text-decoration: underline; /* 마우스 올렸을 때 밑줄 */
    color: #0056b3;             /* 마우스 오버 시 색상 변경 */
}
</style>
