<template>
    <div v-if="isEditing" class="event-modal">
        <div class="modal-content">
            <h3>일정 수정</h3>
            <form @submit.prevent="updateSchedule">
                <div>
                    <label for="title">제목</label>
                    <input type="text" id="title" v-model="editedSchedule.title" required />
                </div>
                <div>
                    <label for="content">내용</label>
                    <textarea id="content" v-model="editedSchedule.content" rows="3" required></textarea>
                </div>
                <div>
                    <label for="start-date">시작일시</label>
                    <input type="datetime-local" id="start-date" v-model="editedSchedule.startDate" required />
                </div>
                <div>
                    <label for="end-date">종료일시</label>
                    <input type="datetime-local" id="end-date" v-model="editedSchedule.endDate" required />
                </div>
                <div>
                    <label for="tag">태그</label>
                    <select id="tag" v-model="editedSchedule.tag" required>
                        <option value="">태그 선택</option>
                        <option v-for="tag in tags" :key="tag.name" :value="tag.name">
                            {{ tag.name }}
                        </option>
                    </select>
                </div>
                <button type="submit">저장</button>
                <button type="button" @click="cancelEditing">취소</button>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        tags: {
            type: Array,
            required: true
        },
        isEditing: {
            type: Boolean,
            required: true
        },
        editedSchedule: {
            type: Object,
            required: true
        }
    },
    methods: {
        updateSchedule() {
            this.$emit('update-schedule', this.editedSchedule);
        },
        cancelEditing() {
            this.$emit('cancel-editing');
        }
    }
};
</script>

<style scoped>
.event-modal {
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
    margin-bottom: 20px;
    text-align: center;
}

.modal-content form div {
    margin-bottom: 15px;
}

.modal-content form label {
    display: block;
    margin-bottom: 5px;
}

.modal-content form input,
.modal-content form select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.modal-content button {
    padding: 8px 12px;
    margin-right: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.modal-content button[type="submit"] {
    background-color: #4CAF50;
    color: white;
}

.modal-content button[type="button"] {
    background-color: #f44336;
    color: white;
}
</style>
