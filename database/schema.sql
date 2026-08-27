-- ============================================================================
-- Outcome-Indexed AI Spend Router - Database Schema (PostgreSQL 15 + pgvector)
-- ============================================================================

-- Enable UUID & pgvector extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Organizations Table
CREATE TYPE plan_tier AS ENUM ('free', 'starter', 'growth', 'business', 'enterprise');
CREATE TYPE currency_code AS ENUM ('INR', 'USD');

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan plan_tier DEFAULT 'starter',
    currency currency_code DEFAULT 'USD',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    monthly_token_quota BIGINT DEFAULT 100000,
    current_cycle_tokens BIGINT DEFAULT 0,
    spend_limit_usd DECIMAL(12, 4) DEFAULT 500.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Organization Members
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'engineer', 'viewer');

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role member_role DEFAULT 'engineer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- 4. API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    rate_limit INTEGER DEFAULT 600, -- Requests per minute
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- 5. Routed Requests (Core telemetry & audit logs)
CREATE TABLE IF NOT EXISTS routed_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    model_used VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    task_type VARCHAR(100) NOT NULL, -- e.g. 'sales_email', 'code_generation', 'customer_support', 'sql_query'
    tokens_in INTEGER NOT NULL DEFAULT 0,
    tokens_out INTEGER NOT NULL DEFAULT 0,
    cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0.000000,
    cost_inr DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    outcome_success BOOLEAN, -- NULL if feedback not yet received, TRUE/FALSE when recorded
    outcome_metric VARCHAR(100), -- 'demo_booked', 'ticket_resolved', 'code_merged', 'conversion'
    outcome_revenue_impact DECIMAL(12, 2) DEFAULT 0.00,
    outcome_recorded_at TIMESTAMP WITH TIME ZONE,
    prompt_hash VARCHAR(64),
    cached_hit BOOLEAN DEFAULT FALSE,
    fallback_triggered BOOLEAN DEFAULT FALSE,
    client_ip VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_org_date ON routed_requests(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_task_type ON routed_requests(task_type);
CREATE INDEX IF NOT EXISTS idx_requests_outcome ON routed_requests(outcome_success);

-- 6. Model Benchmarks (Real-time A/B outcome matrix)
CREATE TABLE IF NOT EXISTS model_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    total_requests INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    avg_latency_ms INTEGER DEFAULT 0,
    avg_cost_usd DECIMAL(10, 6) DEFAULT 0.000000,
    win_rate DECIMAL(6, 4) DEFAULT 0.0000,
    thompson_alpha DECIMAL(10, 2) DEFAULT 1.00, -- Beta distribution prior alpha
    thompson_beta DECIMAL(10, 2) DEFAULT 1.00,  -- Beta distribution prior beta
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, task_type, model_name)
);

-- 7. Routing Rules (Configurable optimization policies)
CREATE TYPE routing_strategy AS ENUM ('outcome_optimized', 'cost_minimum', 'latency_prioritized', 'balanced_pareto');

CREATE TABLE IF NOT EXISTS routing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority_models JSONB NOT NULL DEFAULT '["claude-3-5-sonnet-20241022", "gpt-4o-mini", "deepseek-chat"]'::jsonb,
    fallback_model VARCHAR(100) DEFAULT 'gpt-4o',
    max_latency_ms INTEGER DEFAULT 1500,
    max_cost_usd DECIMAL(8, 4) DEFAULT 0.0500,
    min_win_rate DECIMAL(5, 2) DEFAULT 80.00,
    strategy routing_strategy DEFAULT 'outcome_optimized',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, task_type)
);

-- 8. Semantic & Exact Prompt Caches
CREATE TABLE IF NOT EXISTS caches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    prompt_hash VARCHAR(64) UNIQUE NOT NULL,
    prompt_embedding vector(1536), -- For semantic cosine similarity matching
    response_payload JSONB NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    tokens_saved INTEGER DEFAULT 0,
    hit_count INTEGER DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_caches_hash ON caches(prompt_hash);

-- 9. Webhooks Configuration
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret VARCHAR(255) NOT NULL,
    events TEXT[] NOT NULL DEFAULT ARRAY['outcome.recorded', 'cost.spike', 'fallback.triggered', 'sla.breached'],
    is_active BOOLEAN DEFAULT TRUE,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Third-Party Integrations
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'slack', 'notion', 'datadog', 'langfuse', 'helicone'
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_connected BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, provider)
);

-- 11. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
