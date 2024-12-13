<template>
    <div class="loading-view">
        <ProgressSpinner />
        <Typography color="darkgray" class="mt-m">데이터를 가져오는 중입니다...</Typography>
    </div>
</template>

<script setup>
import ProgressSpinner from 'primevue/progressspinner';
import Typography from '../Typography.vue';
</script>

<style scoped>
.loading-view {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 64px auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
</style>