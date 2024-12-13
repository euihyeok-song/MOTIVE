<template>
    <PageLayout>
        <div class="component-wrapper">
            <!-- SearchForm -->
            <div>
                <div class="top">
                    <div class="path">
                        <PagePath />
                    </div>
                    <div class="button-row">
                        <CommonButton label="초기화" icon="pi pi-refresh" color="#F1F1FD" textColor="#6360AB"
                            @click="refresh" />
                    </div>
                </div>
                <CSearchForm :fields="formFields" @open-modal="handleOpenModal" ref="searchFormRef" />
            </div>

            <TabView class="horizontal-tabs" @tab-change="handleTabChange">
                <TabPanel v-for="(field, index) in secondRowFields" :key="field.model" :header="field.label">
                    <!-- <p class="m-0">{{ field.label }}</p> -->
                    <div class="flex-container">
                        <div v-for="(field, index) in thridRowFields" :key="index" class="form-row button-row"
                            v-show="shouldShowButtons">
                            <SCommonButton :key="field.model" :label="field.label" @click="handleButtonClick(field)" />
                        </div>
                    </div>
                    <!-- <div class="bigcard-container"> -->
                    <!-- BigCard 컴포넌트를 화면 중앙에 배치하고 크기 맞추기 -->
                    <BigCard ref="chartRef" v-bind="$attrs" class="bigcard" :chartDataList="chartDataList"
                        :chartOptions="chartOptions" />
                    <!-- </div> -->

                </TabPanel>
            </TabView>
        </div>

        <Modal v-model="showModal" :header="modalType === 'centerList' ? '매장 검색' :
            modalType === 'memberList' ? '사원 검색' :
                modalType === 'productList' ? '제품 검색' :
                    modalType === 'customerList' ? '고객 검색' : '검색'" width="30rem" height="none"
            @confirm="confirmSelection" @cancel="resetModalState">
            <!-- 검색 입력 -->
            <div class="flex-row content-center mb-m">
                <label class="mr-m">
                    {{ modalType === 'centerList' ? '매장명:' :
                        modalType === 'memberList' ? '담당자명:' :
                            modalType === 'productList' ? '제품명:' :
                                modalType === 'customerList' ? '고객명:' : '' }}
                </label>
                <InputText type="text" v-model="searchQuery" @keyup.enter="searchStore" />
                <button class="search-button" @click="searchStore">
                    <span class="search-icon pi pi-search"></span>
                </button>
            </div>

            <!-- 검색 결과 테이블 -->
            <table>
                <thead>
                    <tr>
                        <th v-for="header in dynamicHeaders" :key="header">{{ header }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in modalTableData" :key="index" @click="selectStore(row, index)"
                        :class="{ selected: selectedRow === index }">
                        <td v-if="modalType === 'centerList'">{{ row.centerId }}</td>
                        <td v-if="modalType === 'memberList'">{{ row.memberId }}</td>
                        <td v-if="modalType === 'productList'">{{ row.productId }}</td>
                        <td v-if="modalType === 'customerList'">{{ row.customerId }}</td>
                        <td>{{ row.name }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- 모달 하단 버튼 -->
            <template #footer>
                <CommonButton label="확인" @click="confirmSelection" />
                <CommonButton label="취소" color="#ffffff" textColor="#6360AB" borderColor="#6360AB"
                    @click="resetModalState" />
            </template>
        </Modal>
    </PageLayout>
</template>


<script setup>
import { ref, computed } from 'vue';
import PageLayout from '@/components/common/layouts/PageLayout.vue';
import SCommonButton from '@/components/common/Button/SCommonButton.vue';
import BigCard from '@/components/common/FGraphCard.vue';
import { $api } from '@/services/api/api';
import CSearchForm from '@/components/common/CSearchForm.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import Modal from '@/components/common/Modal.vue';
import PagePath from '@/components/common/PagePath.vue';

// SearchForm.vue 검색조건 값
const initialFormFields = [
    [
        {
            label: '분류',
            type: 'select',
            model: 'period',
            value: '',
            options: ['일별', '월별', '연도별'],
            showDivider: false,
        },
        {
            label: '조회기간',
            type: 'calendar',
            model: 'salesHistoryDate',
            showIcon: true,
            manualInput: false,
        }
    ],
];

const formFields = ref(JSON.parse(JSON.stringify(initialFormFields))); // 초기값 복사

const secondRowFields = ref(
    [
        {
            label: '수당',
            type: 'button',
            model: 'totalIncentive',
            value: 'totalIncentive',
        },
        {
            label: '실적',
            type: 'button',
            model: 'totalPerformance',
            value: 'totalPerformance',
        },
        {
            label: '매출액',
            type: 'button',
            model: 'totalSales',
            value: 'totalSales',
        },
    ],
);

const thridRowFields = ref(
    [
        {
            label: '최고',
            type: 'button',
            model: '',
            value: 'best',
        },
        {
            label: '평균',
            type: 'button',
            model: '',
            value: 'average',
        },
    ],
)

const loading = ref(false); // 로딩 상태
const searchCriteria = ref({});
const chartDataList = ref([]);
const chartOptions = ref([]);
const chartRef = ref(null);
let saveButton;
let saveValue;
let existingChartData;
let existingPeriod;
let shouldShowButtons;

const refresh = () => {
    // 검색 조건 초기화
    searchCriteria.value = {};
    formFields.value = JSON.parse(JSON.stringify(initialFormFields));

    // SearchForm 초기화
    if (searchFormRef.value) {
        searchFormRef.value.initializeFormData();
        searchFormRef.value.formData.memberList = "";
        searchFormRef.value.formData.centerList = "";
        searchFormRef.value.formDataIds = {};
    }

    // 차트 데이터 초기화
    chartDataList.value = []; // 빈 배열로 초기화

    if (Array.isArray(chartRef.value)) {
        chartRef.value.forEach(chart => {
            if (chart.destroyCharts) {
                chart.destroyCharts(); // 각 차트의 destroyCharts 호출
            }
        });
    }

    // 버튼 상태 초기화`
    secondRowFields.value.forEach((field) => field.value = '');

    // 모달 상태 초기화
    showModal.value = false;
    selectedRow.value = {};
    searchQuery.value = '';
    modalTableData.value = [];
    selectedStoreCode.value = '';

    window.location.reload();
};

const handleTabChange = (event) => {
    const selectedField = secondRowFields.value[event.index]; // 선택된 탭에 해당하는 field를 가져옴
    handleButtonClick(selectedField); // 선택된 field를 전달하여 처리
};

const handleButtonClick = async (field) => {

    if (loading.value) return;

    console.log("전달받은 field: ", field);

    loading.value = true;
    try {
        const formData = searchFormRef.value?.formData;
        const formDataIds = searchFormRef.value?.formDataIds;

        if (!formData || !formDataIds) {
            console.error('formData를 가져올 수 없습니다.');
            return;
        }

        // 검색 조건 생성
        if (formDataIds && Object.keys(formDataIds).length > 0) {
            // formDataIds가 존재하고 값이 있을 경우
            Object.entries(formDataIds).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    // 배열 필드인 경우 배열 병합 처리
                    if (Array.isArray(searchCriteria.value[key])) {
                        searchCriteria.value[key] = searchCriteria.value[key].concat(value);
                    } else {
                        searchCriteria.value[key] = value; // 배열이 아닌 경우 값 설정
                    }
                }
            });
        }

        if (formData && Object.keys(formData).length > 0) {
            // formData에 값이 있을 경우
            Object.entries(formData).forEach(([key, value]) => {
                if (formDataIds[key]) {
                    // formDataIds에 동일한 키가 있는 경우 무시
                    console.log(`formData의 ${key} 키가 formDataIds와 중복되어 무시되었습니다.`);
                    return;
                }

                if (value !== null && value !== undefined && value !== '') {
                    // 배열 필드인 경우 배열 병합 처리
                    if (Array.isArray(searchCriteria.value[key])) {
                        if (!searchCriteria.value[key].includes(value)) {
                            searchCriteria.value[key].push(value); // 중복 방지 후 값 추가
                        }
                    } else if (searchCriteria.value[key] !== undefined) {
                        if (!Array.isArray(searchCriteria.value[key])) {
                            // 기존 값이 배열이 아니면 배열로 변환
                            searchCriteria.value[key] = [searchCriteria.value[key]];
                        }
                        if (!searchCriteria.value[key].includes(value)) {
                            searchCriteria.value[key].push(value);
                        }
                    } else {
                        searchCriteria.value[key] = value; // 새로운 값 설정
                    }
                }
            });
        }

        console.log("Updated searchCriteria: ", searchCriteria.value);

        // 개별 필드
        if (field.model != '' && field.value != '') {
            saveButton = field.model;
            saveValue = field.value;
            shouldShowButtons = true;
            // 기본 필드
        } else if (field.model == '' && field.value == '') {
            saveButton = '';
            saveValue = '';
            // 비교 필드
            shouldShowButtons = false;
        } else {
            saveValue = field.value;
            shouldShowButtons = true;
        }

        console.log("saveButton", saveButton);

        const period = formData.period || ''; // '일별', '월별', '연도별' 중 하나
        const periodMap = {
            '일별': '',
            '월별': 'month',
            '연도별': 'year',
        };

        const periodType = periodMap[period] || null; // 매핑되지 않은 값은 null
        const groupBy = formData.groupBy || '';

        const groupByMap = {
            '매장': 'center',
            '사원': 'employee',
            '전체': 'employee',
            '': 'employee'
        };

        const groupByType = groupByMap[groupBy] || '';

        console.log('searchCriteria:', searchCriteria.value);

        const apiPathMap = {
            average: 'statistics/average',
            best: 'statistics/best',
            default: 'statistics/mySearch',
        };

        const apiPath = apiPathMap[field.value] || apiPathMap.default;

        console.log("API Path:", apiPath);

        // 데이터 로드 및 차트 업데이트
        await loadData(periodType, field.model, field.label, groupByType, apiPath);
    } finally {
        loading.value = false;
    }
};

