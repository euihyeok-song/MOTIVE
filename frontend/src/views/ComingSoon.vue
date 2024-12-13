<template>
    <div class="placeholder-container">
        <div class="placeholder-content">
            <h1 class="placeholder-title">🚧 페이지 구현 중입니다 🚧</h1>
            <p class="placeholder-description">이 페이지는 현재 작업 중입니다. 곧 멋진 콘텐츠로 찾아뵙겠습니다!</p>
            <div class="loading-animation">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <p class="placeholder-footer">잠시만 기다려주세요 😊</p>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.placeholder-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #f3f4f6, #e0e7ff);
    color: #374151;
    text-align: center;
    font-family: 'Arial', sans-serif;
}

.placeholder-content {
    max-width: 600px;
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.placeholder-title {
    font-size: 2rem;
    font-weight: bold;
    color: #2563eb;
    margin-bottom: 1rem;
}

.placeholder-description {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
}

.loading-animation {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.loading-animation span {
    display: block;
    width: 15px;
    height: 15px;
    background: #2563eb;
    border-radius: 50%;
    animation: bounce 1.5s infinite;
}

.loading-animation span:nth-child(2) {
    animation-delay: 0.3s;
}

.loading-animation span:nth-child(3) {
    animation-delay: 0.6s;
}

.placeholder-footer {
    font-size: 1rem;
    color: #6b7280;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0.8);
    }

    40% {
        transform: scale(1.2);
    }
}
</style>