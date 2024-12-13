import ApiService from '@/services/api/config/ApiService';

export default class LogApiService extends ApiService {
    constructor() {
        super('api/v1/log');
    }
}