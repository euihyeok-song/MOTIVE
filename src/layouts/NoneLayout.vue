<template>
    <div class="none-layout">
        <div>
            <RouterView />
        </div>
    </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
</script>

<style scoped>
.auth-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f5f5f5;
}
</style>