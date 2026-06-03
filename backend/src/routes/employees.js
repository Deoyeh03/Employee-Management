"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const db_1 = require("../db");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.use((0, authMiddleware_1.requireRole)(['Manager', 'Owner']));
const employeeSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(['Worker', 'Manager']),
});
router.get('/', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const result = await (0, db_1.tenantQuery)(tenantId, 'SELECT id, first_name, last_name, email, role, status, created_at FROM employees ORDER BY created_at DESC');
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const data = employeeSchema.parse(req.body);
        // Generate random password for now
        const randomPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt_1.default.hash(randomPassword, 12);
        const result = await (0, db_1.tenantQuery)(tenantId, 'INSERT INTO employees (tenant_id, first_name, last_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, role, status', [tenantId, data.firstName, data.lastName, data.email, passwordHash, data.role]);
        // Also log this action
        await (0, db_1.tenantQuery)(tenantId, 'INSERT INTO audit_logs (tenant_id, performed_by, action, details) VALUES ($1, $2, $3, $4)', [tenantId, req.user.id, 'CREATE_EMPLOYEE', JSON.stringify({ created_employee_id: result.rows[0].id })]);
        res.status(201).json({ ...result.rows[0], initialPassword: randomPassword });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id/status', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { id } = req.params;
        const { status } = req.body;
        if (!['Active', 'Suspended', 'Terminated'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const result = await (0, db_1.tenantQuery)(tenantId, 'UPDATE employees SET status = $1 WHERE id = $2 RETURNING id, status', [status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        await (0, db_1.tenantQuery)(tenantId, 'INSERT INTO audit_logs (tenant_id, performed_by, action, details) VALUES ($1, $2, $3, $4)', [tenantId, req.user.id, 'UPDATE_EMPLOYEE_STATUS', JSON.stringify({ target_employee_id: id, status })]);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=employees.js.map