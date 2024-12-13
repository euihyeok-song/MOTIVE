<template>
    <div>
        <h1>SAM_000000001</h1>
        <br><br><br>
        <div>
            <h1>POST API</h1><br>
            name: <input v-model="postName" type="text" class="post-name"><br><br>
            num: <input v-model="postNum" type="text" class="post-num"><br><br>
            <Button label="put 요청" class="btn-put" @click="postRequest">put 요청
            </Button>
        </div>
        <br><br><br>

        <div>
            <h1>POST IMAGE API</h1><br>
            name: <input v-model="postImageName" type="text" class="post-name"><br><br>
            num: <input v-model="postImageNum" type="text" class="post-num"><br><br>
            image: <input 
                        type="file" 
                        ref="fileInput" 
                        accept="image/*" 
                        @change="handleImageUpload"
                    />

            <br><br>
            <Button label="post 요청" class="btn-post" @click="postImageRequest">post 이미지 요청
            </Button>
        </div>
        <br><br><br>

        <div>
            <h1>PUT API</h1><br>
            mem_id: <input v-model="putMemId" type="text" class="put-mem-id"><br><br>
            name: <input v-model="putName" type="text" class="put-name"><br><br>
            <Button label="put 요청" class="btn-put" @click="putRequest">put 요청
            </Button>
        </div>

        <br><br><br>

        <div>
            <h1>DELETE API</h1><br>
            mem_id: <input v-model="deleteMemId" type="text" class="delete-mem-id"><br><br>
            <Button label="delete 요청" class="btn-delete" @click="deleteRequest">delete 요청
            </Button>
        </div>
        <br><br><br>

        <div>
            <h1>GET API</h1><br>
            mem_id: <input v-model="getMemId" type="text" class="get-mem-id"><br><br>
            <Button label="get 요청" class="btn-get" @click="getRequest">get 요청
            </Button>
        </div>
        <br><br><br>
        <div>
            <h1>GET DETAIL API</h1><br>
            mem_id: <input v-model="getDetailId" type="text" class="get-mem-id"><br><br>
            <Button label="get 요청" class="btn-get-detail" @click="getDetailRequest">get detail 요청
            </Button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { $api } from '@/services/api/api'

// POST API 데이터
const postName = ref('');
const postNum = ref('');

// POST IMAGE API 데이터
const postImageName = ref('');
const postImageNum = ref('');
const image = ref('');



// PUT API 데이터
const putMemId = ref('');
const putName = ref('');

// DELETE API 데이터
const deleteMemId = ref('');

// GET API 데이터
const getMemId = ref('');

// GET DETAIL API 데이터
const getDetailId = ref('');

// GET 요청 함수
const getRequest = async () => {
    try {
        const response = await $api.sample.get(

            '',
            getMemId.value,
            
        );

        console.log('GET 요청 응답 결과');
        console.log(response);

    } catch (error) {
        console.error('GET 요청 실패: ', error);
    }
}

// GET DETAIL 요청 함수
const getDetailRequest = async () => {
    try {
        const response = await $api.sample.get(

            'detail',
            getDetailId.value

        );

        console.log('GET DETAIL 요청 응답 결과');
        console.log(response);

    } catch (error) {
        console.error('GET DETAIL 요청 실패: ', error);
    }
}

// 파일 업로드 핸들러
const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if(file) {
        image.value = file;
        const reader = new FileReader();
    }
    console.log('파일파일: ', file);
}

// POST 요청 함수
const postRequest = async () => {
    try {
        const response = await $api.sample.post(
            {
                name: postName.value,       // data
                num: postNum.value
            },
            '',     // suburl
            ''      // 이미지
        );

        console.log('POST 요청 응답 결과');
        console.log(response);

    } catch (error) {
        console.error('POST 요청 실패: ', error);
    }
};

// POST IMGAE 요청 함수
const postImageRequest = async () => {
    try {
        console.log('Starting POST IMAGE request');
        console.log('Image:', image.value);
        console.log('Data:', { name: postName.value, num: postNum.value });

        const response = await $api.sample.post(
            {
                name: postImageName.value,
                num: postImageNum.value
            },
            'file',
            image.value
        );

        console.log('POST IMAGE 요청 응답 결과');
        console.log(response);

    } catch (error) {
        console.error('POST IMAGE 요청 실패: ', error);
    }
};

// PUT 요청 함수
const putRequest = async () => {
    try {
        const response = await $api.sample.put(
            {
                name: putName.value,
            },
            putMemId.value
        );

    }catch(error){
        console.error('PUT 요청 실패: ', error);
    }
}

// DELETE 요청 함수
const deleteRequest = async () => {
    try {
        const response = await $api.sample.delete(
            
            deleteMemId.value
            
        );

        console.log('DELETE 요청 응답 결과');
        console.log(response);

    } catch (error) {
        console.error('DELETE 요청 실패: ', error);
    }
}
</script>

<style scoped></style>