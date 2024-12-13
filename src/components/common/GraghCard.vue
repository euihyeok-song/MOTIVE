<template>
    <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, defineProps } from 'vue';
import { Chart, registerables } from 'chart.js';

// Chart.js 모듈 등록
Chart.register(...registerables);

const chartCanvas = ref(null);
let chartInstance = null;

const props = defineProps({
    chartData: {
        type: Array,
        required: true,
    },
});

// 데이터 복사본 생성
const localChartData = ref(JSON.parse(JSON.stringify(props.chartData)));

// 차트 생성 함수
const createChart = () => {
    const ctx = chartCanvas.value.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar', // 기본 차트 타입은 bar
        data: {
            labels: localChartData.value[0].labels,
            datasets: localChartData.value.flatMap((data) => {
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, data.gradientColors[0]);
                gradient.addColorStop(0.3, data.gradientColors[1]);
                gradient.addColorStop(1, data.gradientColors[2]);
                data.datasets[0].backgroundColor = gradient;
                return data.datasets;
            }),
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#6B7280', // 범례 텍스트 색상
                        font: {
                            family: 'Poppins',
                            size: 14,
                        },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false, // X축 격자선 숨김
                    },
                    ticks: {
                        color: '#6B7280', // X축 라벨 색상
                        font: {
                            family: 'Poppins',
                            size: 12,
                        },
                    },
                },
                y: {
                    position: 'left',
                    grid: {
                        color: 'rgba(82, 77, 249, 0.2)', // 수당 축 격자선 색상
                    },
                    ticks: {
                        color: 'rgba(82, 77, 249, 1)', // 수당 축 색상
                        font: {
                            family: 'Poppins',
                            size: 12,
                        },
                    },
                },
                y1: {
                    position: 'right',
                    grid: {
                        drawOnChartArea: false, // 실적 축의 격자선 숨김
                    },
                    ticks: {
                        color: 'rgba(52, 152, 219, 1)', // 실적 축 색상
                        font: {
                            family: 'Poppins',
                            size: 12,
                        },
                    },
                },
                y2: {
                    position: 'right',
                    grid: {
                        drawOnChartArea: false, // 매출액 축의 격자선 숨김
                    },
                    ticks: {
                        color: 'rgba(46, 204, 113, 1)', // 매출액 축 색상
                        font: {
                            family: 'Poppins',
                            size: 12,
                        },
                    },
                },
            },
        },
    });
};


// 차트 업데이트 함수
const updateChart = () => {
    if (chartInstance) {
        chartInstance.data.labels = localChartData.value[0].labels;
        chartInstance.data.datasets = localChartData.value.flatMap((data) => {
            const ctx = chartCanvas.value.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, data.gradientColors[0]);
            gradient.addColorStop(0.3, data.gradientColors[1]);
            gradient.addColorStop(1, data.gradientColors[2]);
            data.datasets[0].backgroundColor = gradient;
            return data.datasets;
        });
        chartInstance.update();
    }
};

// `props.chartData` 변경 감지
watch(
    () => props.chartData,
    (newData) => {
        localChartData.value = JSON.parse(JSON.stringify(newData));
        updateChart();
    },
    { deep: true }
);

onMounted(() => {
    createChart();
});

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.destroy();
    }
});
</script>

<style scoped>
.chart-container {
    position: relative;
    width: 100%;
    height: 400px;
    background: #FFFFFF;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25);
    border-radius: 3px;
    padding: 20px;
    overflow: hidden;
}
</style>