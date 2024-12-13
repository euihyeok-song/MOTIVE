import ApiService from '@/services/api/config/ApiService';

export default class FamilyApiService extends ApiService {
    constructor() {
        super('api/v1/family');
    }
}