const loadData = async (searchType = null,
    fieldModel = null,
    fieldLabel = null,
    groupBy = 'employee',
    apiPath = 'statistics/mySearch') => {

    loading.value = true; // 로딩 시작
    let saveStartDate;
    let saveEndDate;
    try {
        if ((searchCriteria.value.salesHistoryDate_start != saveStartDate) || (searchCriteria.value.salesHistoryDate_end != saveEndDate)) {
            saveStartDate = searchCriteria.value.salesHistoryDate_start;
            saveEndDate = searchCriteria.value.salesHistoryDate_end;
        }
        // 검색 조건 필터링 및 유효한 값만 유지
        const filteredCriteria = Object.fromEntries(
            Object.entries(searchCriteria.value).filter(([key, value]) => {
                // null, undefined, 빈 문자열, 빈 배열, 빈 객체는 필터링
                if (value === null || value === undefined || value === '') return false;
                if (Array.isArray(value) && value.length === 0) return false;
                if (typeof value === 'object' && Object.keys(value).length === 0) return false;
                return key !== 'salesHistoryDate_start' && key !== 'salesHistoryDate_end' && key !== 'period'; // 날짜 제외
            })
        );
        // 배열 필드 강제 처리
        const ensureArrayFields = (criteria) => {
            const arrayFields = ['memberList', 'centerList', 'productList']; // 배열로 처리할 필드 정의
            arrayFields.forEach((field) => {
                if (!Array.isArray(criteria[field])) {
                    criteria[field] = criteria[field] ? [criteria[field]] : []; // 값이 있으면 배열로, 없으면 빈 배열로 처리
                }
            });
            return criteria;
        };
        // 필터링된 조건에 배열 처리 추가
        const preparedCriteria = ensureArrayFields(filteredCriteria);

        console.log("마지막 saveButton: ", saveButton);

        // 최종 요청 본문
        const searchParams = {
            ...preparedCriteria,
            startDate: saveStartDate || null,
            endDate: saveEndDate || null,
            orderBy: saveButton || '',
            groupBy,
            period: searchType
        };
        // API 호출
        const response = await $api.salesHistory.post(searchParams, apiPath);

        if (response && response.result) {
            const result = response.result.content;

            console.log("result: ", result);

            if (fieldModel === '') {
                if (saveValue === '') {
                    // 기본 버튼 클릭 시: 모든 데이터 처리
                    if (!Array.isArray(result)) {
                        console.error("result가 배열이 아닙니다:", result);
                        return;
                    }

                    const mappedDataList = [
                        {
                            labels: result.map((item) => {item.period || '';
                            }),
                            data: result.map((item) => item.totalIncentive || 0),
                            key: '수당',
                            period: result.map((item) => item.period || '')
                        },
                        {
                            labels: result.map((item) => { item.period || '';
                            }),
                            data: result.map((item) => item.totalPerformance || 0),
                            key: '실적',
                            period: result.map((item) => item.period || '')
                        },
                        {
                            labels: result.map((item) => item.period || ''),
                            data: result.map((item) => item.totalSales || 0),
                            key: '매출액',
                            period: result.map((item) => item.period || '')
                        },
                    ];

                    console.log("mappedDataList (기본 버튼):", mappedDataList);

                    if (Array.isArray(mappedDataList)) {
                        updateChartData(mappedDataList, '기본 데이터');
                    } else {
                        console.error("mappedDataList가 배열이 아닙니다:", mappedDataList);
                    }
                } else if (saveValue === 'average' || saveValue === 'best') {

                    // 기존 chartDataList에서 첫 번째 차트 데이터를 가져옵니다.
                    existingChartData = chartDataList.value[0];
                    existingPeriod = [...existingChartData.datasets[0].period];

                    console.log("existing", existingChartData);

                    const keyPrefix = saveValue === 'average' ? '평균' : '최고';
                    const fieldMapping = {
                        totalIncentive: `${keyPrefix} 수당`,
                        totalPerformance: `${keyPrefix} 실적`,
                        totalSales: `${keyPrefix} 매출액`,
                    };

                    // mappedDataList로부터 데이터 추출
                    const mappedDataList = [
                        {
                            labels: result.map((item) => item.period || ''),
                            data: result.map((item) => item.averageTotalIncentive || item.totalIncentive || 0),
                            key: fieldMapping.totalIncentive,
                            period: result.map((item) => item.period || '')
                        },
                        {
                            labels: result.map((item) => item.period || ''),
                            data: result.map((item) => item.averageTotalPerformance || item.totalPerformance || 0),
                            key: fieldMapping.totalPerformance,
                            period: result.map((item) => item.period || '')
                        },
                        {
                            labels: result.map((item) => item.period || ''),
                            data: result.map((item) => item.averageTotalSales || item.totalSales || 0),
                            key: fieldMapping.totalSales,
                            period: result.map((item) => item.period || '')
                        },
                    ];

                    updateChartData(mappedDataList, fieldLabel, true);
                }
            }
            else {
                // 개별 필드 처리
                const mappedData = result.map((item) => {
                    let label;
                    try {
                        // groupBy에 따라 적절한 라벨을 설정
                        label = item.period || '';
                        // 만약 label이 문자열이 아니면 강제로 문자열로 변환
                        label = typeof label === 'string' ? label : JSON.stringify(label);
                    } catch (error) {
                        console.error("Label 파싱 중 오류 발생:", error);
                        label = ''; // 기본값 설정
                    }

                    return {
                        label,
                        value: item[fieldModel] || 0,
                        period: item.period || 0,
                    };
                });

                console.log("mappedData (개별 필드):", mappedData);

                updateChartData(mappedData, fieldLabel);
            }

            searchCriteria.value = ref({});
        } else {
            throw new Error('Unsupported method');
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error.message);
    } finally {
        loading.value = false; // 로딩 종료
    }
};

