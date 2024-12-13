<template>
    <div class="card-wrapper">
        <Card>
            <template #content>
                <slot />
            </template>
        </Card>
    </div>
</template>

<script setup>
import Card from 'primevue/card';
</script>

<style scoped>
.card-wrapper {
    background: #FFFFFF;
    border-radius: 3px;
    overflow: hidden; /* 내용이 튀어나가지 않도록 설정 */
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25); /* 그림자 설정 */
}

.p-card {
    height: 250px;
    /* height: 100%; */
    overflow-y: 250px; /* 내부 스크롤 설정 */
}
</style>