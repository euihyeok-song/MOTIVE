<template>
    <div class="dashboard">
        <div class="summary-cards">
            <DashBoardCard class="summary-card custom-summary-card" @click="navigateToUrl('/contract/emlist')">
                <div class="summary-icon-and-title">
                    <div class="summary-icon">📄</div>
                    <div class="summary-title">이번달 계약 건수</div>
                </div>
                <div class="summary-value">{{ contractCount }}건</div>
            </DashBoardCard>
            <DashBoardCard class="summary-card" @click="navigateToUrl('/order/emList')">
                <div class="summary-icon-and-title">
                    <div class="summary-icon">📋</div>
                    <div class="summary-title">이번달 수주 건수</div>
                </div>
                <div class="summary-value">{{ orderReceiptCount }}건</div>
            </DashBoardCard>
            <DashBoardCard class="summary-card" @click="navigateToUrl('/sales-history/Elist')">
                <div class="summary-icon-and-title">
                    <div class="summary-icon">💰</div>
                    <div class="summary-title">이번달 판매내역</div>
                </div>
                <div class="summary-value">{{ formattedThisMonthSales }}원</div>
            </DashBoardCard>
            <DashBoardCard class="summary-card" @click="navigateToUrl('/schedule')">
                <div class="summary-icon-and-title">
                    <div class="summary-icon">📆</div>
                    <div class="summary-title">오늘 일정 수</div>
                </div>
                <div class="summary-value">{{ todayScheduleCount }}건</div>
            </DashBoardCard>
        </div>

        <div class="chart-and-customer">
            <div class="chart">
                <div class="chart-containerr">
                    <BigCard :chart-data="[bigCardChartData, secondChartData, thirdChartData]" />
                </div>
            </div>

            <!-- 내 고객 정보 -->
            <DashBoardCard>
                <div class="customer-info">
                    <div class="content-title">이번달 판매사원 순위</div>
                    <CustomerRank :customers="customers" class="customer-content" />
                </div>
            </DashBoardCard>
        </div>

        <div class="small-cards">
            <div class="announcement-card card">
                <DashBoardCard>
                    <div class="card-content">
                        <div class="content-title">공지사항</div>
                        <ul class="announcement-list">
                            <li v-for="announcement in announcements" :key="announcement.id"
                                @click="navigateToUrl(announcement.content)">
                                {{ announcement.title }}
                            </li>
                        </ul>
                    </div>
                </DashBoardCard>
            </div>
            <div class="news-card">
                <DashBoardCard>
                    <div class="card-content">
                        <div class="content-title">뉴스 기사</div>
                        <ul class="news-list">
                            <li v-for="(news, index) in newsArticles.slice(0, 5)" :key="index">
                                <a :href="news.originallink" target="_blank" rel="noopener noreferrer"
                                    class="news-link">
                                    {{ removeHTMLTags(news.title) }}
                                </a>
                            </li>
                        </ul>
                    </div>
                </DashBoardCard>
            </div>
        </div>
    </div>
</template>


<script setup>
import BigCard from '@/components/common/GraghCard.vue';
import DashBoardCard from '@/components/common/DashBoardCard.vue';
import CustomerRank from '@/components/common/CustomerRank.vue';
import GaugeChart from '@/components/common/Chart/GaugeChart.vue';
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { $api } from '@/services/api/api';

// New reactive references for summary cards
const contractCount = ref(0);
const orderReceiptCount = ref(0);
const thisMonthSales = ref(0);
const announcements = ref([]);
const newsArticles = ref([]);
const customers = ref([]);
const todaySchedule = ref(null);
const todayScheduleCount = ref(0);

const chartData = ref([]);
const loading = ref(false);
const router = useRouter();
const formattedThisMonthSales = computed(() => formatNumber(thisMonthSales.value));

