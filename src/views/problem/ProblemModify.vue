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

            <!-- 기존 파일 확인 및 새 파일 업로드 -->
            <div class="file-container">
                <label>첨부 파일</label>
                <div v-if="currentFileName" class="current-file">
                    <p>현재 파일: 
                            <a :href="currentFileName" target="_blank" rel="noopener noreferrer" class="file-link">{{ currentFileName }}</a>
                    </p>
                    <button @click="removeCurrentFile">파일 삭제</button>
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
        const problemId = route.query.problemId || '';
        const title = ref('');
        const content = ref('');
        const initialHtml = ref('');
        const currentFileName = ref(null);
        const file = ref(null);

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
            router.push('/problem/list');
        };

        // 공지사항 정보 로드
        onMounted(async () => {
            try {
                const response = await $api.problem.get('',problemId )
                title.value = response.title || '';
                content.value = response.content || '';
                initialHtml.value = response.content || '';
                currentFileName.value = response.fileUrl || " ";
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
                removeFile: !currentFileName.value && !file.value,  
                fileUrl: currentFileName.value, 
            };
            try {
                await $api.problem.putParams(
                    updateData,
                    problemId,
                    file.value || null // 새 파일이 있으면 추가
                );
                console.log("title",updateData.title);
                alert('게시글이 수정되었습니다.');
                router.push('/problem/list');
            } catch (error) {
                console.error('수정 중 오류 발생:', error);
                alert('수정에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
            }
        };

        return {
            title,
            content,
            initialHtml,
            currentFileName,
            file,
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

.title-container{
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    margin-left:40px;
}

.file-container {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    margin-left:40px;
    width : 880px;
}

.title-container label,
.file-container label {
    font-weight: bold;
    margin-bottom: 8px;
}

.file-container FileUpload{
    margin-left: 40px;
}
.title-container input{
    padding:10px;
    font-size:16px;
    border: 1px solid #ddd;
    padding-left: 1rem;
    border-radius: 4px;
    width:880px;
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
    margin-right: 40px;
}

</style>
