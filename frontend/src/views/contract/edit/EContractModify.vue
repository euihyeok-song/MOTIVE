<template>
    <Modal
        v-model="isVisible"
        header="계약서 수정"
        width="80rem"
        height="100rem"
        @cancel="resetModalState"
    >
        <div class="flex-row content-center">
            <div class="flex-row items-center">
                <Typography type="title3" color="black" fontSize="16px" class="mr-s">계약서 제목:</Typography>
            </div>
            <InputText type="text" v-model="title" />
        </div>
        <CKEditor 
            v-if="content"
            v-model="content" 
            :initial-html="content"
            @update:model-value="handleEditorUpdate" 
        />

        <template #footer>
            <CommonButton 
                label="취소" 
                color="#F1F1FD" 
                textColor="#6360AB" 
                @click="closeModal" 
            />
            <CommonButton 
                label="수정" 
                color="#6360AB" 
                textColor="#FFFFFF" 
                @click="onUpdate"
            />
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
    contractId: {
        type: String,
        required: true,
    },
});

const validateForm = () => {
    if (!title.value) {
        toast.add({ severity: 'warn', summary: '유효성 검사 실패', detail: '계약서 제목을 입력해주세요.', life: 3000 });
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
        const response = await $api.contract.get('', props.contractId);

        const createdUrl = response.result.createdUrl;
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
            vehiclePrice: formatNumberWithCommas(extractedData.vehiclePrice),
            downPayment: formatNumberWithCommas(extractedData.downPayment),
            intermediatePayment: formatNumberWithCommas(extractedData.intermediatePayment),
            remainderPayment: formatNumberWithCommas(extractedData.remainderPayment),
            consignmentPayment: formatNumberWithCommas(extractedData.consignmentPayment),
            totalSales: formatNumberWithCommas(extractedData.totalSales),
        });

        const postData = {
            title: extractedData.title, // 계약서 제목
            customerName: extractedData.customerName, // 고객 성명
            customerIdentifiNo: extractedData.customerIdentifiNo, // 고객 주민등록번호
            customerAddress: extractedData.customerAddress, // 고객 주소
            customerPhone: extractedData.customerPhone, // 고객 전화번호
            customerEmail: extractedData.customerEmail, // 고객 이메일
            companyName: extractedData.companyName, // 상호
            customerClassifcation: extractedData.customerClassifcation, // 고객 구분
            customerPurchaseCondition: extractedData.customerPurchaseCondition, // 구매 조건
            customerAge: extractedData.customerAge, // 고객 나이
            customerSex: extractedData.customerSex, // 고객 성별
            carName: extractedData.carName, // 차량 이름
            serialNum: extractedData.serialNum, // 차량 일련번호
            selectOption: extractedData.selectOption, // 차량 선택 옵션
            numberOfVehicles: extractedData.numberOfVehicles, // 차량 대수
            deliveryDate: extractedData.deliveryDate, // 인도 예정일
            deliveryLocation: extractedData.deliveryLocation, // 인도 장소
            vehiclePrice: extractedData.vehiclePrice, // 차량 가격
            downPayment: extractedData.downPayment, // 계약금
            intermediatePayment: extractedData.intermediatePayment, // 중도금
            remainderPayment: extractedData.remainderPayment, // 잔금
            consignmentPayment: extractedData.consignmentPayment, // 탁송료
            totalSales: extractedData.totalSales, // 총 판매 금액
            createdAt: extractedData.createdAt, // 계약일
            centerName: extractedData.centerName, // 계약 장소
            memberId: extractedData.memberId, // 담당자
            memberPhone: extractedData.memberPhone, // 담당자 전화번호
            createdUrl: updatedInitialHtml, // HTML 내용
        };
        
        const response = await $api.contract.put(
            postData,
            props.contractId
        );

        toast.add({ severity: 'success', summary: '수정 완료', detail: '계약서가 성공적으로 수정되었습니다.', life: 3000 });

        closeModal();
        window.location.reload();
    } catch (error) {
        console.error("수정 중 오류:", error);
        toast.add({ severity: 'error', summary: '수정 실패', detail: `수정 중 문제가 발생했습니다: ${error.message}`, life: 3000 });
    }
};

// CKEditor 내용에서 데이터를 추출하는 함수
const parseNumber = (value) => {
    if (!value) return 0;
    // 쉼표 제거 후 숫자로 변환
    return parseFloat(value.replace(/,/g, ''));
};

