<template>
    <PageLayout>
        <!-- SearchForm -->
        <div class="component-wrapper">

            <div class="top">
                <div class="path">
                    <PagePath />
                </div>
                <div class="flex-row content-end">
                    <div class="ml-l">
                        <div class="ml-xs">
                            <CommonButton label="초기화" @click="resetSearch" icon="pi pi-refresh" color="#F1F1FD"
                                textColor="#6360AB" />
                        </div>
                    </div>
                    <div class="search-button-wrapper ml-s">
                        <CommonButton label="조회" @click="handleSearch" />
                    </div>
                </div>
            </div>
            <SearchForm class="mb-l" :fields="formFields" @open-modal="handleOpenModal" ref="searchFormRef"
                @keyup.enter="handleSearch" />
        </div>
        <div class="flex-row content-between mt-xxxxl">
            <div class="subtitle">
                <div class="line"></div>
                <div class="subtitle-text">
                    매장 목록
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
        <div class="table-wrapper">
            <ViewTable :headers="tableHeaders" :data="tableData" :loading="loading" :totalRecords="totalRecords"
                :rows="rows" :rowsPerPageOptions="[10, 15, 20, 50]" :selectable="true" buttonLabel="조회"
                buttonHeader="상세조회" :selection="selectedRows" @update:selection="updateSelectedRows"
                :buttonAction="handleView" buttonField="code" @page="onPage" @sort="onSort" @filter="onFilter" />

            <CenterDetail v-model="showDetailModal" :showModal="showDetailModal" :details="selectedDetail"
                @close="showDetailModal = false" />
        </div>
    </PageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PageLayout from '@/components/common/layouts/PageLayout.vue';
import ViewTable from '@/components/common/ListTable.vue';
import CenterDetail from '@/views/center/CenterDetail.vue';
import SearchForm from '@/components/common/NoticeSearchForm.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import { $api } from '@/services/api/api';
import PagePath from '@/components/common/PagePath.vue';
import DOMEventService from '@/services/DOMEventService';

const formFields = [
    [
        {
            type: 'input',
            label: '매장번호',
            model: 'centerId',
            showDivider: false
        },
        {
            type: 'input',
            label: '매장명',
            model: 'name',
            showDivider: true
        },
        {
            type: 'input',
            label: '주소',
            model: 'address',
            showDivider: false
        }
    ]
];

const tableHeaders = ref([
    { field: 'centerId', label: '매장번호', width: '17%' },
    { field: 'name', label: '매장명', width: '18%' },
    { field: 'address', label: '주소', width: '30%' },
    { field: 'memberCount', label: '사원수', width: '20%' },
    { field: 'operatingAt', label: '운영시간', width: '10%' }
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

const searchParams = ref({
    centerId: '',
    name: '',
    address: ''
});

function handleView(rowData) {
    // 상세 데이터 설정 및 모달 열기
    selectedDetail.value = rowData; // 클릭된 행 데이터 전달
    showDetailModal.value = true;
}

const handleSearch = async () => {
    console.log('handleSearch 호출됨');

    // SearchForm에서 데이터를 가져옴
    if (!searchFormRef.value) {
        console.error('searchFormRef가 초기화되지 않았습니다.');
        return;
    }

    const formData = searchFormRef.value.getFormData();
    console.log('SearchForm에서 반환된 데이터:', formData);

    // 검색 파라미터 매핑
    searchParams.value = {
        centerId: formData.centerId || '',
        name: formData.name || '',
        address: formData.address || ''
    };

    console.log('매핑된 검색 파라미터:', searchParams.value);

    // 데이터 로드 호출
    await loadData();
};

// 데이터 로드 함수
const loadData = async () => {
    loading.value = true; // 로딩 시작
    try {

        const query = {
            page: Math.floor(first.value / rows.value), // 현재 페이지 번호
            size: rows.value, // 한 페이지 데이터 수
            centerId: searchParams.value.centerId || '',
            name: searchParams.value.name || '',
            address: searchParams.value.address || '',
            sortField: sortField.value || null, // 정렬 필드
            sortOrder: sortOrder.value || null, // 정렬 순서
        };

        // 쿼리 문자열 생성
        const queryString = `?${new URLSearchParams(query).toString()}`;
        console.log("API 호출 URL:", queryString); // 디버깅용
        // API 호출
        const response = await $api.center.getParams('search', queryString);

        const result = response?.result; // 응답 데이터 접근

        if (result && Array.isArray(result.content)) {
            tableData.value = result.content; // 테이블 데이터 업데이트
            totalRecords.value = result.totalElements; // 전체 데이터 수

            console.log(tableData.value);
        } else {
            console.warn("API 응답이 예상한 구조와 다릅니다:", response);
            throw new Error("API 응답 데이터 구조 오류");
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error.message);
        DOMEventService.dispatchApiError("검색 결과가 없습니다.");
    } finally {
        loading.value = false; // 로딩 종료
    }
};

function onPage(event) {
    first.value = event.first;
    rows.value = event.rows;
    loadData(); // 데이터 다시 로드
}
// 정렬 이벤트 처리
function onSort(event) {
    sortField.value = event.sortField; // 정렬 필드
    sortOrder.value = event.sortOrder > 0 ? 'asc' : 'desc'; // 정렬 순서
    loadData(); // 데이터 로드
}

const exportCSV = async () => {
    loading.value = true;
    try {
        const blob = await $api.center.get('excel', '', {
            responseType: 'blob'
        });

        // 이미 blob이 반환되었으므로 바로 URL 생성
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'centerExcel.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('파일 다운로드 완료');
    } catch (error) {
        console.error('다운로드 에러:', error);
        DOMEventService.dispatchApiError('엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
        loading.value = false;
    }
};

// 페이지 로드 시 데이터 로드
onMounted(() => {
    loadData();
});

// 필터 이벤트 처리
function onFilter(event) {
    filters.value = event.filters;
    loadData(); // 데이터 다시 로드
}


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

const resetSearch = () => {
    searchParams.value = {
        centerId: '',
        name: '',
        address: '',
    };
    first.value = 0; // 페이지를 첫 번째로 초기화
    sortField.value = null; // 정렬 조건 초기화
    sortOrder.value = null; // 정렬 순서 초기화
    searchFormRef.value.initializeFormData();
    loadData(); // 데이터 재로딩
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

.list {
    font-size: 1.5rem;
    font-weight: bold;
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
