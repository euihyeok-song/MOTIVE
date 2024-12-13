import ApiService from '@/services/api/config/ApiService';

export default class NoticeApiService extends ApiService {
    constructor() {
        super('api/v1/notice');
    }
}

