INSERT INTO employees (id, tenant_id, first_name, last_name, email, password_hash, role, status) VALUES 
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Admin', 'User', 'admin@gmail.com', '$2b$10$Rhsm.GldGIG1GSfnYvnM.OlQWUiY.sfBfU.8d24ec0CHRg5CUURXu', 'Manager', 'Active'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'John', 'Doe', 'john@example.com', '$2b$10$Rhsm.GldGIG1GSfnYvnM.OlQWUiY.sfBfU.8d24ec0CHRg5CUURXu', 'Worker', 'Active'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Jane', 'Smith', 'jane@example.com', '$2b$10$Rhsm.GldGIG1GSfnYvnM.OlQWUiY.sfBfU.8d24ec0CHRg5CUURXu', 'Worker', 'Active'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Mike', 'Johnson', 'mike@example.com', '$2b$10$Rhsm.GldGIG1GSfnYvnM.OlQWUiY.sfBfU.8d24ec0CHRg5CUURXu', 'Manager', 'Active')
ON CONFLICT (email) DO NOTHING;
