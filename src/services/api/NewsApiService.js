import ApiService from '@/services/api/config/ApiService';

export default class NewsApiService extends ApiService {
    constructor() {
        super('api/v1/news');
    }
}

