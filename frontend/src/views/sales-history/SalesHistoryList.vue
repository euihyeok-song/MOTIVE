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
            <div class="subtitle">
                <div class="line"></div>
                <div class="subtitle-text">
                    판매내역
                </div>
            </div>
            <div class="flex-row items-center mb-s">
                <div>
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
                :rows="rows" :rowsPerPageOptions="[5, 10, 20, 50]" :selectable="true" :selection="selectedRows"
                @update:selection="updateSelectedRows" @page="onPage" @sort="onSort" @filter="onFilter">
            </ViewTable>
        </div>

        <Modal v-model="showModal" :header="modalType === 'centerList' ? '매장 검색' :
            modalType === 'memberList' ? '사원 검색' :
                modalType === 'productList' ? '제품 검색' :
                    modalType === 'customerList' ? '고객 검색' : '검색'" width="30rem" height="none" @confirm="confirmSelection"
            @cancel="resetModalState">
            <!-- 검색 입력 -->
            <div class="flex-row content-center mb-m">
                <label class="mr-m">
                    {{ modalType === 'centerList' ? '매장명:' :
                        modalType === 'memberList' ? '사원명:' :
                            modalType === 'productList' ? '제품명:' :
                                modalType === 'customerList' ? '고객명:' : '' }}
                </label>
                <InputText type="text" v-model="searchQuery" @keyup.enter="searchStore" />
                <button class="search-button" @click="searchStore">
                    <span class="search-icon pi pi-search"></span>
                </button>
            </div>

            <!-- 검색 결과 테이블 -->
            <table>
                <thead>
                    <tr>
                        <th v-for="header in dynamicHeaders" :key="header">{{ header }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in modalTableData" :key="index" @click="selectStore(row, index)"
                        :class="{ selected: selectedRow === index }">
                        <td v-if="modalType === 'centerList'">{{ row.centerId }}</td>
                        <td v-if="modalType === 'memberList'">{{ row.memberId }}</td>
                        <td v-if="modalType === 'productList'">{{ row.productId }}</td>
                        <td v-if="modalType === 'customerList'">{{ row.customerId }}</td>
                        <td>{{ row.name }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- 모달 하단 버튼 -->
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
import CSearchForm from '@/components/common/CSearchForm.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import { $api } from '@/services/api/api';
import Modal from '@/components/common/Modal.vue';
import PagePath from '@/components/common/PagePath.vue';

const initialFormFields = [
    [
        {
            label: '매장명',
            type: 'inputWithButton',
            model: 'centerList',
            showDivider: false,
        },
        {
            label: '제품 번호',
            type: 'inputWithButton',
            model: 'productList',
            showDivider: false,
        },
        {
            label: '담당자명',
            type: 'inputWithButton',
            model: 'memberList',
            showDivier: false,
        }
    ],
    [
        {
            label: '고객명',
            type: 'inputWithButton',
            model: 'customerList',
            showDivider: true,
        },
        {
            label: '계약서 번호',
            type: 'input',
            model: 'contractId',
            showDivider: true,
        },
        {
            label: '조회기간',
            type: 'calendar',
            model: 'salesHistoryDate',
            showIcon: true,
            manualInput: false,
        }
    ]
]

const formFields = ref(JSON.parse(JSON.stringify(initialFormFields))); // 초기값 복사

// table 헤더 값
const tableHeaders = ref([
    { field: 'salesHistoryId', label: '판매내역 번호', width: '20%' },
    { field: 'salesHistoryIncentive', label: '수당', width: '15%' },
    { field: 'salesHistoryNumberOfVehicles', label: '판매 대수', width: '5%' },
    { field: 'salesHistoryTotalSales', label: '매출액', width: '15%' },
    { field: 'createdAt', label: '작성 일시', width: '23%' },
    { field: 'contractId', label: '계약서 번호', width: '25%' },
    { field: 'customerId', label: '고객명', width: '10%' },
    { field: 'productId', label: '제품 번호', width: '20%' },
    { field: 'centerId', label: '매장명', width: '20%' },
    { field: 'memberId', label: '담당자', width: '15%' },
]);

// 상태 변수
const tableData = ref([]); // 테이블 데이터
const showDetailModal = ref(false); // 상세조회 모달 표시 여부
const selectedDetail = ref(null); // 선택된 상세 데이터
const totalRecords = ref(0); // 전체 데이터 개수
const loading = ref(false); // 로딩 상태
const rows = ref(10); // 페이지 당 행 수
const first = ref(0); // 첫 번째 행 위치
const filters = ref({}); // 필터
const sortField = ref(null); // 정렬 필드
const sortOrder = ref(null); // 정렬 순서
const selectedRows = ref([]);

const searchCriteria = ref({});

const refresh = () => {
    searchCriteria.value = {};
    formFields.value = JSON.parse(JSON.stringify(initialFormFields));
    // SearchForm 초기화
    if (searchFormRef.value) {
        searchFormRef.value.initializeFormData(); // SearchForm에서 제공되는 초기화 메서드가 있다고 가정
    }
    searchFormRef.value.formDataIds = {};

    showModal.value = false;
    selectedRow.value = {};
    searchQuery.value = '';
    modalTableData.value = [];
    selectedStoreCode.value = '';

    window.location.reload();
}


// 조회 버튼 클릭 시
const select = () => {
    const formData = searchFormRef.value?.formData;
    const formDataIds = searchFormRef.value?.formDataIds;

    console.log("formDataIds: ", formDataIds);
    console.log("formData: ", formData);

    if (!formData || !formDataIds) {
        console.error('formData를 가져올 수 없습니다.');
        return;
    }

    // formDataIds와 formData를 비교하여 조건에 맞게 설정
    Object.entries(formData).forEach(([key, value], index) => {
        // formDataIds가 존재하고, 해당 인덱스에 값이 있을 경우 formDataIds 값을 우선 사용
        if (formDataIds && formDataIds[key] !== undefined && formDataIds[key] !== null && formDataIds[key] !== '') {
            searchCriteria.value[key] = formDataIds[key]; // formDataIds 값 우선
        } else if (value !== null && value !== undefined && value !== '') {
            // formDataIds가 없거나 해당 인덱스에 값이 없을 경우 formData 값을 사용
            if (Array.isArray(searchCriteria.value[key])) {
                // 배열 필드인 경우 배열 병합 처리
                if (!searchCriteria.value[key].includes(value)) {
                    searchCriteria.value[key].push(value); // 중복 방지 후 값 추가
                }
            } else {
                searchCriteria.value[key] = value; // 배열이 아니면 값을 설정
            }
        }
    });

    // 날짜 처리 부분에서 배열을 방지하고 하나의 문자열로만 처리
    if (formData.salesHistoryDate_start) {
        searchCriteria.value.salesHistoryDate_start = formData.salesHistoryDate_start;
    }
    if (formData.salesHistoryDate_end) {
        searchCriteria.value.salesHistoryDate_end = formData.salesHistoryDate_end;
    }

    console.log("검색 조건 (id):", searchCriteria.value);
    loadData();
};

const loadData = async () => {
    try {
        // 검색 조건 필터링 및 유효한 값만 유지
        const filteredCriteria = Object.fromEntries(
            Object.entries(searchCriteria.value).filter(([key, value]) => {
                // null, undefined, 빈 문자열, 빈 배열, 빈 객체는 필터링
                if (value === null || value === undefined || value === '') return false;
                if (Array.isArray(value) && value.length === 0) return false;
                if (typeof value === 'object' && Object.keys(value).length === 0) return false;
                return key !== 'salesHistorySearchDate_start' && key !== 'salesHistorySearchDate_end'; // 날짜 제외
            })
        );

        // 쿼리 파라미터 설정
        const query = {
            page: first.value / rows.value, // 현재 페이지 번호
            size: rows.value, // 한 페이지 데이터 수
            sortField: sortField.value || null, // 정렬 필드
            sortOrder: sortOrder.value || null, // 정렬 순서
        };

        // 별도로 날짜 처리
        const startDate = searchCriteria.value.salesHistoryDate_start || null;

        if (searchCriteria.value.salesHistoryDate_end) {
            // salesHistoryDate_end 값을 Date 객체로 변환
            let date = new Date(searchCriteria.value.salesHistoryDate_end);

            // 1일을 더하기
            date.setDate(date.getDate() + 1);

            // 새로운 날짜를 YYYY-MM-DD 형식으로 변환
            searchCriteria.value.salesHistoryDate_end = date.toISOString().split('T')[0]; // "2024-12-12"
        }

        const endDate = searchCriteria.value.salesHistoryDate_end || null;

        if ((startDate != null && endDate == null) || (startDate == null && endDate != null)) {
            alert('조회 일자를 모두 선택해주세요.');
            console.warn("달력 선택 오류");
        }
        // 배열 필드 강제 처리
        const ensureArrayFields = (criteria) => {
            const arrayFields = ['memberList', 'centerList', 'customerList', 'productList']; // 배열로 처리할 필드 정의
            arrayFields.forEach((field) => {
                if (!Array.isArray(criteria[field])) {
                    criteria[field] = criteria[field] ? [criteria[field]] : []; // 값이 있으면 배열로, 없으면 빈 배열로 처리
                }
            });
            return criteria;
        };

        // 필터링된 조건에 배열 처리 추가
        const preparedCriteria = ensureArrayFields(filteredCriteria);

        // 최종 요청 본문
        const searchParams = {
            ...preparedCriteria,
            startDate,
            endDate,
        };
        // 쿼리 문자열 생성
        const queryString = `search?${new URLSearchParams(query).toString()}`;
        console.log("API 호출 URL:", queryString); // 디버깅용

        console.log("검색 인자: ", searchParams);

        // API 호출
        const response = await $api.salesHistory.post(searchParams, queryString);

        // API 응답 데이터 확인
        console.log("API 응답 데이터:", response);

        const result = response?.result; // 응답 데이터 접근
        if (result && Array.isArray(result.content)) {
            tableData.value = result.content; // 테이블 데이터 업데이트
            totalRecords.value = result.totalElements; // 전체 데이터 수
            searchCriteria.value['contractId'] = "";
        } else {
            console.warn("API 응답이 예상한 구조와 다릅니다:", response);
            throw new Error("API 응답 데이터 구조 오류");
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error.message);
        tableData.value = null;
    } finally {
        loading.value = false; // 로딩 종료
    }
};

onMounted(() => {
    loadData('POST');
});

const exportCSV = async () => {
    loading.value = true;
    try {
        const blob = await $api.salesHistory.get('excel', '', {
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

// 검색창 모달
const showModal = ref(false);
const searchQuery = ref('');
const modalTableData = ref([]);
const selectedRow = ref(null);
const selectedStoreCode = ref('');
const modalType = ref(''); // 현재 열려 있는 모달의 유형
const searchFormRef = ref(null);

const dynamicHeaders = computed(() => {
    if (modalType.value === 'centerList') {
        return ['매장코드', '매장명'];
    } else if (modalType.value === 'memberList') {
        return ['사원코드', '사원명'];
    } else if (modalType.value === 'productList') {
        return ['제품코드', '제품명']; // 가정
    } else if (modalType.value === 'customerList') {
        return ['고객코드', '고객명']; // 가정
    } else {
        return [];
    }
});

function handleOpenModal(fieldModel) {
    if (fieldModel === 'centerList') {
        modalType.value = 'centerList';
    } else if (fieldModel === 'memberList') {
        modalType.value = 'memberList';
    } else if (fieldModel === 'productList') {
        modalType.value = 'productList'; // 추가로 필요한 경우
    } else if (fieldModel === 'customerList') {
        modalType.value = 'customerList'; // 추가로 필요한 경우
    } else {
        console.warn(`알 수 없는 fieldModel: ${fieldModel}`);
        return;
    }
    showModal.value = true; // 모달 열기
    selectedRow.value = null; // 선택 초기화
}

// 테이블 행 선택
function selectStore(row, index) {
    selectedRow.value = index; // 선택된 행의 인덱스 저장

    switch (modalType.value) {
        case 'centerList':
            selectedStoreCode.value = row.centerId; // 매장 코드 저장
            console.log("선택된 매장 코드:", selectedStoreCode.value);
            break;
        case 'memberList':
            selectedStoreCode.value = row.memberId; // 사원 코드 저장
            console.log("선택된 사원 코드:", selectedStoreCode.value);
            break;
        case 'productList':
            selectedStoreCode.value = row.productId; // 제품 코드 저장
            console.log("선택된 제품 코드:", selectedStoreCode.value);
            break;
        case 'customerList':
            selectedStoreCode.value = row.customerId; // 고객 코드 저장
            console.log("선택된 고객 코드:", selectedStoreCode.value);
            break;
        default:
            console.warn(`알 수 없는 modalType: ${modalType.value}`);
    }
}


function confirmSelection() {
    if (selectedRow.value === null) {
        alert('항목을 선택하세요.');
        return;
    }

    const selectedData = modalTableData.value[selectedRow.value];

    switch (modalType.value) {
        case 'centerList':
            searchFormRef.value.updateFieldValue('centerList', selectedData.name, selectedData.centerId);
            break;
        case 'memberList':
            searchFormRef.value.updateFieldValue('memberList', selectedData.name, selectedData.memberId);
            break;
        case 'productList':
            searchFormRef.value.updateFieldValue('productList', selectedData.name, selectedData.productId);
            break;
        case 'customerList':
            searchFormRef.value.updateFieldValue('customerList', selectedData.name, selectedData.customerId);
            break;
        default:
            console.warn(`알 수 없는 modalType: ${modalType.value}`);
    }

    showModal.value = false; // 모달 닫기
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
        console.log("검색어:", searchQuery.value);

        const query = modalType.value === 'centerList'
            ? { name: searchQuery.value }
            : { employeeName: searchQuery.value };


        const endpoint = modalType.value === 'centerList'
            ? $api.center
            : modalType.value === 'memberList'
                ? $api.member
                : modalType.value === 'productList'
                    ? $api.product // 가정
                    : modalType.value === 'customerList'
                        ? $api.customer // 가정
                        : null;

        if (!endpoint) {
            console.error('유효하지 않은 modalType:', modalType.value);
            return;
        }

        const response = await endpoint.getParams('search', `?name=${searchQuery.value}`);
        console.log("API 응답 데이터:", response);

        let result = [];
        if (modalType.value === 'centerList') {
            result = response.result.content || [];
        } else if (modalType.value === 'memberList') {
            result = response.result || [];
        } else if (modalType.value === 'productList') {
            result = response.result.content || []; // 가정
        } else if (modalType.value === 'customerList') {
            result = response.result.content || []; // 가정
        }

        if (Array.isArray(result)) {
            modalTableData.value = result;
            console.log("Modal Table Data:", modalTableData.value);
        } else {
            console.warn("API 응답 데이터가 배열이 아닙니다.");
            modalTableData.value = [];
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error.message);
        alert("데이터를 가져오는 데 실패했습니다. 관리자에게 문의하세요.");
    } finally {
        loading.value = false;
    }
}


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

.button-row {
    display: flex;
    gap: 10px;
    /* 버튼 간 간격 */
    margin-top: 20px;
    /* 버튼 행 위쪽 간격 */
    justify-content: flex-start;
    /* 버튼을 왼쪽 정렬 */
}

.common-button {
    background-color: #6360AB;
    /* 기본 배경색 */
    color: #fff;
    /* 텍스트 색상 */
    border: none;
    /* 테두리 제거 */
    padding: 8px 16px;
    /* 버튼 내부 여백 */
    font-size: 14px;
    /* 텍스트 크기 */
    cursor: pointer;
    /* 마우스 커서 */
    border-radius: 4px;
    /* 모서리 둥글게 */
    text-align: center;
    /* 텍스트 정렬 */
    display: inline-block;
    /* 인라인 블록 레이아웃 */
    box-sizing: border-box;
    /* 크기 계산에 패딩 포함 */
}

.common-button:hover {
    background-color: #4e4c96;
    /* 호버 시 배경색 */
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


.line {
    width: 5px;
    height: 24px;
    background-color: #333333;
    margin-right: 10px;
}

.subtitle {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
}

.line {
    width: 5px;
    height: 24px;
    background-color: #333333;
    margin-right: 10px;
}

.subtitle-text {
    font-size: 16px;
    font-weight: bold;
    color: #000;
}
</style>