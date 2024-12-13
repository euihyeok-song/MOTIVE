<template>
    <PageLayout>
        <!-- SearchForm -->
        <div class="search-wrapper">

            <div class="top">
                <div class="path">
                    <PagePath />
                </div>
                <div class="flex-row">
                    <div class="ml-l">
                        <CommonButton label="초기화" icon="pi pi-refresh" color="#F1F1FD" textColor="#6360AB"
                            @click="refresh" />
                    </div>
                    <div class="search-button-wrapper ml-s">
                        <CommonButton label="조회" @click="select" />
                    </div>
                </div>
            </div>
            <div class="search-fields">
                <CSearchForm :fields="formFields" @open-modal="handleOpenModal" ref="searchFormRef" :key="formKey"
                    @keyup.enter="select" />
            </div>
        </div>

        <div class="flex-row content-between mt-xxxxl">
            <div class="title-pos">
                <img src="@/assets/body/rectangle.png" class="mr-xs">전체목록
            </div>
            <div class="flex-row items-center mb-s">
                <div>
                    <CommonButton label="등록" icon="pi pi-plus" @click="openRegisterModal" />
                </div>
                <div class="ml-xs">
                    <CommonButton label="인쇄" icon="pi pi-print" @click="printSelectedRows" />
                </div>
                <div class="ml-xs">
                    <CommonButton label="엑셀다운" @click="exportCSV($event)" icon="pi pi-download" />
                </div>
            </div>
        </div>

        <!-- ViewTable -->
        <div class="component-wrapper">
            <ViewTable :headers="tableHeaders" :data="tableData" :loading="loading" :totalRecords="totalRecords"
                :rows="rows" :rowsPerPageOptions="[10, 15, 20, 50]" :selectable="true" :selection="selectedRows"
                @update:selection="updateSelectedRows" buttonLabel="조회" buttonHeader="상세조회" :buttonAction="handleView"
                buttonField="code" @page="onPage" @sort="onSort" @filter="onFilter">
                <template #body-status="{ data }">
                    <div class="custom-tag-wrapper">
                        <div :class="['custom-tag', getCustomTagClass(data.status)]">
                            {{ getStatusLabel(data.status) }}
                        </div>
                    </div>
                </template>
            </ViewTable>
        </div>

        <!-- 모달 -->
        <Modal v-model="showRegisterModal" width="40rem" height="none" header="고객 등록">
            <div class="modal-content">
                <div class="form-row" v-for="(item, index) in registerInfo" :key="index">

                    <!-- 첫 번째 필드 -->
                    <div class="form-group">
                        <label class="form-label">{{ item.firstLabel }}</label>
                        <template v-if="item.type === 'radio'">
                            <div class="radio-group">
                                <label v-for="option in item.options" :key="option" class="radio-option">
                                    <input type="radio" :value="option" v-model="item.firstValue" />
                                    {{ option }}
                                </label>
                            </div>
                        </template>
                        <template v-else>
                            <input v-if="item.firstEditable" type="text" v-model="item.firstValue" class="form-input"
                                :placeholder="`${item.firstLabel}을(를) 입력하세요`" />
                            <span v-else class="form-value">{{ item.firstValue }}</span>
                        </template>
                    </div>

                    <!-- 두 번째 필드 -->
                    <div class="form-group" v-if="item.secondLabel">
                        <label class="form-label">{{ item.secondLabel }}</label>
                        <input v-if="item.secondEditable" type="text" v-model="item.secondValue" class="form-input"
                            :placeholder="`${item.secondLabel}을(를) 입력하세요`" />
                        <span v-else class="form-value">{{ item.secondValue }}</span>
                    </div>
                </div>

                <!-- 경고 메시지 -->
                <div v-if="validationError" class="error-message">
                    모든 값을 입력해 주세요. (비상연락처 제외)
                </div>

                <div class="modal-actions">
                    <CommonButton label="저장" class="btn-save" @click="registerModalBtn" />
                    <CommonButton label="취소" class="btn-cancel" @click="closeRegisterModal" />
                </div>
            </div>
        </Modal>
    </PageLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import PageLayout from '@/components/common/layouts/PageLayout.vue';
import ViewTable from '@/components/common/ListTable.vue';
import CSearchForm from '@/components/common/CSearchForm.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import Modal from '@/components/common/Modal.vue';
import { $api } from '@/services/api/api';
import { useRouter } from 'vue-router';
import PagePath from '@/components/common/PagePath.vue';