const updateChartData = (mappedDataList, fieldLabel, isComparison = false) => {
    console.log(`updateChartData 호출: fieldLabel = ${fieldLabel}, isComparison = ${isComparison}, data =`, mappedDataList);

    if (!Array.isArray(mappedDataList) || mappedDataList.length === 0) {
        console.error("mappedDataList가 비어 있거나 배열이 아닙니다:", mappedDataList);
        return;
    }

    // x축 labels 추출
    const newLabels = mappedDataList.map((item) => item.labels || "");
    const labels = mappedDataList[0]?.labels || [];
    if ((newLabels.length === 0 || !isComparison) && fieldLabel != '기본 데이터') {
        // 데이터셋이 없다면 새로운 차트 데이터 생성
        const individualFieldData = {
            labels: mappedDataList.map((item) => item.label),
            datasets: [
                {
                    label: fieldLabel,
                    data: mappedDataList.map((item) => item.value),
                    borderColor: 'rgba(82, 77, 249, 0.8)',
                    backgroundColor: 'rgba(82, 77, 249, 0.3)',
                    pointBackgroundColor: 'rgba(82, 77, 249, 1)',
                    pointBorderColor: '#FFFFFF',
                    // pointRadius: 5,
                    fill: true,
                    tension: 0.4,
                    type: 'bar',
                    period: mappedDataList.map((item) => item.period)
                },
            ],
        };

        // 날짜 필드 처리
        individualFieldData.startDate = mappedDataList.map(item => item.startDate);
        individualFieldData.endDate = mappedDataList.map(item => item.endDate);

        // 차트 데이터에 새로 생성한 데이터 추가
        if (isComparison) {
            chartDataList.value = [...chartDataList.value, individualFieldData];
        } else {
            chartDataList.value = [individualFieldData];
        }

        console.log("Updated chartDataList:", chartDataList.value);
        return;
    }
    else if (fieldLabel == '기본 데이터') {
        // 기존 데이터셋이 있을 경우
        // 기존 데이터셋이 있을 경우
        const datasets = mappedDataList.map((data, index) => {
            if (!data.data || !Array.isArray(data.data)) {
                console.error(`mappedDataList[${index}]의 data가 유효하지 않습니다:`, data.data);
                return null;
            }
            const mainColor = "6360AB"; // 메인 컬러

            // 메인 컬러의 RGB 변환
            const r = parseInt(mainColor.substring(0, 2), 16); // 63
            const g = parseInt(mainColor.substring(2, 4), 16); // 60
            const b = parseInt(mainColor.substring(4, 6), 16); // 171

            // 밝기 조정 값
            const brightnessAdjustment = 50;

            // 색상 조합 (밝기와 선명도 조정)
            const colors = [
                `rgba(${Math.min(g + brightnessAdjustment, 255)}, ${Math.min(b + brightnessAdjustment, 255)}, ${Math.min(r + brightnessAdjustment, 255)}, 1)`, // 두 번째 파생 색상
                `rgba(${Math.min(b + brightnessAdjustment, 255)}, ${Math.min(r + brightnessAdjustment, 255)}, ${Math.min(g + brightnessAdjustment, 255)}, 1)`, // 첫 번째 파생 색상
                `rgba(${Math.min(r, 255)}, ${Math.min(g, 255)}, ${Math.min(b, 255)}, 1)`, // 메인 컬러 (밝게 조정)
            ];

            // `index === 2`일 때만 `backgroundColor`를 설정
            return {
                label: data.key,
                data: data.data,
                yAxisID: `y${index}`,
                borderColor: colors[index % colors.length], // index에 따라 색상 순환
                backgroundColor: index === 2
                    ? colors[2].replace(', 1)', ', 0.6)') // 투명도를 0.2로 설정
                    : undefined, // index가 2가 아닌 경우 undefined로 설정
                // fill: true,
                tension: 0.4,
                type: data.key === '매출액' ? 'bar' : 'line',
                period: mappedDataList.map((item) => item.period),
            };
        }).filter(Boolean);


        if (!datasets.length) {
            console.error("생성된 데이터셋이 비어 있습니다.");
            return;
        }

        const startDate = mappedDataList.map(item => item.startDate);
        const endDate = mappedDataList.map(item => item.endDate);

        // y축 스케일 설정: 데이터셋의 yAxisID와 색상 매칭
        const scales = datasets.reduce((acc, dataset, index) => {
            acc[`y${index}`] = {
                type: 'linear',
                position: index % 2 === 0 ? 'left' : 'right', // 왼쪽 또는 오른쪽 위치 번갈아 설정
                ticks: {
                    color: dataset.borderColor, // y축 색상: borderColor와 동일하게 설정
                },
                grid: {
                    drawOnChartArea: index === 0, // 첫 번째 y축만 격자선을 표시
                    color: dataset.borderColor, // y축의 그리드 색상도 borderColor와 일치
                }
            };
            return acc;
        }, {});


        const newChartData = {
            labels,
            datasets,
            startDate,
            endDate,
        };

        const updatedChartData = {
            ...newChartData,
            options: {
                responsive: true,
                scales, // y축 설정 적용
            },
        }

        if (isComparison) {
            chartDataList.value = [...chartDataList.value, updatedChartData];
        } else {
            chartDataList.value = [updatedChartData];
        }

        console.log("Updated chartDataList:", chartDataList.value);
    } else if (chartDataList.value.length > 0) { // average, best
        let mappingIndex;

        if (saveButton == 'totalIncentive') {
            mappingIndex = 0;
        } else if (saveButton == 'totalPerformance') {
            mappingIndex = 1;
        } else if (saveButton == 'totalSales') {
            mappingIndex = 2;
        }

        // `saveValue`에 따라 라벨 설정
        const keyPrefix = saveValue === 'average' ? '평균' : '최고';
        const fieldMapping = {
            totalIncentive: `${keyPrefix} 수당`,
            totalPerformance: `${keyPrefix} 실적`,
            totalSales: `${keyPrefix} 매출액`,
        };

        const unifiedLabels = ref([]);

        // if (existingChartData.labels[0].substr(0, 1) != '2' && existingChartData.labels[0].substr(-1) != ')')
        //     unifiedLabels.value = [...existingChartData.labels.map((label, index) => `${label}(${existingPeriod[index] || ''})`)];
        // else {
        unifiedLabels.value = [...existingChartData.labels];
        // }

        // 디버그용 출력
        console.log('Unified Labels:', unifiedLabels);
        console.log('Mapped Data Period:', mappedDataList[mappingIndex].period);

        const updatedDatasets = existingChartData.datasets.map(dataset => ({
            ...dataset,
        }));

        console.log("fieldMappingp[saveButton]", fieldMapping[saveButton]);

        // 새로운 데이터셋 생성
        const newDataset = {
            label: fieldMapping[saveButton],
            data: existingPeriod.map(label => {
                const index = mappedDataList[mappingIndex].period.indexOf(label);
                return index !== -1 ? mappedDataList[mappingIndex].data[index] : 0; // 라벨 매핑
            }),
            borderColor: saveValue === 'average' ? 'rgba(33, 150, 243, 1)' : 'rgba(39, 174, 96, 1)', // 파란색과 초록색
            backgroundColor: saveValue === 'average' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(39, 174, 96, 0.5)',
            fill: true,
            tension: 0.4,
            type: saveValue === 'average' ? 'line' : 'bar' // average는 선, best는 막대 그래프
        };

        console.log("newDataSet", newDataset);

        // 새로운 데이터셋 추가
        updatedDatasets.push(newDataset);

        // 차트 데이터 업데이트 (불변성 유지)
        const updatedChartData = {
            labels: unifiedLabels, // 기존 라벨 유지
            datasets: updatedDatasets
        };

        // chartDataList 업데이트
        chartDataList.value = [updatedChartData];

        // 디버그 로그
        console.log('Updated Chart Data:', chartDataList.value);
    }


};