// CKEditor 내용에서 데이터를 추출하는 함수
const extractDataFromHTML = (html) => {
    const parser = new DOMParser();

    const doc = parser.parseFromString(html, "text/html");

    const createdAt = doc.querySelector(".createdAt")?.innerText.trim() || "";
    const centerName = doc.querySelector(".centerName")?.innerText.trim() || "";
    const memberId = doc.querySelector(".memberId")?.innerText.trim() || "";
    const memberPhone = doc.querySelector(".memberPhone")?.innerText.trim() || "";

    // 고객 사항
    const customerName = doc.querySelector(".customer-name-value")?.innerText.trim() || "";
    const customerIdentifiNo = doc.querySelector(".customer-identifiNo-value")?.innerText.trim() || "";
    const customerAddress = doc.querySelector(".customer-address-value")?.innerText.trim() || "";
    const customerPhone = doc.querySelector(".customer-phone-value")?.innerText.trim() || "";
    const customerEmail = doc.querySelector(".customer-email-value")?.innerText.trim() || "";
    const companyName = doc.querySelector(".customer-company-value")?.innerText.trim() || "";
    const customerClassifcation = doc.querySelector(".customer-classification-value")?.innerText.trim() || "";
    const customerPurchaseCondition = doc.querySelector(".customer-purchaseCondition-value")?.innerText.trim() || "";
    const customerAge = doc.querySelector(".customer-age-value")?.innerText.trim() || "";
    const customerSex = doc.querySelector(".customer-sex-value")?.innerText.trim() || "";

    // 차량 사항
    const carName = doc.querySelector(".customer-carName-value")?.innerText.trim() || "";
    const serialNum = doc.querySelector(".customer-serialNo-value")?.innerText.trim() || "";
    const selectOption = doc.querySelector(".customer-selectOption-value")?.innerText.trim() || "";
    const numberOfVehicles = doc.querySelector(".customer-numberOfVehicles-value")?.innerText.trim() || "";
    const deliveryDate = doc.querySelector(".customer-deliveryDate-value")?.innerText.trim() || "";
    const deliveryLocation = doc.querySelector(".customer-deliveryLocation-value")?.innerText.trim() || "";

    // 금액 사항
    const vehiclePrice = parseNumber(doc.querySelector(".customer-vehiclePrice-value")?.innerText.trim() || "0");
    const downPayment = parseNumber(doc.querySelector(".customer-downPayment-value")?.innerText.trim() || "0");
    const intermediatePayment = parseNumber(doc.querySelector(".customer-intermediatePayment-value")?.innerText.trim() || "0");
    const remainderPayment = parseNumber(doc.querySelector(".customer-remainderPayment-value")?.innerText.trim() || "0");
    const consignmentPayment = parseNumber(doc.querySelector(".customer-consignmentPayment-value")?.innerText.trim() || "0");
    const totalSales = parseNumber(doc.querySelector(".customer-totalSales-value")?.innerText.trim() || "0");

    const buyerSignature = doc.querySelector("#buyer-signature-area img")?.getAttribute("src") || null;
    const sellerSignature = doc.querySelector("#seller-signature-area img")?.getAttribute("src") || null;
    // 필요한 필드를 추가적으로 추출
    return {
        title: title.value,
        customerName,
        customerIdentifiNo,
        customerAddress,
        customerPhone,
        customerEmail,
        companyName,
        customerClassifcation,
        customerPurchaseCondition,
        customerAge,
        customerSex,
        carName,
        serialNum,
        selectOption,
        numberOfVehicles,
        deliveryDate,
        deliveryLocation,
        vehiclePrice,
        downPayment,
        intermediatePayment,
        remainderPayment,
        consignmentPayment,
        totalSales,
        createdAt,
        centerName,
        memberId,
        memberPhone,
        buyerSignature,
        sellerSignature,
        createdUrl: html // HTML 전체를 전송
    };
};