function removeHTMLTags(text) {
    // HTML 태그 제거 및 HTML 엔티티 디코딩
    return text
        .replace(/<\/?[^>]+(>|$)/g, '') // 모든 HTML 태그 제거
        .replace(/&quot;/g, '"') // &quot; → "
        .replace(/&amp;/g, '&') // &amp; → &
        .replace(/&lt;/g, '<') // &lt; → <
        .replace(/&gt;/g, '>') // &gt; → >
        .replace(/&#39;/g, "'"); // &#39; → '
}

function formatNumber(value) {
    if (!value && value !== 0) return ''; // 값이 null 또는 undefined인 경우 처리
    return value.toLocaleString(); // 숫자를 천 단위 쉼표로 포맷팅
}


const fetchDashBoardInfo = async () => {

    try {
        const response = await $api.dashBoard.get(
            'employee',
            ''
        );

        console.log("response", response);

        if (response?.result) {
            const {
                unreadContract,
                unreadOrder,
                scheduleTitle,
                memberList,
                totalPrice,
                noticeList
            } = response.result;

            contractCount.value = unreadContract || 0;
            orderReceiptCount.value = unreadOrder || 0;
            thisMonthSales.value = totalPrice || 0;
            todayScheduleCount.value = scheduleTitle.length;
            customers.value = Object.values(memberList || {}).map((name, index) => ({
                id: index,
                name: name
            }));

            // Handle announcements
            announcements.value = noticeList?.map((notice, index) => ({
                id: index,
                title: notice.title,
                content: notice.content
            })) || [];

            console.log("schedule", todayScheduleCount.value);
        }
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    }
}

const bigCardChartData = ref({
    labels: [],
    datasets: [
        {
            label: '수당',
            data: [],
            yAxisID: 'y',
            borderColor: 'rgba(82, 77, 249, 0.8)',
            backgroundColor: 'rgba(82, 77, 249, 0.3)',
            pointBackgroundColor: 'rgba(82, 77, 249, 1)',
            pointBorderColor: '#FFFFFF',
            pointRadius: 5,
            fill: true,
            tension: 0.4,
            type: 'line', // 라인 차트
        },
    ],
    gradientColors: ['rgba(82, 77, 249, 0.7)', 'rgba(82, 77, 249, 0.1)', 'rgba(255, 255, 255, 0)'],
});

const secondChartData = ref({
    labels: [],
    datasets: [
        {
            label: '실적',
            data: [],
            yAxisID: 'y1',
            borderColor: 'rgba(52, 115, 235, 0.8)', // 선명한 블루
            backgroundColor: 'rgba(52, 115, 235, 0.2)', // 블루 배경색

            type: 'bar', // 바 차트
            barThickness: 15, // 바의 두께
        },
    ],
    gradientColors: [
        'rgba(52, 115, 235, 0.8)', // 상단 진한 블루
        'rgba(52, 115, 235, 0.3)', // 중간 블루
        'rgba(52, 115, 235, 0)',   // 하단 투명
    ],
});

const thirdChartData = ref({
    labels: [],
    datasets: [
        {
            label: '매출액',
            data: [],
            yAxisID: 'y2',
            borderColor: 'rgba(46, 204, 113, 1)',
            backgroundColor: 'rgba(46, 204, 113, 0.6)',
            pointBackgroundColor: 'rgba(46, 204, 113, 1)',
            pointBorderColor: '#FFFFFF',
            pointRadius: 5,
            type: 'line', // 라인 차트
            tension: 0.4,
        },
    ],
    gradientColors: ['rgba(46, 204, 113, 0.7)', 'rgba(46, 204, 113, 0.1)', 'rgba(255, 255, 255, 0)'],
});

// 1번 차트 그림 value
const gaugeChartValue = 40; // Gauge Chart에 전달할 값

const loadData = async () => {
    loading.value = true; // 로딩 시작
    try {

        let currentTime = new Date();
        let startTime = new Date();
        startTime.setFullYear(startTime.getFullYear() - 1);

        const searchParams = ref({
            startDate: startTime.toISOString(),
            endDate: currentTime.toISOString(),
        });

        const query = {
            startDate: searchParams.value.startDate || '',
            endDate: searchParams.value.endDate || '',
        };

        const queryString = `?${new URLSearchParams(query).toString()}`;
        console.log("API 호출 URL:", queryString); // 디버깅용

        // API 호출
        const response = await $api.salesHistory.getParams('employee/statistics/search/month', queryString);

        const result = response?.result; // 응답 데이터 접근

        if (result && Array.isArray(result)) {
            chartData.value = result;

            // 데이터 매핑
            bigCardChartData.value = {
                ...bigCardChartData.value,
                labels: chartData.value.map((item) => item.month || ''),
                datasets: [
                    {
                        ...bigCardChartData.value.datasets[0],
                        data: chartData.value.map((item) => item.incentive || 0),
                    },
                ],
            };

            secondChartData.value = {
                ...secondChartData.value,
                labels: chartData.value.map((item) => item.month || ''),
                datasets: [
                    {
                        ...secondChartData.value.datasets[0],
                        data: chartData.value.map((item) => item.performance || 0),
                    },
                ],
            };

            thirdChartData.value = {
                ...thirdChartData.value,
                labels: chartData.value.map((item) => item.month || ''),
                datasets: [
                    {
                        ...thirdChartData.value.datasets[0],
                        data: chartData.value.map((item) => item.totalSales || 0),
                    },
                ],
            };

        } else {
            console.warn("API 응답이 예상한 구조와 다릅니다:", response);
            throw new Error("API 응답 데이터 구조 오류");
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error.message);
        alert("데이터를 가져오는 데 실패했습니다. 관리자에게 문의하세요.");
    } finally {
        loading.value = false; // 로딩 종료
    }
};

const loadNewsArticles = async () => {
    try {
        const response = await $api.news.get(
            'car',
            ''
        );
        newsArticles.value = response?.result || [];

    } catch (error) {
        console.error("News articles load failed:", error);
    }

    console.log("news", newsArticles.value);
};

const navigateToUrl = (url) => {
    if (url) {
        router.push(url);
    } else {
        console.warn("유효하지 않은 URL입니다:", url);
    }
};

onMounted(async () => {
    fetchDashBoardInfo();
    loadNewsArticles();
    loadData();
});

</script>

<style scoped>
.dashboard {
    background-color: #F1F1FD;
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
}

.summary-cards {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.8rem;
}

.summary-card {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
    width: 50rem;
    height: 10rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}


.summary-icon-and-title {
    display: flex;
    gap: 25px;
    margin-bottom: 0.3rem;
}

.summary-icon {
    font-size: 36px;
}

.summary-title {
    font-size: 25px;
    font-weight: bold;
    color: #380979;
    margin-top: 11px;
}

.content-title {
    font-size: 25px;
    font-weight: bold;
    color: #380979;
    padding-left: 0.5rem;
    padding-top: 12px;
    padding-bottom: 1rem;
    width: 300%;
}

.chart-and-customer {
    display: flex;
    gap: 2rem;
    width: 100%
}

.summary-value {
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    display: flex;
    justify-content: center;
    margin-top: 0.6rem;
    height: 80%;
    /* 카드 전체 높이에 맞추기 */
}

.chart {
    width: 74.5%;
}

.customer-info {
    width: 24.5rem;
}


.small-cards {
    display: flex;
    gap: 2rem;
    margin-top: 1.8rem;
}

.card-content {
    width: 100%;
    height: 18rem;
}

.announcement-card, .news-card {
    width: 50%;
}

.announcement-list,
.news-list {
    font-size: 18px;
    font-weight: bold;
    color: #333333;
    width: 50%;
}

.announcement-list li,
.news-list li {
    font-size: 18px;
    /* 기본 크기 조정 */
    color: #555555;
    margin-bottom: 10px;
    padding: 6px;
    border-radius: 5px;
    transition: background-color 0.2s ease;
    width: 200%;
}

.announcement-list li:hover,
.news-list li:hover {
    background-color: #F1F1FD;
    cursor: pointer;
}

.summary-card {
    cursor: pointer;
}

.summary-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    background-color: #f5f5f5;
}

.chart-container {
    position: relative;
    width: 100%;
    height: 32rem;
    background: #FFFFFF;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25);
    border-radius: 3px;
    padding: 20px;
    overflow: hidden;
}
</style>