<template>
    <div>
        <table>
            <thead>
                <tr>
                    <th v-for="header in headers" :key="header">{{ header }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, index) in tableData" :key="index">
                    <td v-for="(value, key) in row" :key="key">{{ value }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    props: {
        headers: {
            type: Array,
            required: true
        },
        tableData: {
            type: Array,
            required: true
        }
    }
};
</script>

<style scoped>
table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed; /* 테이블 너비를 일정하게 맞추기 위한 설정 */
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px 16px 8px 16px; /* 일정한 패딩을 줘서 각 셀의 간격을 맞춤 */
    text-align: center;
    font-weight: normal;
    font-size: 13px;
}

th {
    background-color: #F8F8F8;
    color: #777777;
}
</style>