// 검색창 모달
const showModal = ref(false);
const searchQuery = ref('');
const modalTableData = ref([]);
const selectedRow = ref(null);
const selectedStoreCode = ref('');
const modalType = ref(''); // 현재 열려 있는 모달의 유형
const searchFormRef = ref(null);

const dynamicHeaders = computed(() => {
    if (modalType.value === 'centerList') {
        return ['매장코드', '매장명'];
    } else if (modalType.value === 'memberList') {
        return ['사원코드', '사원명'];
    } else if (modalType.value === 'productList') {
        return ['제품코드', '제품명']; // 가정
    } else if (modalType.value === 'customerList') {
        return ['고객이름', '담당자']; // 가정
    } else {
        return [];
    }
});

function handleOpenModal(fieldModel) {
    if (fieldModel === 'centerList') {
        modalType.value = 'centerList';
    } else if (fieldModel === 'memberList') {
        modalType.value = 'memberList';
    } else if (fieldModel === 'productList') {
        modalType.value = 'productList'; // 추가로 필요한 경우
    } else if (fieldModel === 'customerList') {
        modalType.value = 'customerList'; // 추가로 필요한 경우
    } else {
        console.warn(`알 수 없는 fieldModel: ${fieldModel}`);
        return;
    }
    showModal.value = true; // 모달 열기
    selectedRow.value = null; // 선택 초기화
}

