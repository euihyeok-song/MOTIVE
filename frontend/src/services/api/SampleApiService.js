import ApiService from '@/services/api/config/ApiService';

export default class SampleApiService extends ApiService {
    constructor() {
        super('api/v1/sample');
    }
}