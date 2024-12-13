<template>
    <div class="bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
        <!-- Sales Representatives -->
        <div class="space-y-4">
            <div v-for="(rep, index) in customers" :key="rep.name" class="
            flex items-center p-4 rounded-lg transition-all duration-300
            bg-gray-50 hover:bg-blue-50" :class="{
                'bg-yellow-50 border-2 border-yellow-200': index === 0,
                'bg-gray-50': index === 1,
                'bg-brown-50': index === 2,
                'bg-gray-50': index > 2,
            }">
                <!-- Ranking Badge -->
                <div class="w-10 h-10 mr-4 rounded-full flex items-center justify-center font-bold" :class="{
                    'bg-yellow-500 text-white': index === 0,
                    'bg-gray-400 text-white': index === 1,
                    'bg-yellow-700 text-white': index === 2,
                    'bg-blue-100 text-blue-800': index > 2,
                }">
                    <template v-if="index === 0">
                        <Crown size="20" />
                    </template>
                    <template v-else>{{ index + 1 }}</template>
                </div>

                <!-- Sales Rep Name -->
                <div class="flex-grow">
                    <h3 class="font-semibold text-gray-800">{{ rep.name }}</h3>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { Crown } from "lucide-vue-next";

// Props
const props = defineProps({
    customers: {
        type: Array,
        required: true
    }
});

// Computed properties
const sortedSalesReps = computed(() =>
    [...props.salesReps].sort((a, b) => b.sales - a.sales)
);
</script>

<style scoped>
/* 유지된 스타일 */
.bg-white {
    background-color: #ffffff;
}

.rounded-xl {
    border-radius: 12px;
}

.max-w-md {
    max-width: 28rem;
}

.mx-auto {
    margin-left: auto;
    margin-right: auto;
}

.mb-4 {
    margin-bottom: 1rem;
}

.text-xl {
    font-size: 1.25rem;
}

.font-bold {
    font-weight: 700;
}

.text-gray-800 {
    color: #1f2937;
}

.text-sm {
    font-size: 0.875rem;
}

.text-gray-500 {
    color: #6b7280;
}

.space-y-4> :not([hidden])~ :not([hidden]) {
    /* margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse))); */
    margin-top: 1rem;
    margin-bottom: calc(1rem * var(--tw-space-y-reverse));
}

.flex {
    display: flex;
}

.items-center {
    display: flex;
    align-items: center;
}

.p-4 {
    padding: 1rem;
}

.rounded-lg {
    border-radius: 0.5rem;
}

.bg-gray-50 {
    background-color: #f9fafb;
}

.bg-brown-50 {
    background-color: #f7f3ed;
}

.hover\:bg-blue-50:hover {
    background-color: #eff6ff;
}

.bg-yellow-50 {
    background-color: #fffbeb;
}


.border-brown-50{
    background-color: #fde68a;
}

.border-2 {
    border-width: 2px;
}

.border-yellow-200 {
    border-color: #fde68a;
}

.w-10 {
    width: 2.5rem;
}

.h-10 {
    height: 2.5rem;
}

.mr-4 {
    margin-right: 1rem;
}

.rounded-full {
    border-radius: 9999px;
}

.text-white {
    color: #ffffff;
}

.bg-yellow-500 {
    background-color: #f59e0b;
    justify-content: center;
}

.bg-gray-400 {
    background-color: #9ca3af;
    justify-content: center;
}

.bg-yellow-700 {
    background-color: #b45309;
    justify-content: center;
}

.bg-blue-100 {
    background-color: #dbeafe;
}

.text-blue-800 {
    color: #1e40af;
    justify-content: center;
}

.font-semibold {
    font-weight: 600;
}

.transition-all[data-v-b237e0b9] {
    transition-property: all;
    transition-duration: 0.3s;
    padding: 0.3rem;
    width: 23rem;
}
</style>