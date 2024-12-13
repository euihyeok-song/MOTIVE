import ApiService from '@/services/api/config/ApiService';

export default class PurchaseOrderApiService extends ApiService {
    constructor() {
        super('api/v1/purchase-order');
    }
}