const router = useRouter();

const registerInfo = ref([
    {
        firstLabel: '고객명',
        firstValue: '',
        firstEditable: true,
        secondLabel: '나이',
        secondValue: '',
        secondEditable: true,
    },
    {
        firstLabel: '성별',
        firstValue: '',
        firstEditable: true,
        type: 'radio', // 성별은 라디오 버튼으로 처리
        options: ['남성', '여성'],
        secondLabel: '연락처',
        secondValue: '',
        secondEditable: true,
    },
    {
        firstLabel: '비상연락처',
        firstValue: '',
        firstEditable: true,
        secondLabel: '이메일',
        secondValue: '',
        secondEditable: true,
    }
]);

const resetRegisterInfo = () => {
    registerInfo.value.forEach((item) => {
        item.firstValue = '';
        item.secondValue = '';
    });
};

// 경고 메시지 상태
const validationError = ref(false);

const registerModalBtn = async () => {

    const isValid = registerInfo.value.every(item => {
        if (item.firstLabel === '비상연락처') return true; // 비상연락처 제외
        const firstValid = item.firstEditable ? !!item.firstValue : true;
        const secondValid = item.secondEditable ? !!item.secondValue : true;
        return firstValid && secondValid;
    });

    if (!isValid) {
        validationError.value = true; // 경고 메시지 활성화
        return;
    }

    // 모든 값이 입력되었을 경우 저장 동작
    validationError.value = false; // 경고 메시지 비활성화

    try {
        // 필드 맵핑
        const payload = {
            name: registerInfo.value.find(item => item.firstLabel === '고객명')?.firstValue || '',
            age: parseInt(registerInfo.value.find(item => item.secondLabel === '나이')?.secondValue || '0', 10),
            // sex: registerInfo.value.find(item => item.firstLabel === '성별')?.firstValue || '',
            sex: (() => {
                const sexValue = registerInfo.value.find(item => item.firstLabel === '성별')?.firstValue || '';
                return sexValue === '남성' ? 'MALE' : sexValue === '여성' ? 'FEMALE' : '';
            })(),
            phone: registerInfo.value.find(item => item.secondLabel === '연락처')?.secondValue || '',
            emergePhone: registerInfo.value.find(item => item.firstLabel === '비상연락처')?.firstValue || '',
            email: registerInfo.value.find(item => item.secondLabel === '이메일')?.secondValue || ''
        };

        // API 호출
        const response = await $api.customer.post(
            {
                "name": payload.name,
                "age": payload.age,
                "sex": payload.sex,
                "phone": payload.phone,
                "emergePhone": payload.emergePhone,
                "email": payload.email,
            },
            ''
        );

        showRegisterModal.value = false;
        resetRegisterInfo();
        select();

    } catch (error) {
        console.error('Error during API communication:', error);
    }
};


const selectedRows = ref([]);

const updateSelectedRows = (newSelection) => {
    selectedRows.value = newSelection;
};

