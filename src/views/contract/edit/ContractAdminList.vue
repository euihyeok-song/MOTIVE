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
                <CSearchForm :fields="formFields" @open-modal="handleOpenModal" ref="searchFormRef"
                    @keyup.enter="select" />
            </div>
        </div>


        <div class="flex-row content-between mt-l">
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
                    <div v-if="!data">
                        <!-- 상태 열이 없을 경우 빈 상태 유지 -->
                    </div>
                </template>
            </ViewTable>


            <ContractAdminDetail v-model="showDetailModal" :showModal="showDetailModal" :details="selectedDetail"
                @close="showDetailModal = false" @refresh="loadData" :status="getStatusLabel(selectedDetail?.status)"
                :statusClass="getCustomTagClass(selectedDetail?.status)" />
        </div>

        <EContractRegister v-model:visible="showRegisterModal" @close="closeRegisterModal" @refresh="loadData" />

        <!-- 모달 -->
        <Modal v-model="showModal" :header="modalType === 'centerName' ? '매장 검색' : '사원 검색'" width="30rem" height="none"
            @confirm="confirmSelection" @cancel="resetModalState">
            <div class="flex-row content-center mb-m">
                <label class="mr-m">{{ modalType === 'centerName' ? '매장명:' : '사원명:' }}</label>
                <InputText type="text" v-model="searchQuery" @keyup.enter="searchStore" />
                <button class="search-button" @click="searchStore">
                    <span class="search-icon pi pi-search"></span>
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th v-for="header in dynamicHeaders" :key="header">{{ header }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in modalTableData" :key="index" @click="selectStore(row, index)"
                        :class="{ selected: selectedRow === index }">
                        <td>{{ modalType === 'centerName' ? row.centerId : row.memberId }}</td>
                        <td>{{ modalType === 'centerName' ? row.name : row.name }}</td>
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
import { ref, onMounted, watch, computed } from 'vue';
import PageLayout from '@/components/common/layouts/PageLayout.vue';
import ViewTable from '@/components/common/ListTable.vue';
import ContractAdminDetail from '@/views/contract/edit/ContractAdminDetail.vue';
import Modal from '@/components/common/Modal.vue';
import CSearchForm from '@/components/common/CSearchForm.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import { $api } from '@/services/api/api';
import EContractRegister from '@/views/contract/edit/EContractRegister.vue';
import PagePath from '@/components/common/PagePath.vue';

// SearchForm.vue 검색조건 값
const formFields = [
    [
        {
            label: '사원명',
            type: 'inputWithButton',
            model: 'searchMemberName',
            relatedModel: 'searchMemberId',
            showDivider: false
        },
        {
            label: '매장명',
            type: 'inputWithButton',
            model: 'centerName',
            relatedModel: 'centerId',
            showDivider: false
        },
        {
            label: '제품명',
            type: 'input',
            model: 'carName',
            showDivider: false
        },
        {
            type: 'select',
            label: '승인여부',
            model: 'status',
            options: ['대기', '승인', '취소']
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
            model: 'customerClassifcation',
            options: ['개인', '법인'],
            showDivider: false
        },
        {
            label: '구매 조건',
            type: 'radio',
            model: 'customerPurchaseCondition',
            options: ['현금', '할부', '리스'],
            showDivider: false
        },
        {
            label: '고객 상호',
            type: 'input',
            model: 'companyName',
            showDivider: false
        }
    ],
    [
        {
            label: '계약서명',
            type: 'input',
            model: 'title',
            showDivider: true
        },
        {
            label: '계약일자',
            type: 'calendar', // 쌍으로 처리
            model: 'contractDate', // 시작과 종료를 모두 포함
            showIcon: true,
            manualInput: false,
        }
    ]
];

// table 헤더 값
const tableHeaders = ref([
    { field: 'contractId', label: '계약서 번호', width: '15%' },
    { field: 'title', label: '계약서명', width: '25%' },
    { field: 'carName', label: '제품명', width: '13%' },
    { field: 'customerName', label: '고객명', width: '13%' },
    { field: 'customerPurchaseCondition', label: '구매 조건', width: '10%' },
    { field: 'createdAt', label: '계약일자', width: '15%' },
    { field: 'status', label: '승인 상태', width: '3%' },
]);

// 상태 변수
const tableData = ref([]); // 테이블 데이터
const showDetailModal = ref(false); // 상세조회 모달 표시 여부
const selectedDetail = ref(null); // 선택된 상세 데이터
const totalRecords = ref(0); // 전체 데이터 개수
const loading = ref(false); // 로딩 상태
const rows = ref(15); // 페이지 당 행 수
const first = ref(0); // 첫 번째 행 위치
const filters = ref({}); // 필터
const sortField = ref(null); // 정렬 필드
const sortOrder = ref(null); // 정렬 순서
const selectedRows = ref([]);

function getStatusLabel(status) {
    switch (status) {
        case "WAIT":
            return "대기";
        case "APPROVED":
            return "승인";
        case "CANCEL":
            return "취소";
        default:
            return "알 수 없음";
    }
}

// 상태에 따라 표시할 색상 반환
function getCustomTagClass(status) {
    switch (status) {
        case "WAIT":
            return "success"; // 노란색
        case "APPROVED":
            return "info"; // 초록색
        case "CANCEL":
            return "danger"; // 빨간색
        default:
            return "warning"; // 기본 색상
    }
}

const searchCriteria = ref({});

const refresh = () => {
    if (searchFormRef.value && searchFormRef.value.resetFields) {
        searchFormRef.value.resetFields(); // CSearchForm의 초기화 메서드 호출
    }

    // 검색 조건 초기화
    searchCriteria.value = {};

    // 데이터 로드
    loadData();
};

// 조회 버튼 클릭 시
const select = () => {
    const formData = searchFormRef.value?.formData;

    if (!formData) {
        console.error('formData를 가져올 수 없습니다.');
        return;
    }

    // 검색 조건 생성
    searchCriteria.value = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
            return value !== null && value !== undefined && value !== '';
        })
    );

    const updatedCriteria = {};
    for (const [key, value] of Object.entries(searchCriteria.value)) {
        if (key === 'contractDate_start') {
            updatedCriteria.startDate = value;
        } else if (key === 'contractDate_end') {
            updatedCriteria.endDate = value;
        } else {
            updatedCriteria[key] = value; // 나머지 키는 그대로 유지
        }
    }

    searchCriteria.value = updatedCriteria;

    // 검색 실행
    loadData();
};

