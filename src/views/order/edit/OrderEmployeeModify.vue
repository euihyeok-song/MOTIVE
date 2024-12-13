<template>
    <Modal v-model="isVisible" header="수주서 수정" width="100rem" height="none" @cancel="resetModalState">
        <div class="flex-row content-center">
            <div class="flex-row items-center">
                <Typography type="title3" color="black" fontSize="16px" class="mr-s">수주서 제목:</Typography>
            </div>
            <InputText type="text" v-model="title" />
        </div>
        <div class="flex-row content-between">
            <CKEditor v-model="content" :initial-html="initialHtml" @update:model-value="handleEditorUpdate" ref="editorRef" />
            <div class="p-20">
                <Card style="width: 25rem; height: 37rem; overflow: visible; box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);">
                    <template #title>계약서 선택</template>
                    <Divider />
                    <template #content>
                        <div
                            class="contract-list"
                            @scroll="onScroll"
                            style="max-height: 32rem; overflow-y: auto;"
                        >
                            <div
                                v-for="contract in contracts"
                                :key="contract.id"
                                class="contract-item"
                                :class="{ 'selected': selectedContractId === contract.id }"
                                @click="selectContract(contract)"
                                style="padding: 15px 10px; cursor: pointer;"
                            >
                                <Typography>제목: {{ contract.title }}</Typography>
                                <Typography type="caption">{{ contract.createdAt }}</Typography>
                            </div>
                            <div v-if="isLoading" style="text-align: center; padding: 10px;">
                                <Typography type="caption">로딩 중...</Typography>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <template #footer>
            <CommonButton label="취소" color="#F1F1FD" textColor="#6360AB" @click="closeModal" />
            <CommonButton label="수정" color="#6360AB" textColor="#FFFFFF" @click="onUpdate" />
        </template>
    </Modal>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import Modal from '@/components/common/Modal.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import Typography from '@/components/Typography.vue';
import CKEditor from '@/components/common/CKEditor/CKEditor.vue';
import { $api } from "@/services/api/api";
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true,
    },
    orderId: {
        type: String,
        required: true,
    },
});

const validateForm = () => {
    if (!title.value) {
        toast.add({ severity: 'warn', summary: '유효성 검사 실패', detail: '수주서 제목을 입력해주세요.', life: 3000 });
        return false;
    }
    return true;
};

function resetModalState() {
    isVisible.value = false;
    emit('update:visible', false); // 부모 컴포넌트에 상태 전달
    emit('close'); // 부모 컴포넌트에 close 이벤트 전달
}

const emit = defineEmits(['update:visible', 'close']);
const toast = useToast();
const isVisible = ref(props.visible);
const content = ref('');
const title = ref('');

watch(
    () => props.visible,
    async (newVal) => {
        isVisible.value = newVal;
        if (newVal) {
            resetModalState();
            await getDetailRequest();
            isVisible.value = true;
        }
    }
);

const getDetailRequest = async () => {
    try {
        console.log("orderId: " + props.orderId);
        const response = await $api.order.get('employee', props.orderId);
        console.log('수주서 상세 조회 응답:', response);

        const createdUrl = response.result.content;
        if (createdUrl) {

            const htmlResponse = await fetch(createdUrl);
            if (!htmlResponse.ok) {
                throw new Error(`Failed to fetch HTML: ${htmlResponse.status}`);
            }

            const htmlText = await htmlResponse.text();
            content.value = htmlText; // content를 직접 설정
            title.value = response.result.title;
        } else {
            console.error('createdUrl이 비어 있습니다.');
        }
    } catch (error) {
        console.error('GET DETAIL 요청 실패: ', error);
    }
};

// 수정 버튼 클릭 시 호출되는 함수
const onUpdate = async () => {
    try {
        if (!content.value) {
            throw new Error("에디터 내용이 비어 있습니다.");
        }

        // 유효성 검사
        if (!validateForm()) {
            return; // 검사 실패 시 함수 종료
        }

        const extractedData = extractDataFromHTML(content.value);

        // initialHtml을 업데이트
        const updatedInitialHtml = generateInitialHtml({
            ...extractedData,
            numberOfVehicles: formatNumberWithCommas(extractedData.numberOfVehicles),
            totalSales: formatNumberWithCommas(extractedData.totalSales),
            stock: formatNumberWithCommas(extractedData.stock),
            writerSignature: extractedData.writerSignature, // 서명 이미지 추가
        });

        // content에 반영
        content.value = updatedInitialHtml;

        const postData = {
            title: extractedData.title,
            orderId: extractedData.orderId,
            contractId: extractedData.contractId,
            content: content.value,
        };

        const response = await $api.order.put(
            postData,
            props.orderId
        );

        toast.add({ severity: 'success', summary: '수정 완료', detail: '수주서가 성공적으로 수정되었습니다.', life: 3000 });

        closeModal();
        window.location.reload();
    } catch (error) {
        console.error("수정 중 오류:", error);
        toast.add({ severity: 'error', summary: '수정 실패', detail: `수정 중 문제가 발생했습니다: ${error.message}`, life: 3000 });
    }
};

