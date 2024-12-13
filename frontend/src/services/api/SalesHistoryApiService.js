import ApiService from '@/services/api/config/ApiService';

export default class SalesHistoryApiService extends ApiService {
    constructor() {
        super('api/v1/salesHistory');
    }
}