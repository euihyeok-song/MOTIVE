<template>
  <component :is="layout">
    <Toast position="top-center" />
    <RouterView />
  </component>

  <Toast position="top-center" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import NoneLayout from '@/layouts/NoneLayout.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import DOMEventService from '@/services/DOMEventService';
import useToastMessage from '@/hooks/useToastMessage';
import Toast from 'primevue/toast';
import { useUserStore } from '@/stores/user';
import { EventSourcePolyfill } from 'event-source-polyfill';

const eventSource = ref(null);
const isSseConnected = ref(false);

// SSE 연결 함수
const connectToSSE = (accessToken) => {
  
  if (isSseConnected.value || !accessToken) {
    return;
  }

  // SSE 연결 생성
  eventSource.value = new EventSourcePolyfill('http://localhost:8080/api/v1/alarm/connect', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  // 이벤트 수신 시 알림 추가
  eventSource.value.onmessage = (event) => {
    const newAlarm = JSON.parse(event.data); // 알림 데이터 파싱
    console.log("새로운 알람을 받았습니다: ", newAlarm);

    // 알림 추가
    alarms.value = [...alarms.value, newAlarm];
  };

  // 오류 시 연결 종료
  eventSource.value.onerror = (error) => {
    console.error("SSE 연결 오류:", error);
    eventSource.value.close();
  };

  isSseConnected.value = true;
};

// SSE 연결 해제 함수
const disconnectFromSSE = () => {
  if (eventSource.value) {
    eventSource.value.close(); // 연결 종료
    console.log("SSE 연결이 종료되었습니다.");
    isSseConnected.value = false;
  }
};

const route = useRoute();
const { showError, showSuccess } = useToastMessage();
const userStore = useUserStore();

// 경로에 따라 레이아웃을 동적으로 변경
const layout = computed(() => {
  if (route.path.match('/')) {
    return NoneLayout;
  }
  return MainLayout; // 기본 레이아웃은 로그인 레이아웃
});

const handleLoginStatusChange = () => {
  const accessToken = userStore.accessToken;

  if (accessToken && !isSseConnected.value) {
    connectToSSE(accessToken); // 로그인된 상태에서만 연결
  } else if (!accessToken && isSseConnected.value) {
    disconnectFromSSE(); // 로그아웃된 상태에서 해제
  }
};

watch(
  () => userStore.accessToken, // 로그인 상태 감지
  () => {
    handleLoginStatusChange();
  },
  { immediate: true } // 컴포넌트가 로드될 때도 실행
);

function handleApiError(customEvent) {
  showError('오류 발생', customEvent.detail);
}

function handleApiSuccess(customEvent) {
  showSuccess('성공', customEvent.detail);
}

// 컴포넌트 언마운트 시 SSE 연결 해제
onBeforeUnmount(() => {
  disconnectFromSSE();
});

onMounted(() => {
  DOMEventService.subscribeApiError(handleApiError);
  DOMEventService.subscribeApiSuccess(handleApiSuccess);
  // 컴포넌트 마운트 시 로그인 상태 확인 및 SSE 연결 설정
  handleLoginStatusChange();
});

onUnmounted(() => {
  DOMEventService.unsubscribeApiError(handleApiError);
  DOMEventService.unsubscribeApiSuccess(handleApiSuccess);
});
</script>