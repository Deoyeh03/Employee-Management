"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantQuery = exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const query = async (text, params) => {
    return exports.pool.query(text, params);
};
exports.query = query;
// Helper for queries that require tenant context
const tenantQuery = async (tenantId, text, params) => {
    const client = await exports.pool.connect();
    try {
        // Set the tenant id for the session
        await client.query(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
        const res = await client.query(text, params);
        return res;
    }
    finally {
        client.release();
    }
};
exports.tenantQuery = tenantQuery;
//# sourceMappingURL=index.js.map