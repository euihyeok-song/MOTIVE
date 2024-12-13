import ApiService from '@/services/api/config/ApiService';

export default class ProblemApiService extends ApiService {
    constructor() {
        super('api/v1/problem');
    }
}