// CKEditor 내용에서 데이터를 추출하는 함수
const extractDataFromHTML = (html) => {
    const parser = new DOMParser();

    const doc = parser.parseFromString(html, "text/html");

    const contractId = doc.querySelector(".contractId")?.innerText.trim() || "";
    const createdAt = doc.querySelector(".createdAt")?.innerText.trim() || "";
    const centerName = doc.querySelector(".centerName")?.innerText.trim() || "";
    const adminId = doc.querySelector(".adminId")?.innerText.trim() || "";
    const serialNo = doc.querySelector(".serialNo")?.innerText.trim() || "";
    const carName = doc.querySelector(".carName")?.innerText.trim() || "";
    const no = doc.querySelector(".no")?.innerText.trim() || "";
    const numberOfVehicles = doc.querySelector(".numberOfVehicles")?.innerText.trim() || "";
    const totalSales = doc.querySelector(".totalSales")?.innerText.trim() || "";
    const stock = doc.querySelector(".stock")?.innerText.trim() || "";

    const writerSignature = doc.querySelector("#writer-signature-area img")?.getAttribute("src") || null;

    // 필요한 필드를 추가적으로 추출
    return {
        title: title.value,
        contractId,
        createdAt,
        centerName,
        adminId,
        serialNo,
        numberOfVehicles,
        totalSales,
        stock,
        carName,
        writerSignature,
        no,
        content: html // HTML 전체를 전송
    };
};

const generateInitialHtml = (data) => {
    return `
        <!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Sheet</title>
</head>

<body>
    <div
    style="font-family: Arial, sans-serif; line-height: 1.5; display: flex; justify-content: center; padding: 20px; background-color: #f9f9f9;">
    <div style="width: 900px; border: 1px solid #000; padding: 20px; background-color: #fff;">
        <!-- Header Section -->
        <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; position: relative;">
            <!-- 수주서 제목 -->
            <div style="position: absolute; left: 50%; transform: translateX(-50%); text-align: center;">
                <h2 style="font-size: 20px; font-weight: bold; margin: 0;">수주서</h2>
            </div>

            <!-- Approval Table -->
            <div>
                <table
                    style=" width: 20%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; margin-left: auto;">
                    <tr style="background-color: #f0f0f0;">
                        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">작성</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; width: 50px; text-align: center;" id="writer-signature-area">
                            ${data.writerSignature
            ? `<img src="${data.writerSignature}" alt="작성인 서명 이미지" style="width: 8rem; height: auto;">`
            : "(서명)"
        }
                            </td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Top Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
            <tr>
                <td style="width: 10%; border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">날짜
                </td>
                <td style="width: 15%; border: 1px solid #000; padding: 6px;" class="createdAt">${data.createdAt || "-"}</td>
                <td style="width: 14%; border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">계약서
                    번호</td>
                <td style="width: 15%; border: 1px solid #000; padding: 6px;" class="contractId">${data.contractId || "-"}</td>
                <td style="width: 10%; border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">매장
                </td>
                <td style="width: 15%; border: 1px solid #000; padding: 6px;" class="centerName">${data.centerName || "-"}</td>
                <td style="width: 10%; border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">담당자
                </td>
                <td style="width: 15%; border: 1px solid #000; padding: 6px;" class="adminId">${data.adminId || "-"}</td>
            </tr>
        </table>

        <!-- Middle Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
            <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #000; padding: 6px; text-align: center;">No.</th>
                <th style="border: 1px solid #000; padding: 6px; text-align: center;">일련번호</th>
                <th style="border: 1px solid #000; padding: 6px; text-align: center;">품명</th>
                <th style="border: 1px solid #000; padding: 6px; text-align: center;">수주수량</th>
                <th style="border: 1px solid #000; padding: 6px; text-align: center;">단가 / 합계</th>
                <th style="border: 1px solid #000; padding: 6px; text-align: center;">현재고</th>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 6px; height: 20px;" class="no">${data.no || "-"}</td>
                <td style="border: 1px solid #000; padding: 6px;" class="serialNo">${data.serialNo || "-"}</td>
                <td style="border: 1px solid #000; padding: 6px;" class="carName">${data.carName || "-"}</td>
                <td style="border: 1px solid #000; padding: 6px;" class="numberOfVehicles format-number">${data.numberOfVehicles || "-"}</td>
                <td style="border: 1px solid #000; padding: 6px;" class="totalSales format-number">${data.totalSales || "-"}</td>
                <td style="border: 1px solid #000; padding: 6px;" class="stock">${data.stock || "-"}</td>
            </tr>
        </table>
    </div>
</div>
</body>
</html>
    `;
};

const contracts = ref([]);
const page = ref(1);
const hasMoreContracts = ref(true);
const sortField = ref('contractDate'); // 정렬 기준 필드
const sortOrder = ref('desc'); // 정렬 순서 (asc/desc)

