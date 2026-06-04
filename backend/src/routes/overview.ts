import { Router } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const tenantId = (req as any).user?.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    // 1. Total Items Processed Today
    const totalItemsRes = await query(`
      SELECT SUM(items_processed) as total 
      FROM performance_logs 
      WHERE tenant_id = $1 AND DATE(log_date) = CURRENT_DATE
    `, [tenantId]);
    const totalItems = parseInt(totalItemsRes.rows[0].total || '0', 10);

    // 2. Active Workers Count (Currently Clocked In)
    const activeWorkersRes = await query(`
      SELECT COUNT(DISTINCT employee_id) as count 
      FROM attendance 
      WHERE tenant_id = $1 AND DATE(clock_in) = CURRENT_DATE AND clock_out IS NULL
    `, [tenantId]);
    const activeWorkers = parseInt(activeWorkersRes.rows[0].count || '0', 10);

    // 3. Average Processing Time (diff between clock in today and item log)
    // For simplicity, we calculate the average seconds difference between the log timestamp and the most recent clock in for that employee today
    const avgTimeRes = await query(`
      WITH recent_clock_ins AS (
        SELECT employee_id, MAX(clock_in) as latest_clock_in
        FROM attendance
        WHERE tenant_id = $1 AND DATE(clock_in) = CURRENT_DATE
        GROUP BY employee_id
      )
      SELECT AVG(EXTRACT(EPOCH FROM (p.log_date - r.latest_clock_in))) as avg_seconds
      FROM performance_logs p
      JOIN recent_clock_ins r ON p.employee_id = r.employee_id
      WHERE p.tenant_id = $1 AND DATE(p.log_date) = CURRENT_DATE AND p.log_date >= r.latest_clock_in
    `, [tenantId]);
    
    let avgProcessingTime = '0m 0s';
    const avgSeconds = parseFloat(avgTimeRes.rows[0].avg_seconds);
    if (!isNaN(avgSeconds) && avgSeconds > 0) {
      const mins = Math.floor(avgSeconds / 60);
      const secs = Math.floor(avgSeconds % 60);
      avgProcessingTime = `${mins}m ${secs}s`;
    }

    // 4. Top Performers Today
    const topPerformersRes = await query(`
      SELECT e.first_name, e.last_name, e.role, SUM(p.items_processed) as total_items
      FROM performance_logs p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.tenant_id = $1 AND DATE(p.log_date) = CURRENT_DATE
      GROUP BY e.id, e.first_name, e.last_name, e.role
      ORDER BY total_items DESC
      LIMIT 3
    `, [tenantId]);

    const topPerformers = topPerformersRes.rows.map(row => ({
      name: `${row.first_name} ${row.last_name}`,
      role: row.role,
      items: parseInt(row.total_items, 10)
    }));

    res.json({
      totalItems,
      activeWorkers,
      avgProcessingTime,
      topPerformers
    });

  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
