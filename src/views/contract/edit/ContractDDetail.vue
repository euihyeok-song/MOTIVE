<template>
    <Toast />
    <ConfirmDialog></ConfirmDialog>
    <Modal :visible="modelValue" header="계약 상세 조회" width="70rem" height="none" style="z-index: 1000;" @click="onClose">
        <div class="flex-row content-between items-end">
            <div class="flex-row">
                <div class="status-display">
                    <span :class="['status-badge', statusClass]">{{ status }}</span>
                </div>
            </div>

            <div class="flex-row content-end">
                <div>
                    <CommonButton label="인쇄" icon="pi pi-print" @click="printIframeContent" />
                </div>
            </div>
        </div>
        <div id="printMe">
            <!-- iFrame으로 HTML 파일 삽입 -->
            <iframe ref="iframeRef" v-if="details?.createdUrl" :src="details.createdUrl" width="100%" height="552px"
                frameborder="0" style="border: 1px solid #ccc; height: 50rem;">
            </iframe>

            <!-- URL 값 표시 -->
            <div v-else>
                HTML 파일 URL을 불러올 수 없습니다.
            </div>
        </div>

        <template #footer>
            <CommonButton label="닫기" @click="onClose" />
        </template>
    </Modal>

    <EContractModify v-model:visible="showModifyModal" :contract-id="getDetailId" @close="closeModifyModal" />
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import Modal from '@/components/common/Modal.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import { $api } from '@/services/api/api';
import EContractModify from './EContractModify.vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import ConfirmDialog from 'primevue/confirmdialog';

const props = defineProps({
    modelValue: Boolean, // v-model로 바인딩될 값
    details: Object, // 상세 데이터
    status: String, // 상태 레이블
    statusClass: String // 상태 스타일 클래스
});

const emit = defineEmits(['update:modelValue', 'refresh']);

// PrimeVue 훅
const confirm = useConfirm();
const toast = useToast();

// contractId를 저장할 ref 변수
const getDetailId = ref(null);
// 등록 모달 상태 변수
const showModifyModal = ref(false);

// details 값이 변경될 때마다 contractId를 업데이트
watch(
    () => props.details,
    (newDetails) => {
        if (newDetails?.contractId) {
            console.log('Iframe URL:', newDetails.createdUrl);
            getDetailId.value = newDetails.contractId; // contractId를 저장
            getDetailRequest(); // 데이터 요청
        }
    },
    { immediate: true } // 컴포넌트가 처음 마운트될 때도 실행
);

// 모달 닫기
function onClose() {
    emit('update:modelValue', false); // 부모 컴포넌트에 false로 업데이트
}

// GET 요청 함수
const getDetailRequest = async () => {
    if (!getDetailId.value) {
        console.error('contractId가 없습니다.');
        return;
    }

    try {
        const response = await $api.contract.get(
            '', // 엔드포인트 설정
            getDetailId.value // contractId 전달
        );

        console.log('GET DETAIL 요청 응답 결과');
        console.log(response);

        props.details.createdUrl = response.result.createdUrl;
        console.log("Updated details.createdUrl: " + props.details.createdUrl);
    } catch (error) {
        console.error('GET DETAIL 요청 실패: ', error);
    }
};

// iFrame 내용 인쇄
const iframeRef = ref < HTMLIFrameElement | null > (null);

function printIframeContent() {
    if (props.details?.createdUrl) {
        // 새 창 열기
        const printWindow = window.open(props.details.createdUrl, '_blank');

        if (printWindow) {
            // onload 이벤트 등록
            printWindow.onload = () => {
                try {
                    printWindow.focus(); // 새 창에 포커스 설정
                    printWindow.print(); // 바로 인쇄 창 띄우기
                } catch (error) {
                    console.error('인쇄 창 호출 중 오류 발생:', error);
                }
            };
        } else {
            console.error('새 창을 열 수 없습니다. 팝업 차단을 확인하세요.');
        }
    } else {
        console.error('details.createdUrl이 설정되지 않았습니다.');
    }
}

// 수정 버튼 클릭 시 모달 열기
function openModifyModal() {
    showModifyModal.value = true;
}

// 모달 닫기
function closeModifyModal() {
    showModifyModal.value = false;
}

// 삭제 버튼 클릭 시 확인 다이얼로그 호출
function deleteModal() {
    confirm.require({
        message: '이 계약서를 삭제하시겠습니까?',
        header: '삭제 확인',
        icon: 'pi pi-exclamation-circle',
        rejectLabel: '취소',
        acceptLabel: '삭제',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-help',
        accept: async () => {
            try {
                if (!getDetailId.value) {
                    throw new Error("contractId가 없습니다.");
                }

                await $api.contract.delete(getDetailId.value);
                toast.add({ severity: 'success', summary: '성공', detail: '계약서가 삭제되었습니다.', life: 3000 });
                emit('refresh');
                emit('update:modelValue', false); // 모달 닫기
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

</script>

<style scoped>
/* 상태변경 모달이 상세조회 모달 위로 보이도록 설정 */
.status-modal {
    z-index: 1050;
    /* 상태 변경 모달이 상세 조회 모달 위로 뜨게 설정 */
}

h3 {
    margin-bottom: 1rem;
}

iframe {
    display: block;
    margin-top: 1rem;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    color: white;
}

.status-badge.success {
    background-color: #caf1d8;
    color: #188a42;
}

.status-badge.warning {
    background-color: #feddc7;
    color: #ae510f;
}

.status-badge.danger {
    background-color: #ffd0ce;
    color: #b32b23;
}

.status-badge.info {
    background-color: #d0e1fd;
    color: #295bac;
}

.custom-button {
    margin-left: 8px;
    padding: 4px 12px;
    background-color: #FFF;
    color: #6360AB;
    border: 1px solid #6360AB;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

.custom-button:hover {
    background-color: #F1F1FD;
}

.status-content {
    display: flex;
    flex-direction: column;
    align-items: center; /* 수평 중앙 정렬 */
    justify-content: center; /* 수직 중앙 정렬 */
    text-align: center; /* 텍스트 중앙 정렬 */
    gap: 1.5rem; /* 요소 간격 */
    margin-bottom: 1rem;
}

/* 현재 상태 스타일 */
.current-status {
    font-size: 18px; /* 텍스트 크기 증가 */
    margin-bottom: 1.5rem;
}

/* 강조 표시 */
.status-highlight {
    color: #6360ab;
    font-weight: bold;
    font-size: 18px; /* 강조된 텍스트 크기 증가 */
}

/* 라디오 버튼 옵션 정렬 */
.status-options {
    display: flex;
    flex-direction: column;
    align-items: center; /* 옵션 중앙 정렬 */
    gap: 15px; /* 옵션 간격 확대 */
    font-size: 16px; /* 라벨 크기 증가 */
}

/* 라디오 버튼 스타일 */
.status-options input[type="radio"] {
    transform: scale(1.5); /* 버튼 크기 확대 */
    margin-right: 10px; /* 버튼과 라벨 간 간격 */
}

/* 라벨 스타일 */
.status-options label {
    cursor: pointer;
    font-size: 18px; /* 라벨 폰트 크기 증가 */
}

/* 주요 버튼 스타일 */
.primary-button {
    background-color: #6360ab;
    color: white;
    border: none;
    margin-right: 10px;
}

/* 보조 버튼 스타일 */
.secondary-button {
    background-color: #f1f1fd;
    color: #6360ab;
}
</style>