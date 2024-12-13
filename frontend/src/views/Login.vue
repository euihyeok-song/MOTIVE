<template>
    <div class="login-page">
        <div class="background">
            <div class="login-container">
                <!-- 로그인 -->
                <form @submit.prevent="login">
                    <!-- 아이디 입력 -->
                    <div>
                        <input id="login-id" v-model="loginId" type="text" placeholder="아이디" autocomplete="username" />
                        <p v-if="showLoginError && !loginId" class="error-message">아이디를 입력해주세요.</p>
                    </div>
                    <!-- 비밀번호 입력 -->
                    <div>
                        <input id="password" v-model="password" type="password" placeholder="비밀번호"
                            autocomplete="current-password" />
                        <p v-if="showLoginError && !password" class="error-message">비밀번호를 입력해주세요.</p>
                    </div>
                    <button type="submit">로그인</button>

                    <div class="button-container">
                        <button type="button" class="secondary-button" @click="showModal">임시 비밀번호 발급하기</button>
                    </div>
                    <!-- 서버 응답 오류 메시지 -->
                    <p v-if="loginErrorMessage" class="server-error">{{ loginErrorMessage }}</p>
                </form>

                <!-- 임시 비밀번호 모달 -->
                <Modal v-model="showPwdModal" width="40rem" height="none" header="임시 비밀번호 발급하기">
                    <div class="modal-content">

                        <!-- 인증번호 발송 관련 -->
                        <div class="send">
                            <div>
                                <label for="employee-id">사원 번호</label>
                                <div>
                                    <input id="employee-id" v-model="employeeId" type="text"
                                        placeholder="사원 번호를 입력하세요" />
                                    <button class="primary-button" @click="sendAuthCode">인증번호 발급</button>
                                </div>
                                <p v-if="sendAuthMessage" :class="sendAuthMessageType">{{ sendAuthMessage }}</p>
                            </div>
                        </div>

                        <!-- 인증번호 입력 -->
                        <div v-if="authCodeSent" class="form-group">
                            <label for="auth-code">인증번호</label>
                            <input id="auth-code" v-model="authCode" type="text" placeholder="인증번호를 입력하세요" />
                            <p v-if="authCodeMessage" :class="authCodeMessageType">{{ authCodeMessage }}</p>
                        </div>

                        <!-- 인증 버튼 -->
                        <div v-if="authCodeSent">
                            <button class="secondary-button2" @click="verifyAuthCode">인증하기</button>
                        </div>

                        <!-- 성공 메시지 -->
                        <p v-if="verificationSuccess" class="success-message">임시 비밀번호가 이메일로 전송되었습니다.</p>

                    </div>
                </Modal>
            </div>
            <img class="car-image" src="@/assets/login/loginCar.png" alt="Car" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { $api } from '@/services/api/api';
import Modal from '@/components/common/Modal.vue';

// 상태 관리
const userStore = useUserStore();
const router = useRouter();

// 로그인 관련 변수
const loginId = ref('');
const password = ref('');
const showLoginError = ref(false); // 로그인 입력 필드 오류 여부
const loginErrorMessage = ref(''); // 로그인 실패 메시지

// 임시 비밀번호 모달 관련 변수
const showPwdModal = ref(false);
const employeeId = ref('');
const authCode = ref('');

// 인증 전송 타입
const sendAuthMessageType = ref('');
const authCodeMessageType = ref('');

// 인증 상태 메시지
const sendAuthMessage = ref(''); // 인증번호 발송 관련 메시지
const authCodeMessage = ref(''); // 인증번호 검증 관련 메시지

// 인증 상태
const authCodeSent = ref(false); // 인증번호 발송 여부
const verificationSuccess = ref(false); // 인증 성공 여부

const goHome = () => {
    switch(userStore.auth){
        case 'ADMIN':
            router.push('/ADashboard');
            break;
        case 'DIRECTOR':
            router.push('/DDashboard');
            break;
        case 'GOD':
            router.push('/SDashboard');
            break;
        default:
            router.push('/EDashboard');
    }
};

// 로그인
const login = async () => {
    // 입력 필드가 비어 있는지 검사
    if (!loginId.value || !password.value) {
        showError.value = true;
        return;
    }

    // 초기화
    showLoginError.value = false;
    loginErrorMessage.value = '';

    try {
        // 로그인 시도
        const userTokens = await $api.auth.post(
            {
                loginId: loginId.value,
                password: password.value,
            },
            'signin'
        );

        // 로그인 성공 시 사용자 정보 저장 및 페이지 이동
        userStore.saveTokens(userTokens.result);
        userStore.saveUserInfo(userTokens.result);
        userStore.resetRemainingTime();
        goHome();
    } catch (error) {
        // 로그인 실패 시 에러 메시지 표시
        showLoginError.value = true;
        loginErrorMessage.value = '아이디(로그인 전용 아이디 또는 이메일)가 잘못되었거나, 비밀번호가 올바르지 않습니다.';
    }
};

// 임시 비밀번호 발급 모달 열기
const showModal = () => {
    showPwdModal.value = true;
}

