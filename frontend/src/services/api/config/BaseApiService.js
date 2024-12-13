import DOMEventService from '@/services/DOMEventService';

export default class BaseApiService {
    baseUrl = `${import.meta.env.VITE_SERVER_URL}`;
    resource;

    constructor(resource) {
        if (!resource) throw new Error('Resource is not provided');
        this.resource = resource;
    }

    handleError(errMsg) {
        DOMEventService.dispatchApiError(errMsg);
    }
}