// 테이블 행 선택
function selectStore(row, index) {
    selectedRow.value = index; // 선택된 행의 인덱스 저장

    switch (modalType.value) {
        case 'centerList':
            selectedStoreCode.value = row.centerId; // 매장 코드 저장
            console.log("선택된 매장 코드:", selectedStoreCode.value);
            break;
        case 'memberList':
            selectedStoreCode.value = row.memberId; // 사원 코드 저장
            console.log("선택된 사원 코드:", selectedStoreCode.value);
            break;
        case 'productList':
            selectedStoreCode.value = row.productId; // 제품 코드 저장
            console.log("선택된 제품 코드:", selectedStoreCode.value);
            break;
        case 'customerList':
            selectedStoreCode.value = row.customerId; // 고객 코드 저장
            console.log("선택된 고객 코드:", selectedStoreCode.value);
            break;
        default:
            console.warn(`알 수 없는 modalType: ${modalType.value}`);
    }
}


function confirmSelection() {
    if (selectedRow.value === null) {
        alert('항목을 선택하세요.');
        return;
    }

    const selectedData = modalTableData.value[selectedRow.value];

    switch (modalType.value) {
        case 'centerList':
            searchFormRef.value.updateFieldValue('centerList', selectedData.name, selectedData.centerId);
            break;
        case 'memberList':
            searchFormRef.value.updateFieldValue('memberList', selectedData.name, selectedData.memberId);
            break;
        case 'productList':
            searchFormRef.value.updateFieldValue('productList', selectedData.name, selectedData.productId);
            break;
        case 'customerList':
            searchFormRef.value.updateFieldValue('customerList', selectedData.name, selectedData.customerId);
            break;
        default:
            console.warn(`알 수 없는 modalType: ${modalType.value}`);
    }

    showModal.value = false; // 모달 닫기
}




