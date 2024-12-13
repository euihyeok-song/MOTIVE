<template>
    <div class="card custom-datatable">
        <DataTable lazy paginator :value="data" :rows="rows" :rowsPerPageOptions="rowsPerPageOptions" :loading="loading"
            tableStyle="min-width: 100%" showGridlines :selection="selectedItems" selectionMode="multiple"
            :totalRecords="totalRecords" @update:selection="selectedItems = $event"
            @selection-change="onSelectionChange" @page="onPage" @sort="onSort" @filter="onFilter">

            <!-- 첫 번째 체크박스 컬럼 조건부 추가 -->
            <Column v-if="selectable" selectionMode="multiple" headerStyle="width: 3rem; text-align: center"
                bodyStyle="text-align: center; vertical-align: middle" class="checkbox-cell">
            </Column>

            <!-- 동적 컬럼 생성 -->
            <Column v-for="(header, index) in headers" :key="index" :field="header.field" :header="header.label"
                :headerStyle="{ width: header.width || 'auto', textAlign: 'center' }"
                :bodyStyle="{ width: header.width || 'auto', textAlign: 'center', verticalAlign: 'middle' }">
                <template #body="slotProps">
                    <slot :name="`body-${header.field}`" :data="slotProps.data">
                        {{ slotProps.data[header.field] }}
                    </slot>
                </template>
            </Column>

            <!-- 버튼 컬럼 조건부 추가 -->
            <Column v-if="buttonLabel && buttonAction && buttonField" :header="buttonHeader || buttonLabel"
                :style="{ width: buttonColumnWidth || 'auto' }" headerStyle="text-align: center"
                bodyStyle="text-align: center; vertical-align: middle">
                <template #body="{ data }">
                    <div class="button-cell">
                        <button @click="buttonAction(data)" class="custom-button">{{ buttonLabel }}</button>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, watch, defineEmits } from 'vue';

const props = defineProps({
    headers: Array,
    data: Array,
    loading: Boolean,
    selectable: {
        type: Boolean,
        default: true
    },
    totalRecords: Number,
    rows: {
        type: Number,
        default: 20,
    },
    selection: Array,
    rowsPerPageOptions: {
        type: Array,
        default: () => [10, 15, 20, 50]
    },
    buttonLabel: String,
    buttonHeader: String,
    buttonAction: Function,
    buttonField: String,
    buttonColumnWidth: String
});

const emits = defineEmits(['page', 'sort', 'filter', 'update:selection']);

const selectedItems = ref(props.selection || []);

watch(selectedItems, (newSelection) => {
    emits('update:selection', newSelection);
    console.log('ViewTable에서 선택된 항목:', newSelection);
});

function onSelectionChange(event) {
    selectedItems.value = event.value;
    console.log('테이블에서 선택된 항목:', selectedItems.value);
}

function onPage(event) {
    emits('page', event);
}

function onSort(event) {
    emits('sort', event);
}

function onFilter(event) {
    emits('filter', event);
}
</script>

<style>
/* 기존 스타일 유지 */
</style>


<style>
/* 체크박스 컬럼에 패딩과 가운데 정렬 적용 */
.checkbox-cell {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 8px 12px 8px 12px !important;
}

/* 버튼 스타일 */
.custom-button {
    margin-left: 8px;
    padding: 4px 12px;
    background-color: #FFF;
    color: #6360AB;
    border: 1px solid #6360AB;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

/* 버튼 셀 정렬 */
.p-column-title {
    width: 90px !important;
}

.custom-button:hover {
    background-color: #F1F1FD;
}

/* 모든 컬럼 헤더(th)와 셀(td)의 텍스트 가운데 정렬 */
.custom-datatable .p-datatable .p-datatable-thead>tr>th,
.custom-datatable .p-datatable .p-datatable-tbody>tr>td {
    text-align: center !important;
}

/* 헤더 컨텐츠 가운데 정렬 */
.custom-datatable .p-datatable .p-column-header-content {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    color: #777777;
    font-weight: normal;
}

/* 컬럼 헤더 높이 설정 */
.custom-datatable .p-datatable .p-datatable-thead>tr>th {
    height: 35px !important;
    padding: 0 !important;
    font-size: 14px;
}

/* 셀 높이 설정 */
.custom-datatable .p-datatable .p-datatable-tbody>tr>td {
    height: 35px !important;
    padding: 0 !important;
    font-size: 14px;
}

/* 정렬된 컬럼 헤더 배경색 완전 제거 */
.custom-datatable .p-datatable .p-sortable-column.p-highlight,
.custom-datatable .p-datatable .p-sortable-column.p-highlight:focus,
.custom-datatable .p-datatable .p-sortable-column.p-highlight:active {
    background-color: #F8F8F8;
    color: inherit !important;
    box-shadow: none !important;
    /* 그림자 제거 */
    border-color: 1px solid #EEEEEE !important;
    /* 테두리 제거 */
}

/* 정렬 아이콘의 강조 색상 제거 */
.custom-datatable .p-datatable .p-sortable-column.p-highlight ,
.custom-datatable .p-datatable .p-sortable-column:focus,
.custom-datatable .p-datatable .p-sortable-column:active{
    color: inherit !important;
}

/* 컬럼 헤더의 hover 효과 완전 제거 */
.custom-datatable .p-datatable .p-sortable-column:hover {
    color: inherit !important;
    box-shadow: none !important;
    /* 그림자 제거 */
    border-color: transparent !important;
}

/* hover 시 정렬 아이콘 색상 유지 */
.custom-datatable .p-datatable .p-sortable-column:hover  {
    color: inherit !important;
}

/* 정렬 아이콘 크기 및 위치 */


.p-checkbox .p-checkbox-box {
    border: 1px solid #ced4da !important;
    border-radius: 0px !important;
    width: 17px;
    height: 17px;
}

.p-checkbox.p-highlight .p-checkbox-box {
    background: #6360AB;
    font-size: 15px;
}

.p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
    background: #F1F1FD;
    border-color: #F1F1FD;
    color: #495057;
    border-radius: 30px;
}

.p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover {
    background: #e9ecef;
    border-color: transparent;
    color: #495057;
    border-radius: 30px;
}
</style>
