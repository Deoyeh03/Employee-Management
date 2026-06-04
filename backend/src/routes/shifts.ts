import { Router } from 'express';
import { z } from 'zod';
import { tenantQuery } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { getIO } from '../socket';

const router = Router();
router.use(authenticateToken);

const shiftSchema = z.object({
  employeeId: z.string().uuid(),
  type: z.string().min(1),
  day: z.string().min(1),
  time: z.string().min(1),
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const result = await tenantQuery(
      tenantId,
      `SELECT s.id, s.type, s.day, s.time, e.first_name, e.last_name, e.role 
       FROM shifts s 
       JOIN employees e ON s.employee_id = e.id 
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole(['Manager', 'Owner']), async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = shiftSchema.parse(req.body);

    const result = await tenantQuery(
      tenantId,
      'INSERT INTO shifts (tenant_id, employee_id, type, day, time) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [tenantId, data.employeeId, data.type, data.day, data.time]
    );

    getIO().emit('dashboard_update', { type: 'shifts_updated' });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
