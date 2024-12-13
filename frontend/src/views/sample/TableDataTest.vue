<template>
    <PageLayout>
        <ViewTable 
            :headers="tableHeaders" 
            :data="tableData" 
            :loading="loading" 
            :totalRecords="totalRecords" 
            :rows="rows" 
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :selectable="true" 
            buttonLabel="조회" 
            buttonHeader="상세조회"
            :buttonAction="handleView" 
            buttonField="code"
            @page="onPage" 
            @sort="onSort" 
            @filter="onFilter" 
        />
    </PageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PageLayout from '@/components/common/layouts/PageLayout.vue';
import ViewTable from '@/components/common/ListTable.vue';
import { $api } from '@/services/api/api';

// 테이블 헤더 정의
const tableHeaders = [
    { field: 'contractId', label: '계약서 번호', width: '25%' },
    { field: 'title', label: '계약서 명', width: '25%' },
    { field: 'productName', label: '제품 명', width: '25%' },
    { field: 'customerName', label: '고객 명', width: '25%' },
    { field: 'status', label: '고객 구분', width: '25%' },
    { field: 'quantity', label: '고객 구매 조건', width: '25%' },
    { field: 'companyName', label: '고객 상호', width: '25%' },
    { field: 'status', label: '승인 상태', width: '25%' }
];

// 상태 변수
const tableData = ref([]); // 테이블 데이터
const totalRecords = ref(0); // 전체 데이터 개수
const loading = ref(false); // 로딩 상태
const rows = ref(5); // 페이지 당 행 수
const first = ref(0); // 첫 번째 행 위치
const filters = ref({}); // 필터
const sortField = ref(null); // 정렬 필드
const sortOrder = ref(null); // 정렬 순서

// 데이터 로드 함수
const loadData = async () => {
    loading.value = true; // 로딩 시작
    try {
        const response = await $api.contract.get(
            '',
            '',
        );
        console.log('GET 요청 응답 결과');
        console.log(response);

        tableData.value = response.result.content; // 테이블 데이터 업데이트
        totalRecords.value = response.result.totalElements; // 전체 데이터 개수 업데이트
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    } finally {
        loading.value = false; // 로딩 종료
    }
};

// 페이지 로드 시 데이터 로드
onMounted(() => {
    loadData();
});

// 페이지네이션 이벤트 처리
function onPage(event) {
    first.value = event.first;
    rows.value = event.rows;
    loadData(); // 데이터 다시 로드
}

// 정렬 이벤트 처리
function onSort(event) {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
    loadData(); // 데이터 다시 로드
}

// 필터 이벤트 처리
function onFilter(event) {
    filters.value = event.filters;
    loadData(); // 데이터 다시 로드
}

// 버튼 동작
function handleView(rowData) {
    console.log('조회 버튼 클릭:', rowData);
}
</script>
