<template>
    <Toast />
    <ConfirmDialog></ConfirmDialog>
    <Modal :visible="modelValue" header="발주 상세 조회" width="70rem" height="none" style="z-index: 1000;" @click="onClose">
        <div class="flex-row content-between items-end">
            <div class="flex-row">
                <div class="status-display">
                    <span :class="['status-badge', statusClass]">{{ status }}</span>
                </div>
                <div class="ml-xs">
                    <button @click="openStatusModal" class="custom-button">승인/취소</button>
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
            <iframe ref="iframeRef" v-if="details?.content" :src="details.content" width="100%" height="552px"
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

    <Modal v-if="showStatusChangeModal" v-model:visible="showStatusChangeModal" header="발주 승인/취소 처리" width="20rem"
            height="none" style="z-index: 1050;" class="status-modal" @close="closeStatusModal">
            <div class="status-content">
                <p class="current-status">
                    <strong>현재 상태:</strong>
                    <span class="status-highlight ml-xs">{{ status }}</span>
                </p>
                <div class="status-options">
                    <label>
                        <input type="radio" value="WAIT" v-model="newStatus" />
                        대기
                    </label>
                    <label>
                        <input type="radio" value="APPROVED" v-model="newStatus" />
                        승인
                    </label>
                    <label>
                        <input type="radio" value="CANCEL" v-model="newStatus" />
                        취소
                    </label>
                </div>
            </div>
            <template #footer>
                <CommonButton label="확인" @click="confirmStatusChange" />
                <CommonButton label="취소" @click="closeStatusModal" />
            </template>
        </Modal>

    <PuchaseOrderModify v-model:visible="showModifyModal" :purchaseOrder-id="getDetailId" @close="closeModifyModal" />
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import Modal from '@/components/common/Modal.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import { $api } from '@/services/api/api';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import ConfirmDialog from 'primevue/confirmdialog';

const props = defineProps({
    modelValue: Boolean, // v-model로 바인딩될 값
    details: Object, // 상세 데이터
    status: String, // 현재 상태
    statusClass: String, // 상태 표시 스타일
});

const emit = defineEmits(['update:modelValue', 'refresh', 'update-status']);

// PrimeVue 훅
const confirm = useConfirm();
const toast = useToast();

// orderId를 저장할 ref 변수
const getDetailId = ref(null);
// 등록 모달 상태 변수
const showModifyModal = ref(false);
const showStatusChangeModal = ref(false); // 상태 변경 모달 상태
const newStatus = ref(props.status); // 새로운 상태 값

function openStatusModal() {
    showStatusChangeModal.value = true;
}

function closeStatusModal() {
    showStatusChangeModal.value = false;
}

// 상태 변경 확인
const confirmStatusChange = async () => {
    try {
        const response = await $api.purchaseOrder.put(
            {
                status: newStatus.value,
            },
            'status/' + getDetailId.value
        );
        console.log('PUT 요청 응답 결과');
        console.log(getDetailId.value);
        toast.add({
            severity: 'success',
            summary: '성공',
            detail: `상태가 "${newStatus.value}"(으)로 변경되었습니다.`,
            life: 3000,
        });
        emit('refresh');
        closeStatusModal();
        onClose();
    }catch(error){
        console.error('상태 변경 실패:', error);
        toast.add({
            severity: 'error',
            summary: '실패',
            detail: '상태 변경 중 오류가 발생했습니다.',
            life: 3000,
        });
    }
}

// details 값이 변경될 때마다 orderId를 업데이트
watch(
    () => props.details,
    (newDetails) => {
        if (newDetails?.purchaseOrderId) {
            console.log('PurchaseOrderId:', newDetails.purchaseOrderId);
            getDetailId.value = newDetails.purchaseOrderId; // orderId를 저장
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
        console.error('purchaseOrderId가 없습니다.');
        return;
    }

    try {
        const response = await $api.purchaseOrder.get(
            '', // 엔드포인트 설정
            getDetailId.value // contractId 전달
        );

        console.log('GET DETAIL 요청 응답 결과');
        console.log(response);

        props.details.content = response.result.content;
        console.log("Updated details.content: " + props.details.content);
    } catch (error) {
        console.error('GET DETAIL 요청 실패: ', error);
    }
};

// iFrame 내용 인쇄
const iframeRef = ref < HTMLIFrameElement | null > (null);

function printIframeContent() {
    if (props.details?.content) {
        // 새 창 열기
        const printWindow = window.open(props.details.content, '_blank');

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
        console.error('details.content이 설정되지 않았습니다.');
    }
}

// 모달 닫기
function closeModifyModal() {
    showModifyModal.value = false;
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
    align-items: center;
    /* 수평 중앙 정렬 */
    justify-content: center;
    /* 수직 중앙 정렬 */
    text-align: center;
    /* 텍스트 중앙 정렬 */
    gap: 1.5rem;
    /* 요소 간격 */
    margin-bottom: 1rem;
}

/* 현재 상태 스타일 */
.current-status {
    font-size: 18px;
    /* 텍스트 크기 증가 */
    margin-bottom: 1.5rem;
}

/* 강조 표시 */
.status-highlight {
    color: #6360ab;
    font-weight: bold;
    font-size: 18px;
    /* 강조된 텍스트 크기 증가 */
}

/* 라디오 버튼 옵션 정렬 */
.status-options {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* 옵션 중앙 정렬 */
    gap: 15px;
    /* 옵션 간격 확대 */
    font-size: 16px;
    /* 라벨 크기 증가 */
}

/* 라디오 버튼 스타일 */
.status-options input[type="radio"] {
    transform: scale(1.5);
    /* 버튼 크기 확대 */
    margin-right: 10px;
    /* 버튼과 라벨 간 간격 */
}

/* 라벨 스타일 */
.status-options label {
    cursor: pointer;
    font-size: 18px;
    /* 라벨 폰트 크기 증가 */
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
