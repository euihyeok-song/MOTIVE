<template>
    <div class="calendar-container">
        <div ref="calendarEl"></div>

        <div v-if="showSmallCalendar" class="small-calendar-dropdown" :style="smallCalendarPosition">
            <input type="date" v-model="selectedDate" @change="goToSelectedDate" class="small-calendar-input" />
        </div>

        <div v-if="showTagDropdown" class="tag-dropdown" :style="tagDropdownPosition">
            <ul>
                <li v-for="tag in tags" :key="tag.name" class="tag-item">
                    <span class="color-dot" :style="{ backgroundColor: tag.color }"></span>
                    <span>{{ tag.name }}</span>
                </li>
            </ul>
        </div>
        <div v-if="showEventModal" class="event-modal">
            <div class="modal-content">
                <h3>일정 등록</h3>
                <form @submit.prevent="addNewEvent">
                    <div>
                        <label for="title">제목</label>
                        <input type="text" id="title" v-model="newEvent.title" required />
                    </div>
                    <div class="form-group">
                        <label for="content">내용</label>
                        <textarea id="content" v-model="newEvent.content" rows="3" required></textarea>
                    </div>
                    <div>
                        <label for="startDate">시작 날짜</label>
                        <input type="date" id="startDate" v-model="newEvent.startDate" required />
                        <label for="startTime">시작 시간</label>
                        <input type="time" id="startTime" v-model="newEvent.startTime" required />
                    </div>
                    <div>
                        <label for="endDate">종료 날짜</label>
                        <input type="date" id="endDate" v-model="newEvent.endDate" required />
                        <label for="endTime">종료 시간</label>
                        <input type="time" id="endTime" v-model="newEvent.endTime" required />
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
                    <button type="button" @click="closeEventModal" class="submit-close-button">취소</button>
                </form>
            </div>
        </div>
        <div v-if="showScheduleDetails" class="event-detail-modal">
            <div class="modal-content">
                <h3 v-if="!isEditing">{{ selectedSchedule.title }}</h3>
                <h3 v-else>일정 수정</h3>

                <!-- 조회 모드 -->
                <div v-if="!isEditing">
                    <p><strong>제목:</strong> {{ selectedSchedule.title }}</p>
                    <p><strong>내용:</strong> {{ selectedSchedule.content }}</p>
                    <p><strong>시작일시:</strong> {{ selectedSchedule.startDate }}</p>
                    <p><strong>종료일시:</strong> {{ selectedSchedule.endDate }}</p>
                    <p>
                        <strong>태그:</strong>
                        <span class="tag-badge" :style="{ backgroundColor: selectedSchedule.tagColor }">
                            {{ selectedSchedule.tag }}
                        </span>
                    </p>
                </div>

                <!-- 수정 모드 -->
                <form v-else @submit.prevent="editSchedule" class="edit-form">
                    <div class="form-group">
                        <label for="edit-title">제목</label>
                        <input type="text" id="edit-title" v-model="editedSchedule.title" required />
                    </div>

                    <div class="form-group">
                        <label for="edit-content">내용</label>
                        <textarea id="edit-content" v-model="editedSchedule.content" rows="3" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="edit-start-date">시작일시</label>
                        <input type="datetime-local" id="edit-start-date" v-model="editedSchedule.startDate" required />
                    </div>

                    <div class="form-group">
                        <label for="edit-end-date">종료일시</label>
                        <input type="datetime-local" id="edit-end-date" v-model="editedSchedule.endDate" required />
                    </div>

                    <div class="form-group">
                        <label for="edit-tag">태그</label>
                        <select id="edit-tag" v-model="editedSchedule.tag" required>
                            <option v-for="tag in tags" :key="tag.name" :value="tag.name">
                                {{ tag.name }}
                            </option>
                        </select>
                    </div>
                </form>

                <div class="modal-footer">
                    <template v-if="!isEditing">
                        <button @click="startEditing" class="edit-button">수정</button>
                        <button @click="confirmDeleteSchedule" class="cancel-button">삭제</button>
                        <button @click="closeScheduleDetails" class="close-button">닫기</button>
                    </template>
                    <template v-else>
                        <button @click="editSchedule" class="save-button">저장</button>
                        <button @click="cancelEditing" class="cancel-button">취소</button>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import tagSvg from '@/assets/icon/scheduleIcons/tag.svg';
