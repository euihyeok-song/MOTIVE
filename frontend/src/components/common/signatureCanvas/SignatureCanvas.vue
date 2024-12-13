<template>
    <div class="flex-row content-center">
        <canvas ref="canvas" style="border: 1px solid #ddd; width: 100%; height: 200px;"></canvas>
    </div>
    <div class="flex-row content-center">
        <CommonButton label="초기화" color="#F1F1FD" textColor="#6360AB" @click="clearSignature" />
        <div class="ml-s"></div>
        <CommonButton label="저장" color="#6360AB" textColor="#FFFFFF" @click="saveSignature" />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CommonButton from '@/components/common/Button/CommonButton.vue';

// 이벤트를 부모로 emit하기 위한 설정
const emit = defineEmits(["signatureSaved"]); // 부모 컴포넌트로 데이터 전달

const canvas = ref(null); // 캔버스 DOM 요소 참조
let context = null; // 캔버스의 2D 컨텍스트
let isDrawing = false; // 현재 그리기 상태

// 마우스 좌표를 계산하는 헬퍼 함수
const getMousePos = (event) => {
    const rect = canvas.value.getBoundingClientRect(); // 캔버스의 위치와 크기
    return {
        x: event.clientX - rect.left, // 마우스의 X좌표
        y: event.clientY - rect.top, // 마우스의 Y좌표
    };
};

// 그리기 시작
const startDrawing = (event) => {
    isDrawing = true;
    const { x, y } = getMousePos(event);
    context.beginPath();
    context.moveTo(x, y); // 시작점 이동
};

// 그리기 진행
const draw = (event) => {
    if (!isDrawing) return;
    const { x, y } = getMousePos(event);
    context.lineTo(x, y); // 현재 위치로 선 그리기
    context.stroke();
};

// 그리기 종료
const stopDrawing = () => {
    if (!isDrawing) return;
    isDrawing = false;
    context.closePath(); // 경로 닫기
};

// 서명 저장
const saveSignature = () => {
    if (canvas.value) {
        const dataURL = canvas.value.toDataURL("image/png"); // 이미지 데이터 URL 생성
        emit("signatureSaved", dataURL); // 부모 컴포넌트로 전달
    } else {
        console.error("캔버스가 초기화되지 않았습니다.");
    }
};

// 서명 초기화
const clearSignature = () => {
    context.clearRect(0, 0, canvas.value.width, canvas.value.height);
};

// 캔버스 초기화
onMounted(() => {
    context = canvas.value.getContext("2d");
    context.lineWidth = 2; // 선 굵기
    context.lineCap = "round"; // 선 끝 모양
    context.strokeStyle = "#000000"; // 선 색상

    // 캔버스 이벤트 리스너 추가
    canvas.value.addEventListener("mousedown", startDrawing);
    canvas.value.addEventListener("mousemove", draw);
    canvas.value.addEventListener("mouseup", stopDrawing);
    canvas.value.addEventListener("mouseout", stopDrawing); // 마우스가 캔버스를 벗어났을 때 종료
});
</script>

<style scoped>
canvas {
    border: 1px solid #ddd;
    display: block;
    margin: 10px 0;
    cursor: crosshair;
    /* 그리기용 커서 */
    width: 19.5rem !important;
    height: 10rem !important;
}
</style>