function handleView(rowData) {
    // 상세 데이터 설정 및 모달 열기
    selectedDetail.value = rowData; // 클릭된 행 데이터 전달
    showDetailModal.value = true;
}

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

        // 쿼리 파라미터 설정
        const query = {
            page: first.value / rows.value, // 현재 페이지 번호
            size: rows.value, // 한 페이지 데이터 수
            sortField: sortField.value || null, // 정렬 필드
            sortOrder: sortOrder.value || null, // 정렬 순서
            ...filteredCriteria // 필터링된 검색 조건 병합
        };

        // 쿼리 문자열 생성
        const queryString = `?${new URLSearchParams(query).toString()}`;
        console.log("API 호출 URL:", queryString); // 디버깅용

        // API 호출
        const response = await $api.contract.getParams('center/search', queryString);

        const result = response?.result; // 응답 데이터 접근
        if (result && Array.isArray(result.content)) {
            tableData.value = result.content; // 결과를 설정
            totalRecords.value = result.totalElements; // 전체 데이터 수
        } else {
            tableData.value = []; // 데이터가 없으면 빈 배열 유지
            totalRecords.value = 0; // 전체 데이터 수도 0으로 설정
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error.message);
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
        const blob = await $api.contract.get('excel', '', {
            responseType: 'blob'
        });

        // 이미 blob이 반환되었으므로 바로 URL 생성
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'contractExcel.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('파일 다운로드 완료');
    } catch (error) {
        console.error('다운로드 에러:', error);
        alert('엑셀 다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        loading.value = false;
    }
};

