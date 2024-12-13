<template>
    <Modal v-model="visible" header="서명 추가" width="30rem" height="none">
        <div>
            <!-- 서명 캔버스 -->
            <SignatureCanvas @signatureSaved="saveSignature" />
        </div>
    </Modal>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import Modal from "@/components/common/Modal.vue";
import SignatureCanvas from "@/components/common/signatureCanvas/SignatureCanvas.vue";

const props = defineProps({
    modelValue: Boolean, // 부모로부터 v-model로 전달받는 값
});

const emit = defineEmits(["update:modelValue", "signatureSaved"]); // 부모에게 상태 전달 및 서명 데이터 전송

const visible = ref(props.modelValue);

const saveSignature = (signatureData) => {
    emit("signatureSaved", signatureData); // 서명 데이터를 부모 컴포넌트로 전달
    closeModal(); // 모달 닫기
};

const closeModal = () => {
    emit("update:modelValue", false); // 부모에 모달 상태 전달
};
</script>

<style scoped>
</style>
