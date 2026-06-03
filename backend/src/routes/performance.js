"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
const performanceSchema = zod_1.z.object({
    itemsProcessed: zod_1.z.number().positive(),
});
router.post('/log', async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const employeeId = req.user.id;
        const { itemsProcessed } = performanceSchema.parse(req.body);
        const result = await (0, db_1.tenantQuery)(tenantId, 'INSERT INTO performance_logs (tenant_id, employee_id, items_processed) VALUES ($1, $2, $3) RETURNING id, items_processed, log_date', [tenantId, employeeId, itemsProcessed]);
        res.json(result.rows[0]);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/summary', (0, authMiddleware_1.requireRole)(['Manager', 'Owner']), async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { period } = req.query; // 'daily', 'weekly', 'monthly'
        let dateModifier = '1 day';
        if (period === 'weekly')
            dateModifier = '7 days';
        else if (period === 'monthly')
            dateModifier = '1 month';
        const result = await (0, db_1.tenantQuery)(tenantId, `SELECT e.id, e.first_name, e.last_name, SUM(p.items_processed) as total_items 
       FROM performance_logs p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.log_date >= NOW() - INTERVAL '${dateModifier}'
       GROUP BY e.id, e.first_name, e.last_name
       ORDER BY total_items DESC`);
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=performance.js.map