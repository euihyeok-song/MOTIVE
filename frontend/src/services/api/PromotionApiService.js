import ApiService from '@/services/api/config/ApiService';

export default class PromotionApiService extends ApiService {
    constructor() {
        super('api/v1/promotion');
    }
}