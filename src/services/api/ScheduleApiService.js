import ApiService from '@/services/api/config/ApiService';

export default class ScheduleApiService extends ApiService {
    constructor() {
        super('api/v1/schedule');
    }
}