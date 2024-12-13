<template>
    <div class="gauge-chart" :data-value="value">
        <canvas ref="gaugeCanvas"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import { Chart } from 'chart.js/auto';

const props = defineProps({
    value: {
        type: Number,
        required: true
    }
});

const gaugeCanvas = ref(null);

onMounted(() => {
    const ctx = gaugeCanvas.value.getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [
                {
                    data: [props.value, 100 - props.value],
                    backgroundColor: ['#4A469F', '#E6E6E6'],
                    borderWidth: 0,
                    cutout: '80%',
                    rotation: 270,
                    circumference: 180,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: { enabled: false },
            },
        },
    });
});
</script>

<style scoped>
.gauge-chart {
    position: relative;
    width: 250px;
    height: 150px;
}

.gauge-chart::after {
    content: attr(data-value);
    position: absolute;
    left: 50%;
    top: 70%;
    transform: translate(-50%, -50%);
    font-weight: 700;
    font-size: 35px;
    line-height: 36px;
    color: #404040;
    text-align: center;
}
</style>