import calendarSvg from '@/assets/icon/scheduleIcons/calendar.svg';
import { $api } from '@/services/api/api';

export default {
    data() {
        return {
            calendar: null,
            currentViewDate: null,
            tags: [
                { name: 'MEETING', color: '#AEC6CF' },
                { name: 'TRAINING', color: '#FFDAB9' },
                { name: 'VACATION', color: '#B0E57C' },
                { name: 'SESSION', color: '#FFB7C5' }
            ],
            selectedTags: [],
            showTagDropdown: false,
            showEventModal: false,
            showSmallCalendar: false,
            showScheduleDetails: false,
            isEditing: false,
            selectedSchedule: {
                id: '',
                title: '',
                content: '',
                startDate: '',
                endDate: '',
                tag: ''
            },
            selectedDate: '',
            newEvent: {
                title: '',
                date: '',
                tag: ''
            },
            editedSchedule: {
                id: null,
                title: '',
                content: '',
                startDate: '',
                endDate: '',
                tag: ''
            },
            schedules: []
        };
    },
    async mounted() {
        this.currentViewDate = new Date();
        // 컴포넌트 마운트 시 일정 데이터 조회
        this.initCalendar();

        const currentYear = this.currentViewDate.getFullYear();
        const currentMonth = String(this.currentViewDate.getMonth() + 1).padStart(2, '0');

        await this.fetchSchedules(currentYear, currentMonth);
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeDestroy() {
        // 컴포넌트가 제거되기 전에 이벤트 리스너 제거
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        async fetchSchedules(year, month) {
            try {
                let response;

                if (year && month) {
                    // Fetch schedules for the specified year and month
                    response = await $api.schedule.get(`${year}/${month}`);
                } else {
                    // Fetch all schedules (default behavior)
                    response = await $api.schedule.get('', '');
                }

                this.schedules = Array.isArray(response.data) ? response.data : response.result;

                if (this.calendar) {
                    this.updateCalendarEvents();
                }
            } catch (error) {
                console.error('Failed to fetch schedules:', error);
            }
        },
        async startEditing() {
            try {

                this.isEditing = true;
                const response = await $api.schedule.get(`${this.selectedSchedule.id}`);
                const scheduleData = response.data || response.result;

                if (scheduleData) {
                    this.editedSchedule = {
                        id: scheduleData.scheduleId || scheduleData.id,
                        title: scheduleData.name || scheduleData.title,
                        content: scheduleData.content,
                        startDate: this.formatDateToCustomFormat(scheduleData.startAt),
                        endDate: this.formatDateToCustomFormat(scheduleData.endAt),
                        tag: scheduleData.tag
                    };
                }
            } catch (error) {
                console.error('일정 조회 실패:', error);
                alert('일정을 불러오는데 실패했습니다.');
            }
        },

        formatDateToCustomFormat(date) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },

        // 일정 수정 저장
        async editSchedule() {
            try {

                function dateToCustomFormat(date) {
                    const d = new Date(date);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
                    const day = String(d.getDate()).padStart(2, '0');
                    const hours = String(d.getHours()).padStart(2, '0');
                    const minutes = String(d.getMinutes()).padStart(2, '0');
                    const seconds = String(d.getSeconds()).padStart(2, '0');
                    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                };

                // startAt과 endAt을 원하는 형식으로 포맷
                const startAtFormatted = dateToCustomFormat(this.editedSchedule.startDate);
                const endAtFormatted = dateToCustomFormat(this.editedSchedule.endDate);

                // API 호출 시 URL에서 scheduleId를 올바르게 사용
                const response = await $api.schedule.put(
                    {
                        name: this.editedSchedule.title,
                        content: this.editedSchedule.content,
                        tag: this.editedSchedule.tag,
                        startAt: startAtFormatted,
                        endAt: endAtFormatted
                    },
                    this.editedSchedule.id
                );

                if (response.httpStatus === 200 && response.result === true) {
                    alert('일정이 성공적으로 수정되었습니다.');
                    await this.fetchSchedules(); // 캘린더 이벤트 새로고침
                    this.closeEditMode();
                } else {
                    // 실패 시 msg를 출력
                    throw new Error(response.msg || '일정 수정에 실패했습니다.');
                }
            } catch (error) {
                console.error('일정 수정 실패:', error);
                alert(error.message || '일정 수정에 실패했습니다. 다시 시도해주세요.');
            }
        },

        // Format datetime for input fields
        formatDateTimeForInput(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
        },

        // Close edit mode and reset form
        closeEditMode() {
            this.isEditing = false;
            this.editedSchedule = {
                id: null,
                name: '',
                content: '',
                startDate: '',
                endDate: '',
                tag: ''
            };
            this.showScheduleDetails = false;
        },

        // Cancel editing
        cancelEditing() {
            this.closeEditMode();
        },

        // Fetch schedule details for viewing
        async fetchScheduleDetails(scheduleId) {
            try {
                const response = await $api.schedule.get(`${scheduleId}`);
                const scheduleData = response.data || response.result;

                if (scheduleData) {
                    this.selectedSchedule = {
                        id: scheduleData.scheduleId || scheduleData.id,
                        title: scheduleData.name,
                        content: scheduleData.content,
                        startDate: this.formatDateTime(scheduleData.startAt),
                        endDate: this.formatDateTime(scheduleData.endAt),
                        tag: scheduleData.tag,
                        tagColor: this.tags.find(t => t.name === scheduleData.tag)?.color
                    };
                    this.showScheduleDetails = true;
                }
            } catch (error) {
                console.error('일정 상세 조회 실패:', error);
                alert('일정을 불러오는데 실패했습니다.');
            }
        },

        // Format datetime for display
        formatDateTime(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                weekday: 'short'
            });
        },
        closeScheduleDetails() {
            this.showScheduleDetails = false;
            this.selectedSchedule = {};
        },
        // 캘린더 이벤트 업데이트
        updateCalendarEvents() {
            // 기존 이벤트 모두 제거
            this.calendar.removeAllEvents();

            // API로 받아온 일정 데이터를 캘린더 이벤트로 변환하여 추가
            this.schedules.forEach(schedule => {

                // Ensure we have valid date strings
                const startDate = this.formatDateString(schedule.startAt);
                const endDate = this.formatEndDateString(schedule.endAt);

                // Find matching tag or use default
                const tag = this.tags.find(t => t.name === schedule.tag) || this.tags[5];

                // Create the event object
                const eventObject = {
                    id: schedule.scheduleId || schedule.id,
                    title: schedule.name || schedule.title,
                    content: schedule.content,
                    start: startDate,
                    end: endDate || startDate,
                    color: tag.color,
                    textColor: '#333',
                    tag: schedule.tag,
                    allDay: true
                };

                this.calendar.addEvent(eventObject);
            });
        },
        formatDateString(dateStr) {
            if (!dateStr) return '';

            const date = dateStr.split(' ')[0];

            return dateStr;
        },

        formatEndDateString(dateStr) {
            if (!dateStr) return '';

            // 날짜와 시간 분리
            const [datePart, timePart] = dateStr.split(' ');

            // Date 객체로 변환
            const date = new Date(dateStr);  // 시간까지 포함된 문자열을 그대로 사용

            // 날짜에 1일 추가
            date.setDate(date.getDate() + 1);

            // 날짜와 시간을 다시 형식화
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            // 결과를 YYYY-MM-DD HH:mm:ss 형식으로 반환
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },

        async confirmDeleteSchedule() {
            const confirmDelete = confirm('정말로 이 일정을 삭제하시겠습니까?');
            if (confirmDelete) {
                await this.deleteSchedule(this.selectedSchedule.id);
            }
        },
        async deleteSchedule(scheduleId) {
            try {
                const response = await $api.schedule.delete(`${scheduleId}`);
                if (response.httpStatus === 200 && response.result === true) {
                    alert('일정이 성공적으로 삭제되었습니다.');

                    // 캘린더에서 이벤트 제거
                    const event = this.calendar.getEventById(scheduleId);
                    if (event) {
                        event.remove();
                    }

                    // 현재 표시 중인 월 일정 새로고침
                    const currentDate = this.calendar.getDate();
                    await this.fetchSchedules(
                        currentDate.getFullYear(),
                        String(currentDate.getMonth() + 1).padStart(2, '0')
                    );

                    this.closeScheduleDetails();
                } else {
                    throw new Error(response.message || '일정 삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('일정 삭제 오류:', error);
                alert(error.message || '일정 삭제 중 오류가 발생했습니다.');
            }
        },
        formatDate(date) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');

            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },
        formatEndDate(date) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate() - 1).padStart(2, '0');

            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },
        initCalendar() {
            const calendarEl = this.$refs.calendarEl;

            this.calendar = new Calendar(calendarEl, {
                plugins: [dayGridPlugin, interactionPlugin],
                initialView: 'dayGridMonth',
                initialDate: this.currentViewDate,
                locale: 'ko',
                headerToolbar: {
                    left: ' today prev,next title',
                    center: '',
                    right: 'customCalendarButton customTagsButton customAddEventButton',
                },
                buttonText: {
                    today: '오늘'
                },
                datesSet: async (info) => {
                    // 현재 보이는 달력의 첫 날짜
                    const firstVisible = info.start;
                    // 마지막 보이는 날짜
                    const lastVisible = info.end;

                    // 현재 달력이 표시하는 실제 월을 구하기
                    const targetDate = this.calendar.getDate();
                    const year = targetDate.getFullYear();
                    const month = String(targetDate.getMonth() + 1).padStart(2, '0');

                    await this.fetchSchedules(year, month);
                },
                fixedWeekCount: false, // 주 수를 고정하지 않음
                showNonCurrentDates: true,
                views: {
                    dayGridMonth: {
                        dayCellContent: (info) => {
                            const number = document.createElement('a');
                            number.classList.add('fc-daygrid-day-number');
                            number.innerHTML = info.dayNumberText.replace('일', '').replace('日', '');
                            return { html: number.outerHTML };
                        },
                    },
                },
                customButtons: {
                    customCalendarButton: {
                        text: '',
                        click: (e) => {
                            e.stopPropagation(); // 이벤트 전파 중지
                            this.toggleSmallCalendar();
                            // Tag 드롭다운이 열려있다면 닫기
                            if (this.showTagDropdown) {
                                this.showTagDropdown = false;
                            }
                        },
                    },
                    customTagsButton: {
                        text: '',
                        click: (e) => {
                            e.stopPropagation(); // 이벤트 전파 중지
                            this.toggleTagDropdown();
                            // Calendar 드롭다운이 열려있다면 닫기
                            if (this.showSmallCalendar) {
                                this.showSmallCalendar = false;
                            }
                        },
                    },
                    customAddEventButton: {
                        text: '일정 등록',
                        click: () => {
                            this.openEventModal();
                        },
                    },
                },
                events: this.schedules.map(schedule => ({
                    id: schedule.scheduleId,
                    title: schedule.title,
                    start: schedule.startAt,
                    end: schedule.endAt,
                    color: this.tags.find(t => t.name === schedule.tag)?.color || '#FFFFFF',
                    allDay: true,
                })),
                editable: true,
                eventDrop: async (info) => {
                    try {

                        const response = await $api.schedule.put(
                            {
                                name: info.event._def.title,
                                content: info.event.extendedProps.content,
                                tag: info.event.extendedProps.tag,
                                startAt: this.formatDate(info.event._instance.range.start),
                                endAt: this.formatEndDate(info.event._instance.range.end)
                            },
                            info.event.id
                        );

                        if (response.httpStatus === 200 && response.result === true) {
                            // 수정 성공 시 사용자에게 알림
                            alert('일정이 성공적으로 업데이트되었습니다.');
                        } else {
                            // 에러 발생 시 일정을 원래 위치로 되돌리기
                            throw new Error('일정 업데이트 실패');
                        }
                    } catch (error) {
                        console.error('일정 업데이트 오류:', error);
                        alert('일정 업데이트에 실패했습니다.');
                        // 원래 위치로 이벤트 되돌리기
                        info.revert();
                    }
                },
                eventResize: async (info) => {
                    try {

                        const response = await $api.schedule.put(
                            {
                                name: info.event._def.title,
                                content: info.event.extendedProps.content,
                                tag: info.event.extendedProps.tag,
                                startAt: this.formatDate(info.event._instance.range.start),
                                endAt: this.formatEndDate(info.event._instance.range.end)
                            },
                            info.event.id
                        );

                        if (response.httpStatus === 200 && response.result === true) {
                            // 수정 성공 시 사용자에게 알림
                            alert('일정이 성공적으로 업데이트되었습니다.');
                        } else {
                            // 에러 발생 시 일정을 원래 위치로 되돌리기
                            throw new Error('일정 업데이트 실패');
                        }
                    } catch (error) {
                        console.error('일정 업데이트 오류:', error);
                        alert('일정 업데이트에 실패했습니다.');
                        // 원래 위치로 이벤트 되돌리기
                        info.revert();
                    }
                },
                eventClick: async (info) => {
                    const scheduleId = info.event.id;
                    if (scheduleId) {
                        await this.fetchScheduleDetails(scheduleId);
                    } else {
                        console.error('일정 ID가 없습니다.');
                    }
                }
            });

            this.calendar.render();
            this.updateCalendarEvents();

            const customCalendarButton = calendarEl.querySelector('.fc-customCalendarButton-button');
            if (customCalendarButton) {
                const svgContainer = document.createElement('img');
                svgContainer.src = calendarSvg;
                svgContainer.style.width = '1.2rem';
                svgContainer.style.height = '1.2rem';
                customCalendarButton.innerHTML = '';
                customCalendarButton.appendChild(svgContainer);
            }

            const customTagsButton = calendarEl.querySelector('.fc-customTagsButton-button');
            if (customTagsButton) {
                const svgContainer = document.createElement('img');
                svgContainer.src = tagSvg;
                svgContainer.style.width = '1.2rem';
                svgContainer.style.height = '1.2rem';
                customTagsButton.innerHTML = '';
                customTagsButton.appendChild(svgContainer);
            }
        },
        closeScheduleDetails() {
            this.showScheduleDetails = false; // 상세 정보 닫기
            this.selectedSchedule = null;
        },
        handleClickOutside(event) {
            // small calendar 드롭다운 처리
            const calendarDropdown = this.$el.querySelector('.small-calendar-dropdown');
            const calendarButton = this.$el.querySelector('.fc-customCalendarButton-button');
            if (this.showSmallCalendar &&
                calendarDropdown &&
                !calendarDropdown.contains(event.target) &&
                !calendarButton.contains(event.target)) {
                this.showSmallCalendar = false;
            }

            // tag 드롭다운 처리
            const tagDropdown = this.$el.querySelector('.tag-dropdown');
            const tagButton = this.$el.querySelector('.fc-customTagsButton-button');
            if (this.showTagDropdown &&
                tagDropdown &&
                !tagDropdown.contains(event.target) &&
                !tagButton.contains(event.target)) {
                this.showTagDropdown = false;
            }
        },
        toggleSmallCalendar() {
            if (!this.showSmallCalendar) {
                const calendarButton = this.$el.querySelector('.fc-customCalendarButton-button');
                if (calendarButton) {
                    const rect = calendarButton.getBoundingClientRect();
                    const containerRect = this.$el.getBoundingClientRect();
                    const dropdownWidth = 150; // 달력 드롭다운의 예상 너비

                    this.smallCalendarPosition = {
                        top: `${rect.bottom - containerRect.top}px`,
                        left: `${rect.left - containerRect.left + (rect.width / 2) - (dropdownWidth / 2)}px`
                    };
                }
            }
            this.showSmallCalendar = !this.showSmallCalendar;
        },
        goToSelectedDate() {
            if (this.selectedDate) {
                const selected = new Date(this.selectedDate);
                const year = selected.getFullYear();
                const month = String(selected.getMonth() + 1).padStart(2, '0');

                this.calendar.gotoDate(this.selectedDate);
                this.fetchSchedules(year, month);
                this.showSmallCalendar = false;
            }
        },
        toggleTagDropdown() {
            if (!this.showTagDropdown) {
                const tagButton = this.$el.querySelector('.fc-customTagsButton-button');
                if (tagButton) {
                    const rect = tagButton.getBoundingClientRect();
                    const containerRect = this.$el.getBoundingClientRect();
                    const dropdownWidth = 150; // tag 드롭다운의 너비 (CSS에서 설정한 값)

                    this.tagDropdownPosition = {
                        top: `${rect.bottom - containerRect.top}px`,
                        left: `${rect.left - containerRect.left + (rect.width / 2) - (dropdownWidth / 2)}px`
                    };
                }
            }
            this.showTagDropdown = !this.showTagDropdown;
        },
        selectTag(tag) {
            if (!this.selectedTags.includes(tag)) {
                this.selectedTags.push(tag);
            } else {
                this.selectedTags = this.selectedTags.filter((t) => t !== tag);
            }
        },
        openEventModal() {
            this.showEventModal = true;
        },
        closeEventModal() {
            this.showEventModal = false;
            this.newEvent = { title: '', date: '' };
        },
        formatDateTimeForDB(date, time) {
            return `${date} ${time}:00`;
        },

        // 일정 등록
        async addNewEvent() {
            try {
                // 필수 필드 검증
                if (!this.newEvent.title || !this.newEvent.content || !this.newEvent.tag ||
                    !this.newEvent.startDate || !this.newEvent.startTime ||
                    !this.newEvent.endDate || !this.newEvent.endTime) {
                    alert('모든 필수 항목을 입력해주세요.');
                    return;
                }

                // 시작일시와 종료일시 생성
                const startAt = this.formatDateTimeForDB(this.newEvent.startDate, this.newEvent.startTime);
                const endAt = this.formatDateTimeForDB(this.newEvent.endDate, this.newEvent.endTime);

                // 종료일시가 시작일시보다 이후인지 검증
                if (new Date(endAt) <= new Date(startAt)) {
                    alert('종료일시는 시작일시보다 이후여야 합니다.');
                    return;
                }

                // API 요청 데이터 구성
                const scheduleData = {
                    name: this.newEvent.title,
                    content: this.newEvent.content,
                    tag: this.newEvent.tag,
                    startAt: startAt,
                    endAt: endAt
                };

                // API 호출
                const response = await $api.schedule.post(scheduleData);

                if (response.httpStatus === 200 && response.result === true) {
                    // 성공적으로 저장된 경우
                    const savedSchedule = response.data || response.result;

                    // 캘린더에 이벤트 추가
                    const selectedTag = this.tags.find(tag => tag.name === this.newEvent.tag);
                    const newEvent = {
                        id: savedSchedule.scheduleId || savedSchedule.id,
                        title: scheduleData.name,
                        content: scheduleData.content,
                        start: scheduleData.startAt,
                        end: scheduleData.endAt,
                        color: selectedTag.color,
                        textColor: '#333',
                        tag: scheduleData.tag,
                        allDay: true
                    };

                    this.calendar.addEvent(newEvent);
                    alert('일정이 성공적으로 등록되었습니다.');

                    // 현재 표시 중인 월의 일정 새로고침
                    const currentDate = this.calendar.getDate();
                    await this.fetchSchedules(
                        currentDate.getFullYear(),
                        String(currentDate.getMonth() + 1).padStart(2, '0')
                    );

                    this.closeEventModal();
                } else {
                    throw new Error(response.message || '일정 등록에 실패했습니다.');
                }
            } catch (error) {
                console.error('일정 등록 오류:', error);
                alert(error.message || '일정 등록 중 오류가 발생했습니다.');
            }
        },
    },
};
</script>

