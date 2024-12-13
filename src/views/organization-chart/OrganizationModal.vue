<template>
    <Dialog
        v-model:visible="localVisible"
        modal
        :header="header"
        :style="{ width: dialogWidth }"
        @hide="handleHide"
    >
        <slot></slot>
        <template #footer>
            <!-- 부모 컴포넌트에서 footer 슬롯을 정의할 수 있도록 슬롯 제공 -->
            <slot name="footer"></slot>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';


const props = defineProps({
    modelValue: Boolean,
    header: String,
    width: {
        type: String,
        default: '40rem'
    }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);
const localVisible = ref(props.modelValue);
const dialogWidth = props.width;

watch(() => props.modelValue, (newVal) => {
    localVisible.value = newVal;
});

watch(localVisible, (newVal) => {
    emit('update:modelValue', newVal);
});

function handleHide() {
    emit('update:modelValue', false);
    emit('cancel');
}
</script>