// 모달 상태 초기화
function resetModalState() {
    showModal.value = false;
    selectedRow.value = null;
    searchQuery.value = ''; // 검색어 초기화
    modalTableData.value = []; // 모달 테이블 데이터 초기화
    selectedStoreCode.value = ''; // 선택된 매장 코드 초기화
}

async function searchStore() {
    try {
        console.log("검색어:", searchQuery.value);

        const query = modalType.value === 'centerList'
            ? { name: searchQuery.value }
            : { employeeName: searchQuery.value };


        const endpoint = modalType.value === 'centerList'
            ? $api.center
            : modalType.value === 'memberList'
                ? $api.member
                : modalType.value === 'productList'
                    ? $api.product // 가정
                    : modalType.value === 'customerList'
                        ? $api.customer // 가정
                        : null;

        if (!endpoint) {
            console.error('유효하지 않은 modalType:', modalType.value);
            return;
        }

        const response = await endpoint.getParams('search', `?name=${searchQuery.value}`);
        console.log("API 응답 데이터:", response);

        let result = [];
        if (modalType.value === 'centerList') {
            result = response.result.content || [];
        } else if (modalType.value === 'memberList') {
            result = response.result || [];
        } else if (modalType.value === 'productList') {
            result = response.result.content || []; // 가정
        } else if (modalType.value === 'customerList') {
            result = response.result.content || []; // 가정
        }

        if (Array.isArray(result)) {
            modalTableData.value = result;
            console.log("Modal Table Data:", modalTableData.value);
        } else {
            console.warn("API 응답 데이터가 배열이 아닙니다.");
            modalTableData.value = [];
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error.message);
        alert("데이터를 가져오는 데 실패했습니다. 관리자에게 문의하세요.");
    } finally {
        loading.value = false;
    }
}


