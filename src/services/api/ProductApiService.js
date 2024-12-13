import ApiService from '@/services/api/config/ApiService';

export default class ProductApiService extends ApiService {
    constructor() {
        super('api/v1/product');
    }
}