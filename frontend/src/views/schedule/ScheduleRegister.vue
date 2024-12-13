<template>
    <div v-if="showEventModal" class="event-modal">
        <div class="modal-content">
            <h3>일정 등록</h3>
            <form @submit.prevent="addNewEvent">
                <div>
                    <label for="title">제목</label>
                    <input type="text" id="title" v-model="newEvent.title" required />
                </div>
                <div>
                    <label for="content">내용</label>
                    <textarea id="content" v-model="newEvent.content" rows="3" required></textarea>
                </div>
                <div>
                    <label for="date">날짜</label>
                    <input type="date" id="date" v-model="newEvent.date" required />
                    <label for="start-time">시작 시간</label>
                    <input type="time" id="start-time" v-model="newEvent.startTime" />
                    <label for="end-time">종료 시간</label>
                    <input type="time" id="end-time" v-model="newEvent.endTime" />
                </div>
                <div>
                    <label for="tag">태그</label>
                    <select id="tag" v-model="newEvent.tag" required>
                        <option value="">태그 선택</option>
                        <option v-for="tag in tags" :key="tag.name" :value="tag.name">
                            {{ tag.name }}
                        </option>
                    </select>
                </div>
                <button type="submit">등록</button>
                <button type="button" @click="closeEventModal">취소</button>
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
        showEventModal: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            newEvent: {
                title: '',
                content: '',
                date: '',
                tag: '',
                startTime: '',
                endTime: ''
            }
        };
    },
    methods: {
        addNewEvent() {
            this.$emit('register-event', this.newEvent);
            this.resetForm();
        },
        closeEventModal() {
            this.resetForm();
            this.$emit('close-modal');
        },
        resetForm() {
            this.newEvent = {
                title: '',
                content: '',
                date: '',
                tag: '',
                startTime: '',
                endTime: ''
            };
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
.modal-content form select,
.modal-content form textarea {
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
    background-color: #6360AB;
    color: white;
}

.modal-content button[type="button"] {
    background-color: #ddd;
    color: #333;
}
</style>
