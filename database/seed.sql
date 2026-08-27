-- ============================================================================
-- Seed Data for Outcome-Indexed AI Spend Router
-- ============================================================================

-- Seed User
INSERT INTO users (id, email, name, avatar_url)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'founder@acmesaaS.com',
    'Arjun Mehta',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
) ON CONFLICT (email) DO NOTHING;

-- Seed Organization
INSERT INTO organizations (id, name, slug, owner_id, plan, currency, monthly_token_quota, current_cycle_tokens, spend_limit_usd)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Acme AI Solutions',
    'acme-ai',
    'a0000000-0000-0000-0000-000000000001',
    'growth',
    'USD',
    500000,
    184200,
    1500.00
) ON CONFLICT (slug) DO NOTHING;

-- Seed API Key
INSERT INTO api_keys (id, organization_id, key_hash, key_prefix, name, rate_limit, is_active)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'oir_live_8f39a',
    'Production Cluster - US East',
    1200,
    TRUE
) ON CONFLICT DO NOTHING;

-- Seed Model Benchmarks (Real Outcome & Cost Data)
INSERT INTO model_benchmarks (organization_id, task_type, model_name, provider, total_requests, success_count, avg_latency_ms, avg_cost_usd, win_rate, thompson_alpha, thompson_beta)
VALUES
('b0000000-0000-0000-0000-000000000001', 'sales_email', 'claude-3-5-sonnet-20241022', 'anthropic', 1420, 1306, 420, 0.003400, 0.9197, 131.0, 12.0),
('b0000000-0000-0000-0000-000000000001', 'sales_email', 'gpt-4o', 'openai', 1150, 989, 580, 0.005200, 0.8600, 99.0, 17.0),
('b0000000-0000-0000-0000-000000000001', 'sales_email', 'deepseek-chat', 'deepseek', 1890, 1695, 310, 0.000420, 0.8968, 170.0, 20.0),
('b0000000-0000-0000-0000-000000000001', 'sales_email', 'gpt-4o-mini', 'openai', 2200, 1782, 210, 0.000300, 0.8100, 179.0, 42.0),
('b0000000-0000-0000-0000-000000000001', 'code_generation', 'claude-3-5-sonnet-20241022', 'anthropic', 3100, 2920, 680, 0.006200, 0.9419, 293.0, 19.0),
('b0000000-0000-0000-0000-000000000001', 'code_generation', 'deepseek-coder', 'deepseek', 2800, 2580, 390, 0.000650, 0.9214, 259.0, 23.0),
('b0000000-0000-0000-0000-000000000001', 'customer_support', 'gpt-4o-mini', 'openai', 8400, 8064, 180, 0.000180, 0.9600, 807.0, 34.0),
('b0000000-0000-0000-0000-000000000001', 'customer_support', 'llama-3.3-70b-versatile', 'groq', 6200, 5890, 95, 0.000210, 0.9500, 590.0, 32.0)
ON CONFLICT (organization_id, task_type, model_name) DO NOTHING;

-- Seed Routing Rules
INSERT INTO routing_rules (organization_id, task_type, is_active, priority_models, fallback_model, max_latency_ms, max_cost_usd, min_win_rate, strategy)
VALUES
('b0000000-0000-0000-0000-000000000001', 'sales_email', TRUE, '["deepseek-chat", "claude-3-5-sonnet-20241022", "gpt-4o-mini"]'::jsonb, 'gpt-4o', 800, 0.0040, 88.00, 'outcome_optimized'),
('b0000000-0000-0000-0000-000000000001', 'code_generation', TRUE, '["claude-3-5-sonnet-20241022", "deepseek-coder", "gpt-4o"]'::jsonb, 'gpt-4o', 1200, 0.0100, 92.00, 'balanced_pareto'),
('b0000000-0000-0000-0000-000000000001', 'customer_support', TRUE, '["llama-3.3-70b-versatile", "gpt-4o-mini"]'::jsonb, 'gpt-4o-mini', 300, 0.0005, 94.00, 'cost_minimum')
ON CONFLICT (organization_id, task_type) DO NOTHING;
