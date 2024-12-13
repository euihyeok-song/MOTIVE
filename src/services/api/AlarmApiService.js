import ApiService from '@/services/api/config/ApiService';

export default class AlarmApiService extends ApiService {
    constructor() {
        super('api/v1/alarm');
    }
}