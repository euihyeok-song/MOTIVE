export default class DOMEventService {
    static #subscribe(eventName, listener) {
        document.addEventListener(eventName, listener);
    }

    static #unsubscribe(eventName, listener) {
        document.removeEventListener(eventName, listener);
    }

    static #dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * CustomEvent: onApiError
     */
    static subscribeApiError(listener) {
        this.#subscribe('onApiError', listener);
    }

    static unsubscribeApiError(listener) {
        this.#unsubscribe('onApiError', listener);
    }

    static dispatchApiError(errMsg) {
        this.#dispatchEvent('onApiError', errMsg);
    }

    /**
     * CustomEvent: onApiSuccess
     */
    static subscribeApiSuccess(listener) {
        this.#subscribe('onApiSuccess', listener);
    }

    static unsubscribeApiSuccess(listener) {
        this.#unsubscribe('onApiSuccess', listener);
    }

    static dispatchApiSuccess(successMsg) {
        this.#dispatchEvent('onApiSuccess', successMsg);
    }

    /**
     * CustomEvent: onExpiredToken
     */
    static subscribeExpiredToken(listener) {
        this.#subscribe('onExpiredToken', listener);
    }

    static unsubscribeExpiredToken(listener) {
        this.#unsubscribe('onExpiredToken', listener);
    }

    static dispatchExpiredToken() {
        this.#dispatchEvent('onExpiredToken');
    }
}