const generateInitialHtml = (data) => {
    return `
        <!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>자동차 매매 계약서</title>
</head>

<body style="font-family: 'Noto Sans KR', sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 800px; margin: auto; background-color: white; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <!-- 상단 로고 및 계약 정보 -->
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 24px; margin-bottom: 10px;">기아 자동차 매매 계약서</h1>
        </div>

        <!-- 관리 번호 및 계약 정보 -->
        <section style="margin-top: 20px;">
            <h2 style="background-color: #333; color: #fff; padding: 10px; font-size: 18px;">계약 정보</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #ddd;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: left; background-color: #f0f0f0; font-weight: bold; width: 20%;">계약일</th>
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: left; width: 30%;" class="createdAt">${data.createdAt || "-"}</td>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: left; background-color: #f0f0f0; font-weight: bold; width: 20%;">계약장소</th>
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: left;" class="centerName">${data.centerName || "-"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: left; background-color: #f0f0f0; font-weight: bold; width: 11%;">담당자</th>
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: left;" class="memberId">${data.memberId || "-"}</td>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: left; background-color: #f0f0f0; font-weight: bold; width: 11%;">전화번호</th>
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: left;" class="memberPhone">${data.memberPhone || "-"}</td>
                </tr>
            </table>
        </section>

        <!-- 고객 사항 -->
        <section style="margin-top: 20px;">
            <h2 style="background-color: #333; color: #fff; padding: 10px; font-size: 18px;">고객사항</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">성명</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-name-value">${data.customerName || "-"}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">상호</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-company-value">${data.companyName || "-"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">주민등록번호</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left;" class="customer-identifiNo-value">${data.customerIdentifiNo || "-"}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">사업자등록번호</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left;" class="customer-campanyNo-value">${data.businessNumber || "-"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">주소</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-address-value">${data.customerAddress || "-"}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">사업자등록주소</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-campanyAddresss-value">${data.businessAddress || "-"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">전화(휴대폰)</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-phone-value">${data.customerPhone || "-"}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">구분</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-classification-value">${data.customerClassifcation || "-"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">E-mail</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-email-value">${data.customerEmail || "-"}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">구매조건</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-purchaseCondition-value">${data.customerPurchaseCondition || "-"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">나이</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-age-value">${data.customerAge || "-"}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">성별</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-sex-value">${data.customerSex || "-"}</td>
                </tr>
            </table>
        </section>

        <!-- 차량 사항 -->
        <section style="margin-top: 20px;">
            <h2 style="background-color: #333; color: #fff; padding: 10px; font-size: 18px;">차량사항</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">차종</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-carName-value">${data.carName || "-"}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">일련번호</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-serialNo-value">${data.serialNum || "-"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">선택옵션</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-selectOption-value">${data.selectOption || "-"}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">차량대수</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%;" class="customer-numberOfVehicles-value format-number">${data.numberOfVehicles || "0"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">인도예정일</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left;" class="customer-deliveryDate-value">${data.deliveryDate || "-"}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">인도장소</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left;" class="customer-deliveryLocation-value">${data.deliveryLocation || "-"}</td>
                </tr>
                <tr>
                    <th colspan="1" style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">특약사항</th>
                    <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: left;">${data.additionalTerms || "-"}</td>
                </tr>
            </table>
        </section>

        <!-- 금액 사항 -->
        <section style="margin-top: 20px;">
            <h2 style="background-color: #333; color: #fff; padding: 10px; font-size: 18px;">금액사항</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">차량가격</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 82%" class="customer-vehiclePrice-value format-number">${data.vehiclePrice || "0"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">계약금</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 82%" class="customer-downPayment-value format-number">${data.downPayment || "0"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">중도금</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 82%" class="customer-intermediatePayment-value format-number">${data.intermediatePayment || "0"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">인도금</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 82%" class="customer-remainderPayment-value format-number">${data.remainderPayment || "0"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">탁송료</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 82%" class="customer-consignmentPayment-value format-number">${data.consignmentPayment || "0"}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f0f0f0; font-weight: bold;">합계</th>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 82%" class="customer-totalSales-value format-number">${data.totalSales || "0"}</td>
                </tr>
            </table>
        </section>

        <!-- 서명 -->
        <section style="margin-top: 20px;">
            <p style="margin-top: 30px;">본 계약서 주요 내용을 확인하고 계약을 체결하였음을 확인합니다.</p>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div>매수인:
            <div
            id="buyer-signature-area"
            style="border: 1px dashed #ccc; padding: 10px; text-align: center; cursor: pointer;"
        >${
                            data.buyerSignature
                                ? `<img src="${data.buyerSignature}" alt="매수인 서명 이미지" style="width: 8rem; height: auto;">`
                                : "(서명)"
                        }
        </div></div>
                <div>매도인:
                    <div
            id="seller-signature-area"
            style="border: 1px dashed #ccc; padding: 10px; text-align: center; cursor: pointer;"
        > ${
                            data.sellerSignature
                                ? `<img src="${data.sellerSignature}" alt="매도인 서명 이미지" style="width: 8rem; height: auto;">`
                                : "(서명)"
                        }
                </div>
            </div>
        </section>
    </div>
</body>

</html>
    `;
};

// 숫자 포맷 함수
const formatNumberWithCommas = (num) => {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 테이블 내 숫자 포맷 적용
const formatNumbersInTable = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const tdElements = doc.querySelectorAll('td.format-number');

    tdElements.forEach((td) => {
        const text = td.textContent.trim().replace(/,/g, ''); // 기존 쉼표 제거
        if (!isNaN(text) && text !== '') {
            const number = parseFloat(text);
            td.textContent = formatNumberWithCommas(number); // 숫자 형식 적용
        }
    });

    return doc.body.innerHTML;
};

// 에디터 내용 업데이트 핸들러
const handleEditorUpdate = (newContent) => {
    // 숫자 포맷 적용
    const formattedContent = formatNumbersInTable(newContent);
    if (formattedContent !== content.value) {
        content.value = formattedContent; // 내용 업데이트
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