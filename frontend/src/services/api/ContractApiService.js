import ApiService from '@/services/api/config/ApiService';

export default class ContractApiService extends ApiService {
    constructor() {
        super('api/v1/contract');
    }
}