<style scoped>
.calendar-container {
    max-width: 1330px;
    margin: 0 auto;
    padding-top: 0rem;
    padding-right: 3rem;
    position: relative;
}

.fc {
    font-family: 'Noto Sans KR', sans-serif;
    color: #333;
}

:deep(.fc .fc-toolbar.fc-header-toolbar) {
    margin-bottom: 1rem;
}

:deep(.fc-direction-ltr .fc-toolbar > * > :not(:first-child)) {
    margin-left: 0;
}

:deep(.fc-toolbar-title) {
    display: inline-block;
    font-size: 1.4rem;
    margin-top: 0.3rem;
}

:deep(.fc-button-primary) {
    background-color: white;
    border: none;
    padding: 0rem;
    font-size: 1.2rem;
}

:deep(.fc-button) {
    border: none !important;
    color: #333 !important;
    box-shadow: none !important;
    cursor: pointer;
    transition: none !important;
    font-size: 1.2rem;
}

:deep(.fc-today-button) {
    border: 1px solid #333 !important;
    padding: 0.2rem 0.6rem !important;
    border-radius: 4px;
    margin-top: 0.2rem;

}

:deep(.fc-button:hover) {
    background-color: inherit !important;
    color: inherit !important;
}

:deep(.fc-button.fc-button-active) {
    border: none !important;
}

