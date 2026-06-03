import { Pool } from 'pg';
export declare const pool: Pool;
export declare const query: (text: string, params?: any[]) => Promise<import("pg").QueryResult<any>>;
export declare const tenantQuery: (tenantId: string, text: string, params?: any[]) => Promise<import("pg").QueryResult<any>>;
//# sourceMappingURL=index.d.ts.map