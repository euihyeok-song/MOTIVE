<template>
    <div class="typography" :style="{ color: textColor, fontSize: `${textSize}px`, fontWeight }">
        <slot></slot>
    </div>
</template>

<script setup>
import { defineProps, ref, watchEffect } from 'vue';

const props = defineProps({
    color: {
        type: String,
        required: false,
        default: 'black',
    },
    type: {
        type: String, // title1, title2, title3, body1, body2, caption
        required: false,
        default: 'body1',
    },
});

const textColor = ref('#000000');
const textSize = ref(16);
const fontWeight = ref(600);

// 텍스트 색상 설정
watchEffect(() => {
    if (props.color === 'black') {
        textColor.value = '#000000';
    } else if (props.color === 'white') {
        textColor.value = '#ffffff';
    } else if (props.color === 'gray') {
        textColor.value = '#AAAAAA';
    } else if (props.color === 'darkgray') {
        textColor.value = '#777777';
    } else if (props.color === 'main') {
        textColor.value = '#6360AB';
    } else if (props.color === 'sub') {
        textColor.value = '#F1F1FD';
    }
});

// 텍스트 사이즈, 굵기 설정
watchEffect(() => {
    if (props.type === 'caption') {
        textSize.value = 12;
        fontWeight.value = 400;
    } else if (props.type === 'body2') {
        textSize.value = 14;
        fontWeight.value = 400;
    } else if (props.type === 'body1') {
        textSize.value = 16;
        fontWeight.value = 400;
    } else if (props.type === 'title3') {
        textSize.value = 20;
        fontWeight.value = 500;
    } else if (props.type === 'title2') {
        textSize.value = 28;
        fontWeight.value = 800;
    } else if (props.type === 'title1') {
        textSize.value = 36;
        fontWeight.value = 800;
    }
});
</script>

<style scoped>
.typography {
    white-space: pre-wrap;
}
</style>