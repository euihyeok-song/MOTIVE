<template>
    <main class="dashboard">
        <div class="small-cards">
            <draggable v-model="cards" group="cards" @end="onDragEnd" :move="checkMove" :sort="true" itemKey="id">
                <template #item="{ element }">
                    <div :key="element.id" :class="element.className" :style="elementConfigs[element.id]?.style">
                        <Card>
                            <div class="card-content">
                                <div class="card-name">{{ element.title }}</div>
                                <component :is="element.component" v-bind="element.props" />
                            </div>
                        </Card>
                        <div class="resize-handle resize-bottom-right"
                            @mousedown="onResizeMouseDown($event, element.id, 'bottom-right')"></div>
                        <div class="resize-handle resize-top-left"
                            @mousedown="onResizeMouseDown($event, element.id, 'top-left')"></div>
                        <div class="resize-handle resize-top-right"
                            @mousedown="onResizeMouseDown($event, element.id, 'top-right')"></div>
                        <div class="resize-handle resize-bottom-left"
                            @mousedown="onResizeMouseDown($event, element.id, 'bottom-left')"></div>
                    </div>
                </template>
            </draggable>
        </div>
    </main>
</template>

<script setup>
import { ref, reactive, onMounted, markRaw } from 'vue';
import draggable from 'vuedraggable';
import BigCard from '@/components/common/GraghCard.vue';
import Card from '@/components/common/Card.vue';
import GaugeChart from '@/components/common/Chart/GaugeChart.vue';
import CustomerRank from '@/components/common/CustomerRank.vue';
import DashTimeLine from '@/components/common/DashTimeLine.vue';

const chartData = [
    {
        labels: Array.from({ length: 30 }, (_, i) => i + 1),
        datasets: [
            {
                label: '영업 실적',
                data: [
                    1400, 1500, 1600, 1800, 2000, 2300, 2400, 2600, 2500, 2400, 2200, 2100,
                    2000, 2200, 2300, 2200, 1800, 1700, 1600, 1900, 2100, 2200, 2100, 2000,
                    1900, 1800, 1700, 1600, 1800, 1500,
                ],
                borderColor: 'rgba(82, 77, 249, 0.8)',
                backgroundColor: 'rgba(82, 77, 249, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(66, 47, 138, 0.5)',
                pointBorderColor: '#FFFFFF',
                pointRadius: 0,
                borderWidth: 3,
            },
        ],
        gradientColors: ['rgba(82, 77, 249, 0.7)', 'rgba(82, 77, 249, 0.1)', 'rgba(255, 255, 255, 0)'],
    },
    {
        labels: Array.from({ length: 30 }, (_, i) => i + 1),
        datasets: [
            {
                label: '판매 내역',
                data: [
                    1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300,
                    2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500,
                    3600, 3700, 3800, 3900, 4000, 4100,
                ],
                borderColor: 'rgba(52, 152, 219, 0.8)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(41, 128, 185, 0.5)',
                pointBorderColor: '#FFFFFF',
                pointRadius: 0,
                borderWidth: 3,
            },
        ],
        gradientColors: ['rgba(52, 152, 219, 0.7)', 'rgba(52, 152, 219, 0.1)', 'rgba(255, 255, 255, 0)'],
    },
    {
        labels: Array.from({ length: 30 }, (_, i) => i + 1),
        datasets: [
            {
                label: '수당',
                data: [
                    50, 60, 55, 70, 80, 75, 85, 90, 95, 100, 110, 115, 120, 125, 130, 135,
                    140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 205,
                ],
                borderColor: 'rgba(46, 204, 113, 0.8)',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(39, 174, 96, 0.5)',
                pointBorderColor: '#FFFFFF',
                pointRadius: 0,
                borderWidth: 3,
            },
        ],
        gradientColors: ['rgba(46, 204, 113, 0.7)', 'rgba(46, 204, 113, 0.1)', 'rgba(255, 255, 255, 0)'],
    },
];

const gaugeChartValue = 40;
const resources = [
    { id: 'a', title: 'Resource A' },
    { id: 'b', title: 'Resource B' },
    { id: 'c', title: 'Resource C' },
];
const events = [
    { id: '1', resourceId: 'a', start: '2024-11-10T09:00:00', end: '2024-11-05T10:00:00', title: 'Meeting' },
    { id: '2', resourceId: 'b', start: '2024-11-10T12:00:00', end: '2024-11-05T14:00:00', title: 'Lunch Break' },
    { id: '3', resourceId: 'c', start: '2024-11-10T15:00:00', end: '2024-11-05T17:00:00', title: 'Work Session' },
];
const customers = [
    { name: '기우석' },
    { name: '김민석' },
    { name: '방동호' },
    { name: '송의혁' },
    { name: '유혜진' },
];

