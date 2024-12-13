<template>
  <Dialog v-model:visible="localVisible" modal :header="header" :style="{ width: '40rem' }" @hide="handleHide">
    <!-- 검색 텍스트 입력 및 버튼 -->
    <div class="search-input">
      <input type="text" v-model="searchText" :placeholder="`검색 ${header}`" class="form-input" />
      <button class="search-button" @click="searchItems">
        <span class="search-icon pi pi-search"></span>
      </button>
    </div>

    <div class="table-wrapper width-s ml-m">
      <ViewTable :headers="modalHeaders" :data="modalData" :selectable="true" :selection="selectedRows"
        @update:selection="updateSelectedRows"></ViewTable>
    </div>
    <!-- 부모에서 정의한 footer 슬롯 -->
    <template #footer>
      <SCommonButton class="btn btn-primary" @click="confirmSelection" label="확인"></SCommonButton>
      <SCommonButton class="btn btn-secondary" @click="handleHide" label="취소"></SCommonButton>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, defineEmits, watch } from 'vue';
import Dialog from 'primevue/dialog';
import ViewTable from '@/components/common/ListTable.vue';
import SCommonButton from '@/components/common/Button/SCommonButton.vue';

const props = defineProps({
  modelValue: Boolean,
  header: String,
  fetchItemsApi: Function, // API 호출 함수
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);
const localVisible = ref(props.modelValue);
const searchText = ref(''); // 검색어
const items = ref([]); // 검색 결과
const selectedItem = ref(null); // 선택된 항목
const loading = ref(false);
const modalData = ref([]);
const selectedRows = ref([]);

// props.modelValue가 변경될 때 localVisible을 업데이트
watch(() => props.modelValue, (newVal) => {
  localVisible.value = newVal;
});

function handleHide() {
  emit('update:modelValue', false);
  emit('cancel');
}

const modalHeaders = ref([
  { field: 'centerId', label: '매장번호', width: '50%' },
  { field: 'name', label: '매장명', width: '50%' },
]);

// 검색 버튼 클릭 시 API 호출
const searchItems = async () => {
  if (searchText.value.trim()) {
    loading.value = true;
    try {
      // API 호출
      const response = await props.fetchItemsApi(searchText.value);
      items.value = response.result || []; // API 응답의 데이터에 맞게 설정
      modalData.value = response.result || [];
      console.log(items.value);
      console.log(modalData.value);
    } catch (error) {
      console.error('API 요청 실패:', error);
    } finally {
      loading.value = false;
    }
  }
};

// 아이템 선택 시 선택된 항목을 부모 컴포넌트로 전달
const updateSelectedRows = (item) => {
  selectedItem.value = item;
};

// 선택 완료 후 부모 컴포넌트에 값 전달
function confirmSelection() {
  emit('update:modelValue', false);
  emit('confirm', selectedItem.value); // 선택된 항목을 부모로 전달
}
</script>


<style scoped>
.search-input {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.search-button {
  background-color: #4CAF50;
  color: white;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
}

.search-results ul {
  list-style-type: none;
  padding: 0;
}

.search-results li {
  padding: 10px;
  cursor: pointer;
}

.search-results li:hover {
  background-color: #f0f0f0;
}
</style>
