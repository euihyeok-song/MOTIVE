<template>
    <div v-if="alarm" class="alarm-detail-container">
        <div class="alarm-detail-header">
            <div class="member-info">
                <img v-if="admin.profileImageUrl" :src="admin.profileImageUrl" alt="Profile" class="profile-image" />
                <span class="member-name">{{ admin.name || "이름 없음" }} </span>
                <span class="member-position">{{ admin.position || "직책 없음" }}</span>
            </div>
            <p class="created-at">{{ formatDate(alarm.createdAt) }}</p>
        </div>

        <div class="alarm-detail-content">

            <!-- 태그별 조건부 상세 정보 렌더링 -->
            <div v-if="detailInfo" class="additional-details">
                <!-- 미팅/회의/휴가/교육 -->
                <template v-if="alarm.type == 'SCHEDULE'">
                    <div class="detail-grid">
                        <table>
                            <thead>
                                <tr>
                                    <th>항목</th>
                                    <th>내용</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="detailInfo?.result.name">
                                    <td class="left-column">제목</td>
                                    <td>
                                        {{ detailInfo.result.name }}
                                    </td>
                                </tr>
                                <tr v-if="alarm.tag">
                                    <td class="left-column">태그</td>
                                    <td>
                                        <span class="tag" :style="{ backgroundColor: getTagColor(tagMapping(alarm.tag)) }">
                                            {{ tagMapping(alarm.tag) }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="member.name && member.position">
                                    <td class="left-column">등록자</td>
                                    <td>{{ member.name }} {{ member.position }} </td>
                                </tr>
                                <tr v-if="detailInfo?.result.startAt">
                                    <td class="left-column">시작일자</td>
                                    <td>{{ detailInfo.result.startAt }}</td>
                                </tr>
                                <tr v-if="detailInfo?.result.endAt">
                                    <td class="left-column">종료일자</td>
                                    <td>{{ detailInfo.result.endAt }}</td>
                                </tr>
                                <tr v-if="detailInfo?.result.content">
                                    <td class="left-column">내용</td>
                                    <td class="content-cell">{{ detailInfo.result.content }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </template>

                <!-- 공지사항 -->
                <template v-else-if="alarm.type == 'NOTICE'">
                    <div class="detail-grid">
                        <table>
                            <thead>
                                <tr>
                                    <th>항목</th>
                                    <th>내용</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="detailInfo.title">
                                    <td class="left-column">제목</td>
                                    <td>
                                        {{ detailInfo.title }}
                                    </td>
                                </tr>
                                <tr v-if="alarm.tag">
                                    <td class="left-column">분류</td>
                                    <td>
                                        <span class="tag" :style="{ backgroundColor: getTagColor(tagMapping(alarm.tag)) }">
                                            {{ tagMapping(alarm.tag) }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="admin.name && admin.position">
                                    <td class="left-column">등록자</td>
                                    <td>{{ admin.name }} {{ admin.position }} </td>
                                </tr>
                                <tr v-if="detailInfo.content">
                                    <td class="left-column">내용</td>
                                    <td class="content-cell">{{ truncateContent(detailInfo.content) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>

                <!-- 계약서 -->
                <template v-else-if="alarm.tag === '계약서'">
                    <div class="detail-grid">
                        <table>
                            <thead>
                                <tr>
                                    <th>항목</th>
                                    <th>내용</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="detailInfo?.result.title">
                                    <td class="left-column">제목</td>
                                    <td>{{ detailInfo.result.title }}</td>
                                </tr>
                                <tr v-if="alarm.tag">
                                    <td class="left-column">태그</td>
                                    <td>
                                        <span class="tag" :style="{ backgroundColor: getTagColor(alarm.tag) }">
                                            {{ alarm.tag }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="detailInfo?.result.customerName">
                                    <td class="left-column">고객명</td>
                                    <td>{{ detailInfo.result.customerName }}</td>
                                </tr>
                                <tr v-if="detailInfo?.result.customerPurchaseCondition">
                                    <td class="left-column">결제방식</td>
                                    <td>{{ detailInfo.result.customerPurchaseCondition }}</td>
                                </tr>
                                <tr v-if="member.name && member.position">
                                    <td class="left-column">계약자</td>
                                    <td>{{ member.name }} {{ member.position }}</td>
                                </tr>
                                <tr v-if="admin.name && admin.position">
                                    <td class="left-column">승인자</td>
                                    <td>{{ admin.name }} {{ admin.position }}</td>
                                </tr>
                                <tr v-if="detailInfo.result.status">
                                    <td class="left-column">승인 상태</td>
                                    <td>
                                        <span class="tag"
                                            :style="{ backgroundColor: getTagColor(tagMapping(detailInfo.result.status)) }">
                                            {{ tagMapping(detailInfo.result.status) }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="detailInfo?.result.createdAt">
                                    <td class="left-column">계약날짜</td>
                                    <td>{{ formatDate(detailInfo.result.createdAt) }}</td>
                                </tr>
                                <tr v-if="detailInfo?.result.createdUrl">
                                    <td class="left-column">파일</td>
                                    <td>
                                        <a :href="detailInfo.result.createdUrl" download target="_blank"
                                            class="file-link">파일 보기</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>

                <!-- 수주서/발주서 -->
                <template v-if="alarm.tag === '수주서'">
                    <table>
                        <thead>
                            <tr>
                                <th>항목</th>
                                <th>내용</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="detailInfo?.result.title">
                                <td class="left-column">제목</td>
                                <td>{{ detailInfo.result.title }}</td>
                            </tr>
                            <tr v-if="alarm.tag">
                                <td class="left-column">태그</td>
                                <td>
                                    <span class="tag" :style="{ backgroundColor: getTagColor(alarm.tag) }">
                                        {{ alarm.tag }}
                                    </span>
                                </td>
                            </tr>
                            <tr v-if="detailContractInfo?.carName">
                                <td class="left-column">제품명</td>
                                <td>{{ detailContractInfo.carName }}</td>
                            </tr>
                            <tr v-if="member.name && member.position">
                                <td class="left-column">수주자</td>
                                <td>{{ member.name }} {{ member.position }}</td>
                            </tr>
                            <tr v-if="admin.name && admin.position">
                                <td class="left-column">승인자</td>
                                <td>{{ admin.name }} {{ admin.position }}</td>
                            </tr>
                            <tr v-if="detailInfo.result.status">
                                <td class="left-column">승인 상태</td>
                                <td>
                                    <span class="tag"
                                        :style="{ backgroundColor: getTagColor(tagMapping(detailInfo.result.status)) }">
                                        {{ tagMapping(detailInfo.result.status) }}
                                    </span>
                                </td>
                            </tr>
                            <tr v-if="detailInfo?.result.createdAt">
                                <td class="left-column">수주날짜</td>
                                <td>{{ formatDate(detailInfo.result.createdAt) }}</td>
                            </tr>
                            <tr v-if="detailInfo?.result.content">
                                <td class="left-column">파일</td>
                                <td>
                                    <a :href="detailInfo.result.content" download target="_blank"
                                        class="file-link">파일 보기</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </template>

                <!-- 발주서 -->
                <template v-else-if="alarm.tag === '발주서'">
                    <div class="detail-grid">
                        <table>
                            <thead>
                                <tr>
                                    <th>항목</th>
                                    <th>내용</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="detailInfo?.result.title">
                                    <td class="left-column">제목</td>
                                    <td>{{ detailInfo.result.title }}</td>
                                </tr>
                                <tr v-if="alarm.tag">
                                    <td class="left-column">태그</td>
                                    <td>
                                        <span class="tag" :style="{ backgroundColor: getTagColor(alarm.tag) }">
                                            {{ alarm.tag }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="detailContractInfo?.carName">
                                    <td class="left-column">제품명</td>
                                    <td>{{ detailContractInfo.carName }}</td>
                                </tr>
                                <tr v-if="member.name && member.position">
                                    <td class="left-column">발주자</td>
                                    <td>{{ member.name }} {{ member.position }}</td>
                                </tr>
                                <tr v-if="admin.name && admin.position">
                                    <td class="left-column">승인자</td>
                                    <td>{{ admin.name }} {{ admin.position }}</td>
                                </tr>
                                <tr v-if="detailInfo.result.status">
                                    <td class="left-column">승인 상태</td>
                                    <td>
                                        <span class="tag"
                                            :style="{ backgroundColor: getTagColor(tagMapping(detailInfo.result.status)) }">
                                            {{ tagMapping(detailInfo.result.status) }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="detailInfo?.result.createdAt">
                                    <td class="left-column">수주날짜</td>
                                    <td>{{ formatDate(detailInfo.result.createdAt) }}</td>
                                </tr>
                                <tr v-if="detailInfo?.result.content">
                                    <td class="left-column">파일</td>
                                    <td>
                                        <a :href="detailInfo.result.content" download target="_blank"
                                            class="file-link">파일 보기</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>

                <!-- 기타 추가 정보 -->
                <div v-if="alarm.additionalDetails" class="additional-custom-details">
                    <div v-for="(value, key) in alarm.additionalDetails" :key="key" class="detail-item">
                        <strong>{{ formatKey(key) }}:</strong> {{ value }}
                    </div>
                </div>
            </div>

            <!-- <div v-if="alarm.redirectUrl" class="action-buttons">
                <button @click="goToRelatedPage" class="view-details-btn">
                    관련 페이지 보기
                </button>
            </div> -->
        </div>
    </div>
    <div v-else class="no-alarm-selected">
        알림을 선택해주세요.
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import ApiService from '@/services/api/config/ApiService';
import { useUserStore } from '@/stores/user';

const apiMemberService = new ApiService('api/v1/member');
const apiScheduleService = new ApiService('api/v1/schedule');
const apiNoticeService = new ApiService('api/v1/notice');
const apiContractService = new ApiService('api/v1/contract');
const apiPurchaseOrderService = new ApiService('api/v1/purchase-order');
const apiOrderService = new ApiService('api/v1/order');

const router = useRouter();
const userStore = useUserStore();
const userRole = userStore.auth;

const props = defineProps({
    alarm: {
        type: Object,
        required: true
    }
});

const member = ref({
    name: '',
    profileImageUrl: '',
    position: ''
});

const admin = ref({
    name: '',
    profileImageUrl: '',
    position: ''
});

const tagMapping = (tag) => {
    const tagMap = {
        'MEETING': '미팅',
        'TRAINING': '교육',
        'VACATION': '휴가',
        'SESSION': '회의',
        'NORMAL': '일반',
        'GOAL': '영업 목표',
        'STRATEGY': '영업 전략',
        'APPROVED': '승인',
        "all": '전체',
        "admin": '영업 관리자',
        "director":'영업 담당자',
        "god": '시스템 관리자'
    };

    return tagMap[tag] || tag; // 일치하는 값이 없으면 원래 값 반환
};


const tagColors = [
    { name: '미팅', color: '#AEC6CF' },
    { name: '교육', color: '#FFDAB9' },
    { name: '휴가', color: '#B0E57C' },
    { name: '회의', color: '#FFB7C5' },
    { name: '계약서', color: '#A7D8DE' },
    { name: '발주서', color: '#FFE4E1' },
    { name: '수주서', color: '#B9E4C9' },
    { name: '중요', color: '#FFB3B3' },
    { name: '일반', color: '#E0FFB3' },
    { name: '영업 목표', color: '#D4A5A5' },
    { name: '영업 전략', color: '#A5D4C5' },
    { name: '승인', color: '#B3FFB3' },
    { name: '전체', color: '#D3D3D3' }, 
    { name: '영업 관리자', color: '#FFA07A' }, 
    { name: '영업 담당자', color: '#20B2AA' }, 
    { name: '시스템 관리자', color: '#9370DB' } 
];

const getTagColor = (tag) => {

    const tagData = tagColors.find(item => item.name === tag);
    return tagData ? tagData.color : '#DDD'; // 기본 회색
};

const detailInfo = ref(null);
const detailContractInfo = ref(null);
const detailOrderInfo = ref(null);

const emit = defineEmits(['close', 'closeModal']);

const truncateContent = (htmlContent) => {
    if (!htmlContent) return '';

    // <p> 태그 내의 내용을 추출
    const paragraphMatch = htmlContent.match(/<p[^>]*>(.*?)<\/p>/);
    if (!paragraphMatch || !paragraphMatch[1]) return '';

    let paragraphText = paragraphMatch[1].trim();

    // 70글자 내외로 자르고 초과 시 "..." 추가
    return paragraphText.length > 247
        ? paragraphText.substring(0, 247) + '...'
        : paragraphText;
};

// Member 정보 조회 함수
const fetchMemberInfo = async () => {
    if (props.alarm && props.alarm.adminId) {

        try {
            const memResponse = await apiMemberService.get(
                'memberInfo',
                `${props.alarm.memberId}`,
                ''
            );

            member.value = {
                name: memResponse.result.name || "이름 없음",
                profileImageUrl: memResponse.result.imageUrl || null,
                position: memResponse.result.position || null
            };

            const admResponse = await apiMemberService.get(
                'memberInfo',
                `${props.alarm.adminId}`,
                ''
            );

            admin.value = {
                name: admResponse.result.name || "이름 없음",
                profileImageUrl: admResponse.result.imageUrl || null,
                position: admResponse.result.position || null
            };
        } catch (error) {
            console.error("Failed to fetch member info:", error);
            member.value = { name: '', profileImageUrl: '' };
        }
    } else {
        member.value = { name: '', profileImageUrl: '' };
    }
};

// 스케줄 정보 조회 함수들
const fetchScheduleInfo = async () => {

    const scheduleTypes = ['미팅', '회의', '휴가', '교육'];
    if (scheduleTypes.includes(props.alarm.tag)) {
        try {
            const response = await apiScheduleService.get(
                '',
                `${props.alarm.contentId}`,
                ''
            );
            detailInfo.value = response;
        } catch (error) {
            console.error("Failed to fetch schedule info:", error);
        }

        console.log("response", detailInfo.value);
    } else {
        console.log('잘못된 태그 정보 입니다.');
    }
};

const fetchNoticeInfo = async () => {

    const noticeTypes = ['일반', '영업 전략', '영업 목표'];
    if (noticeTypes.includes(props.alarm.tag)) {
        try {
            const response = await apiNoticeService.get(
                '',
                `${props.alarm.contentId}`,
                ''
            );

            detailInfo.value = response;
        } catch (error) {
            console.error("Failed to fetch notice info:", error);
        }
    } else {
        console.log('잘못된 태그 정보 입니다.');
    }
};

const fetchContractInfo = async () => {

    if (props.alarm.tag === '계약서') {
        if (userRole === "EMPLOYEE") {
            // "영업 사원"일 경우 실행할 코드
            try {
                const response = await apiContractService.get(
                    'employee',
                    `${props.alarm.contentId}`,
                    ''
                );
                detailInfo.value = response;
            } catch (error) {
                console.error("Failed to fetch contract info for 영업 사원:", error);
            }
        } else if (userRole === "ADMIN") {
            // "영업 담당자"일 경우 실행할 코드
            try {
                const response = await apiContractService.get(
                    'center',
                    `${props.alarm.contentId}`,
                    ''
                );
                detailInfo.value = response;
            } catch (error) {
                console.error("Failed to fetch contract info for 영업 관리자:", error);
            }
        } else if (userRole === "DIRECTOR") {
            // "시스템 관리자"일 경우 실행할 코드
            try {
                const response = await apiContractService.get(
                    '',
                    `${props.alarm.contentId}`,
                    ''
                );
                detailInfo.value = response;
            } catch (error) {
                console.error("Failed to fetch contract info for 영업 담당자:", error);
            }
        } else if (userRole === "GOD") {
            // "시스템 관리자"일 경우 실행할 코드
            try {
                const response = await apiContractService.get(
                    '',
                    `${props.alarm.contentId}`,
                    ''
                );
                detailInfo.value = response;
            } catch (error) {
                console.error("Failed to fetch contract info for 시스템 관리자:", error);
            }
        } else {
            console.log('계약정보를 가져오지 못했습니다.');
        }

        console.log("response", detailInfo.value);
    } else {
        console.log('잘못된 태그 정보 입니다.');
    }
};


const fetchPurchaseOrderInfo = async () => {

    if (props.alarm.tag === '발주서') {
        if (userRole === "ADMIN") {
            // "영업 담당자"일 경우 실행할 코드
            try {
                const response = await apiPurchaseOrderService.get(
                    'admin',
                    `${props.alarm.contentId}`,
                    ''
                );
                detailInfo.value = response;
            } catch (error) {
                console.error("Failed to fetch contract info for 영업 관리자:", error);
            }
        } else if (userRole === "DIRECTOR") {
            // "시스템 관리자"일 경우 실행할 코드
            try {
                const response = await apiPurchaseOrderService.get(
                    '',
                    `${props.alarm.contentId}`,
                    ''
                );
                detailInfo.value = response;
            } catch (error) {
                console.error("Failed to fetch contract info for 영업 담당자:", error);
            }
        } else if (userRole === "GOD") {
            // "시스템 관리자"일 경우 실행할 코드
            try {
                const response = await apiPurchaseOrderService.get(
                    '',
                    `${props.alarm.contentId}`,
                    ''
                );
                detailInfo.value = response;
            } catch (error) {
                console.error("Failed to fetch contract info for 시스템 관리자:", error);
            }
        } else {
            console.log('계약정보를 가져오지 못했습니다.');
        }

        console.log("res", detailInfo.value);

        // 수주서 정보 가져오기 (제품 추출을 위함)
        if (detailInfo.value.result.orderId) {
            const orderResponse = await apiOrderService.get(
                '',
                `${detailInfo.value.result.orderId}`,
                ''
            );
            detailOrderInfo.value = orderResponse.result;
        }

        // 계약서 정보 가져오기 (제품 추출을 위함)
        if (detailOrderInfo.value.contractId) {
            const contractResponse = await apiContractService.get(
                '',
                `${detailOrderInfo.value.contractId}`,
                ''
            );
            detailContractInfo.value = contractResponse.result;
        }
    } else {
        console.log('잘못된 태그 정보 입니다.');
    }
};

const fetchOrderInfo = async () => {

    if (props.alarm.tag === '수주서') {
        if (userRole === "EMPLOYEE") {
            // "영업 사원"일 경우 실행할 코드
            try {
                const response = await apiOrderService.get(
                    'employee',
                    `${props.alarm.contentId}`,
                    ''
                );
                detailInfo.value = response;
            } catch (error) {
                console.error("Failed to fetch contract info for 영업 사원:", error);
            }
        } else if (userRole === "ADMIN") {
            // "영업 담당자"일 경우 실행할 코드
            try {
                const response = await apiOrderService.get(
                    '',
                    `${props.alarm.contentId}`,
                    ''
                );
                detailInfo.value = response;
            } catch (error) {
                console.error("Failed to fetch contract info for 영업 관리자:", error);
            }
        } else if (userRole === "DIRECTOR") {
            // "시스템 관리자"일 경우 실행할 코드
            try {
                const response = await apiOrderService.get(
                    '',
                    `${props.alarm.contentId}`,
                    ''
                );
                detailInfo.value = response;
            } catch (error) {
                console.error("Failed to fetch contract info for 영업 담당자:", error);
            }
        } else if (userRole === "GOD") {
            // "시스템 관리자"일 경우 실행할 코드
            try {
                const response = await apiOrderService.get(
                    '',
                    `${props.alarm.contentId}`,
                    ''
                );
                detailInfo.value = response;
            } catch (error) {
                console.error("Failed to fetch contract info for 시스템 관리자:", error);
            }
        } else {
            console.log('계약정보를 가져오지 못했습니다.');
        }

        // 계약서 정보 가져오기 (제품 추출을 위함)
        if (detailInfo.value.result.contractId) {
            const contractResponse = await apiContractService.get(
                '',
                `${detailInfo.value.result.contractId}`,
                ''
            );
            detailContractInfo.value = contractResponse.result;
        }

    } else {
        console.log('잘못된 태그 정보 입니다.');
    }
};

// 알림을 클릭할 때마다 조회
watch(() => props.alarm, async (newAlarm) => {

    if (newAlarm) {
        await fetchMemberInfo();

        // 알림 태그에 따라 적절한 정보 조회 함수 호출
        switch (newAlarm.tag) {
            case '미팅':
            case '회의':
            case '휴가':
            case '교육':
                await fetchScheduleInfo();
                break;
            case '일반':
            case '영업 전략':
            case '영업 목표':
                await fetchNoticeInfo();
                break;
            case '계약서':
                await fetchContractInfo();
                break;
            case '수주서':
                await fetchOrderInfo();
                break;
            case '발주서':
                await fetchPurchaseOrderInfo();
                break;
        }
    }
}, { immediate: true });

// 알림 상세 페이지로 이동
const goToRelatedPage = () => {

    if (props.alarm.redirectUrl) {
        router.push(props.alarm.redirectUrl);
        emit('closeModal');
    }
};

// 날짜 포맷터
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 키 포맷터
const formatKey = (key) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, (str) => str.toUpperCase());
};
</script>

<style scoped>
.alarm-detail-container {
    position: fixed;
    background-color: white;
    border-radius: 8px;
    width: 450px;
    height: 480px;
    padding: 1rem;
    margin-left: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    border: 2px solid #ddd;
}

.alarm-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
}

.member-info {
    display: flex;
    align-items: center;
}

.profile-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
}

.member-name {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.alarm-detail-content {
    flex-grow: 1;
}

.message {
    font-size: 18px;
    margin-bottom: 10px;
    line-height: 1.5;
}

.created-at {
    color: #777;
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
}

.additional-details {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 13px;
    padding-top: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    width: 410px;
    height: 340px;
}

.detail-item {
    margin-bottom: 2rem;
}

.detail-contract-item {
    margin-bottom: 1.5rem;
}

.action-buttons {
    display: flex;
    justify-content: flex-start;
}

.view-details-btn {
    background-color: #6360AB;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.view-details-btn:hover {
    background-color: #4a48a2;
}

.no-alarm-selected {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #777;
    font-size: 16px;
}

.title-with-date {
    display: inline-block;
    /* 같은 줄에 배치 */
    white-space: nowrap;
    /* 줄바꿈 방지 */
    justify-content: space-between;
}

.title-with-date .created-at {
    display: inline-block;
    white-space: nowrap;
    font-size: 12px;
    color: #777;
    margin-bottom: 0;
}

.tag {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 0;
    text-align: center;
    /* 텍스트 가로 정렬 */
    line-height: 1.5;
    /* 수직 정렬을 위한 줄 높이 */
    vertical-align: middle;
    width: 3.8rem;
}

.detail-item {
    margin-bottom: 16px;
    font-size: 14px;
    color: #333;
}

.title-with-date {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title-with-date strong {
    color: #555;
}

.created-at {
    font-size: 12px;
    color: #888;
    margin-left: 8px;
}

.content {
    margin-top: 4px;
    color: #444;
    line-height: 1.5;
}

.tag-container {
    display: flex;
    align-items: center;
}

.tag-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 16px;
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    margin-left: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.date {
    font-size: 17px;
    color: #555;
    margin-left: 8px;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

thead th {
    background-color: #f7f7f7;
    text-align: center;
    padding: 8px;
    border: 1px solid #ddd;
    font-size: 13px;
}

tbody td {
    padding: 7px;
    border: 1px solid #ddd;
    font-size: 12px;
    /* 본문 폰트 크기 */
    text-align: center;
    /* 본문 중앙 정렬 */
}

.left-column {
    background-color: #f0f0f0;
    font-weight: bold;
    text-align: center;
    font-size: 12px;
    width: 104.45px;
}

.file-link {
    color: #007bff; /* 기본 파란색 */
    text-decoration: underline; /* 기본 밑줄 */
    transition: color 0.3s ease; /* 부드러운 색상 전환 효과 */
}

.file-link:hover {
    color: #0056b3; /* 마우스 올렸을 때 더 어두운 파란색 */
}

.content-cell {
    height: 120px; 
    vertical-align: top; 
    overflow-y: auto; 
    word-wrap: break-word; 
}

.member-position{
    
    margin-top: 8px;
    margin-left: 6px;
    font-size: 12px;
    color: #888;    
}
</style>