:deep(.fc .fc-button-primary:disabled) {
    background-color: white;
    border-color: #333;
}

:deep(.fc-button.fc-button-disabled) {
    cursor: not-allowed;
}

:deep(.fc-daygrid-day-frame) {
    height: 8rem;
    box-sizing: border-box;
}

.small-calendar-dropdown {
    position: absolute;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 10px;
    margin-top: 5px;
}

.small-calendar-input {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 5px;
}

:deep(.fc-toolbar-chunk) {
    display: flex;
    gap: 1rem;
}

:deep(.fc-customTagsButton-button),
:deep(.fc-customCalendarButton-button) {
    background-color: white !important;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem !important;
    height: 3rem !important;
    padding: 0.6rem !important;
}

:deep(.fc-customCalendarButton-button img),
:deep(.fc-customTagsButton-button img) {
    width: 1.8rem !important;
    height: 1.8rem !important;
    filter: brightness(0) !important;
    transition: filter 0.2s ease;
}

:deep(.fc-customTagsButton-button:hover img),
:deep(.fc-customCalendarButton-button:hover img) {
    filter: brightness(0.4) !important;
}

:deep(.fc-customAddEventButton-button) {
    background-color: white !important;
    color: #333 !important;
    font-size: 0.875rem !important;
    border-radius: 20px !important;
    padding: 0.5rem 1rem !important;
    margin-left: 0.5rem;
    border: 1px solid #dadce0 !important;
    box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3),
        0 1px 3px 1px rgba(60, 64, 67, 0.15) !important;
    display: flex !important;
    align-items: center;
    gap: 4px;
    font-weight: 500;
    height: 36px;
    margin-top: 0.32rem;
}

