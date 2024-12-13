import ApiService from '@/services/api/config/ApiService';

export default class EvaluationApiService extends ApiService {
    constructor() {
        super('api/v1/evaluation');
    }
}