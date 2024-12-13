<template>
    <div v-if="showScheduleDetails" class="event-detail-modal">
        <div class="modal-content">
            <h3>{{ selectedSchedule.title }}</h3>
            <p><strong>내용:</strong> {{ selectedSchedule.content }}</p>
            <p><strong>시작일시:</strong> {{ selectedSchedule.startDate }}</p>
            <p><strong>종료일시:</strong> {{ selectedSchedule.endDate }}</p>
            <p>
                <strong>태그:</strong>
                <span class="tag-badge" :style="{ backgroundColor: selectedSchedule.tagColor }">
                    {{ selectedSchedule.tag }}
                </span>
            </p>
            <div class="modal-footer">
                <button @click="$emit('edit-schedule', selectedSchedule)">수정</button>
                <button @click="$emit('close-details')">닫기</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        selectedSchedule: {
            type: Object,
            required: true
        },
        showScheduleDetails: {
            type: Boolean,
            required: true
        }
    }
};
</script>

<style scoped>
.event-detail-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    width: 400px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1001;
}

.modal-content h3 {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
}

.modal-content p {
    margin: 12px 0;
}

.modal-content strong {
    display: inline-block;
    width: 80px;
    color: #666;
}

.tag-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    background: #ddd;
    color: #333;
}
</style>
