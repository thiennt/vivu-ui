"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
/**
 * Pool instances of a certain class for reusing.
 */
var Pool = /** @class */ (function () {
    function Pool(ctor) {
        /** List of idle instances ready to be reused */
        this.list = [];
        this.ctor = ctor;
    }
    /**
     * Get an idle instance from the pool, or create a new one if there is none available.
     * If you pass params, always create a new instance with params (not pooled).
     */
    Pool.prototype.get = function (params) {
        var _a;
        if (params) {
            // Always create a new instance with params
            return new this.ctor(params);
        }
        // No params: reuse from pool if available
        return (_a = this.list.pop()) !== null && _a !== void 0 ? _a : new this.ctor();
    };
    /** Return an instance to the pool, making it available to be reused */
    Pool.prototype.giveBack = function (item) {
        if (this.list.includes(item))
            return;
        this.list.push(item);
    };
    return Pool;
}());
var MultiPool = /** @class */ (function () {
    function MultiPool() {
        /** Map of pools per class */
        this.map = new Map();
    }
    /** Get an idle instance of given class, or create a new one if there is none available */
    MultiPool.prototype.get = function (ctor, params) {
        var pool = this.map.get(ctor);
        if (!pool) {
            pool = new Pool(ctor);
            this.map.set(ctor, pool);
        }
        return pool.get(params);
    };
    /** Return an instance to its pool, making it available to be reused */
    MultiPool.prototype.giveBack = function (item) {
        var pool = this.map.get(item.constructor);
        if (pool)
            pool.giveBack(item);
    };
    return MultiPool;
}());
/**
 * Shared multi-class pool instance
 */
exports.pool = new MultiPool();