const cards = ref([
    {
        id: 'big-card',
        className: 'big-card card',
        title: 'Big Card',
        component: markRaw(BigCard),
        props: { chartData },
    },
    {
        id: 'sell-card',
        className: 'sell-card card',
        title: '영업실적',
        component: markRaw(GaugeChart),
        props: { value: gaugeChartValue },
    },
    {
        id: 'plan-card',
        className: 'plan-card card',
        title: '일정표',
        component: markRaw(DashTimeLine),
        props: { resources, events },
    },
    {
        id: 'customer-card',
        className: 'customer-card card',
        title: '나의 고객',
        component: markRaw(CustomerRank),
        props: { customers },
    },
]);

const elementConfigs = reactive({});

function onDragEnd(event) {
    // Handle drag end event
}

function checkMove(evt) {
    // Handle whether the item is allowed to be moved
    return true; // or add your custom logic
}

function onResizeMouseDown(event, elementId, direction) {
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const startConfig = elementConfigs[elementId] || { x: 0, y: 0, width: 300, height: 200, style: {} };
    elementConfigs[elementId] = startConfig;

    function onMouseMove(moveEvent) {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        switch (direction) {
            case 'bottom-right':
                elementConfigs[elementId] = {
                    ...startConfig,
                    width: Math.max(startConfig.width + deltaX, 100),
                    height: Math.max(startConfig.height + deltaY, 100),
                    style: {
                        ...startConfig.style,
                        width: `${Math.max(startConfig.width + deltaX, 100)}px`,
                        height: `${Math.max(startConfig.height + deltaY, 100)}px`,
                    },
                };
                break;
            case 'top-left':
                elementConfigs[elementId] = {
                    ...startConfig,
                    x: startConfig.x + deltaX,
                    y: startConfig.y + deltaY,
                    width: Math.max(startConfig.width - deltaX, 100),
                    height: Math.max(startConfig.height - deltaY, 100),
                    style: {
                        ...startConfig.style,
                        left: `${startConfig.x + deltaX}px`,
                        top: `${startConfig.y + deltaY}px`,
                        width: `${Math.max(startConfig.width - deltaX, 100)}px`,
                        height: `${Math.max(startConfig.height - deltaY, 100)}px`,
                    },
                };
                break;
            case 'top-right':
                elementConfigs[elementId] = {
                    ...startConfig,
                    y: startConfig.y + deltaY,
                    width: Math.max(startConfig.width + deltaX, 100),
                    height: Math.max(startConfig.height - deltaY, 100),
                    style: {
                        ...startConfig.style,
                        top: `${startConfig.y + deltaY}px`,
                        width: `${Math.max(startConfig.width + deltaX, 100)}px`,
                        height: `${Math.max(startConfig.height - deltaY, 100)}px`,
                    },
                };
                break;
            case 'bottom-left':
                elementConfigs[elementId] = {
                    ...startConfig,
                    x: startConfig.x + deltaX,
                    width: Math.max(startConfig.width - deltaX, 100),
                    height: Math.max(startConfig.height + deltaY, 100),
                    style: {
                        ...startConfig.style,
                        left: `${startConfig.x + deltaX}px`,
                        width: `${Math.max(startConfig.width - deltaX, 100)}px`,
                        height: `${Math.max(startConfig.height + deltaY, 100)}px`,
                    },
                };
                break;
        }
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}
</script>

<style scoped>
.dashboard {
    background-color: #f1f1fd;
    height: 100vh;
    overflow: hidden;
}

.small-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 15px;
    position: relative;
}

.card {
    padding-top: 15px;
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
}

.card-name {
    font-size: 25px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
}

.resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #12121250;
}

.resize-bottom-right {
    right: -5px;
    bottom: -5px;
    cursor: se-resize;
}

.resize-top-left {
    left: -5px;
    top: -5px;
    cursor: nw-resize;
}

.resize-top-right {
    right: -5px;
    top: -5px;
    cursor: ne-resize;
}

.resize-bottom-left {
    left: -5px;
    bottom: -5px;
    cursor: sw-resize;
}
</style>