"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPClient = void 0;
class HTTPClient {
    constructor(baseUrl = '', headers = {}) {
        this.baseUrl = baseUrl;
        this.headers = headers;
    }
    async get(path) {
        const response = await fetch(this.baseUrl + path, { headers: this.headers });
        return response.json();
    }
    async post(path, body) {
        const response = await fetch(this.baseUrl + path, {
            method: 'POST',
            headers: { ...this.headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return response.json();
    }
}
exports.HTTPClient = HTTPClient;
