<template>
    <Modal v-model="isVisible" header=" 발주서 등록" width="100rem" height="none" @cancel="resetModalState">
        <div class="flex-row content-center">
            <div class="flex-row items-center">
                <Typography type="title3" color="black" fontSize="16px" class="mr-s">발주서 제목:</Typography>
            </div>
            <InputText type="text" v-model="title" />
        </div>
        <div class="flex-row content-between">
            <CKEditor v-model="content" :initial-html="initialHtml" @update:model-value="handleEditorUpdate"
                ref="editorRef" />
            <div class="p-20">
                <Card
                    style="width: 25rem; height: 37rem; overflow: visible; margin-top: 10px; box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);">
                    <template #title>수주서 선택</template>
                    <Divider />
                    <template #content>
                        <div class="order-list" @scroll="onScroll" style="max-height: 32rem; overflow-y: auto;">
                            <div v-for="order in orders" :key="order.id" class="order-item"
                                :class="{ 'selected': selectedOrderId === order.id }" @click="selectOrder(order)"
                                style="padding: 15px 10px; cursor: pointer;">
                                <Typography>제목: {{ order.title }}</Typography>
                                <Typography type="caption">{{ order.createdAt }}</Typography>
                            </div>
                            <div v-if="isLoading" style="text-align: center; padding: 10px;">
                                <Typography type="caption">로딩 중...</Typography>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        <div class="flex-row content-between ml-l mr-xl">
            <button class="custom-button" @click="openSignatureModal()">작성인 서명</button>
        </div>
        <SignatureModal v-model:visible="isSignatureModalVisible" @signatureSaved="handleSignature" />

        <template #footer>
            <CommonButton label="취소" color="#F1F1FD" textColor="#6360AB" @click="closeModal" />
            <CommonButton label="등록" color="#6360AB" textColor="#FFFFFF" @click="onRegister" />
        </template>
    </Modal>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import Modal from '@/components/common/Modal.vue';
import CommonButton from '@/components/common/Button/CommonButton.vue';
import CKEditor from '@/components/common/CKEditor/CKEditor.vue';
import Typography from '@/components/Typography.vue';
import SignatureModal from '@/components/common/signatureCanvas/SignatureModal.vue';
import { $api } from "@/services/api/api"; // $api는 API 호출 핸들러로 가정
import { useToast } from 'primevue/usetoast';

// 부모에서 전달받는 props
const props = defineProps({
    visible: {
        type: Boolean,
        required: true,
    },
});

const validateForm = () => {
    if (!title.value) {
        toast.add({ severity: 'warn', summary: '유효성 검사 실패', detail: '발주서 제목을 입력해주세요.', life: 3000 });
        return false;
    }
    if (!writerSignature.value) {
        toast.add({ severity: 'warn', summary: '유효성 검사 실패', detail: '작성인 서명을 추가해주세요.', life: 3000 });
        return false;
    }
    if (!content.value || content.value.trim() === initialHtml.trim()) {
        toast.add({ severity: 'warn', summary: '유효성 검사 실패', detail: '발주 내용을 입력해주세요.', life: 3000 });
        return false;
    }
    return true;
};

function resetModalState() {
    isVisible.value = false;
    title.value = null;
    content.value = initialHtml;
    writerSignature.value = null;
    emit('update:visible', false); // 부모 컴포넌트에 상태 전달
    emit('close'); // 부모 컴포넌트에 close 이벤트 전달
}

// 부모 컴포넌트로 상태를 전달하는 emit
const emit = defineEmits(['update:visible', 'close']);
const toast = useToast();

