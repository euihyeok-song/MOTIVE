<template>
    <PageLayout>
        <!-- 기초 정보 -->
        <div>
            <div class="section-title">
                <div class="section-text">기초 정보</div>
            </div>

            <div class="infomation">
                <!-- 사용자 이미지 -->
                <div class="user-image-container">
                    <img v-if="memberInfo.imageUrl" :src="memberInfo.imageUrl" alt="User Profile"
                        class="user-profile-image" />
                    <div v-else class="user-image-container">
                        <i class="user-profile-image" @click="goMypage"></i>
                    </div>
                </div>
                <div class="memberInfo">
                    <div class="row" v-for="(item, index) in memberInfo.details" :key="index">
                        <div class="label">{{ item.firstLabel }}</div>
                        <div class="value">{{ item.firstValue }}</div>
                        <div class="label">{{ item.secondLabel }}</div>
                        <div class="value">{{ item.secondValue }}</div>
                        <div class="label">{{ item.thirdLabel }}</div>
                        <div class="value">{{ item.thirdValue }}</div>
                    </div>

                </div>
            </div>
        </div>


        <!-- 학력 정보 -->
        <div class="section">
            <div class="subtitle">
                <div class="line"></div>
                <div class="subtitle-text">
                    학력 사항
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th v-for="header in educationHeaders" :key="header.field" :style="{ width: header.width }">{{ header.label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in educationData" :key="index">
                        <td v-for="header in educationHeaders" :key="header.field">{{ row[header.field] }}</td>
                    </tr>
                </tbody>
            </table>

        </div>

        <!-- 외국어/자격증 정보 -->
        <div class="section">
            <div class="subtitle">
                <div class="line"></div>
                <div class="subtitle-text">
                    외국어/자격증 정보
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th v-for="header in certificationHeaders" :key="header.field" :style="{ width: header.width }">{{ header.label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in certificationData" :key="index">
                        <td v-for="header in certificationHeaders" :key="header.field">{{ row[header.field] }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 경력 정보 -->
        <div class="section">
            <div class="subtitle">
                <div class="line"></div>
                <div class="subtitle-text">
                    경력 정보
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th v-for="header in careerHeaders" :key="header.field" :style="{ width: header.width }">{{ header.label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in careerData" :key="index">
                        <td v-for="header in careerHeaders" :key="header.field">{{ row[header.field] }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 가족 구성원 -->
        <div class="section">
            <div class="subtitle">
                <div class="line"></div>
                <div class="subtitle-text">
                    가족 구성원
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th v-for="header in familyHeaders" :key="header.field" :style="{ width: header.width }">{{ header.label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in familyData" :key="index">
                        <td v-for="header in familyHeaders" :key="header.field">{{ row[header.field] }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </PageLayout>
</template>

<script setup>
import PageLayout from '@/components/common/layouts/PageLayout.vue';
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { $api } from '@/services/api/api';

const route = useRoute();
const employeeId = ref(route.query.employeeId);

// 기본 정보
const memberInfo = ref([]);

// 학력 정보
const educationHeaders = [
    { field: 'entranceDate', label: '입학일', width: '15%' },
    { field: 'graduationDate', label: '졸업일', width: '15%' },
    { field: 'name', label: '학력', width: '20%' },
    { field: 'major', label: '전공', width: '20%' },
    { field: 'score', label: '점수', width: '15%' },
    { field: 'note', label: '비고', width: '15%' }
];
const educationData = ref([]);

// 자격증/외국어 정보
const certificationHeaders = [
    { field: 'acquisitionDate', label: '취득 날짜', width: '20%' },
    { field: 'agency', label: '시행기관', width: '20%' },
    { field: 'name', label: '자격증/외국어', width: '25%' },
    { field: 'score', label: '등급', width: '20%' },
    { field: 'note', label: '비고', width: '15%' }
];
const certificationData = ref([]);

// 경력 정보
const careerHeaders = [
    { field: 'emplDate', label: '입사일', width: '25%' },
    { field: 'resignDate', label: '퇴사일', width: '25%' },
    { field: 'name', label: '경력 정보', width: '35%' },
    { field: 'note', label: '비고', width: '15%' }
];
const careerData = ref([]);

// 가족 구성원
const familyHeaders = [
    { field: 'relation', label: '관계', width: '10%' },
    { field: 'name', label: '이름', width: '10%' },
    { field: 'birth', label: '생년월일', width: '15%' },
    { field: 'identNo', label: '주민등록번호', width: '15%' },
    { field: 'phone', label: '연락처', width: '15%' },
    { field: 'sex', label: '성별', width: '10%' },
    { field: 'disability', label: '장애인 여부', width: '10%' },
    { field: 'die', label: '사망 여부', width: '10%' },
    { field: 'note', label: '비고', width: '5%' }
];
const familyData = ref([]);

// 기본 정보
const getMemberInfo = async () => {
    try {
        const response = await $api.member.get('info', employeeId.value);
        const result = response.result;

        memberInfo.value = {
            imageUrl: result.imageUrl, // 이미지 URL 추가
            details: [
                {
                    firstLabel: '사원번호', firstValue: result.loginId || 'N/A',
                    secondLabel: '성명', secondValue: result.name || 'N/A',
                    thirdLabel: '주민등록번호', thirdValue: result.identNo.substring(0, 8)+'******' || 'N/A'
                },
                {
                    firstLabel: '이메일', firstValue: result.email || 'N/A',
                    secondLabel: '휴대전화', secondValue: result.phone || 'N/A',
                    thirdLabel: '성별', thirdValue: result.sex === 'MALE' ? '남성' : '여성'
                },
                {
                    firstLabel: '입사일', firstValue: result.createdAt.substring(0, 10) || 'N/A', // 입사일 정보 없음
                    secondLabel: '발령일', secondValue: result.updatedAt.substring(0, 10) || 'N/A', // 발령일 정보 없음
                    thirdLabel: '병역구분',
                    thirdValue: result.military === "FULFILLED"
                                                ? "군필"
                                                    : result.military === "EXEMPTION"
                                                ? "면제"
                                                    : result.military === "UNFULFILLED"
                                                ? "미필"
                                                    : "N/A"
                },
                {
                    firstLabel: '비상연락처', firstValue: result.emergePhone || 'N/A',
                    secondLabel: '직위',
                    secondValue: result.position === "INTERN" 
                                                        ? "인턴"
                                                    : result.position === "STAFF"
                                                        ? "사원"
                                                    : result.position === "ASSISTANT"
                                                        ? "대리"
                                                    : result.position === "MANAGER"
                                                        ? "과장"
                                                    : result.position === "SENIOR"
                                                        ? "차장"
                                                    : result.position === "EXECUTIVE"
                                                        ? "부장"
                                                    : result.position === "DIRECTOR"
                                                        ? "임원"
                                                    : result.position === "CEO"
                                                        ? "대표이사"
                                                    : "N/A",
                    thirdLabel: '학력구분',
                    thirdValue: result.grade === "High School"
                                                ? "고졸"
                                                    : result.grade === "Associate"
                                                ? "2년제"
                                                    : result.grade === "Bachelor"
                                                ? "4년제"
                                                    : result.grade === "Master"
                                                ? "석사"
                                                    : result.grade === "Doctoral"
                                                ? "박사"
                                                    : "N/A"
                },
                {
                    firstLabel: '은행명', firstValue: result.bankName || 'N/A',
                    secondLabel: '계좌번호', secondValue: result.account || 'N/A',
                    thirdLabel: '주소', thirdValue: result.address || 'N/A'
                },
                {
                    firstLabel: '고용형태', firstValue: result.jobType === 'REGULAR' ? '정규직' : '비정규직',
                    secondLabel: '비고', secondValue: result.note || '-'
                },
            ]
        };
    } catch (error) {
        console.error('GET 요청 실패: ', error);
    }
};

// 학력 정보 API 호출
const getEducationData = async () => {
    try {
        const response = await $api.education.get('other', employeeId.value);
        const result = response.result;

        educationData.value = result.map((edu) => ({
            entranceDate: edu.entranceDate || 'N/A',
            graduationDate: edu.graduationDate || 'N/A',
            name: edu.name || 'N/A',
            major: edu.major || 'N/A',
            score: edu.score || 'N/A',
            note: edu.note || '-',
        }));
    } catch (error) {
        console.error('학력 정보 요청 실패: ', error);
    }
};

// 자격증/외국어 정보 API 호출
const getCertificationData = async () => {
    try {
        const response = await $api.certification.get('other', employeeId.value);
        const result = response.result;

        certificationData.value = result.map((cert) => ({
            acquisitionDate: cert.acquisitionDate || 'N/A',
            agency: cert.agency || 'N/A',
            name: cert.name || 'N/A',
            score: cert.score || 'N/A',
            note: cert.note || '-',
        }));
    } catch (error) {
        console.error('자격증/외국어 정보 요청 실패: ', error);
    }
};

const getCareerData = async () => {
    try {
        const response = await $api.career.get('other', employeeId.value);
        const result = response.result;

        careerData.value = result.map((career) => ({
            emplDate: career.emplDate || 'N/A',
            resignDate: career.resignDate || 'N/A',
            name: career.name || 'N/A',
            note: career.note || '-',
        }));
    } catch (error) {
        console.error('경력 정보 요청 실패:', error);
    }
};

const getFamilyData = async () => {
    try {
        const response = await $api.family.get('other', employeeId.value);
        const result = response.result;

        familyData.value = result.map((family) => ({
            relation: family.relation || 'N/A',
            name: family.name || 'N/A',
            birth: family.birth || 'N/A',
            identNo: family.identNo.substring(0, 8) + '******' || 'N/A',
            phone: family.phone || 'N/A',
            sex: family.sex === 'MALE' ? '남성' : '여성',
            disability: family.disability ? 'O' : 'X',
            die: family.die ? 'O' : 'X',
            note: family.note || '-',
        }));
    } catch (error) {
        console.error('가족 구성원 정보 요청 실패:', error);
    }
};

// watch로 query 변경 감지
watch(
    () => route.query.employeeId,
    (newEmployeeId) => {
        employeeId.value = newEmployeeId;
        getMemberInfo();
        getEducationData();
        getCertificationData();
        getCareerData();
        getFamilyData();
    }
);

onMounted(() => {
    getMemberInfo();
    getEducationData();
    getCertificationData();
    getCareerData();
    getFamilyData();
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
    margin-bottom: 24px;
}

.subtitle {
    display: flex;
    align-items: center;
    /* 수직 중앙 정렬 */
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

.infomation {
    display: flex;
    flex-wrap: wrap; /* 화면 크기에 따라 자동 줄바꿈 */
    gap: 20px; /* 이미지와 정보 사이 간격 */
    align-items: center; /* 수직 정렬 */
    justify-content: flex-start; /* 좌측 정렬 */
    padding: 20px; /* 내부 여백 */
    border: 1px solid #a3a3a3; /* 외곽선 추가 */
    border-radius: 8px; /* 모서리 둥글게 */
    background-color: #fdfdfd; /* 배경색 추가 */
    margin-bottom: 24px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 사용자 이미지 컨테이너 */
.user-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px; /* 이미지 컨테이너 고정 너비 */
    height: 120px; /* 이미지 컨테이너 고정 높이 */
    flex-shrink: 0; /* 컨테이너 크기 고정 */
}

/* 사용자 프로필 이미지 */
.user-profile-image {
    width: 100px;
    height: 100px;
    border-radius: 50%; /* 원형 이미지 */
    object-fit: cover; /* 이미지 크기에 맞게 잘라내기 */
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
}

.memberInfo {
    flex: 1; /* 남은 공간을 채우도록 설정 */
    display: flex;
    flex-direction: column; /* 세로 정렬 */
    gap: 10px; /* 행 사이 간격 */
    margin-top: 10px;
    margin-bottom: 10px;
}

.row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 35px;   /* 각 행의 높이를 고정 */
    border-bottom: 0.5px solid #EEEEEE;   /* 행 간의 구분선을 적용 */
    border-top: 0.5px solid #EEEEEE;   /* 행 간의 구분선을 적용 */
}

.label,
.value {
    border-right: 1px solid #EEEEEE;    /* 좌우 구분선 추가 */
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
    color: #545454;
    background: #F8F8F8;
    display: flex;
    justify-content: center;
}

/* 각 value 셀의 스타일 */
.value {
    width: 75%;
    color: #000000;
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
</style>