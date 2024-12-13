import ApiService from '@/services/api/config/ApiService';

export default class AuthApiService extends ApiService {
    constructor() {
        super('api/v1/auth');
    }
}