</script>

<style scoped>
.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* 세로 가운데 정렬 */
    width: 100%;
    /* 부모 요소 기준 크기 */
    box-sizing: border-box;
    /* 테두리 포함 크기 계산 */
}

.path {
    /* 나머지 요소를 오른쪽으로 밀어냄 */
    margin-bottom: 10px;
    display: flex;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px 16px;
    text-align: center;
}

th {
    background-color: #F8F8F8;
    color: #777;
}

/* 선택된 행 스타일 */
tr.selected {
    background-color: #e0e0e0;
    /* 선택된 행의 배경색 */
}

tr:hover {
    cursor: pointer;
    background-color: #f0f0f0;
}

.p-inputtext {
    height: 27px !important;
    border-radius: 0px;
}

.select {
    display: flex;
    justify-content: right;
    margin-top: 16px;
}

.search-button {
    right: 0;
    top: 0;
    width: 27px;
    height: 27px;
    background: #6360AB !important;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.search-icon {
    color: white;
    font-size: 14px;
}

.component-wrapper {
    margin-bottom: 8rem;
}

.custom-tag-wrapper {
    display: flex;
    justify-content: center;
    /* 수평 가운데 정렬 */
    align-items: center;
    /* 수직 가운데 정렬 */
    height: 100%;
    /* 부모 높이에 맞게 정렬 */
}

