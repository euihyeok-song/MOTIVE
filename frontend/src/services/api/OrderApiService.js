import ApiService from '@/services/api/config/ApiService';

export default class OrderApiService extends ApiService {
    constructor() {
        super('api/v1/order');
    }
}