import { Router } from 'express';
import { tenantQuery } from '../db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/authMiddleware';
import { getIO } from '../socket';

const router = Router();
router.use(authenticateToken);

router.post('/clock-in', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const employeeId = req.user!.id;

    // Check if already clocked in today
    const existing = await tenantQuery(
      tenantId,
      'SELECT id FROM attendance WHERE employee_id = $1 AND date = CURRENT_DATE AND clock_out IS NULL',
      [employeeId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already clocked in' });
    }

    const result = await tenantQuery(
      tenantId,
      'INSERT INTO attendance (tenant_id, employee_id, clock_in) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id, clock_in',
      [tenantId, employeeId]
    );

    getIO().emit('dashboard_update', { type: 'attendance_clock_in' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/clock-out', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const employeeId = req.user!.id;

    const result = await tenantQuery(
      tenantId,
      'UPDATE attendance SET clock_out = CURRENT_TIMESTAMP WHERE employee_id = $1 AND date = CURRENT_DATE AND clock_out IS NULL RETURNING id, clock_in, clock_out',
      [employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'No active clock-in found for today' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', requireRole(['Manager', 'Owner']), async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const result = await tenantQuery(
      tenantId,
      `SELECT a.id, a.clock_in, a.clock_out, a.date, e.first_name, e.last_name 
       FROM attendance a 
       JOIN employees e ON a.employee_id = e.id 
       ORDER BY a.date DESC, a.clock_in DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
