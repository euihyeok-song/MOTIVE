import ApiService from '@/services/api/config/ApiService';

export default class CustomerApiService extends ApiService {
    constructor() {
        super('api/v1/customer');
    }
}