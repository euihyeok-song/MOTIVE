<template>
    <div class="search-container">
        <!-- 행 단위 렌더링 -->
        <template v-for="(fieldGroup, rowIndex) in fields" :key="rowIndex">
            <div class="form-row">
                <!-- 필드 그룹 렌더링 -->
                <template v-for="(field, index) in fieldGroup" :key="`${rowIndex}_${index}`">
                    <div class="form-group">
                        <div class="label">{{ field.label }}</div>

                        <!-- 필드 타입에 따른 조건부 렌더링 -->
                        <template v-if="field.type === 'input'">
                            <input type="text" v-model="formData[`${field.model}_${rowIndex}_${index}`]"
                                :placeholder="field.placeholder" class="form-input" />
                        </template>

                        <template v-else-if="field.type === 'select'">
                            <div class="select-container">
                                <select v-model="formData[`${field.model}_${rowIndex}_${index}`]" class="form-select">
                                    <option v-for="(option, idx) in field.options" :key="idx" :value="option">
                                        {{ option }}
                                    </option>
                                </select>
                                <span class="select-icon">
                                    <img src="@/assets/body/chevron-down.png" />
                                </span>
                            </div>
                        </template>

                        <template v-else-if="field.type === 'calendar'">
                            <div class="date-range">
                                <input type="date" v-model="formData[`${field.model}_start_${rowIndex}_${index}`]"
                                    class="form-date" />
                                <span class="date-separator">~</span>
                                <input type="date" v-model="formData[`${field.model}_end_${rowIndex}_${index}`]"
                                    class="form-date" />
                            </div>
                        </template>

                        <template v-if="field.type === 'inputWithButton'">
                            <div class="search-input">
                                <input type="text" disabled v-model="formData[`${field.model}_${rowIndex}_${index}`]"
                                    :placeholder="field.placeholder" class="form-input" />
                                <button class="search-button" @click="openModal(rowIndex, index)">
                                    <span class="search-icon pi pi-search"></span>
                                </button>
                            </div>
                        </template>

                        <template v-else-if="field.type === 'radio'">
                            <div class="radio-group">
                                <label v-for="(option, idx) in field.options" :key="idx" class="radio-label">
                                    <input type="radio" :name="`${field.model}_${rowIndex}_${index}`" :value="option"
                                        v-model="formData[`${field.model}_${rowIndex}_${index}`]" />
                                    {{ option }}
                                </label>
                            </div>
                        </template>

                        <template v-else-if="field.type === 'checkbox'">
                            <div class="checkbox-group">
                                <label v-for="(option, idx) in field.options" :key="idx" class="checkbox-label">
                                    <input type="checkbox" :value="option"
                                        v-model="formData[`${field.model}_${rowIndex}_${index}`]" />
                                    {{ option }}
                                </label>
                            </div>
                        </template>
                    </div>
                </template>
            </div>
            <!-- 행 아래 선 -->
            <div v-if="rowIndex < fields.length - 1" class="row-divider"></div>
        </template>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, defineExpose, onMounted } from 'vue';

const emit = defineEmits(['open-modal']);
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
    props.fields.forEach((fieldGroup, rowIndex) => {
        fieldGroup.forEach((field, index) => {
            if (field.type === 'inputWithButton') {
                // 키 생성 및 초기화
                formData.value[`${field.model}_${rowIndex}_${index}`] = field.default || '';
            } else {
                // 다른 필드도 초기화 (옵션)
                formData.value[`${field.model}_${rowIndex}_${index}`] = '';
            }
        });
    });
    console.log('Initialized formData:', formData.value); // formData 상태 출력
}

// 컴포넌트가 로드될 때 formData 초기화
onMounted(() => {
    initializeFormData();
});

// 모달 열기 메서드
function openModal(rowIndex, index) {
    const field = props.fields[rowIndex][index]; // field 데이터를 가져옵니다.
    const fieldKey = `${field.model}_${rowIndex}_${index}`; // 키 생성
    formData.value[fieldKey] = ''; // 필드 초기화
    emit('open-modal', fieldKey); // 부모 컴포넌트에 키 전달
}

// 부모 컴포넌트에서 호출하여 input 필드 값을 업데이트하는 메서드
function updateFieldValue(fieldIndex, value) {
    console.log(`Updating field ${fieldIndex} with value:`, value);
    if (formData.value[fieldIndex] !== undefined) {
        formData.value[fieldIndex] = value; // 필드 값 업데이트
        console.log('Updated formData:', formData.value);
    } else {
        console.error(`Field ${fieldIndex} not found in formData.`);
    }
}

// expose로 부모 컴포넌트에서 접근 가능하도록 설정
defineExpose({
    updateFieldValue
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
</style>