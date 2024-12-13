<template>
    <div class="page-container">
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
            <div class="select-container">
                <label for="classification-select">분류</label>
                <select id="classification-select" v-model="classification">
                    <option value="NORMAL">NORMAL</option>
                    <option value="GOAL">GOAL</option>
                    <option value="STRATEGY">STRATEGY</option>
                </select>
            </div>
        </div>

        <div class="file-upload-container">
            <FileUpload 
                label="파일 업로드" 
                class="file-upload-input"
                @file-selected="onFileSelected" 
                @file-error="onFileError"
            />
        </div>

        <!-- CKEditor 필요한거 가져다가 쓰기 -->
        <CKEditor 
            v-model="content" 
            :initial-html="initialHtml"
        />

        <div class="footer-buttons">
            <CommonButton 
                label="취소" 
                color="#F1F1FD" 
                textColor="#6360AB" 
                @click="closePage" 
            />
            <CommonButton 
                label="등록" 
                color="#6360AB" 
                textColor="#FFFFFF" 
                @click="onRegister" 
            />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import { $api } from '@/services/api/api';

// CKEditor 컴포넌트 import  -> 이미지 업로드도 등록해둠
import CKEditor from '@/components/common/CKEditor/CKEditor.vue';

// FileUpload 컴포넌트 import
import FileUpload from '@/components/common/FileUpload.vue'; 

const router = useRouter();

const title = ref(''); // 제목
const content = ref('');
const file = ref(null); // 업로드할 파일
const tag = ref('ALL'); // 태그 기본값
const classification = ref('NORMAL'); // 분류 기본값

const initialHtml = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>공지사항</title>
    </head>
    <body>
        <p>공지사항 내용을 작성하세요.</p>
    </body>
    </html>
`;

// 파일 선택 핸들러
const onFileSelected = (selectedFile) => {
    file.value = selectedFile; // 파일 저장
};

const onFileError = (errorMessage) => {
    alert(errorMessage);
};

const closePage = () => {
    router.push('/notice/Elist'); // 취소 시 이동 경로
};

const onRegister = async () => {
    if (!title.value.trim() || !content.value.trim()) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    // JSON 데이터 추가
    const noticeData = {
        title: title.value.trim(),
        content: content.value.trim(),
        tag: tag.value,
        classification: classification.value,
    };

    try {
        // API 호출
        const response = await $api.notice.post(
            noticeData,
            '',
            file.value || " "
        );

        alert("등록되었습니다.");
        router.push('/notice/Elist');
        
    } catch (error) {
        console.error("등록 오류:", error);
        alert("등록 중 오류: " + error.message);
    }
};
</script>

<style scoped>
.page-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 10px;
    background-color: #fff;
    border-radius: 8px;
}

.title-container {
    margin-left: 2.4rem;
    width: 90.5rem;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
}

.title-container label {
    font-weight: bold;
    margin-bottom: 5px;
}

.title-container input {
    padding: 8px;
    padding-left: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    width: 45%;
}


.selectors-container {
    display: flex;
    justify-content: space-between;
    margin-left: 2.4rem;
    margin-bottom: 20px;
    width: 40rem;
    gap: 20px;
}

.select-container {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.select-container label {
    font-weight: bold;
    margin-bottom: 5px;
}

.select-container select {
    padding: 3px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    width: 50%;
}

.footer-buttons {
    margin-right:2.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 5px;
}
.file-upload-container {
    margin-left: 1.1rem;
    width: 96%;
}


</style>