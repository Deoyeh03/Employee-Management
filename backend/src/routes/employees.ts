import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { tenantQuery } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { getIO } from '../socket';

const router = Router();
router.use(authenticateToken);
router.use(requireRole(['Manager', 'Owner']));

const employeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['Worker', 'Manager']),
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const result = await tenantQuery(tenantId, 'SELECT id, first_name, last_name, email, role, status, created_at FROM employees ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = employeeSchema.parse(req.body);
    
    // Generate random password for now
    const randomPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(randomPassword, 12);

    const result = await tenantQuery(
      tenantId,
      'INSERT INTO employees (tenant_id, first_name, last_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, role, status',
      [tenantId, data.firstName, data.lastName, data.email, passwordHash, data.role]
    );

    // Also log this action
    await tenantQuery(
      tenantId,
      'INSERT INTO audit_logs (tenant_id, performed_by, action, details) VALUES ($1, $2, $3, $4)',
      [tenantId, req.user!.id, 'CREATE_EMPLOYEE', JSON.stringify({ created_employee_id: result.rows[0].id })]
    );

    io.emit('dashboard_update', { type: 'employee_created' });

    res.status(201).json({ ...result.rows[0], initialPassword: randomPassword });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/status', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Suspended', 'Terminated'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await tenantQuery(
      tenantId,
      'UPDATE employees SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await tenantQuery(
      tenantId,
      'INSERT INTO audit_logs (tenant_id, performed_by, action, details) VALUES ($1, $2, $3, $4)',
      [tenantId, req.user!.id, 'UPDATE_EMPLOYEE_STATUS', JSON.stringify({ target_employee_id: id, status })]
    );

    getIO().emit('dashboard_update', { type: 'employee_status_changed' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
