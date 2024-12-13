<template>
    <PageLayout>
        <SearchForm :fields="formFields" @open-modal="handleOpenModal" ref="searchFormRef" />

        <!-- 모달 -->
        <Modal v-model="showModal" header="매장코드 검색" width="30rem" height="none" @confirm="confirmSelection" @cancel="resetModalState">
            <div class="flex-row content-center mb-m">
                <label class="mr-m">매장명: </label>
                <!-- Enter 키 입력 시 searchStore 함수 호출 -->
                <InputText type="text" v-model="searchQuery" @keyup.enter="searchStore" />
                <button class="search-button" @click="searchStore">
                    <span class="search-icon pi pi-search"></span>
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th v-for="header in headers" :key="header">{{ header }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in tableData" :key="index" @click="selectStore(row, index)"
                        :class="{ selected: selectedRow === index }">
                        <td>{{ row.매장코드 }}</td>
                        <td>{{ row.매장명 }}</td>
                    </tr>
                </tbody>
            </table>

            <template #footer>
                <CommonButton label="확인" @click="confirmSelection" />
                <CommonButton label="취소" color="#ffffff" textColor="#6360AB" borderColor="#6360AB"
                    @click="resetModalState" />
            </template>
        </Modal>
    </PageLayout>
</template>

<script setup>
import { ref } from 'vue';
import PageLayout from '@/components/common/layouts/PageLayout.vue';
import Modal from '@/components/common/Modal.vue';
import SearchForm from '@/components/common/SearchForm.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';


// 모달 테이블 값
const headers = ['매장코드', '매장명'];
const tableData = [
    { 매장코드: 'A', '매장명': 50 },
    { 매장코드: 'B', '매장명': 75 },
];

// SearchForm.vue 검색조건 값
const formFields = [
    [
        {
            label: '사원 검색',
            type: 'inputWithButton',
            model: 'employeeSearch',
            showDivider: false
        },
        {
            label: '매장 검색',
            type: 'inputWithButton',
            model: 'storeSearch',
            showDivider: false
        },
        {
            label: '계약서명',
            type: 'input',
            model: 'contractName',
            showDivider: true
        },
        {
            label: '계약일',
            type: 'calendar', // 쌍으로 처리
            model: 'contractDate', // 시작과 종료를 모두 포함
            showIcon: true,
            manualInput: false,
        }
    ],
    [
        {
            label: '고객명',
            type: 'input',
            model: 'customerName',
            showDivider: true
        },
        {
            label: '고객 구분',
            type: 'radio',
            model: 'customerType',
            options: ['개인', '법인'],
            showDivider: false
        },
        {
            label: '구매 조건',
            type: 'radio',
            model: 'purchaseCondition',
            options: ['일시불', '할부', '리스'],
            showDivider: false
        },
        {
            label: '고객 상호',
            type: 'input',
            model: 'customerBusinessName',
            showDivider: false
        }
    ],
    [

        {
            label: '제품명',
            type: 'input',
            model: 'productName',
            showDivider: false
        },
        {
            type: 'select',
            label: '승인여부',
            model: 'approvalStatus',
            options: ['대기', '승인', '취소']
        }
    ]
];

// 모달에서 쓰이는 값들
const showModal = ref(false);
const selectedRow = ref(null);
const selectedCode = ref('');
const searchFormRef = ref(null);
const selectedFieldIndex = ref(null);
const searchQuery = ref('');

function handleOpenModal(fieldIndex) {
    console.log(`Opening modal for field: ${fieldIndex}`);
    selectedFieldIndex.value = fieldIndex; // 필드 인덱스 저장
    showModal.value = true;
}

function selectStore(row, index) {
    selectedRow.value = index;
    selectedCode.value = row.매장코드;
}

function confirmSelection() {
    if (selectedFieldIndex.value !== null) {
        searchFormRef.value.updateFieldValue(selectedFieldIndex.value, selectedCode.value);
    }
    closeModal();
}

function resetModalState() {
    closeModal();
}

function closeModal() {
    showModal.value = false;
    selectedRow.value = null;
    selectedCode.value = '';
}

// 여기에 검색어 조회 API 로직 작성
function searchStore() {
    // 입력된 값 출력
    console.log('검색어:', searchQuery.value);

    // 추가적인 검색 로직을 여기에 추가할 수 있습니다.
    if (searchQuery.value) {
        alert(`검색어: ${searchQuery.value}`);
    }
    // 검색어 초기화
    searchQuery.value = '';
}

</script>

<style scoped>
/* 테이블 스타일 */
table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px 16px;
    text-align: center;
}

th {
    background-color: #F8F8F8;
    color: #777;
}

/* 선택된 행 스타일 */
tr.selected {
    background-color: #e0e0e0;
    /* 선택된 행의 배경색 */
}

tr:hover {
    cursor: pointer;
    background-color: #f0f0f0;
}

.p-inputtext {
    height: 27px !important;
    border-radius: 0px;
}

.search-button {
    right: 0;
    top: 0;
    width: 27px;
    height: 27px;
    background: #6360AB !important;
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
</style>