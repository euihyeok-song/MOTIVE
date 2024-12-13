<template>
    <div class="image-preview" :style="{ borderWidth: borderSize + 'px' }">
        <img :src="imageUrl" alt="Image Preview" v-if="imageUrl" class="preview-image" />
        <p v-else>Loading...</p>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

// Props 정의
defineProps({
    imageUrl: {
        type: String,
        required: true,
    },
    borderSize: {
        type: Number,
        default: 1, // 기본 borderSize는 1px
    },
});
</script>

<style scoped>

.image-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0 0 300px; /* 고정된 크기로 설정 (필요 시 조정 가능) */
    height: 200px; /* 고정된 높이 */
    /* border: 1px solid #ddd; */
    /* border-radius: 8px; */
    overflow: hidden;
    background-color: #f9f9f9; /* 이미지가 없을 때 배경색 */
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 컨테이너를 꽉 채우면서 비율 유지 */
    border: 1px solid #ddd;
    border-radius: 8px;
}

</style>
