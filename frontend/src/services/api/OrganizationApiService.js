import ApiService from '@/services/api/config/ApiService';

export default class OrganizationApiService extends ApiService {
    constructor() {
        super('api/v1/organization');
    }
}