const updateSelectedRows = (newSelection) => {
    selectedRows.value = newSelection;
    console.log('선택된 항목 업데이트:', selectedRows.value);
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
const searchQuery = ref('');
const modalTableData = ref([]);
const selectedRow = ref(null);
const selectedStoreCode = ref('');
const modalType = ref(''); // 현재 열려 있는 모달의 유형

const selectedCode = ref('');
const searchFormRef = ref(null);
const selectedFieldIndex = ref(null);

const dynamicHeaders = computed(() => {
    if (modalType.value === 'centerName') {
        return ['매장코드', '매장명'];
    } else {
        return ['사원코드', '사원명'];
    }
    return [];
});

// 모달 열기
function handleOpenModal(fieldModel) {
    modalType.value = fieldModel; // 'centerId' 또는 'employeeId' 값 설정
    showModal.value = true; // 모달 열기
    selectedRow.value = null; // 선택 초기화
}

// 테이블 행 선택
function selectStore(row, index) {
    selectedRow.value = index; // 선택된 행의 인덱스 저장

    if (modalType.value === 'centerName') {
        // 매장 검색의 경우
        searchFormRef.value.updateFieldValue('centerName', row.name); // 매장명 표시
        console.log("선택된 매장명:", row.name);
    } else {
        // 사원 검색의 경우
        searchFormRef.value.updateFieldValue('searchMemberName', row.name); // 사원명 표시
        console.log("선택된 사원명:", row.name);
    }
}


// 모달 확인 및 값 전달
function confirmSelection() {
    if (selectedRow.value === null) {
        alert('항목을 선택하세요.');
        return;
    }

    // 선택된 데이터를 가져오기
    const selectedData = modalTableData.value[selectedRow.value];

    if (!selectedData) {
        console.error("선택된 데이터가 없습니다.");
        return;
    }

    // 부모 컴포넌트의 inputWithButton 필드 업데이트
    if (modalType.value === 'centerName') {
        // 매장 검색의 경우
        searchFormRef.value.updateFieldValue('centerId', selectedData.centerId);
        searchFormRef.value.updateFieldValue('centerName', selectedData.name);
    } else {
        // 사원 검색의 경우
        searchFormRef.value.updateFieldValue('searchMemberName', selectedData.name); // 표시용 name
        searchFormRef.value.updateFieldValue('searchMemberId', selectedData.memberId);
    }

    // 모달 닫기
    showModal.value = false;
}

// 모달 상태 초기화
function resetModalState() {
    showModal.value = false;
    selectedRow.value = null;
    searchQuery.value = ''; // 검색어 초기화
    modalTableData.value = []; // 모달 테이블 데이터 초기화
    selectedStoreCode.value = ''; // 선택된 매장 코드 초기화
}

async function searchStore() {
    try {
        // 검색 쿼리 확인
        console.log("검색어:", searchQuery.value);

        const query = modalType.value === 'centerName'
            ? { name: searchQuery.value }
            : { employeeName: searchQuery.value };

        const endpoint = modalType.value === 'centerName'
            ? $api.center
            : $api.member;

        // API 호출
        const response = await endpoint.getParams('search', `?name=${searchQuery.value}`);

        // API 응답 데이터 확인
        console.log("API 응답 데이터:", response);

        // `modalType`에 따라 다른 응답 구조 처리
        let result = [];
        if (modalType.value === 'centerName') {
            // center의 경우
            result = response.result.content || []; // content 내부 데이터 추출
        } else {
            // member의 경우
            result = response.result || []; // result 자체를 사용
            console.log("result: ", result);
        }

        // 데이터가 배열인지 확인 후 modalTableData 업데이트
        if (Array.isArray(result)) {
            modalTableData.value = result; // 데이터 바인딩
            console.log("Modal Table Data:", modalTableData.value);
        } else {
            console.warn("API 응답 데이터가 배열이 아닙니다.");
            modalTableData.value = [];
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error.message);
        alert("데이터를 가져오는 데 실패했습니다. 관리자에게 문의하세요.");
    } finally {
        loading.value = false; // 로딩 종료
    }
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