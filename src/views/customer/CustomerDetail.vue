<template>
    <Toast />
    <ConfirmDialog></ConfirmDialog>
    <PageLayout>
        <!-- 기초 정보 -->
        <div>
            <div class="subtitle">
                <div class="line"></div>
                <div class="subtitle-text">
                    고객 정보
                </div>
            </div>
        </div>

        <div class="customer-info">
            <div class="row" v-for="(item, index) in customerInfo" :key="index">
                <div class="label">{{ item.firstLabel }}</div>
                <div class="value">{{ item.firstValue }}</div>
                <div class="label">{{ item.secondLabel }}</div>
                <div class="value">{{ item.secondValue }}</div>
                <div class="label">{{ item.thirdLabel }}</div>
                <div class="value">{{ item.thirdValue }}</div>
            </div>

            <div class="flex-row items-center mb-s content-end btn">
                <div class="ml-xs">
                    <CommonButton label="삭제" @click="goDelete" />
                </div>
                <div class="ml-xs">
                    <CommonButton label="수정" @click="goModify" />
                </div>
                <div class="ml-xs">
                    <CommonButton label="목록" color="#F1F1FD" textColor="#6360AB" @click="goList" />
                </div>
            </div>
        </div>



        <!-- 계약 정보 -->
        <div class="section">
            <div class="subtitle">
                <div class="line"></div>
                <div class="subtitle-text">
                    계약서
                </div>
            </div>

            <div class="component-wrapper">
                <ViewTable :headers="tableHeaders" :data="tableData" :loading="loading" :totalRecords="totalRecords"
                    :rows="rows" :rowsPerPageOptions="[5, 10, 20, 50]" :selectable="true"
                    :selection.sync="selectedItems" :buttonAction="handleView"
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

            <Modal v-model="showModifyModal" width="40rem" height="none" header="고객정보 수정">
                <div class="modal-content">
                    <div class="form-row" v-for="(item, index) in modifyInfo" :key="index">

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
                                <input v-if="item.firstEditable" type="text" v-model="item.firstValue"
                                    class="form-input" :placeholder="`${item.firstLabel}을(를) 입력하세요`" />
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

                    <div class="modal-actions">
                        <CommonButton label="저장" class="btn-save" @click="modifyModalBtn" />
                        <CommonButton label="취소" class="btn-cancel" @click="closemodifyModal" />
                    </div>
                </div>
            </Modal>
        </div>



    </PageLayout>
</template>

<script setup>
import PageLayout from '@/components/common/layouts/PageLayout.vue';
import ViewTable from '@/components/common/NListTable.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import Modal from '@/components/common/Modal.vue';
import { ref, onMounted } from 'vue';
import { $api } from '@/services/api/api';
import { useRoute, useRouter } from 'vue-router';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import ConfirmDialog from 'primevue/confirmdialog';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// 현재 페이지 고객
const customerId = route.query.customerId;

// 수정 모달 열/닫
const showModifyModal = ref(false);

// 수정 정보
const modifyInfo = ref([]);

// 기본 정보
const customerInfo = ref([]);

// 계약 헤더
const tableHeaders = [
    { field: 'contractId', label: '계약 번호', width: '15%' },
    { field: 'centerName', label: '매장', width: '20%' },
    { field: 'contractCarName', label: '모델명', width: '20%' },
    { field: 'contractTTL', label: '계약명', width: '20%' },
    { field: 'contractTotalSale', label: '계약금', width: '15%' },
    { field: 'status', label: '계약상태', width: '10%' }
];

const tableData = ref([]); // 테이블 데이터
const selectedItems = ref([]);
const totalRecords = ref(0); // 전체 데이터 개수
const loading = ref(false); // 로딩 상태
const rows = ref(10); // 페이지 당 행 수
const first = ref(0); // 첫 번째 행 위치
const sortField = ref(null); // 정렬 필드
const sortOrder = ref(null); // 정렬 순서

const confirm = useConfirm();

function goDelete() {
    confirm.require({
        message: '고객을 삭제하시겠습니까?',
        header: '삭제 확인',
        icon: 'pi pi-exclamation-circle',
        rejectLabel: '취소',
        acceptLabel: '삭제',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-help',
        accept: async () => {
            try {
                // 고객 id 있는지 체크
                if (!customerId) {
                    throw new Error("customerId가 없습니다.");
                }

                await $api.customer.delete(customerId);
                toast.add({ severity: 'success', summary: '성공', detail: '계약서가 삭제되었습니다.', life: 3000 });

                router.push('/customer/list'); // 고객 목록으로 이동
            } catch (error) {
                console.error('삭제 요청 실패:', error);
                toast.add({ severity: 'error', summary: '실패', detail: '삭제에 실패했습니다. 다시 시도해주세요.', life: 3000 });
            }
        },
        reject: () => {
            toast.add({ severity: 'info', summary: '취소됨', detail: '삭제 작업이 취소되었습니다.', life: 3000 });
        }
    });
}

function goModify() {
    showModifyModal.value = true;
}

function goList() {
    router.push('/customer/list');  // 고객 목록으로 이동
}

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


