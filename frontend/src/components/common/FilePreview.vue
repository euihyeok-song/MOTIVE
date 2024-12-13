<template>
    <div class="image-preview">
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
});
</script>

<style scoped>
.image-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    width: 200px;
    border: 1px solid #ddd;
    overflow: hidden;
    border-radius: 8px;
}

.preview-image {
    max-width: 100%;
    max-height: 100%;
}
</style>