const printSelectedRows = () => {
    if (selectedRows.value.length === 0) {
        alert('인쇄할 행을 선택하세요.');
        return;
    }

    const headersToPrint = tableHeaders.value.filter(
        (header) => header.excludeFromPrint !== true
    );

    const printContent = document.createElement('div');
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const headerRow = document.createElement('tr');
    headersToPrint.forEach((header) => {
        const th = document.createElement('th');
        th.innerText = header.label;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    selectedRows.value.forEach((row) => {
        const tr = document.createElement('tr');
        headersToPrint.forEach((header) => {
            const td = document.createElement('td');
            td.innerText = row[header.field] || '';
            td.style.border = '1px solid #ddd';
            td.style.padding = '8px';
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    printContent.appendChild(table);

    // iframe 생성
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-10000px';
    printFrame.style.left = '-10000px';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
        frameDoc.open();
        frameDoc.write('<html><head><title>Print</title></head><body>');
        frameDoc.write(printContent.innerHTML);
        frameDoc.write('</body></html>');
        frameDoc.close();

        // 인쇄 호출
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
    }

    // iframe 제거
    document.body.removeChild(printFrame);
};

// SearchForm.vue 검색조건 값
const initialFormFields = [
    [
        {
            label: '고객 번호',
            type: 'input',
            model: 'customerId',
            value: '',
            showDivider: false
        },
        {
            label: '고객명',
            type: 'input',
            model: 'name',
            value: '',
            showDivider: false
        },
        {
            label: '연락처',
            type: 'input',
            model: 'phone',
            value: '',
            showDivider: false
        },
        {
            label: '성별',
            type: 'radio',
            model: 'sex',
            options: ['남성', '여성'],
            value: '',
            showDivider: false
        }
    ]
];
const formFields = ref(JSON.parse(JSON.stringify(initialFormFields))); // 초기값 복사

// table 헤더 값
const tableHeaders = ref([
    { field: 'customerId', label: '고객 번호', width: '25%' },
    { field: 'name', label: '고객명', width: '20%' },
    { field: 'sex', label: '성별', width: '15%' },
    { field: 'phone', label: '연락처', width: '20%' },
    { field: 'memberId', label: '담당자', width: '20%' }
]);

// 상태 변수
const tableData = ref([]); // 테이블 데이터
const selectedItems = ref([]);
const showDetailModal = ref(false); // 상세조회 모달 표시 여부
const selectedDetail = ref(null); // 선택된 상세 데이터
const totalRecords = ref(0); // 전체 데이터 개수
const loading = ref(false); // 로딩 상태
const rows = ref(15); // 페이지 당 행 수
const first = ref(0); // 첫 번째 행 위치
const filters = ref({}); // 필터
const sortField = ref(null); // 정렬 필드
const sortOrder = ref(null); // 정렬 순서

function handleView(rowData) {
    // 상세 데이터 설정 및 모달 열기
    selectedDetail.value = rowData; // 클릭된 행 데이터 전달
    router.push({ path: '/customer/detail', query: { customerId: rowData.customerId } });
}

const searchCriteria = ref({});
const formKey = ref(0);

const refresh = () => {
    formFields.value = JSON.parse(JSON.stringify(initialFormFields));
    formKey.value++; // 강제로 재렌더링
    if (searchFormRef.value?.resetForm) {
        searchFormRef.value.resetForm(); // 검색창 초기화
    }

    first.value = 0; // 페이지를 첫 번째로 초기화
    sortField.value = null; // 정렬 조건 초기화
    sortOrder.value = null; // 정렬 순서 초기화

    searchCriteria.value = {};
    loadData();
}


// 조회 버튼 클릭 시
const select = () => {
    const formData = searchFormRef.value?.formData;

    if (!formData) {
        console.error('formData를 가져올 수 없습니다.');
        return;
    }

    // 검색 조건 생성
    searchCriteria.value = Object.fromEntries(
        Object.entries(formData)
            .filter(([_, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => {
                // 성별 값 변환
                if (key === 'sex') {
                    value = value === '남성' ? 'MALE' : value === '여성' ? 'FEMALE' : value;
                }
                return [key, value];
            })
    );
    // 검색 실행
    loadData();
};


// 데이터 로드 함수
const loadData = async () => {
    loading.value = true; // 로딩 시작
    try {
        // 검색 조건 필터링 및 유효한 값만 유지
        const filteredCriteria = Object.fromEntries(
            Object.entries(searchCriteria.value).filter(([key, value]) => {
                // null, undefined, 빈 문자열, 빈 배열, 빈 객체는 필터링
                if (value === null || value === undefined || value === '') return false;
                if (Array.isArray(value) && value.length === 0) return false;
                if (typeof value === 'object' && Object.keys(value).length === 0) return false;
                return true;
            })
        );

        // 쿼리 파라미터 생성
        const query = {
            page: first.value / rows.value, // 현재 페이지
            size: rows.value, // 페이지 크기
            sortField: sortField.value || null, // 정렬 필드
            sortOrder: sortOrder.value || null, // 정렬 순서
            ...filteredCriteria // 필터링된 검색 조건 병합
        };

        const queryString = `?${new URLSearchParams(query).toString()}`;

        // API 호출
        const response = await $api.customer.getParams('search', queryString);

        // 응답 데이터
        const result = response?.result;
        if (result && Array.isArray(result.content)) {
            // // 테이블 데이터 업데이트
            // tableData.value = result.content;
            // 성별 변환: MALE -> 남성, FEMALE -> 여성
            tableData.value = result.content.map(row => ({
                ...row,
                sex: row.sex === 'MALE' ? '남성' : row.sex === 'FEMALE' ? '여성' : ''
            }));
            // 전체 데이터 수
            totalRecords.value = result.totalElements;
        } else {
            console.warn('API 응답이 예상한 구조와 다릅니다:', response);
            throw new Error('API 응답 데이터 구조 오류');
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error.message);
        alert('데이터를 가져오는 데 실패했습니다. 관리자에게 문의하세요.');
    } finally {
        loading.value = false; // 로딩 종료
    }
};


onMounted(() => {
    loadData();
});


const exportCSV = async () => {
    loading.value = true;
    try {
        const blob = await $api.customer.get('excel', '', {
            responseType: 'blob'
        });

        // 이미 blob이 반환되었으므로 바로 URL 생성
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'customerExcel.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('다운로드 에러:', error);
        alert('엑셀 다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        loading.value = false;
    }
};


// 페이지네이션 이벤트 처리
function onPage(event) {
    first.value = event.first; // 시작 인덱스
    rows.value = event.rows; // 한 페이지당 데이터 수
    loadData(); // 데이터 로드
}
// 정렬 이벤트 처리

function onSort(event) {
    sortField.value = event.sortField; // 정렬 필드
    sortOrder.value = event.sortOrder > 0 ? 'asc' : 'desc'; // 정렬 순서
    loadData(); // 데이터 로드
}

// 필터 이벤트 처리
function onFilter(event) {
    filters.value = event.filters;
    loadData(); // 데이터 다시 로드
}

// 등록 모달 상태 변수
const showRegisterModal = ref(false);

// 등록 버튼 클릭 시 모달 열기
function openRegisterModal() {
    showRegisterModal.value = true;
}

// 모달 닫기
function closeRegisterModal() {
    showRegisterModal.value = false;
}

watch(showRegisterModal, (newValue) => {
    console.log('showRegisterModal 상태 변경:', newValue);
});

// 검색창 모달
const showModal = ref(false);
const selectedRow = ref(null);
const selectedCode = ref('');
const searchFormRef = ref(null);
const selectedFieldIndex = ref(null);
const searchQuery = ref('');

function handleOpenModal(fieldIndex) {
    selectedFieldIndex.value = fieldIndex; // 필드 인덱스 저장
    showModal.value = true;
}


</script>

<style scoped>
.top{
    display: flex;
    justify-content: space-between;
    align-items: center; /* 세로 가운데 정렬 */
    width: 100%; /* 부모 요소 기준 크기 */
    box-sizing: border-box; /* 테두리 포함 크기 계산 */
}

.path {
    /* 나머지 요소를 오른쪽으로 밀어냄 */
    margin-bottom: 10px;
    display: flex;
}

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

.select {
    display: flex;
    justify-content: right;
    margin-top: 16px;
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

.component-wrapper {
    margin-bottom: 8rem;
}

.custom-tag-wrapper {
    display: flex;
    justify-content: center;
    /* 수평 가운데 정렬 */
    align-items: center;
    /* 수직 가운데 정렬 */
    height: 100%;
    /* 부모 높이에 맞게 정렬 */
}

.custom-tag {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    color: white;
    width: 50px;
}

.custom-tag.success {
    background-color: #caf1d8;
    color: #188a42;
}

.custom-tag.warning {
    background-color: #feddc7;
    color: #ae510f;
}

.custom-tag.danger {
    background-color: #ffd0ce;
    color: #b32b23;
}

.custom-tag.info {
    background-color: #d0e1fd;
    color: #295bac;
}

.radio-group {
    display: flex;
    gap: 16px;
    /* 라디오 버튼 간 간격 */
}

.radio-option {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #555;
}

.radio-option input {
    margin-right: 8px;
}

.modal-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-weight: bold;
    font-size: 14px;
    color: #333;
}

.form-input {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
}

.p-ripple-disabled {
    height: none;
}

.error-message {
    color: red;
    font-size: 14px;
    margin-top: 10px;
    margin-bottom: 20px;
    text-align: center;
}

.search-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    /* 버튼을 오른쪽 정렬 */
    margin-bottom: 1rem;
}

.search-button-wrapper {
    margin-bottom: 1rem;
    /* 검색 조건과 버튼 사이 간격 */
}

.search-fields {
    width: 100%;
}

.title-pos {
    margin-top: 15px;
    font-size: 16px
}
</style>