<template>
    <div>
        <table>
            <thead>
                <tr>
                    <th v-for="header in organizationMemberHeader" :key="header">{{ header }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(member, index) in organizationMembers" :key="index">
                    <td>{{ member.loginId }}</td>
                    <td>{{ member.name }}</td>
                    <td>{{ member.position }}</td>
                    <td>{{ member.jobType }}</td>
                    <td>{{ member.createdAt }}</td>
                    <td>
                        <button @click="goProfile(member)" class="custom-button">조회</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import ApiService from '@/services/api/config/ApiService';

const props = defineProps({
    organizationId: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['closeModal']);

const router = useRouter();
const forceReload = ref(false); // forceReload 변수 정의

const goProfile = (member) => {
    router.push({path: '/employee/detail', query: { employeeId: member.loginId}});  
    emit('closeModal');
};

const apiService = new ApiService('api/v1/member/organization');

const organizationMemberHeader = ['사원번호', '성명', '직위', '고용 구분', '발령일', '상세보기'];
const organizationMembers = ref([]);

const getOrganizationMembers = async (member) => {
    try {
        const response = await apiService.get('', props.organizationId);  
        
        const result = response.result;

        // 필요한 데이터만 추출하여 careerData 배열에 저장
        organizationMembers.value = result.map(member => ({
            loginId: member.loginId || 'N/A',
            name: member.name || 'N/A',
            position: member.position === "INTERN" 
                                    ? "인턴"
                                        : member.position === "STAFF"
                                    ? "사원"
                                        : member.position === "ASSISTANT"
                                    ? "대리"
                                        : member.position === "MANAGER"
                                    ? "과장"
                                        : member.position === "SENIOR"
                                    ? "차장"
                                        : member.position === "EXECUTIVE"
                                    ? "부장"
                                        : member.position === "DIRECTOR"
                                    ? "임원"
                                        : member.position === "CEO"
                                    ? "대표이사"
                                        : "N/A",
            jobType: member.jobType === 'REGULAR' ? '정규직' : '비정규직',
            createdAt: member.createdAt.substring(0, 10)
        }));

        console.log(organizationMembers.value);

    } catch (error) {
        console.error('부서 별 사원 요청 실패: ', error);
    }
};

watch(() => props.organizationId, (newId) => {
    getOrganizationMembers(newId);
}, { immediate: true });

onMounted(() => {
    getOrganizationMembers(props.organizationId); 
});
</script>

<style scoped>
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

/* 버튼 스타일 */
.custom-button {
    margin-left: 8px;
    padding: 4px 12px;
    background-color: #FFF;
    color: #777777;
    border: 1px solid #777777;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}
</style>