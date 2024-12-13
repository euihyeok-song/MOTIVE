<template>
    <PageLayout>
        <!-- ViewTable 컴포넌트 -->
        <ViewTable :headers="headers" :tableData="tableData" />

        <!-- 모달을 띄우는 버튼 -->
        <CommonButton label="상세보기" @click="showModal = true" class="mt-4" />

        <!-- 모달 컴포넌트 -->
        <Modal v-model="showModal" header="상세 정보" width="40rem">
            <p>여기에 모달 내용을 추가하세요. 원하는 정보를 표시할 수 있습니다.</p>

        </Modal>
    </PageLayout>
</template>

<script setup>
import { ref } from 'vue';
import ViewTable from '@/components/common/ViewTable.vue';
import Modal from '@/components/common/Modal.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import PageLayout from '@/components/common/layouts/PageLayout.vue';

const showModal = ref(false); // 모달의 열림/닫힘 상태 관리

const headers = ['구분', '면적(㎡)', '층수', '구조', '비고', '야호', '하이', '헤'];
const tableData = [
    { 구분: 'A', '면적(㎡)': 50, 층수: 1, 구조: '철근콘크리트', 비고: '테스트', 야호: '헤헤', 하이: '헤헤', 헤: '헤헤' },
    { 구분: 'B', '면적(㎡)': 75, 층수: 2, 구조: '목조', 비고: '테스트2', 야호: '헬로', 하이: '헤헤', 헤: '헤헤' },
];
</script>