.custom-tag {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    color: white;
    width: 50px;
}

.custom-tag.success {
    background-color: #caf1d8;
    color: #188a42;
}

.custom-tag.warning {
    background-color: #feddc7;
    color: #ae510f;
}

.custom-tag.danger {
    background-color: #ffd0ce;
    color: #b32b23;
}

.custom-tag.info {
    background-color: #d0e1fd;
    color: #295bac;
}

.radio-group {
    display: flex;
    gap: 16px;
    /* 라디오 버튼 간 간격 */
}

.radio-option {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #555;
}

.radio-option input {
    margin-right: 8px;
}

.modal-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-weight: bold;
    font-size: 14px;
    color: #333;
}

.form-input {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
}

.p-ripple-disabled {
    height: none;
}

.button-row {
    display: flex;
    gap: 10px;
    /* 버튼 간 간격 */
    margin-bottom: 20px;
    /* 버튼 행 위쪽 간격 */
    justify-content: end;
    /* 버튼을 왼쪽 정렬 */
}

.flex-container {
    display: flex;
    align-items: center;
    /* 세로로 중앙 정렬 */
    justify-content: end;
    gap: 16px;
    /* 요소 간의 간격 */
}

.common-button {
    background-color: #6360AB;
    /* 기본 배경색 */
    color: #fff;
    /* 텍스트 색상 */
    border: none;
    /* 테두리 제거 */
    padding: 8px 16px;
    /* 버튼 내부 여백 */
    font-size: 14px;
    /* 텍스트 크기 */
    cursor: pointer;
    /* 마우스 커서 */
    border-radius: 4px;
    /* 모서리 둥글게 */
    text-align: center;
    /* 텍스트 정렬 */
    display: inline-block;
    /* 인라인 블록 레이아웃 */
    box-sizing: border-box;
    /* 크기 계산에 패딩 포함 */
}

.common-button:hover {
    background-color: #4e4c96;
    /* 호버 시 배경색 */
}

.bigcard-container {
    display: flex;
    justify-content: center;
    /* 가로 중앙 정렬 */
    align-items: center;
    /* 세로 중앙 정렬 */
    width: 60%;
    /* 부모 요소의 100% 폭 */
    height: 60%;
    /* 부모 요소의 100% 높이 */
    padding: 16px;
    /* 내부 여백 */
}

.bigcard {
    width: 60%;
    /* 가로 100% */
    height: 60%;
    /* 세로 100% */
    min-height: 300px;
    /* 최소 높이 보장 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* 내용 중앙 정렬 */
}
</style>