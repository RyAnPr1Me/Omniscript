"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOM = exports.Database = exports.PackageManager = exports.HTTPClient = exports.HTTP = exports.Console = exports.Math = void 0;
__exportStar(require("./collections"), exports);
__exportStar(require("./io"), exports);
__exportStar(require("./network"), exports);
__exportStar(require("./crypto"), exports);
__exportStar(require("./datetime"), exports);
__exportStar(require("./math"), exports);
__exportStar(require("./threading"), exports);
var math_1 = require("./math");
Object.defineProperty(exports, "Math", { enumerable: true, get: function () { return math_1.MathUtils; } });
const connections_1 = require("./database/connections");
class Console {
    static log(...args) {
        console.log(...args);
    }
}
exports.Console = Console;
class HTTP {
    static async fetch(url, options) {
        return fetch(url, options);
    }
}
exports.HTTP = HTTP;
// Enhanced HTTP exports
var client_1 = require("./http/client");
Object.defineProperty(exports, "HTTPClient", { enumerable: true, get: function () { return client_1.HTTPClient; } });
// Add package manager support
var package_manager_1 = require("../package-manager");
Object.defineProperty(exports, "PackageManager", { enumerable: true, get: function () { return package_manager_1.PackageManager; } });
// Export enhanced database features
class Database {
    static async connect(connectionString) {
        if (connectionString.startsWith('sqlite://')) {
            return new connections_1.SQLiteConnection(connectionString);
        }
        return new connections_1.PostgresConnection(connectionString);
    }
    static async transaction(callback) {
        try {
            const result = await callback();
            return result;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.Database = Database;
class DOM {
    static querySelector(selector) {
        return document.querySelector(selector);
    }
    static createElement(tag) {
        return document.createElement(tag);
    }
}
exports.DOM = DOM;
