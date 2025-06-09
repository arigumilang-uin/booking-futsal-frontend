-- Create audit_logs table for system tracking
-- This table will store all user activities and system changes

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    additional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_audit_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_audit_logs_updated_at
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_logs_updated_at();

-- Insert some sample audit logs for testing
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, additional_info) VALUES
(1, 'LOGIN', 'user', 1, NULL, '{"login_time": "2024-01-15T10:00:00Z"}', '127.0.0.1', 'Mozilla/5.0', '{"success": true}'),
(1, 'CREATE', 'booking', 1, NULL, '{"field_id": 1, "date": "2024-01-16", "start_time": "10:00", "end_time": "12:00"}', '127.0.0.1', 'Mozilla/5.0', '{"booking_type": "regular"}'),
(2, 'LOGIN', 'user', 2, NULL, '{"login_time": "2024-01-15T11:00:00Z"}', '192.168.1.100', 'Chrome/120.0', '{"success": true}'),
(1, 'UPDATE', 'field', 1, '{"price": 100000}', '{"price": 120000}', '127.0.0.1', 'Mozilla/5.0', '{"reason": "price_adjustment"}'),
(3, 'DELETE', 'booking', 2, '{"status": "confirmed"}', '{"status": "cancelled"}', '192.168.1.200', 'Safari/17.0', '{"reason": "user_request"}'),
(1, 'CREATE', 'user', 4, NULL, '{"name": "Test User", "role": "penyewa", "email": "test@example.com"}', '127.0.0.1', 'Mozilla/5.0', '{"created_by": "supervisor"}'),
(2, 'UPDATE', 'payment', 1, '{"status": "pending"}', '{"status": "completed"}', '192.168.1.100', 'Chrome/120.0', '{"payment_method": "transfer"}'),
(1, 'LOGIN', 'user', 1, NULL, '{"login_time": "2024-01-16T09:00:00Z"}', '127.0.0.1', 'Mozilla/5.0', '{"success": true}'),
(3, 'CREATE', 'field', 2, NULL, '{"name": "Lapangan B", "type": "futsal", "price": 150000}', '192.168.1.200', 'Safari/17.0', '{"created_by": "manager"}'),
(2, 'LOGOUT', 'user', 2, NULL, '{"logout_time": "2024-01-15T15:00:00Z"}', '192.168.1.100', 'Chrome/120.0', '{"session_duration": "4h"}');

-- Create view for audit logs with user information
CREATE OR REPLACE VIEW audit_logs_with_users AS
SELECT 
    al.id,
    al.uuid,
    al.user_id,
    al.action,
    al.resource_type,
    al.resource_id,
    al.old_values,
    al.new_values,
    al.ip_address,
    al.user_agent,
    al.additional_info,
    al.created_at,
    al.updated_at,
    u.name as user_name,
    u.email as user_email,
    u.role as user_role,
    u.employee_id as user_employee_id
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO postgres;
GRANT USAGE, SELECT ON SEQUENCE audit_logs_id_seq TO postgres;
GRANT SELECT ON audit_logs_with_users TO postgres;

COMMENT ON TABLE audit_logs IS 'System audit trail for tracking all user activities and data changes';
COMMENT ON COLUMN audit_logs.action IS 'Type of action: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, etc.';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected: user, booking, field, payment, etc.';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the specific resource affected';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values before change (for UPDATE/DELETE)';
COMMENT ON COLUMN audit_logs.new_values IS 'New values after change (for CREATE/UPDATE)';
COMMENT ON COLUMN audit_logs.additional_info IS 'Additional context information in JSON format';
