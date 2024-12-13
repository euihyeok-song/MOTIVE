<template>
    <PageLayout>
        <div class="search-wrapper">
            <div class="flex-row content-end">
                <div class="ml-l">
                    <div class="ml-xs">
                        <div class="ml-xs">
                            <CommonButton label="초기화" 
                            icon="pi pi-refresh" 
                            color="#F1F1FD" 
                            textColor="#6360AB"
                            @click = "resetSearchParams" 
                        />
                    </div>
                </div>
            </div>
            <div class="search-button-wrapper ml-s">
                <CommonButton label="조회" @click="handleSearch"/>
            </div>
        </div>
        <div class="search-fields">
            <SearchForm :fields="formFields" @open-modal="handleOpenModal" ref="searchFormRef" />
        </div>
        </div>
        <div class="flex-row content-between mt-m">
            <div class="title-pos">
                <img src="@/assets/body/rectangle.png" class="mr-xs">전체목록
            </div>
            <div class="flex-row items-center mb-s">
                <div><CommonButton label="추가" icon="pi pi-plus" @click="navigateToRegisterPage" /></div>
                <div class="ml-xs"><CommonButton label="엑셀다운" @click="exportCSV($event)" icon="pi pi-download" /></div>
            </div>
        </div>

        <div class="table-wrapper">
            <ViewTable 
                :headers="tableHeaders" 
                :data="tableData" 
                :loading="loading" 
                :totalRecords="totalRecords" 
                :rows="rows" 
                :rowsPerPageOptions="[10, 15, 20, 50]"
                :selectable="true" 
                buttonLabel="조회" 
                buttonHeader="상세조회"
                :buttonAction="handleView" 
                buttonField="code"
                @page="onPage" 
                @sort="onSort" 
                @filter="onFilter" 
            />
        </div>
    </PageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PageLayout from '@/components/common/layouts/PageLayout.vue';
import ViewTable from '@/components/common/ListTable2.vue';
import SearchForm from '@/components/common/NoticeSearchForm.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import { $api } from '@/services/api/api';

const router = useRouter(); 
const searchFormRef = ref(null); // ref로 searchFormRef 정의
const loading = ref(false); // 로딩 상태 변수

const selectedDetail = ref(null);

const navigateToRegisterPage = () => {
    router.push({ name: 'ENoticeRegister' }); // 라우터 이름을 이용해 이동
};

const searchParams = ref({
    title: '',
    tag: '',
    memberId: '',
    classification: '',
    startDate: null,
    endDate: null
});

const resetForm = () => {
    fields.value = {
        tag: '',
        classification: '',
        noticeTitle: '',
        noticeWriter: '',
        NoticeSearchDate_start: null,
        NoticeSearchDate_end: null
    };
};

const formFields = [
    [
        {
            type: 'select',
            label: '분류',
            model: 'classification',
            options: ['NORMAL','GOAL','STRATEGY'],
            showDivider: false,
            showIcon: true
        },
        {
            label: '제목',
            type: 'input',
            model: 'noticeTitle',
            showDivider: true
        }
    ],
    [
        {
            label: '작성자',
            type: 'input',
            model: 'noticeWriter',
            showDivider: false
        },
        {
            label: '조회기간',
            type: 'calendar', // 쌍으로 처리
            model: 'NoticeSearchDate', // 시작과 종료를 모두 포함
            showIcon: true,
            manualInput: false,
        }
    ]
];

const fields = ref({
    tag: '',
    classification: '',
    noticeTitle: '',
    noticeWriter: '',
    NoticeSearchDate_start: null,
    NoticeSearchDate_end: null,
});



const tableHeaders = [
    { field: 'noticeId', label: '번호', width: '25%' },
    { field: 'classification', label: '분류', width: '15%' },
    { field: 'title', label: '제목', width: '25%' },
    { field: 'createdAt', label: '작성 일자', width: '20%' },
    { field: 'memberId', label: '작성자', width: '20%' }
];

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

const initializeFormData = () => {
    fields.value = {
        tag: '',
        classification: '',
        noticeTitle: '',
        noticeWriter: '',
        NoticeSearchDate_start: null,
        NoticeSearchDate_end: null,
    };
};
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
        const blob = await $api.notice.get('excel', '', {
            responseType: 'blob'
        });

        // 이미 blob이 반환되었으므로 바로 URL 생성
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'noticeExcel.xlsx');
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

function handleView(rowData) {
    selectedDetail.value = rowData; // 클릭된 행 데이터 전달
    router.push({
        name: 'ENoticeDetail',
        query: {
            classification: rowData.classification, // 분류
            noticeTitle: rowData.title, 
            noticeContent: rowData.content,
            noticeId: rowData.noticeId,
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
        title: formData.noticeTitle || '',
        tag: formData.tag || '',
        memberId: formData.noticeWriter || '',
        classification: formData.classification || '',
        startDate: formData.NoticeSearchDate_start || null,
        endDate: formData.NoticeSearchDate_end || null,
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
            tag: searchParams.value.tag || '',
            memberId: searchParams.value.memberId || '',
            classification: searchParams.value.classification || '',
            startDate: searchParams.value.startDate || '',
            endDate: searchParams.value.endDate || '',
        };
        if(params.title!=''){
            params.title='&title='+params.title;
        }
        if(params.tag!=''){
            params.tag='&tag='+params.tag;
        }
        if(params.memberId!=''){
            params.memberId='&memberId='+params.memberId;
        }
        if(params.classification!=''){
            params.classification='&classification='+params.classification;
        }
        if(params.startDate==null){
            params.startDate=''
            console.log(params.startDate);
        }
        else if(params.startDate!=''){
            params.startDate='&startDate='+params.startDate+'%2000%3A00%3A00';
            console.log(params.startDate);
        }
        if(params.endDate==null){
            params.endDate=''
            console.log(params.endDate);
        }
        else if(params.endDate!=''){
            params.endDate='&endDate='+params.endDate+'%2000%3A00%3A00';
            console.log(params.endDate);
        }
        console.log("test");
        const response = await $api.notice.getParams('',`?page=${params.page}&size=${params.size}${params.title}${params.tag}${params.memberId}${params.classification}${params.startDate}${params.endDate}`);
        console.log(`?page=${params.page}&size=${params.size}${params.title}${params.tag}${params.memberId}${params.classification}${params.startDate}${params.endDate}`);
        tableData.value = response.content || [];
        totalRecords.value = response.totalElements || 0;
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>


<style scoped>
.list{
    font-size: 1.2rem;
    font-weight:bold;
}
.search-wrapper {
    display: flex;
    flex-direction: column;
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