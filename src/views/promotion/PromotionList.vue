<template>
    <PageLayout>
        <div class="search-wrapper">
            <div class="top">
                <div class="path">
                    <PagePath />
                </div>
                <div class="flex-row content-end">
                    <div class="ml-l">
                        <div class="ml-xs">
                            <CommonButton label="초기화" 
                            icon="pi pi-refresh" 
                            @click="resetSearchParams"
                            color="#F1F1FD" 
                            textColor="#6360AB" />
                        </div>
                    </div>
                    <div class="search-button-wrapper ml-s">
                        <CommonButton label="조회" @click="handleSearch" />
                    </div>
                </div>
            </div>
            <SearchForm class="mb-l" :fields="formFields" @open-modal="handleOpenModal" ref="searchFormRef" />
        </div>
        <div class="flex-row content-between mt-l">
            <div class="title-pos">
                <img src="@/assets/body/rectangle.png" class="mr-xs">전체목록
            </div>
            <div class="flex-row items-center mb-s">
                <div class="ml-xs">
                    <CommonButton label="엑셀다운" @click="exportCSV($event)" icon="pi pi-download" />
                </div>
            </div>
        </div>

        <!-- ViewTable -->
        <div class="table-wrapper">
            <ViewTable :headers="tableHeaders" :data="tableData" :loading="loading" :totalRecords="totalRecords"
                :rows="rows" :rowsPerPageOptions="[10, 15, 20, 50]" :selectable="true" buttonLabel="조회"
                buttonHeader="상세조회" :buttonAction="handleView" buttonField="code" @page="onPage" @sort="onSort"
                @filter="onFilter" />
        </div>
    </PageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PageLayout from '@/components/common/layouts/PageLayout.vue';
import ViewTable from '@/components/common/ListTable2.vue';
import SearchForm from '@/components/common/PromotionSearchForm.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import { $api } from '@/services/api/api';
import PagePath from '@/components/common/PagePath.vue';

const router = useRouter();
const searchFormRef = ref(null); // ref로 searchFormRef 정의
const loading = ref(false); // 로딩 상태 변수

const selectedDetail = ref(null);

const navigateToRegisterPage = () => {
    router.push({ name: 'EPromotionRegister' }); // 라우터 이름을 이용해 이동
};

const searchParams = ref({
    title: '',
    memberId: '',
    startDate: null,
    endDate: null
});

const formFields = [
    [
        {
            label: '제목',
            type: 'input',
            model: 'promotionTitle',
            showDivider: true
        },
        {
            label: '작성자',
            type: 'input',
            model: 'promotionWriter',
            showDivider: true
        },
        {
            label: '조회기간',
            type: 'calendar', // 쌍으로 처리
            model: 'PromotionSearchDate', // 시작과 종료를 모두 포함
            showIcon: true,
            manualInput: false,
        }
    ]
];

const tableHeaders = [
    { field: 'promotionId', label: 'NO', width: '20%' },
    { field: 'title', label: '제목', width: '35%' },
    { field: 'createdAt', label: '작성 일자', width: '20%' },
    { field: 'memberId', label: '작성자', width: '20%' }
];

// 상태 변수
const tableData = ref([]); // 테이블 데이터
const totalRecords = ref(0); // 전체 데이터 개수
const rows = ref(15); // 페이지 당 행 수
const first = ref(0); // 첫 번째 행 위치

function handleOpenModal() {
    console.log('모달 열기 호출됨');
}
const exportCSV = async () => {
    loading.value = true;
    try {
        const blob = await $api.promotion.get('excel', '', {
            responseType: 'blob'
        });

        // 이미 blob이 반환되었으므로 바로 URL 생성
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'promotionExcel.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log(url);
        console.log('파일 다운로드 완료');
    } catch (error) {
        console.error('다운로드 에러:', error);
        DOMEventService.dispatchApiError('엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
        loading.value = false;
    }
};

function handleView(rowData) {
    selectedDetail.value = rowData; // 클릭된 행 데이터 전달
    router.push({
        name: 'PromotionDetail',
        query: {
            promotionwriter: rowData.memberId, // 분류
            promotionTitle: rowData.title,
            promotionContent: rowData.content,
            promotionId: rowData.promotionId,
        },
    });
}
function onPage(event) {
    console.log('페이지네이션 이벤트:', event);
    first.value = event.first;
    rows.value = event.rows;
    loadData();
}

function onSort(event) {
    console.log('정렬 이벤트:', event);
    loadData();
}

function onFilter(event) {
    console.log('필터 이벤트:', event);
    loadData();
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
        title: formData.promotionTitle || '',
        memberId: formData.promotionWriter || '',
        startDate: formData.PromotionSearchDate_start || null,
        endDate: formData.PromotionSearchDate_end || null,
    };

    console.log('매핑된 검색 파라미터:', searchParams.value);

    // 데이터 로드 호출
    await loadData();
};

const loadData = async () => {
    loading.value = true;
    try {
        const params = {
            page: Math.floor(first.value / rows.value),
            size: rows.value,
            title: searchParams.value.title || '',
            memberId: searchParams.value.memberId || '',
            startDate: searchParams.value.startDate || '',
            endDate: searchParams.value.endDate || '',
        };
        if (params.title != '') {
            params.title = '&title=' + params.title;
        }
        if (params.memberId != '') {
            params.memberId = '&memberId=' + params.memberId;
        }
        if (params.startDate == null) {
            params.startDate = ''
            console.log(params.startDate);
        }
        else if (params.startDate != '') {
            params.startDate = '&startDate=' + params.startDate + '%2000%3A00%3A00';
            console.log(params.startDate);
        }
        if (params.endDate == null) {
            params.endDate = ''
            console.log(params.endDate);
        }
        else if (params.endDate != '') {
            params.endDate = '&endDate=' + params.endDate + '%2000%3A00%3A00';
            console.log(params.endDate);
        }
        const response = await $api.promotion.getParams('', `?page=${params.page}&size=${params.size}${params.title}${params.memberId}${params.startDate}${params.endDate}`);
        console.log('test', `?page=${params.page}&size=${params.size}${params.title}${params.memberId}${params.startDate}${params.endDate}`);
        tableData.value = response.content || [];
        totalRecords.value = response.totalElements || 0;
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    } finally {
        loading.value = false;
    }
};
const resetSearchParams = async () => {
    console.log('초기화 버튼 클릭됨');
    // 검색 파라미터 초기화
    searchParams.value = {
        title: '',
        tag: '',
        memberId: '',
        classification: '',
        startDate: null,
        endDate: null
    };

    if (searchFormRef.value?.initializeFormData) {
        searchFormRef.value.initializeFormData(); // NoticeSearchForm 초기화
    }

    // 테이블 데이터 및 페이지 관련 변수 초기화
    tableData.value = []; 
    totalRecords.value = 0; 
    first.value = 0; 

    // 초기 상태 데이터 로드
    await loadData();
};

onMounted(() => {
    loadData();
});
</script>


<style scoped>
.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* 세로 가운데 정렬 */
    width: 100%;
    /* 부모 요소 기준 크기 */
    box-sizing: border-box;
    /* 테두리 포함 크기 계산 */
}

.path {
    /* 나머지 요소를 오른쪽으로 밀어냄 */
    margin-bottom: 10px;
    display: flex;
}

.list {
    font-size: 1.2rem;
    font-weight: bold;
}

.search-wrapper {
    display: flex;
    flex-direction: column;
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
