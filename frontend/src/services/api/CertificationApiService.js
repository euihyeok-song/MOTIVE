import ApiService from '@/services/api/config/ApiService';

export default class CertificationApiService extends ApiService {
    constructor() {
        super('api/v1/certification');
    }
}