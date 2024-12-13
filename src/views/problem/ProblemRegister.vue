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

        <div class="info-container">
            <label for="customer-id">고객 ID</label>
            <input 
                id="customer-id" 
                type="text" 
                v-model="customerId" 
                placeholder="고객 ID를 입력하세요" 
            />
        </div>

        <div class="info-container">
            <label for="product-id">상품 ID</label>
            <input 
                id="product-id" 
                type="text" 
                v-model="productId" 
                placeholder="상품 ID를 입력하세요" 
            />
        </div>

        <!-- FileUpload template에 적용  => 필요하면 class로 css 추가-->
        <div class="fileup">
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
const customerId = ref(''); // 고객 ID
const productId = ref(''); // 상품 ID

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
    router.push('/problem/list'); // 취소 시 이동 경로
};

const onRegister = async () => {
    if (!title.value.trim() || !content.value.trim() || !customerId.value.trim() || !productId.value.trim()) {
        alert('제목, 고객 ID, 상품 ID, 내용을 모두 입력해주세요.');
        return;
    }

    // JSON 데이터 추가
    const problemData = {
        title: title.value.trim(),
        content: content.value.trim(),
        customerId: customerId.value.trim(),
        productId: productId.value.trim(),
    };

    try {
        // API 호출
        const response = await $api.problem.post(
            problemData,
            '',
            file.value || " "
        );

        alert("등록되었습니다.");
        router.push('/problem/list');
        
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
    width: 905px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
}

.title-container label {
    font-weight: bold;
    margin-bottom: 5px;
}

.title-container input {
    padding: 10px;
    padding-left: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    width: 100%;
}

.footer-buttons {
    margin-right:2.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 5px;
}

.info-container {
    margin-left: 2.4rem;
    width: 200px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    font-size: 16px;
}
.info-container input{
    padding:10px;
    font-size:16px;
    border: 1px solid #ddd;
    padding-left: 1rem;
    border-radius: 4px;
}
.fileup{
    margin-left: 2.4rem;
    width: 905px;
    margin-bottom: 20px;

}
</style>    