// 인증번호 발송
const sendAuthCode = async () => {
    if (!employeeId.value) {
        sendAuthMessage.value = '사원 번호를 입력해주세요.';
        sendAuthMessageType.value = 'error';
        return;
    }

    try {
        await $api.auth.post(
            {
                loginId: employeeId.value
            },
            'checkmail'
        );

        authCodeSent.value = true;
        sendAuthMessage.value = '인증번호가 발송되었습니다. 이메일을 확인해주세요.';
        sendAuthMessageType.value = 'success';

    } catch {
        sendAuthMessage.value = '인증번호 발송 실패: 사원 번호를 확인해주세요.';
        sendAuthMessageType.value = 'error';
    }
};

// 인증번호 확인
const verifyAuthCode = async () => {
    if (!authCode.value) {
        authCodeMessage.value = '인증번호를 입력해주세요.';
        authCodeMessageType.value = 'error';
        return;
    }

    try {
        await $api.auth.post(
            {
                loginId: employeeId.value,
                number: authCode.value
            },
            'checknum'
        );
        verificationSuccess.value = true;
        authCodeSent.value = false;

        authCodeMessage.value = '인증 성공: 임시 비밀번호가 이메일로 전송되었습니다.';
        authCodeMessageType.value = 'success';

        // 모든 변수 초기화
        loginId.value = '';
        password.value = '';
        employeeId.value = '';
        authCode.value = '';
        sendAuthMessage.value = '';
        authCodeMessage.value = '';

    } catch {
        authCodeMessage.value = '인증 실패: 입력한 정보를 다시 확인해주세요.';
        authCodeMessageType.value = 'error';
    }
};

// 모달이 닫힐 때 초기화
watch(showPwdModal, (newValue) => {
    if (!newValue) {
        employeeId.value = '';
        authCode.value = '';
        sendAuthMessage.value = '';
        sendAuthMessageType.value = '';
        authCodeMessage.value = '';
        authCodeMessageType.value = '';
        authCodeSent.value = false;
        verificationSuccess.value = false;
    }
});
</script>

<style scoped>
.login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    overflow: hidden;
    background-color: #ffffff;
}

.background {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url('@/assets/login/loginBg.png');
    background-size: contain;
    background-position: bottom;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 50px;
}

.car-image {
    position: absolute;
    right: 10rem;
    bottom: 4rem;
    width: 700px;
    height: auto;
    animation: drive-away 6s ease-in-out infinite;
}

/* 왼쪽 아래 대각선으로 이동 후 다시 나타나는 애니메이션 */
@keyframes drive-away {

    /* 처음 위치에서 멈춤 */
    0% {
        transform: translate(1200px, -800px) scale(0.6);
        opacity: 0;
    }

    /* 반대쪽에서 빠르게 다시 나타남 */
    40% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }

    /* 원래 위치로 돌아옴 */
    90% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}


.login-container {
    margin-left: 10rem;
    margin-bottom: 10rem;
    max-width: 18rem;
}

form {
    display: flex;
    flex-direction: column;
}

input {
    margin-top: 15px;
    padding: 10px;
    border: 1px solid #eeeeee;
    border-radius: 4px;
    background-color: #eeeeee;
    font-size: 14px;
    width: 18rem;
}

button {
    padding: 12px;
    border: none;
    border-radius: 4px;
    background-color: #3b3b7b;
    color: white;
    cursor: pointer;
    margin-top: 10px;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #2d2d5f;
}

.button-container {
    display: flex;
    justify-content: flex-end;
    /* 버튼을 오른쪽으로 고정 */
}

.secondary-button {
    display: inline-block;
    min-width: 8rem;
    /* 고정된 최소 너비 설정 */
    height: 2rem;
    font-size: 11px;
    border: 1px solid #eeeeee;
    background-color: #ffffff;
    color: #777777;
    padding: 5px;
    cursor: pointer;
    text-align: center;
    flex-shrink: 0;
    /* 글씨 길이에 따라 버튼 크기 변경 방지 */
    transition: background-color 0.3s ease;
}

.secondary-button:hover {
    background-color: #eeeeee;
}

label[for="employee-id"] {
    margin-top: 1rem; /* 사원 번호 라벨 위에 마진 추가 */
    display: block; /* 블록 요소로 설정하여 다른 요소와의 간격 유지 */
}


.error-message,
.server-error {
    color: red;
    font-size: 12px;
    margin-top: 5px;
}

.success-message {
    color: green;
    font-size: 1rem;
    text-align: center;
    margin-top: 1rem;
}

.primary-button {
    padding: 0.5rem;
    background-color: #3b3b7b;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    height: 2.5rem;
    margin-left: 12px;
}

.primary-button:hover {
    background-color: #2d2d5f;
}

.secondary-button2 {
    padding: 0.8rem;
    background-color: #eee;
    color: #555;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.secondary-button2:hover {
    background-color: #ccc;
}

.message {
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.message.success {
    color: green;
}

.message.error {
    color: red;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-top: 15px;
}

.send {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

.error {
    color: red;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.success {
    color: green;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}
</style>