<template>
    <ConfirmDialog></ConfirmDialog>
    <PageLayout class = "page-layout">
        <div class="header width-s ml-xxxxxl mb-m mt-xl">
            <h2>공지사항 상세 페이지</h2>
        </div>
        <div class="detail-container width-xxxs ml-xxxxl">
            <h2 class="notice-title mb-l ml-xs ">{{ noticeTitle }}</h2>
            <h3 class="notice-content ml-xxxs">
                <div class="notice-content ml-xs content-container">
                    <div v-html="noticeContent"></div>
                </div>
            </h3>

            <!-- 첨부 파일 보여주기 -->
            <div class="bottom-section flex-col items-center width-s ml-l">
                <!-- 첨부 파일 -->
                <div class="file-section mb-xl">
                    <table class="file-table ml-s ">
                        <thead>
                            <tr>
                                <th>첨부파일명</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="noticeImage">
                                <td>
                                    <a :href="noticeImage" target="_blank" class="file-link">첨부파일 다운로드하기</a>
                                </td>
                            </tr>
                            <tr v-else>
                                <td>첨부파일이 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 버튼 -->
                <div class="button-section ">
                    <button class="button back-button" @click="goBack">목록</button>
                    <div class="right-buttons ml-xl">
                        <button class="button delete-button" @click="deleteModal">삭제</button>
                        <button class="button edit-button" @click="navigateToEditPage">수정</button>
                    </div>
                </div>
            </div>
        </div>
    </PageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { $api } from '@/services/api/api';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const emit = defineEmits(['update:modelValue', 'refresh']);

const confirm = useConfirm();

const route = useRoute();
const router = useRouter();

const noticeTitle = route.query.noticeTitle || '';
const noticeContent = route.query.noticeContent || '';
const noticeId = route.query.noticeId || '';
const toast = useToast();
// 첨부파일 조회하기
const noticeImage = ref('');


const goBack = () => {
    router.back();
};

// 첨부파일 조회를 위한 get 메소드
const getNotice = async () => {
  try {
    const response = await $api.notice.get('', noticeId);

    noticeImage.value = response.fileUrl || ''; // fileUrl이 없으면 빈 값
  } catch (error) {
    console.error('조회 중 오류 발생:', error);
    alert('조회에 실패했습니다.');
  }
};




const navigateToEditPage = () => {
    router.push({
        name: 'ENoticeModify',
        query: {
            noticeId,
            noticeTitle,
            noticeContent,
        },
    });
};

onMounted(() => {
    getNotice();
});

function deleteModal() {
    confirm.require({
        message: '이 글을 삭제하시겠습니까?',
        header: '삭제 확인',
        icon: 'pi pi-exclamation-circle',
        rejectLabel: '취소',
        acceptLabel: '삭제',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-help',
        accept: async () => {
            try {
                if (!noticeId) {
                    throw new Error("noticeId가 없습니다.");
                }

                await $api.notice.delete(noticeId);
                toast.add({ severity: 'success', summary: '성공', detail: '글이 삭제되었습니다.', life: 3000 });
                emit('refresh');
                emit('update:modelValue', false); // 모달 닫기
                goBack();
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
.bottom-section {
    position: static; /* Fixed 제거 */
    margin-top: 2rem; /* Content 아래에 여유 공간 추가 */
    width: 100%; /* 부모 컨테이너에 맞춤 */
    background-color: #fff;
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}


.page-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
}

.description {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: #666;
}

.file-section {
    width: 94%;
    margin-right:12.5rem
}

.file-table {    
    width: 100%;
    border-collapse: collapse;
    font-size: 1rem;
    text-align: left;
}

.file-table thead th {
    background-color: #f5f5f5;
    padding: 0.8rem;
    border-bottom: 2px solid #ddd;
}

.file-table tbody td {
    padding: 0.8rem;
    border-bottom: 1px solid #ddd;
}

.button-section {
    display: flex;
    justify-content: space-between; /* 양쪽 정렬 */
    align-items: center;
    width: 100%; /* 부모 컨테이너의 너비에 맞춤 */
    margin-top: 1rem;
    margin-right:13.8rem;
}

.right-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.back-button {
    position: relative;
    left: 50%;
    right: 50%;
    background-color: #6360AB;
    color: #FFFFFF;

}

.delete-button {
    background-color: #F1F1FD;
    color: #6360AB;
}

.edit-button {
    background-color: #6360AB;
    color: #FFFFFF;
}

.content-container {
    max-width: 50rem;
    overflow: auto;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    font-size: 1rem;
    line-height: 1.5;
    color: #333;
}

/* 첨부 파일을 위한 css */
.file-link {
    color: #007bff; 
    text-decoration: none; 
}

/* 첨부 파일을 위한 css */
.file-link:hover {
    color: #0056b3; 
    text-decoration: underline; 
}
.page-layout {
    margin-left: 1000px; /* 화면의 10%만큼 우측으로 이동 */
    position: relative;
}
</style>
