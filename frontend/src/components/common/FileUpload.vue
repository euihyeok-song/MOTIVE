<template>
    <div class="file-upload-container">
        <label :for="inputId">{{ label }}</label>
        <input 
            :id="inputId" 
            type="file" 
            @change="handleFileChange"
            :accept="acceptedFileTypes" 
        />
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
    label: {
        type: String,
        default: '파일 업로드'
    },
    inputId: {
        type: String,
        default: 'file-upload'
    },
    acceptedFileTypes: {
        type: String,
        default: '.jpg, .jpeg, .png, .pdf, .xls, .xlsx, .csv'
    },
    maxFileSize: {
        type: Number,
        default: 10 * 1024 * 1024 // 10MB
    }
});

const emit = defineEmits(['file-selected', 'file-error']);

const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
        // 파일이 선택되지 않았을 때 null 값 emit
        emit('file-selected', null);
        return;
    } else {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv"
        ];

        // 파일 유형 확인
        if (!allowedTypes.includes(selectedFile.type)) {
            emit('file-error', '허용되지 않는 파일 형식입니다.');
            return;
        }

        // 파일 크기 확인
        if (selectedFile.size > props.maxFileSize) {
            emit('file-error', '파일 크기가 10MB를 초과할 수 없습니다.');
            return;
        }

        // 파일 선택 이벤트 emit
        emit('file-selected', selectedFile);
    }
};
</script>

<style scoped>
.file-upload-container {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
}

.file-upload-container label {
    font-weight: bold;
    margin-bottom: 5px;
}

.file-upload-container input {
    padding: 5px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>