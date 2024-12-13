<template>
    <Modal 
        :visible="modelValue" 
        header="매장 상세 조회" 
        width="70rem" 
        height="none"
        @click="onClose">
        
        <div class="horizontal-layout">
            <!-- ***이미지 미리보기*** -->
                <FilePreview v-if="imageUrl" :imageUrl="imageUrl" />
                <p v-else>이미지가 없습니다.</p>
            <div class="info-card">
                <div class="row" v-for="(item, index) in centerData" :key="index">
                    <div class="label">{{ item.label }}</div>
                    <div class="value">{{ item.value }}</div>
                    <div class="label">{{ item.secondLabel }}</div>
                    <div class="value">{{ item.secondValue }}</div>
                </div>
            </div>
        </div>



        <div class="table-wrapper width-s ml-l">
            <ViewTable 
                v-if="tableData && tableData.length > 0"
                :headers="tableHeaders" 
                :tableData="tableData" 
            />
        </div>

        <template #footer>
            <CommonButton label="닫기" @click="onClose" />
        </template>
    </Modal>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted } from 'vue';
import Modal from '@/components/common/Modal.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import { $api } from '@/services/api/api';
import ViewTable from '@/components/common/ViewTable.vue';

// *** 파일 미리보기 import ***
import FilePreview from '@/components/common/CFilePreview.vue';

// ViewForm에 전달할 데이터
const centerData = ref([]);
const tableData = ref([]);

// *** 파일 초기화 ***
const imageUrl = ref('');

const props = defineProps({
    modelValue: Boolean, // v-model로 바인딩
    details: Object, // 부모로부터 넘어오는 상세 데이터
});

const emit = defineEmits(['update:modelValue']); // 부모에게 상태 전달

// 로컬 상태로 데이터를 관리
const centerDetails = ref({ ...props.details }); // 초기 데이터를 복사

// Watch: props.details 업데이트 시 API 호출
watch(
    () => props.details,
    (newDetails, oldDetails) => {
        if (newDetails?.centerId && newDetails.centerId !== oldDetails?.centerId) {
            console.log('props.details 업데이트 감지. API 호출:', newDetails.centerId);
            getDetailRequest(newDetails.centerId);
        }
    }
);

const tableHeaders = [
    '이름',
    '이메일',
    '직급'
];

// 모달 닫기
function onClose() {
    console.log('onClose 호출됨');
    emit('update:modelValue', false);
}

// 데이터 요청 (필요 시 호출)
const getDetailRequest = async (centerId) => {
    try {
        const response = await $api.center.get('', centerId);
        centerDetails.value = response.result;

        // *** iamgeUrl 불러오기 ***
        imageUrl.value = centerDetails.value.imageUrl;

        centerData.value = [
            {
                label: '매장 번호',
                value: centerDetails.value.centerId,
                secondLabel: '매장 이름',
                secondValue: centerDetails.value.name,
            },
            {
                label: '매장 주소',
                value: centerDetails.value.address,
                secondLabel: '사원 수',
                secondValue: centerDetails.value.memberCount,
            },
            {
                label: '전화번호',
                value: centerDetails.value.phone,
                secondLabel: '운영 시간',
                secondValue: centerDetails.value.operatingAt,
            },
        ];

        const responseMember = await $api.member.get('', centerId);
        tableData.value = responseMember.result.map((item) => ({
            name: item.name || 'N/A',        // 이름 필드
            email: item.email || 'N/A',     // 이메일 필드
            position: item.position || 'N/A', // 직급 필드
        }));

        console.log('가공된 memberData:', tableData.value);
    } catch (error) {
        console.error('데이터 요청 실패:', error);
    }
};

// 컴포넌트 마운트 시 API 호출
onMounted(() => {
    if (props.details?.centerId) {
        getDetailRequest(props.details.centerId);
    } else {
        console.error('centerId가 유효하지 않습니다.');
    }
});
</script>

<style scoped>
.info-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0px; /* 간격을 없앰 */
    height: none;
    border-top: 1px solid #EEEEEE;
    margin-top: 1rem;
    margin-left: 1.7rem;
    margin-bottom: 2rem;
    margin-right: 1.7rem;
    flex: 1;
}

.row {
    /* position: relative; */
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 35px; /* 각 행의 높이를 고정 */
    border-bottom: 1px solid #EEEEEE; /* 행 간의 구분선을 적용 */
    border-left: 1px solid #EEEEEE;
}

.label, .value {
    border-right: 1px solid #EEEEEE; /* 좌우 구분선 추가 */
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

.horizontal-layout {
    display: flex; /* Flexbox 활성화 */
    align-items: center; /* 수평 중앙 정렬 */
    gap: 16px; /* 이미지와 카드 사이 간격 */
    height: auto; /* 높이를 내용에 맞게 조정 */
    margin-bottom: 1rem;
}

.image-preview {
    flex: 0 0 300px; /* 고정된 크기로 설정 (필요 시 조정 가능) */
    height: 200px; /* 고정된 높이 */
    margin-left: 2rem;
}

</style>