:deep(.fc-customAddEventButton-button)::before {
    content: '+';
    font-size: 1.25rem;
    margin-right: 4px;
    font-weight: 400;
}

:deep(.fc-customAddEventButton-button:hover) {
    background-color: #f8f9fa !important;
    box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3),
        0 2px 6px 2px rgba(60, 64, 67, 0.15) !important;
}

:deep(.fc-customAddEventButton-button:active) {
    background-color: #f1f3f4 !important;
    box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3) !important;
}

.tag-dropdown {
    position: absolute;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    width: 150px;
    padding: 10px;
    margin-top: 5px;
}

.tag-dropdown ul {
    list-style: none;
    margin: 0;
    padding: 0;
}

.tag-dropdown .tag-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
}

.color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-content select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 15px;
}

.tag-dropdown .tag-item input {
    margin-right: 8px;
}

.tag-dropdown .tag-item label {
    flex-grow: 1;
}

.tag-dropdown .tag-item:hover {
    background-color: #f0f0f0;
}

.tag-dropdown .tag-item input {
    margin-right: 8px;
}

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

.modal-content form input {
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

.event-detail-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    width: 400px;
}

.event-detail-modal .modal-content {
    padding: 20px;
}

.event-detail-modal h3 {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.event-detail-modal p {
    margin: 12px 0;
    line-height: 1.6;
}

.event-detail-modal strong {
    display: inline-block;
    width: 80px;
    color: #666;
    font-weight: 500;
}

.tag-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
    color: #333;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-footer {
    margin-top: 20px;
    text-align: right;
    padding-top: 15px;
    border-top: 1px solid #eee;
}

.close-button {
    background-color: white !important;
    color: #6360AB !important;
    border: 0.293px solid #6360AB !important;
    padding: 8px 16px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 14px !important;
    transition: background-color 0.2s !important;
}

.close-button:hover {
    background-color: white;
}


.edit-form {
    margin-top: 1rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.form-group textarea {
    resize: vertical;
    min-height: 80px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
}

.edit-button {
    background-color: #6360AB;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-right: 0.5rem;
}

.submit-close-button {
    background-color: #F1F1FD !important;
    color: #6360AB !important;
    border: none !important;
    padding: 8px 16px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 14px !important;
}

.save-button {
    background-color: #6360AB;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.cancel-button {
    background-color: #F1F1FD;
    color: #6360AB;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.edit-button:hover,
.save-button:hover {
    background-color: #6360AB;
}

.cancel-button:hover {
    background-color: #F1F1FD;
}
</style>