// 기본 정보
const getCustomerInfo = async () => {
    try {
        const response = await $api.customer.get('', customerId);      // 추후에 수정
        const result = response.result;

        customerInfo.value = [
            {
                firstLabel: '고객번호', firstValue: result.customerId,
                secondLabel: '성명', secondValue: result.name,
                thirdLabel: '나이', thirdValue: result.age
            },
            {
                firstLabel: '성별',
                firstValue: (() => {
                    if (result.sex === 'MALE') return '남성';
                    if (result.sex === 'FEMALE') return '여성';
                    return ''; // 성별 정보가 없을 경우 빈 문자열
                })(),
                secondLabel: '연락처', secondValue: result.phone,
                thirdLabel: '이메일', thirdValue: result.email
            },
            {
                firstLabel: '비상연락처', firstValue: result.emergePhone,
                secondLabel: '', secondValue: '',
                thirdLabel: '', thirdValue: ''
            }
        ];

        modifyInfo.value = [
            {
                firstLabel: '고객명',
                firstValue: result.name || '',
                firstEditable: true,
                secondLabel: '나이',
                secondValue: result.age || '',
            },
            {
                firstLabel: '성별',
                firstValue: (() => {
                    if (result.sex === 'MALE') return '남성';
                    if (result.sex === 'FEMALE') return '여성';
                    return ''; // 성별 정보가 없을 경우 빈 문자열
                })(),
                type: 'radio',
                options: ['남성', '여성'],
                secondLabel: '연락처',
                secondValue: result.phone || '',
                secondEditable: true,
            },
            {
                firstLabel: '비상연락처',
                firstValue: result.emergePhone || '',
                firstEditable: true,
                secondLabel: '이메일',
                secondValue: result.email || '',
                secondEditable: true,
            }
        ];
    } catch (error) {
        console.error('GET 요청 실패: ', error);
    }
};

// 고객 계약 정보 로드
const loadData = async () => {
    try {
        const query = {
            page: Math.floor(first.value / rows.value),
            size: rows.value,
        }

        const queryString = `?${new URLSearchParams(query).toString()}`;

        const response = await $api.customer.getParams(
            'contract/' + customerId + '',                 // 추후에 수정
            queryString
        );

        const result = response?.result;

        if (result && Array.isArray(result.content)) {
            // API 데이터 변환: contractStatus -> status
            tableData.value = result.content.map(item => ({
                ...item,
                status: item.contractState // contractStatus를 status로 매핑
            }));

            totalRecords.value = result.totalElements; // 전체 데이터 수
        } else {
            console.warn("API 응답이 예상한 구조와 다릅니다:", response);
            throw new Error("API 응답 데이터 구조 오류");
        }

        totalRecords.value = response.result.totalElements;
    } catch (error) {
        console.error('고객 계약 정보 요청 실패:', error);
    }
};

function closemodifyModal() {
    showModifyModal.value = false;
}

const modifyModalBtn = async () => {
    try {
        // Construct the payload with the correct field mapping
        const payload = {
            name: modifyInfo.value.find(item => {
                console.log('firstLabel 검사:', item.firstLabel); // 디버깅용 로그
                return item.firstLabel === '고객명';
            })?.firstValue || '',
            age: parseInt(modifyInfo.value.find(item => {
                console.log('secondLabel 검사:', item.secondLabel); // 디버깅용 로그
                return item.secondLabel === '나이';
            })?.secondValue || '0', 10),
            sex: (() => {
                const sexValue = modifyInfo.value.find(item => item.firstLabel === '성별')?.firstValue || '';
                return sexValue === '남성' ? 'MALE' : sexValue === '여성' ? 'FEMALE' : '';
            })(),
            phone: modifyInfo.value.find(item => item.secondLabel === '연락처')?.secondValue || '',
            emergePhone: modifyInfo.value.find(item => item.firstLabel === '비상연락처')?.firstValue || '',
            email: modifyInfo.value.find(item => item.secondLabel === '이메일')?.secondValue || ''
        };


        const phoneItem = modifyInfo.value.find(item => item.secondLabel === '연락처');
        console.log('연락처 항목:', phoneItem);

        // Call your API service
        const response = await $api.customer.put(
            {
                "name": payload.name,
                "age": payload.age,
                "sex": payload.sex,
                "phone": payload.phone,
                "emergePhone": payload.emergePhone,
                "email": payload.email,
            },
            customerId
        );

        showModifyModal.value = false;

        console.log('modoify전');
        await getCustomerInfo(); // 고객 정보를 다시 로드
        await loadData();        // 테이블 데이터를 다시 로드
        console.log('modoify후');


    } catch (error) {
        console.error('Error during API communication:', error);
    }
};

// 상세 조회 메서드
function handleView(rowData) {
    console.log('상세 조회 버튼 클릭됨:', rowData);
    alert(`상세 조회 데이터: ${JSON.stringify(rowData)}`);
}

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


onMounted(() => {
    getCustomerInfo();
    loadData();
});
</script>

<style scoped>
.section {
    margin-bottom: 30px;
    /* 각 섹션 간 간격 */
}

.section-text {
    font-size: 16px;
    font-weight: bold;
    color: #000000;
}

.customer-info {
    margin-top: 20px;
    margin-bottom: 30px;
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

.row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 35px;
    /* 각 행의 높이를 고정 */
    border-bottom: 0.5px solid #EEEEEE;
    /* 행 간의 구분선을 적용 */
    border-top: 0.5px solid #EEEEEE;
    /* 행 간의 구분선을 적용 */
}

.label,
.value {
    border-right: 1px solid #EEEEEE;
    /* 좌우 구분선 추가 */
    font-family: 'Pretendard';
    font-size: 12px;
    line-height: 1.5;
    display: flex;
    align-items: center;
    height: 100%;
    padding: 5px;
    box-sizing: border-box;
}

/* 각 label 셀의 스타일 */
.label {
    width: 25%;
    color: #777777;
    background: #F8F8F8;
    display: flex;
    justify-content: center;
}

/* 각 value 셀의 스타일 */
.value {
    width: 75%;
    color: #000000;
}

.btn {
    margin-top: 16px;
}

table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin-top: 10px;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px 16px;
    text-align: center;
    font-size: 13px;
}

th {
    background-color: #F8F8F8;
    color: #777777;
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
    color: aqua;
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
</style>
