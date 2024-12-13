import ApiService from '@/services/api/config/ApiService';

export default class CenterApiService extends ApiService {
    constructor() {
        super('api/v1/center');
    }
}