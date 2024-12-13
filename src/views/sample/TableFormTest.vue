<template>
    <PageLayout>
        <div class="viewform">
            <ViewForm :data="data" />
        </div>
    </PageLayout>
</template>

<script setup>
import PageLayout from '@/components/common/layouts/PageLayout.vue';
import ViewForm from '@/components/common/ViewForm.vue';
import { ref } from 'vue';

// 더미 데이터 정의
const data = ref([
    {
        label: '지점이름',
        value: '지점 A',
        secondLabel: '지점주소',
        secondValue: '서울특별시 중구'
    },
    {
        label: '지점 전화번호',
        value: '010-1234-5678',
        secondLabel: '본사여부',
        secondValue: '본사'
    }
]);
</script>

<style scoped>
.viewform {
    display: flex;
    width: 100%;
}
</style>
