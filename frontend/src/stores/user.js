import { defineStore } from 'pinia';
import { ref, onUnmounted } from 'vue';

export const useUserStore = defineStore(
    'user',
    () => {
        const id = ref('');
        const name = ref('');
        const accessToken = ref('');
        const refreshToken = ref('');
        const role = ref('');
        const auth = ref('');
        const isLoggined = ref(false);
        const remainingTime = ref(0); // 30분 (밀리초 단위)
        const imageUrl = ref('');
        let timer = null; // 타이머 변수 추가

        function refreshTheToken(newToken) {
            accessToken.value = newToken;
            resetRemainingTime();
        }

        function startTimer() {
            if (timer) clearInterval(timer); // 기존 타이머 중단
            timer = setInterval(() => {
                if (remainingTime.value > 0) {
                    remainingTime.value -= 1000; // 1초 감소
                } else {
                    clearInterval(timer);
                    remainingTime.value = 0; // 시간이 끝나면 0으로 고정
                }
            }, 1000);
        }

        function stopTimer() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function loginByEMPLOYEE() {
            id.value = 0;
            name.value = '영업 사원';
            accessToken.value = 'faketoken';
            refreshToken.value = 'faketoken';
            role.value = 'SalesRep';
            auth.value = 'none';
            isLoggined.value = true;
            imageUrl.value = '영업 사원 이미지';
        }

        function loginByADMIN() {
            id.value = 1;
            name.value = '영업 관리자';
            accessToken.value = 'faketoken';
            refreshToken.value = 'faketoken';
            role.value = 'SalesManager';
            auth.value = 'none';
            isLoggined.value = true;
            imageUrl.value = '영업 관리자 이미지';
        }

        function loginByDIRECTOR() {
            id.value = 2;
            name.value = '영업 담당자';
            accessToken.value = 'faketoken';
            refreshToken.value = 'faketoken';
            role.value = 'SalesAdmin';
            auth.value = 'none';
            isLoggined.value = true;
            imageUrl.value = '영업 담당자 이미지';
        }

        function loginByGOD() {
            id.value = 3;
            name.value = '시스템 관리자';
            accessToken.value = 'faketoken';
            refreshToken.value = 'faketoken';
            role.value = 'SystemAdmin';
            auth.value = 'none';
            isLoggined.value = true;
            imageUrl.value = '시스템 관리자 이미지';
        }

        function logout() {
            id.value = 0;
            name.value = '';
            accessToken.value = '';
            refreshToken.value = '';
            role.value = '';
            auth.value = '';
            imageUrl.value = '';
            isLoggined.value = false;
            remainingTime.value = 0;
        }

        function saveTokens(userToken) {
            accessToken.value = userToken.accessToken;
            refreshToken.value = userToken.refreshToken;
            isLoggined.value = true;
        }

        function saveUserInfo(userInfo) {
            id.value = userInfo.id;
            name.value = userInfo.name;
            role.value = userInfo.role;
            auth.value = userInfo.auth;
            imageUrl.value = userInfo.imageUrl;
        }

        function resetRemainingTime() {
            remainingTime.value = 30 * 60 * 1000; // 로그인 시 30분 초기화
            startTimer(); // 타이머 시작
        }

        onUnmounted(() => {
            stopTimer();
        });

        return {
            id,
            name,
            accessToken,
            refreshToken,
            role,
            auth,
            isLoggined,
            remainingTime,
            imageUrl,
            loginByEMPLOYEE,
            loginByADMIN,
            loginByDIRECTOR,
            loginByGOD,
            logout,
            saveTokens,
            saveUserInfo,
            resetRemainingTime,
            startTimer,
            stopTimer,
            refreshTheToken
        };
    },
    {
        persist: true,
    },
);