// 내부 상태 변수
const isVisible = ref(props.visible);
const isSignatureModalVisible = ref(false);
const content = ref(''); // CKEditor의 현재 내용
const title = ref('');
const initialHtml = `
    <!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>발주서</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px;">

    <div style="width: 600px; border: 1px solid #000; padding: 20px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">발 주 서</h1>
        </div>

        <div style="display: flex; justify-content: end; font-size: 14px; margin-bottom: 10px;">
            <div>
                <table
                    style=" width: 20%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; margin-left: auto;">
                    <tr style="background-color: #f0f0f0;">
                        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">작성</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 20px 40px; text-align: center;" id="writer-signature-area"></td>
                    </tr>
                </table>
            </div>
        </div>

        <table style="width: 100%; font-size: 14px; margin-bottom: 10px; border-collapse: collapse;">
            <tr>
                <td style="padding: 5px; border: 1px solid #000;">발주일자</td>
                <td style="padding: 5px; border: 1px solid #000; width: 30%;" class="createdAt"></td>
                <td style="padding: 5px; border: 1px solid #000;">수주서 번호</td>
                <td style="padding: 5px; border: 1px solid #000; width: 30%;" class="orderId"></td>
            </tr>
            <tr>
                <td style="padding: 5px; border: 1px solid #000;">발주자</td>
                <td style="padding: 5px; border: 1px solid #000; width: 30%;" class="memberName"></td>
                <td style="padding: 5px; border: 1px solid #000;">영업 매장</td>
                <td style="padding: 5px; border: 1px solid #000; width: 30%;" class="centerName"></td>
            </tr>
        </table>

        <table style="width: 100%; font-size: 14px; margin-bottom: 20px; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="padding: 10px; border: 1px solid #000;">No</th>
                    <th style="padding: 10px; border: 1px solid #000;">품목</th>
                    <th style="padding: 10px; border: 1px solid #000;">수량</th>
                    <th style="padding: 10px; border: 1px solid #000;">단가</th>
                    <th style="padding: 10px; border: 1px solid #000;">금액</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 10px; border: 1px solid #000;" class="no">1</td>
                    <td style="padding: 10px; border: 1px solid #000;" class="productName"></td>
                    <td style="padding: 10px; border: 1px solid #000;" class="numberOfVehicles format-number"></td>
                    <td style="padding: 10px; border: 1px solid #000;" class="vehiclePrice format-number"></td>
                    <td style="padding: 10px; border: 1px solid #000;" class="vehiclePrice1 format-number"></td>
                </tr>
                <tr>
                    <td colspan="4" style="padding: 10px; border: 1px solid #000; text-align: right;">합계</td>
                    <td style="padding: 10px; border: 1px solid #000;" class="totalSales format-number"></td>
                </tr>
            </tbody>
        </table>

        <div style="font-size: 12px; margin-top: 20px;">
            <p style="margin: 5px 0;">* 특이사항: 없음</p>
        </div>

        <div style="margin-top: 20px; font-size: 12px;">
            <p style="margin: 5px 0; text-align: right;">감사합니다.</p>
        </div>
    </div>

</body>

</html>
`;

