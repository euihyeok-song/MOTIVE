<template>
    <div class="search-container">
        <template v-for="(fieldGroup, rowIndex) in fields" :key="rowIndex">
            <div class="form-row">
                <template v-for="(field, index) in fieldGroup" :key="`${rowIndex}_${index}`">
                    <div class="form-group">
                        <div class="label">{{ field.label }}</div>

                        <template v-if="field.type === 'input'">
                            <input
                                type="text"
                                v-model="formData[field.model]"
                                :placeholder="field.placeholder"
                                class="form-input"
                            />
                        </template>

                        <template v-else-if="field.type === 'select'">
                            <div class="select-container" v-if="field.showIcon">
                                <select
                                    v-model="formData[field.model]"
                                    class="form-select"
                                >
                                    <option v-for="(option, idx) in field.options" :key="idx" :value="option">
                                        {{ option }}
                                    </option>
                                </select>
                                <i class="pi pi-chevron-down select-icon"></i>
                            </div>
                            <select v-else v-model="formData[field.model]" class="form-select">
                                <option v-for="(option, idx) in field.options" :key="idx" :value="option">
                                    {{ option }}
                                </option>
                            </select>
                        </template>

                        <!-- 날짜 범위 -->
                        <template v-else-if="field.type === 'calendar'">
                            <div class="date-range">
                                <input
                                    type="date"
                                    v-model="formData[`${field.model}_start`]"
                                    @change="validateDateRange(field.model)"
                                    class="form-date"
                                />
                                <span class="date-separator">~</span>
                                <input
                                    type="date"
                                    v-model="formData[`${field.model}_end`]"
                                    @change="validateDateRange(field.model)"
                                    class="form-date"
                                />
                            </div>
                        </template>
                    </div>
                </template>
            </div>
            <div v-if="rowIndex < fields.length - 1" class="row-divider"></div>
        </template>
    </div>
</template>

<script setup>
import { ref, defineProps, defineExpose, onMounted } from 'vue';

const props = defineProps({
    fields: {
        type: Array,
        required: true,
    },
});

const formData = ref({}); // formData 정의

// formData 초기화
function initializeFormData() {
    formData.value = {};
    props.fields.forEach((fieldGroup) => {
        fieldGroup.forEach((field) => {
            if (field.type === 'calendar') {
                formData.value[`${field.model}_start`] = null;
                formData.value[`${field.model}_end`] = null;
            } else {
                formData.value[field.model] = '';
            }
        });
    });
    console.log('초기화된 formData:', formData.value);
}

// 날짜 범위 유효성 검사
function validateDateRange(model) {
    const startDate = formData.value[`${model}_start`];
    const endDate = formData.value[`${model}_end`];

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        alert('조회 날짜를 다시 입력해 주세요.');
        formData.value[`${model}_end`] = null;
    }
}

// 부모 컴포넌트에서 호출할 데이터 반환 메서드
function getFormData() {
    return formData.value;
}

defineExpose({
    getFormData,
    initializeFormData,
});

onMounted(() => {
    initializeFormData();
});
</script>


<style scoped>
*,
*::before,
*::after {
    box-sizing: border-box;
}

html,
body {
    overflow-x: hidden;
}

.search-container {
    cursor: pointer;
    max-width: 100%;
    overflow-x: hidden;
    border: 1.5px solid #EEEEEE;
    background-color: #F8F8F8;
    margin-bottom: 0.5rem;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    /* grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); */
    /* 항상 4열 고정 */
    gap: 1rem;
    margin: 10px 0;
    padding: 0 25px 0 0px;
}

.form-group {
    display: flex;
    align-items: center;
    width: 100%;
}

.form-group.placeholder {
    visibility: hidden; /* 빈 칸 숨김 */
}

.label {
    min-width: 6rem;
    font-size: 13px;
    color: #333;
    text-align: left;
    padding-right: 8px;
    padding-left: 1.5rem;
}

.form-input,
.form-select {
    height: 25px;
    border: 1px solid #ddd;
    padding: 0 8px;
    font-size: 13px;
    box-sizing: border-box;
}

.form-input {
    width: 10.5rem;
}

.date-range {
    width: 100px;
    display: flex;
    align-items: center;
    width: 100%;
}

.date-separator {
    margin: 0 5px;
}

.search-input {
    position: relative;
}

.search-button {
    position: absolute;
    right: 0;
    top: 0;
    width: 25px;
    height: 25px;
    background: #6360AB;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.search-icon {
    color: white;
    font-size: 14px;
}

.form-input:focus,
.form-select:focus {
    outline: none;
    
}

.select-container {
    position: relative;
    display: inline-block;
    
}

.form-select {/*태그 CSS */
    cursor: pointer; 
    width: 10.5rem;
    appearance: none;
    /* 기본 브라우저 화살표 제거 */
    padding-right: 2rem;
    /* 아이콘 공간 확보 */
    border: 1px solid #ddd;
    background-color: white;
    background-image: none;
    /* 기본 배경 제거 */
    height: 25px;
    font-size: 13px;
    appearance: none;
    background-repeat: no-repeat;
    background-position: right 8px center;
}

.select-icon {
    position: absolute;
    right: 0.5rem;
    top: 60%;
    cursor: pointer;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 14px;
    color: #888;
}

/* 반응형 디자인: 화면이 작을 때는 열 개수를 줄입니다 */
@media (max-width: 1024px) {
    .form-row {
        grid-template-columns: repeat(2, 1fr);
        /* 중간 화면에서는 2열 */
    }
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}

.radio-group {
    display: flex;
    gap: 10px;
}

.radio-label {
    display: flex;
    align-items: center;
    font-size: 13px;
    cursor: pointer;
}

.radio-label input[type='radio'] {
    margin-right: 5px;
}

/* 행 아래 선 스타일 */
.row-divider {
    width: 100%;
    height: 1px;
    background-color: #dddddd;
    /* 선 색상 */
    margin: 10px 0;
    /* 선 위아래 간격 */
}

.form-date {
    flex: 1;
    height: 25px;
    border: 1px solid #ddd;
    padding: 0 8px;
    font-size: 13px;
    box-sizing: border-box;
    border-radius: 0px;
    background-color: white;
    width: 8rem;
}

.date-range {
    display: flex;
    align-items: center;
    width: 100%;
}

.date-separator {
    margin: 0 8px;
    font-weight: bold;
    color: #555;
}
</style>