// 모달 열릴 때 초기 데이터 로드
watch(() => props.visible, (newVal) => {
    if (newVal) {
        contracts.value = []; // 기존 데이터 초기화
        page.value = 1;
        hasMoreContracts.value = true;
        fetchContracts(); // 데이터 로드
    }
});

const isLoading = ref(false); // 요청 상태

const fetchContracts = async () => {
    if (!hasMoreContracts.value || isLoading.value) return; // 요청 중이거나 데이터가 없으면 실행하지 않음

    isLoading.value = true; // 요청 시작
    try {
        const query = {
            page: page.value - 1,
            size: 10,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
        };
        const queryString = `?${new URLSearchParams(query).toString()}`;

        const response = await $api.contract.getParams('employee', queryString);

        const result = response?.result;
        const contractData = result.content;

        contracts.value.push(...contractData);

        const totalPages = result.totalPages;

        page.value += 1;

        if (page.value > totalPages) {
            hasMoreContracts.value = false;
        }
    } catch (error) {
        console.error('계약서 조회 중 오류 발생:', error);
    } finally {
        isLoading.value = false; // 요청 종료
    }
};

const editorRef = ref(null);
const ignoreUpdates = ref(false);
const selectedContractId = ref(null);

// 계약서 선택 시 CKEditor 업데이트
const selectContract = async (contract) => {
    selectedContractId.value = contract.contractId;


    // 서버에 상세조회 요청
    const response = await $api.contract.get(
        'employee',
        selectedContractId.value
    );

    console.log('GET DETAIL 요청 응답 결과');
    console.log(response);

    const contractDetails = response.result;
    const parser = new DOMParser();
    const doc = parser.parseFromString(content.value, 'text/html'); // 현재 CKEditor 내용을 HTML로 파싱

    const contractIdCell = doc.querySelector('.contractId');
    const centerCell = doc.querySelector('.centerName');
    const serialNoCell = doc.querySelector('.serialNo');
    const carNameCell = doc.querySelector('.carName');
    const numberOfVehiclesCell = doc.querySelector('.numberOfVehicles');
    const totalSalesCell = doc.querySelector('.totalSales');
    const stockCell = doc.querySelector('.stock');


    // .contractId 셀 찾기
    if (!contractIdCell) {
        console.error("HTML 구조에 .contractId 셀을 찾을 수 없습니다.");
        return;
    }

    // contractId 값 삽입
    contractIdCell.textContent = contractDetails.contractId;
    centerCell.textContent = contractDetails.centerName; // name이 없음
    serialNoCell.textContent = contractDetails.serialNum;
    carNameCell.textContent = contractDetails.carName;
    numberOfVehiclesCell.textContent = contractDetails.numberOfVehicles;
    totalSalesCell.textContent = contractDetails.vehiclePrice;
    stockCell.textContent = 14;



    // HTML 업데이트
    const updatedHtml = doc.documentElement.outerHTML;

    // CKEditor와 동기화
    ignoreUpdates.value = true; // 업데이트 플래그 설정
    content.value = updatedHtml; // content.value 업데이트
};

// 무한 스크롤 이벤트 핸들러
const onScroll = (event) => {
    const target = event.target;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
        fetchContracts(); // 스크롤이 끝에 가까워지면 계약서 데이터 가져오기
    }
};

// 숫자 포맷 함수
const formatNumberWithCommas = (num) => {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatNumbersInTable = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const tdElements = doc.querySelectorAll('td.format-number');

    tdElements.forEach((td) => {
        const text = td.textContent.trim().replace(/,/g, '');
        if (!isNaN(text) && text !== '') {
            const number = parseFloat(text);
            td.textContent = formatNumberWithCommas(number);
        }
    });

    return doc.body.innerHTML;
};

// 에디터 내용 업데이트 핸들러
const handleEditorUpdate = (newContent) => {
    const formattedContent = formatNumbersInTable(newContent);

    if (formattedContent !== content.value) {
        content.value = formattedContent; // CKEditor 내용 업데이트
    }
};

function closeModal() {
    isVisible.value = false;
    content.value = ''; // 모달 닫을 때 content 초기화
    emit('update:visible', false);
    emit('close');
}
</script>

<style scoped>
/* 모달 및 CKEditor 스타일 */
.main-container {
    max-width: 99%;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
}

.editor-container {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
}

::v-deep .ck-editor__editable {
    min-height: 400px;
    padding: 16px;
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    background-color: #fff;
    border-radius: 4px;
}

::v-deep .ck-toolbar {
    border-bottom: 1px solid #e0e0e0;
    background-color: #f7f7f7;
    border-radius: 8px 8px 0 0;
}

::v-deep .ck-content pre.fancy-code-dark {
    background-color: #282c34;
    color: #61dafb;
    padding: 16px;
    border-radius: 4px;
}

.p-inputtext {
    width: 30rem;
    border-bottom: 3px solid #000;
    border-radius: 0px;
    border-top: none;
    border-left: none;
    border-right: none;
}
</style>