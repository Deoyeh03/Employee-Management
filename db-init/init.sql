-- Enable pgCrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table for Tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Worker', 'Manager', 'Owner')),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Table for Attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    employee_id UUID REFERENCES employees(id),
    clock_in TIMESTAMP NOT NULL,
    clock_out TIMESTAMP,
    date DATE DEFAULT CURRENT_DATE
);
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Table for Performance Logs
CREATE TABLE performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    employee_id UUID REFERENCES employees(id),
    items_processed INT DEFAULT 0,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;

-- Table for Audit Logs (OWASP A09)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    performed_by UUID REFERENCES employees(id),
    action VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies
-- Policy for employees
CREATE POLICY employee_tenant_isolation_policy ON employees
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Policy for attendance
CREATE POLICY attendance_tenant_isolation_policy ON attendance
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Policy for performance_logs
CREATE POLICY performance_logs_tenant_isolation_policy ON performance_logs
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Policy for audit_logs
CREATE POLICY audit_logs_tenant_isolation_policy ON audit_logs
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Create a super admin user / tenant for testing out of the box
INSERT INTO tenants (id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'Default Laundry Corp');

-- Password is 'password123'
-- Hash generated via bcrypt: $2b$12$K.g/2aK8586wz3A6zL/WJOn4p6z/L915Qo6D8gGzG7l7H31B6r7f2
INSERT INTO employees (id, tenant_id, first_name, last_name, email, password_hash, role) 
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Admin', 'User', 'admin@example.com', '$2b$12$K.g/2aK8586wz3A6zL/WJOn4p6z/L915Qo6D8gGzG7l7H31B6r7f2', 'Owner');
