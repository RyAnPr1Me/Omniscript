"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSourcingServer = exports.WebSocket = exports.HTTP = void 0;
class HTTP {
    static enableDebugging(enabled = true) {
        HTTP.debugEnabled = enabled;
    }
    static async get(url, headers) {
        const start = HTTP.debugEnabled ? performance.now() : 0;
        const response = await fetch(url, { headers });
        if (HTTP.debugEnabled) {
            console.debug(`[HTTP] GET ${url} took ${performance.now() - start}ms`);
        }
        return response;
    }
    static async post(url, body, headers) {
        const start = HTTP.debugEnabled ? performance.now() : 0;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json', ...headers }
        });
        if (HTTP.debugEnabled) {
            console.debug(`[HTTP] POST ${url} took ${performance.now() - start}ms`);
        }
        return response;
    }
    static async put(url, body, headers) {
        const start = HTTP.debugEnabled ? performance.now() : 0;
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json', ...headers }
        });
        if (HTTP.debugEnabled) {
            console.debug(`[HTTP] PUT ${url} took ${performance.now() - start}ms`);
        }
        return response;
    }
    static async delete(url, headers) {
        const start = HTTP.debugEnabled ? performance.now() : 0;
        const response = await fetch(url, {
            method: 'DELETE',
            headers
        });
        if (HTTP.debugEnabled) {
            console.debug(`[HTTP] DELETE ${url} took ${performance.now() - start}ms`);
        }
        return response;
    }
}
exports.HTTP = HTTP;
// New: Debug flag and method to enable debugging
HTTP.debugEnabled = false;
class WebSocket {
    enableDebugging(enabled = true) {
        this.debugEnabled = enabled;
    }
    constructor(url) {
        // New: Instance debug flag with helper method
        this.debugEnabled = false;
        this.ws = new globalThis.WebSocket(url);
        // New: Log connection open if debugging is enabled
        this.ws.onopen = () => {
            if (this.debugEnabled) {
                console.debug(`[WebSocket] Connected to ${url}`);
            }
        };
    }
    onMessage(callback) {
        this.ws.onmessage = (event) => {
            if (this.debugEnabled) {
                console.debug("[WebSocket] Received raw event:", event.data);
            }
            callback(event.data);
        };
    }
    // Existing onEvent now enhanced with debug logging
    onEvent(eventType, callback) {
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (this.debugEnabled) {
                console.debug(`[WebSocket] onEvent [${eventType}] received:`, data);
            }
            if (data.type === eventType) {
                callback(data);
            }
        };
    }
    send(data) {
        if (this.debugEnabled) {
            console.debug("[WebSocket] Sending:", data);
        }
        this.ws.send(JSON.stringify(data));
    }
    close() {
        if (this.debugEnabled) {
            console.debug("[WebSocket] Closing connection");
        }
        this.ws.close();
    }
}
exports.WebSocket = WebSocket;
// New: EventSourcingServer now supports debug logging.
class EventSourcingServer {
    constructor(url) {
        this.url = url;
        this.clients = [];
        this.debugEnabled = false;
        // Integration with a WebSocket server
    }
    enableDebugging(enabled = true) {
        this.debugEnabled = enabled;
    }
    broadcastEvent(event) {
        const msg = JSON.stringify(event);
        if (this.debugEnabled) {
            console.debug(`[EventSourcingServer] Broadcasting event:`, event);
        }
        this.clients.forEach(client => client.send(msg));
    }
    addClient(client) {
        if (this.debugEnabled) {
            console.debug("[EventSourcingServer] Adding new client");
        }
        this.clients.push(client);
    }
}
exports.EventSourcingServer = EventSourcingServer;
