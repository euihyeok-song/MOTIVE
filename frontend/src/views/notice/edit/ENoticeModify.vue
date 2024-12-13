<template>
    <PageLayout>
        <div class="page-container">
            <!-- 제목 입력 -->
            <div class="title-container">
                <label for="title-input">제목</label>
                <input
                    id="title-input"
                    type="text"
                    v-model="title"
                    placeholder="제목을 입력하세요"
                />
            </div>

            <div class="selectors-container">
                <div class="classification-container">
                    <label for="classification-select">분류</label>
                    <select id="classification-select" v-model="classification">
                        <option value="NORMAL">NORMAL</option>
                        <option value="GOAL">GOAL</option>
                        <option value="STRATEGY">STRATEGY</option>
                    </select>
                </div>
            </div>   

            <!-- 기존 파일 확인 및 새 파일 업로드 -->
            <div class="file-container">
                <label>첨부 파일</label>
                <div v-if="currentFileName" class="current-file">
                    <p>현재 파일: 
                            <a :href="currentFileName" target="_blank" rel="noopener noreferrer" class="file-link">{{ currentFileName }}</a>
                    </p>
                    <div class="file-delete">
                    <button @click="removeCurrentFile">파일 삭제</button>
                    </div>
                </div>
                <FileUpload 
                    label="새 파일 업로드" 
                    @file-selected="onFileSelected" 
                    @file-error="onFileError"
                />
            </div>

            <!-- 내용 입력 -->
            <CKEditor v-model="content" :initial-html="initialHtml" />

            <!-- 하단 버튼 -->
            <div class="footer-buttons">
                <CommonButton
                    label="취소"
                    color="#F1F1FD"
                    textColor="#6360AB"
                    @click="closePage"
                />
                <CommonButton
                    label="수정 완료"
                    color="#6360AB"
                    textColor="#FFFFFF"
                    @click="onUpdate"
                />
            </div>
        </div>
    </PageLayout>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import CKEditor from '@/components/common/CKEditor/CKEditor.vue';
import FileUpload from '@/components/common/FileUpload.vue';
import { $api } from '@/services/api/api';

export default {
    components: {
        CommonButton,
        CKEditor,
        FileUpload,
    },
    setup() {
        const router = useRouter();
        const route = useRoute();

        // 공지사항 정보 상태
        const noticeId = route.query.noticeId || '';
        const title = ref('');
        const content = ref('');
        const initialHtml = ref('');
        const currentFileName = ref(null);
        const file = ref(null);
        const tag = ref('ALL');
        const classification = ref('NORMAL');

        // 파일 선택 핸들러
        const onFileSelected = (selectedFile) => {
            file.value = selectedFile;
        };

        // 파일 삭제 핸들러
        const removeCurrentFile = () => {
            currentFileName.value = null;
            file.value = null;
        };

        // 에러 핸들러
        const onFileError = (errorMessage) => {
            alert(errorMessage);
        };

        // 페이지 닫기
        const closePage = () => {
            router.push('/notice/Elist');
        };

        // 공지사항 정보 로드
        onMounted(async () => {
            try {
                const response = await $api.notice.get('',noticeId )
                title.value = response.title || '';
                content.value = response.content || '';
                initialHtml.value = response.content || '';
                currentFileName.value = response.fileUrl || null;
                tag.value = response.tag || 'ALL';
                classification.value = response.classification || 'NORMAL';
            } catch (error) {
                console.error('공지사항 로드 오류:', error);
                alert('공지사항 정보를 불러오지 못했습니다.');
            }
        });

        // 공지사항 업데이트
        const onUpdate = async () => {
            if (!title.value.trim() || !content.value.trim()) {
                alert('제목과 내용을 입력해주세요.');
                return;
            }

            const updateData = {
                title: title.value.trim(),
                content: content.value.trim(),
                tag: tag.value,
                classification: classification.value,
                removeFile: !currentFileName.value && !file.value,  
                fileUrl: currentFileName.value, 
            };
            try {
                await $api.notice.putParams(
                    updateData,
                    noticeId,
                    file.value || null // 새 파일이 있으면 추가
                );
                alert('공지사항이 수정되었습니다.');
                router.push('/notice/Elist');
            } catch (error) {
                console.error('수정 중 오류 발생:', error);
                // if(error.message ==response is not defined)
                alert('수정에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
            }
        };

        return {
            title,
            content,
            initialHtml,
            currentFileName,
            file,
            classification,
            onFileSelected,
            removeCurrentFile,
            onFileError,
            closePage,
            onUpdate,
        };
    },
};
</script>

<style scoped>
.page-container {
    .file-link {
    color: blue;  /* 파란색으로 링크 표시 */
    text-decoration: underline;  /* 링크에 밑줄 추가 */
}


.file-link {
    color: blue;
    text-decoration: underline;
}

.file-link:hover {
    color: darkblue;  /* 마우스 오버 시 링크 색상 변경 */
}
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.file-delete{
    white-space: nowrap;
}

.title-container,
.classification-container,
.file-container {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    padding-left:35px;
    
}
.title-container{
    width:30rem;
}

.classification-container{
    width:8rem;
}

select {
    padding: 2px; /* 선택 칸 내부 여백 추가 */
    font-size: 14px; /* 글씨 크기 */
    border-radius: 4px; /* 모서리 둥글게 */
    box-sizing: border-box; /* 패딩이 전체 크기에 포함되도록 설정 */
}

.title-container input {
    padding: 8px;
    padding-left: 0.5rem;
    border: 1px solid #b3b1b1;
    border-radius: 4px;
    font-size: 16px;
    width: 40rem;
}

.title-container label,
.file-container label {
    font-weight: bold;
    margin-bottom: 8px;
}

.file-container{
    width:96%;
}
.title-input{
    padding: 4px;
}
.current-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.footer-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}
.main-container{
    padding:0px;
}

label {
    font-weight: bold;
    margin-bottom: 8px;
}

#classification-select{
    padding: 3px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    width:150px;
}
</style>
