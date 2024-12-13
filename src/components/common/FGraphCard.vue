<template>
    <div class="chart-container" v-for="(chartData, index) in chartDataList" :key="index">
        <!-- <canvas :ref="el => { if (el) chartCanvasRefs[index] = el; }"></canvas> -->
        <canvas :ref="setCanvasRef(index)"></canvas>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, defineProps, defineExpose, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps({
    chartDataList: {
        type: Array,
        required: true,
    },
    chartOptions: {
        type: Object,
        default: () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
        }),
    },
});

const chartInstances = []; // 차트 인스턴스 배열 (반응형 필요 없음)
const chartCanvasRefs = ref([]); // Canvas 참조 배열 (반응형 필요 없음)
let updateTimeout;

const setCanvasRef = (index) => (el) => {
    if (el) chartCanvasRefs.value[index] = el;
    else chartCanvasRefs.value.splice(index, 1); // 제거 시 참조에서 삭제
};

// 차트 생성 또는 업데이트
const updateCharts = async () => {
    // 기존 타이머 클리어
    clearTimeout(updateTimeout);
    // 디바운싱: 일정 시간 후에만 실행
    updateTimeout = setTimeout(async () => {
        await nextTick(); // DOM 업데이트 완료 후 실행

        props.chartDataList.forEach((chartData, index) => {
            // const canvas = chartCanvasRefs[index];
            const canvas = chartCanvasRefs.value[index];
            if (!canvas) {
                console.warn(`Canvas not found for chart index ${index}`);
                return;
            }

            if (chartInstances[index]) {
                const chart = chartInstances[index];
                chart.data = chartData;
                chart.update();
            } else {
                const ctx = canvas.getContext('2d');
                const chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: chartData,
                    options: {
                        ...props.chartOptions,
                    },
                });
                chartInstances[index] = chartInstance;
            }
        });

        // 필요 없는 차트 제거
        while (chartInstances.length > props.chartDataList.length) {
            const removedChart = chartInstances.pop();
            if (removedChart) removedChart.destroy();
        }
    }, 10); // 50ms 디바운스
};


const destroyCharts = () => {
    // chartInstances 배열의 모든 차트 인스턴스 제거
    if (chartInstances.length > 0) {
        chartInstances.forEach((chart) => chart.destroy());
        chartInstances.length = 0; // 배열을 비움
    }
    chartCanvasRefs.length = 0;
};

// watch로 데이터 변경 감지
watch(
    () => props.chartDataList,
    async (newData, oldData) => {
        // 데이터 변경 확인
        if (
            JSON.stringify(newData) !== JSON.stringify(oldData) &&
            newData &&
            newData.length > 0
        ) {
            destroyCharts();
            await nextTick(); // DOM 업데이트 완료 후 실행
            updateCharts();
        }
    },
    { immediate: true, deep: true }
);

defineExpose({
    destroyCharts,
});

onMounted(() => {
    // watch가 초기 호출을 처리하므로, onMounted에서는 초기화만 수행
    if (props.chartDataList && props.chartDataList.length > 0) {
        nextTick().then(() => updateCharts());
    }
});

onBeforeUnmount(() => {
    destroyCharts();
});
</script>

<style scoped>
.chart-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #FFFFFF;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25);
    border-radius: 3px;
    padding: 20px;
    overflow: hidden;
}
</style>
