<!-- DashTimeLine.vue -->
<template>
    <div class="timeline-card">
        <FullCalendar :options="calendarOptions" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

// Props로 전달된 데이터 받기
const props = defineProps({
    resources: {
        type: Array,
        required: true
    },
    events: {
        type: Array,
        required: true
    }
});

const calendarOptions = ref({
    plugins: [resourceTimelinePlugin],
    initialView: 'resourceTimelineDay',
    headerToolbar: {
        left: '',
        // center: 'title',
        center: '',
        // right: 'resourceTimelineDay'
        right: ''
    },
    resources: props.resources,
    events: props.events,
    height: '100%',
    contentHeight: 'auto',
    slotDuration: '00:30:00',
    resourceAreaWidth: '150px',
    scrollTime: '08:00:00'
});

// props가 변경될 때마다 calendarOptions 업데이트
watch(
    () => [props.resources, props.events],
    ([newResources, newEvents]) => {
        calendarOptions.value.resources = newResources;
        calendarOptions.value.events = newEvents;
    }
);
</script>

<style scoped>
.timeline-card {
    height: 100%;
    overflow-y: auto;
}

/* FullCalendar 헤더 및 버튼 크기 조정 */
.timeline-card .fc .fc-toolbar-title {
    font-size: 14px;
}

.timeline-card .fc .fc-button {
    font-size: 10px;
    padding: 2px 6px;
    height: auto;
    line-height: 1.2;
}

/* 타임라인 이벤트와 텍스트 크기 조정 */
.timeline-card .fc-event-title,
.timeline-card .fc-col-header-cell-cushion,
.timeline-card .fc-toolbar-title {
    font-size: 10px;
}

/* 타임라인 내부 셀 크기 최소화 */
.timeline-card .fc-timeline-event-harness {
    padding: 2px;
}

/* 헤더 높이와 간격 줄이기 */
.timeline-card .fc .fc-header-toolbar {
    margin-bottom: 4px;
    padding: 4px;
}

/* FullCalendar 내부 스크롤 제한 */
.timeline-card .fc-scrollgrid {
    max-height: 100%;
}
</style>
