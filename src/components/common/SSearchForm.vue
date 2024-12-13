<template>
    <div class="search-container">
        <template v-for="(fieldGroup, rowIndex) in fields" :key="rowIndex">
            <div class="form-row">
                <template v-for="(field, index) in fieldGroup" :key="`${rowIndex}_${index}`">
                    <div class="form-group">
                        <div class="label">{{ field.label }}</div>

                        <!-- Select -->
                        <template v-if="field.type === 'select'">
                            <div class="select-container">
                                <select v-model="formData[field.model]" class="form-select">
                                    <option value="" disabled selected>선택</option>
                                    <option v-for="(option, idx) in field.options" :key="idx" :value="option">
                                        {{ option }}
                                    </option>
                                </select>
                                <span class="select-icon">
                                    <img src="@/assets/body/chevron-down.png" />
                                </span>
                            </div>
                        </template>

                        <!-- Calendar -->
                        <template v-else-if="field.type === 'calendar'">
                            <div class="date-range">
                                <input type="date" v-model="formData[`${field.model}_start`]" class="form-date" />
                                <span class="date-separator">~</span>
                                <input type="date" v-model="formData[`${field.model}_end`]" class="form-date" />
                            </div>
                        </template>

                        <!-- Button -->
                        <template v-else-if="field.type === 'button'">
                            <div class="button-group">
                                <SCommonButton :label="field.label" @click="onButtonClick(field)"
                                    calss="common-button" />
                            </div>
                        </template>

                    </div>
                </template>
            </div>
        </template>
    </div>
</template>




<script setup>
import { ref, defineProps, defineEmits, defineExpose, onMounted } from 'vue';

const emit = defineEmits(['open-modal', 'search', 'button-click']);
const props = defineProps({
    fields: {
        type: Array,
        required: true,
        default: () => []
    }
});

// formData를 ref 객체로 정의
const formData = ref({});

// 컴포넌트 초기화 시 모든 필드 초기화
function initializeFormData() {
    formData.value = {};
    props.fields.forEach((fieldGroup) => {
        fieldGroup.forEach((field) => {
            formData.value[field.model] = field.default || ''; // 각 필드에 대해 기본값 설정
        });
    });
    console.log('초기화된 formData:', formData.value);
}

function onButtonClick(field) {
    console.log(`버튼 클릭: ${field.model}`);
    emit('button-click', { model: field.model });
}

// 부모 컴포넌트에서 호출하여 input 필드 값을 업데이트하는 메서드
function updateFieldValue(fieldModel, value) {
    console.log(`Updating field ${fieldModel} with value:`, value);
    if (formData.value[fieldModel] !== undefined) {
        formData.value[fieldModel] = value; // 필드 값 업데이트
        console.log('Updated formData:', formData.value);
    } else {
        console.error(`Field ${fieldModel} not found in formData.`);
    }
}


// expose로 부모 컴포넌트에서 접근 가능하도록 설정
defineExpose({
    formData,
    updateFieldValue,
    initializeFormData,
});

// 컴포넌트가 로드될 때 formData 초기화
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
    max-width: 100%;
    overflow-x: hidden;
    border: 1.5px solid #EEEEEE;
    background-color: #F8F8F8;
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
    visibility: hidden;
    /* 빈 칸 숨김 */
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
    border-radius: 0px;
}

.form-input {
    width: 10.5rem;
}

.date-range {
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

.form-select {
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
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    /* 아이콘 클릭 방지 */
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
    width: 10px;
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

.button-group {
    display: flex;
    justify-content: flex-start;
    /* 버튼을 왼쪽 정렬 */
    align-items: center;
    /* 버튼과 텍스트 정렬 */
    margin: 10px 0;
    /* 버튼 그룹 위아래 여백 */
}

.common-button {
    background-color: #6360AB;
    /* 버튼 배경색 */
    color: #fff;
    /* 버튼 텍스트 색상 */
    border: none;
    /* 테두리 제거 */
    padding: 8px 16px;
    /* 버튼 내부 여백 */
    font-size: 14px;
    /* 버튼 텍스트 크기 */
    cursor: pointer;
    /* 클릭 가능한 마우스 커서 */
    border-radius: 4px;
    /* 모서리를 둥글게 */
    text-align: center;
    display: inline-block;
    /* 인라인 블록 레이아웃 */
    box-sizing: border-box;
    /* 전체 크기 계산에 패딩과 테두리 포함 */
}

.common-button:hover {
    background-color: #4e4c96;
    /* 호버 시 버튼 배경색 변경 */
}

.select-container {
    position: relative;
    display: inline-block;
}

</style>