// CKEditor 내용에서 데이터를 추출하는 함수
const extractDataFromHTML = (html) => {
    const parser = new DOMParser();

    const doc = parser.parseFromString(html, "text/html");


    const orderId = doc.querySelector(".orderId")?.innerText.trim() || "";
    const no = doc.querySelector(".no")?.innerText.trim() || "";
    const memberName = doc.querySelector(".memberName")?.innerText.trim() || "";
    const createdAt = doc.querySelector(".createdAt")?.innerText.trim() || "";
    const productName = doc.querySelector(".productName")?.innerText.trim() || "";
    const numberOfVehicles = doc.querySelector(".numberOfVehicles")?.innerText.trim() || "";
    const vehiclePrice = doc.querySelector(".vehiclePrice")?.innerText.trim() || "";
    const vehiclePrice1 = doc.querySelector(".vehiclePrice1")?.innerText.trim() || "";
    const centerName = doc.querySelector(".centerName")?.innerText.trim() || "";
    const totalSales = doc.querySelector(".totalSales")?.innerText.trim() || "";

    // 필요한 필드를 추가적으로 추출
    return {
        title: title.value,
        orderId,
        memberName,
        createdAt,
        productName,
        numberOfVehicles,
        vehiclePrice,
        vehiclePrice1,
        totalSales,
        centerName,
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
    <title>발주서</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px;">

    <div style="width: 600px; border: 1px solid #000; padding: 20px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">발 주 서</h1>
        </div>

        <div style="display: flex; justify-content: end; font-size: 14px; margin-bottom: 10px;">
            <div>
                <table
                    style=" width: 20%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; margin-left: auto;">
                    <tr style="background-color: #f0f0f0;">
                        <td style="border: 1px solid #000; text-align: center; font-weight: bold;">작성</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 20px 40px; text-align: center;" id="writer-signature-area">
                            ${
                            data.writerSignature
                                ? `<img src="${data.writerSignature}" alt="작성인 서명 이미지" style="width: 8rem; height: auto;">`
                                : "(서명)"
                        }
                            </td>
                    </tr>
                </table>
            </div>
        </div>

        <table style="width: 100%; font-size: 14px; margin-bottom: 10px; border-collapse: collapse;">
            <tr>
                <td style="padding: 5px; border: 1px solid #000;">발주일자</td>
                <td style="padding: 5px; border: 1px solid #000; width: 30%;" class="createdAt">${data.createdAt || "-"}</td>
                <td style="padding: 5px; border: 1px solid #000;">수주서 번호</td>
                <td style="padding: 5px; border: 1px solid #000; width: 30%;" class="orderId">${data.orderId || "-"}</td>
            </tr>
            <tr>
                <td style="padding: 5px; border: 1px solid #000;">발주자</td>
                <td style="padding: 5px; border: 1px solid #000; width: 30%;" class="memberName">${data.memberName || "-"}</td>
                <td style="padding: 5px; border: 1px solid #000;">영업 매장</td>
                <td style="padding: 5px; border: 1px solid #000; width: 30%;" class="centerName">${data.centerName || "-"}</td>
            </tr>
        </table>

        <table style="width: 100%; font-size: 14px; margin-bottom: 20px; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="padding: 10px; border: 1px solid #000;">No</th>
                    <th style="padding: 10px; border: 1px solid #000;">품목</th>
                    <th style="padding: 10px; border: 1px solid #000;">수량</th>
                    <th style="padding: 10px; border: 1px solid #000;">단가</th>
                    <th style="padding: 10px; border: 1px solid #000;">금액</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 10px; border: 1px solid #000;" class="no">${data.no || "-"}</td>
                    <td style="padding: 10px; border: 1px solid #000;" class="productName">${data.productName || "-"}</td>
                    <td style="padding: 10px; border: 1px solid #000;" class="numberOfVehicles format-number">${data.numberOfVehicles || "-"}</td>
                    <td style="padding: 10px; border: 1px solid #000;" class="vehiclePrice format-number">${data.vehiclePrice || "-"}</td>
                    <td style="padding: 10px; border: 1px solid #000;" class="vehiclePrice1 format-number">${data.vehiclePrice1 || "-"}</td>
                </tr>
                <tr>
                    <td colspan="4" style="padding: 10px; border: 1px solid #000; text-align: right;">합계</td>
                    <td style="padding: 10px; border: 1px solid #000;" class="totalSales format-number">${data.totalSales || "-"}</td>
                </tr>
            </tbody>
        </table>

        <div style="font-size: 12px; margin-top: 20px;">
            <p style="margin: 5px 0;">* 특이사항: 없음</p>
        </div>

        <div style="margin-top: 20px; font-size: 12px;">
            <p style="margin: 5px 0; text-align: right;">감사합니다.</p>
        </div>
    </div>

</body>

</html>
    `;
};

const orders = ref([]);
const page = ref(1);
const hasMoreOrders = ref(true);
const sortField = ref('orderDate'); // 정렬 기준 필드
const sortOrder = ref('desc'); // 정렬 순서 (asc/desc)

// props 변화 감지
watch(
    () => props.visible,
    (newVal) => {
        if (newVal) {
            resetModalState();
            content.value = initialHtml;
            fetchOrders();
            isVisible.value = true;
        }
    }
);

// 모달 열릴 때 초기 데이터 로드
watch(() => props.visible, (newVal) => {
    if (newVal) {
        orders.value = []; // 기존 데이터 초기화
        page.value = 1;
        hasMoreOrders.value = true;
        fetchOrders(); // 데이터 로드
    }
});

const isLoading = ref(false); // 요청 상태

const fetchOrders = async () => {
    if (!hasMoreOrders.value || isLoading.value) return; // 요청 중이거나 데이터가 없으면 실행하지 않음

    isLoading.value = true; // 요청 시작
    try {
        const query = {
            page: page.value - 1,
            size: 10,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
        };
        const queryString = `?${new URLSearchParams(query).toString()}`;
        console.log("API 호출 URL:", queryString);

        const response = await $api.order.getParams('center', queryString);
        console.log("API 응답 데이터:", response);

        const result = response?.result;
        const orderData = result.content;
        const totalPages = result.totalPages;

        if (orderData.length) {
            orders.value.push(...orderData);
            page.value += 1;
        }

        if (page.value > totalPages) {
            hasMoreOrders.value = false;
        }
    } catch (error) {
        console.error('수주서 조회 중 오류 발생:', error);
    } finally {
        isLoading.value = false; // 요청 종료
    }
};

const editorRef = ref(null);
const ignoreUpdates = ref(false);
const selectedOrderId = ref(null);

// 계약서 선택 시 CKEditor 업데이트
const selectOrder = async (order) => {
    selectedOrderId.value = order.orderId;

    // 서버에 상세조회 요청
    const response = await $api.order.get(
        '',
        selectedOrderId.value
    );

    const orderDetail = response.result.contractId;

    const response1 = await $api.contract.get(
        '',
        orderDetail
    );

    const contractDetails = response1.result;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content.value, 'text/html'); // 현재 CKEditor 내용을 HTML로 파싱

    const orderCell = doc.querySelector('.orderId');
    const productNameCell = doc.querySelector(".productName");
    const numberOfVehiclesCell = doc.querySelector(".numberOfVehicles");
    const vehiclePriceCell = doc.querySelector(".vehiclePrice");
    const vehiclePrice1Cell = doc.querySelector(".vehiclePrice1");
    const totalSalesCell = doc.querySelector(".totalSales");

    if (!orderCell) {
        console.error("HTML 구조에 .orderId 셀을 찾을 수 없습니다.");
        return;
    }

    // contractId 값 삽입
    orderCell.textContent = order.orderId;
    productNameCell.textContent = contractDetails.carName;
    vehiclePriceCell.textContent = contractDetails.vehiclePrice;
    numberOfVehiclesCell.textContent = contractDetails.numberOfVehicles;
    vehiclePrice1Cell.textContent = contractDetails.vehiclePrice;
    totalSalesCell.textContent = contractDetails.vehiclePrice;

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
        fetchOrders();
    }
};

const formatNumbersInTable = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const tdElements = doc.querySelectorAll('td.format-number');

    tdElements.forEach((td) => {
        const text = td.textContent.trim();
        if (!isNaN(text) && text !== '') {
            const number = parseFloat(text);
            td.textContent = new Intl.NumberFormat('en-US').format(number);
        }
    });

    return doc.body.innerHTML;
};

// 에디터 내용 업데이트 핸들러
const handleEditorUpdate = (newContent) => {
    if (ignoreUpdates.value) {
        ignoreUpdates.value = false; // 플래그 초기화
        return; // CKEditor 업데이트 중 발생한 호출 무시
    }
    const formattedContent = formatNumbersInTable(newContent);
    content.value = formattedContent;
    console.log('Editor content updated:', formattedContent);
};

// 등록 버튼 클릭 시 호출되는 함수
const onRegister = async () => {
    try {
        console.log("Current editor content:", content.value);

        // 유효성 검사
        if (!validateForm()) {
            return; // 검사 실패 시 함수 종료
        }

        const extractedData = extractDataFromHTML(content.value, writerSignature.value);

        const data = {
            ...extractedData,
            writerSignature: writerSignature.value,
        };

        const updatedInitialHtml = generateInitialHtml(data);
        content.value = updatedInitialHtml;

        const postData = {
            title: extractedData.title,
            orderId: extractedData.orderId,
            memberName: extractedData.memberName,
            createdAt: extractedData.createdAt,
            productName: extractedData.productName,
            numberOfVehicles: extractedData.numberOfVehicles,
            vehiclePrice: extractedData.vehiclePrice,
            totalSales: extractedData.totalSales,
            vehiclePrice1: extractedData.vehiclePrice1,
            totalSales1: extractedData.totalSales1,
            centerName: extractedData.centerName,
            no: extractedData.no,
            content: content.value,
        };

        const response = await $api.purchaseOrder.post(postData, "");

        toast.add({ severity: 'success', summary: '등록 완료', detail: '발주서가 성공적으로 등록되었습니다.', life: 3000 });

        title.value = "";
        content.value = initialHtml;
        isVisible.value = false;
        emit('update:visible', false);
        emit('refresh');
        closeModal();
    } catch (error) {
        console.error("등록 중 오류:", error);
        toast.add({ severity: 'error', summary: '등록 실패', detail: `등록 중 문제가 발생했습니다: ${error.message}`, life: 3000 });
    }
};

// 모달 닫기 함수
function closeModal() {
    isVisible.value = false;
    emit('update:visible', false); // 부모 컴포넌트에 상태 전달
    emit('close'); // 부모 컴포넌트에 close 이벤트 전달
}

const openSignatureModal = () => {
    isSignatureModalVisible.value = true;
};

const writerSignature = ref(null);

const handleSignature = async (signatureImage) => {

    if (!signatureImage.startsWith("data:image/")) {
        console.error("잘못된 서명 이미지 데이터:", signatureImage);
        return;
    }

    writerSignature.value = signatureImage;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content.value, "text/html");

    const writerSignatureArea = doc.querySelector('#writer-signature-area');
    if (writerSignature) {
        writerSignatureArea.innerHTML = `<img src="${signatureImage}" alt="작성 서명 이미지" style="width: 6rem; height: auto;">`;
    }

    content.value = doc.documentElement.outerHTML; // 업데이트된 HTML 반영

    isSignatureModalVisible.value = false; // 모달 닫기
};

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

.order-item {
    transition: background-color 0.2s ease-in-out;
    border-radius: 4px;
    border-bottom: 1px solid #e4e4e4;
    padding: 0 10px;
}

.order-item.selected {
    background-color: #e0e0e0;
    /* 선택된 상태 */
    font-weight: bold;
}

.order-item:not(.selected):hover {
    background-color: #f5f5f5;
    /* 선택되지 않은 상태에서 hover */
}
</style>