import ApiService from '@/services/api/config/ApiService';

export default class DashBoardApiService extends ApiService {
    constructor() {
        super('api/v1/dashBoard');
    }
}