import { Router } from 'express';
import { z } from 'zod';
import { tenantQuery } from '../db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/authMiddleware';
import { getIO } from '../socket';

const router = Router();
router.use(authenticateToken);

const performanceSchema = z.object({
  itemsProcessed: z.number().positive(),
});

router.post('/log', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const employeeId = req.user!.id;
    const { itemsProcessed } = performanceSchema.parse(req.body);

    const result = await tenantQuery(
      tenantId,
      'INSERT INTO performance_logs (tenant_id, employee_id, items_processed) VALUES ($1, $2, $3) RETURNING id, items_processed, log_date',
      [tenantId, employeeId, itemsProcessed]
    );

    getIO().emit('dashboard_update', { type: 'performance_logged' });
    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/summary', requireRole(['Manager', 'Owner']), async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { period } = req.query; // 'daily', 'weekly', 'monthly'

    let dateModifier = '1 day';
    if (period === 'weekly') dateModifier = '7 days';
    else if (period === 'monthly') dateModifier = '1 month';

    const result = await tenantQuery(
      tenantId,
      `SELECT e.id, e.first_name, e.last_name, SUM(p.items_processed) as total_items 
       FROM performance_logs p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.log_date >= NOW() - INTERVAL '${dateModifier}'
       GROUP BY e.id, e.first_name, e.last_name
       ORDER BY total_items DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
