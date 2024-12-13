<template>
    <Button 
        :label="label" 
        :icon="icon" 
        :style="{ backgroundColor: color, color: textColor, borderColor: borderColor || color }" 
        class="mt-4" 
    />
</template>

<script setup>
import Button from 'primevue/button';
import { defineProps } from 'vue';

const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        default: '',
    },
    color: {
        type: String,
        default: '#6360AB', // 기본 버튼 배경색
    },
    textColor: {
        type: String,
        default: '#ffffff', // 기본 버튼 텍스트 색상
    },
    borderColor: {
        type: String,
        default: null, // 기본적으로 배경색과 동일
    },
});
</script>

<style scoped>
.p-button {
    border-radius: 6px;
    font-size: 0.8rem;
    border-width: 1px; /* 원하는 border 두께 */
}
</style>
