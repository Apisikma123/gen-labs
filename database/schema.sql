-- ==============================================================================
-- SIMULA — AI-Generated Interactive Experimental Learning Platform
-- Database Schema Definition (PostgreSQL 15+ with pgvector)
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Enum Types
CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'admin');
CREATE TYPE template_status AS ENUM ('active', 'draft', 'archived', 'deprecated');
CREATE TYPE experiment_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE experiment_mode AS ENUM ('free', 'guided', 'challenge', 'compare', 'what_if');
CREATE TYPE ai_message_role AS ENUM ('user', 'assistant', 'system');

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'student',
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Concepts Table
CREATE TABLE IF NOT EXISTS concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL, -- Physics, Mathematics, Statistics, Computer Science, Economics, Chemistry, Biology
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Learning Objectives Table
CREATE TABLE IF NOT EXISTS learning_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    blooms_level VARCHAR(50) DEFAULT 'understand', -- remember, understand, apply, analyze, evaluate, create
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Simulation Templates Table (Institutional and Organic AI-Generated Library)
CREATE TABLE IF NOT EXISTS simulation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    engine VARCHAR(100) NOT NULL, -- physics, mathematics, statistics, computer-science, economics, chemistry, biology
    prompt TEXT, -- Natural-language inquiry that prompted this template
    definition JSONB NOT NULL, -- SimulationSpecification schema (parameters, controls, outputs, visualization)
    status template_status DEFAULT 'active',
    version INT DEFAULT 1,
    embedding vector(1536), -- Vector representation for semantic reuse via pgvector
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Simulation Instances Table (A Student's Prepared Experiment Instance)
CREATE TABLE IF NOT EXISTS simulation_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES simulation_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    configuration JSONB NOT NULL, -- Initial parameter values and constraints for this instance
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Simulation Sessions Table (Active Student Session)
CREATE TABLE IF NOT EXISTS simulation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID REFERENCES simulation_instances(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    current_state JSONB NOT NULL DEFAULT '{}'::jsonb, -- Live parameters & computed outputs
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Simulation States Table (High-Resolution State Transitions & Telemetry Log)
CREATE TABLE IF NOT EXISTS simulation_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    parameters JSONB NOT NULL,
    computed JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Experiments Table (Target Tasks & Challenges)
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    type experiment_mode DEFAULT 'challenge',
    title VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
    rules JSONB DEFAULT '{}'::jsonb, -- e.g. allowedParameters, heldConstant
    target_condition JSONB NOT NULL, -- output, operator, value, tolerance
    status experiment_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Experiment Attempts Table (Evaluations of Student Solution against Target)
CREATE TABLE IF NOT EXISTS experiment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    state JSONB NOT NULL, -- Parameter values used in attempt
    outputs JSONB NOT NULL, -- Computed outputs
    success BOOLEAN NOT NULL DEFAULT FALSE,
    error_delta NUMERIC(10, 4), -- Difference from target
    feedback TEXT, -- AI-generated or engine validation feedback
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Experiment Events Table (Granular Actions like Slider Drag, Reset, What-If)
CREATE TABLE IF NOT EXISTS experiment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- parameter_changed, reset, what_if_applied, challenge_started, target_reached
    payload JSONB NOT NULL, -- e.g. { parameter: 'force', from: 20, to: 30 }
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. AI Conversations Table (Session-Aware Tutor Context)
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. AI Messages Table (Dialogue Turns with Live Telemetry Context & Executable Actions)
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role ai_message_role NOT NULL,
    content TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb, -- State snapshot visible to AI at time of question
    action JSONB, -- Structured executable action e.g. { type: 'set_parameters', parameters: { mass: 10 } }
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. Learning Events Table (Learning Analytics & Bloom's Mastery Tracking)
CREATE TABLE IF NOT EXISTS learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- discovery_made, concept_mastered, mistake_corrected, retry_attempted
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_sim_templates_slug ON simulation_templates(slug);
CREATE INDEX IF NOT EXISTS idx_sim_templates_domain ON simulation_templates(domain);
CREATE INDEX IF NOT EXISTS idx_sim_templates_engine ON simulation_templates(engine);
CREATE INDEX IF NOT EXISTS idx_sim_instances_template ON simulation_instances(template_id);
CREATE INDEX IF NOT EXISTS idx_sim_instances_user ON simulation_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_sim_sessions_instance ON simulation_sessions(instance_id);
CREATE INDEX IF NOT EXISTS idx_sim_sessions_user ON simulation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sim_states_session ON simulation_states(session_id);
CREATE INDEX IF NOT EXISTS idx_experiments_session ON experiments(session_id);
CREATE INDEX IF NOT EXISTS idx_experiment_attempts_exp ON experiment_attempts(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_exp ON experiment_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_session ON learning_events(session_id);

-- Optional HNSW Vector Index for Semantic Matching with pgvector
-- CREATE INDEX IF NOT EXISTS idx_sim_templates_embedding ON simulation_templates USING hnsw (embedding vector_cosine_ops);

-- ==============================================================================
-- INITIAL SEED DATA: CORE CURATED SIMULATION TEMPLATES
-- ==============================================================================
INSERT INTO concepts (slug, name, domain, description) VALUES
('newtons-second-law', 'Hukum Newton II', 'Physics', 'Hubungan antara gaya, massa, dan percepatan benda linier (F = m · a)'),
('linear-regression', 'Regresi Linear OLS', 'Statistics', 'Pencocokan garis kuadrat terkecil untuk memprediksi variabel dependen dan mengukur koefisien determinasi R²'),
('supply-demand', 'Keseimbangan Pasar Supply & Demand', 'Economics', 'Penentuan harga ekuilibrium dan kuantitas pasar dari interaksi kurva permintaan dan penawaran'),
('binary-search', 'Pencarian Biner', 'Computer Science', 'Algoritma pencarian logaritmik O(log n) pada larik terurut dengan pembagian separuh ruang pencarian')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO simulation_templates (slug, title, domain, engine, prompt, definition, status, version) VALUES
(
    'newtons-second-law',
    'Newton''s Second Law Dynamics',
    'Physics',
    'physics',
    'Kenapa gaya memengaruhi percepatan?',
    '{
        "engine": "physics",
        "simulation": "newtons_second_law",
        "version": 1,
        "title": "Hukum Newton II: Gaya & Percepatan",
        "description": "Eksperimen gerak linier untuk membuktikan bahwa percepatan berbanding lurus dengan gaya bersih dan berbanding terbalik dengan massa.",
        "parameters": {
            "mass": { "value": 5, "min": 0.5, "max": 20, "step": 0.5, "unit": "kg", "label": "Massa Objek" },
            "force": { "value": 25, "min": 0, "max": 100, "step": 1, "unit": "N", "label": "Gaya Dorong" },
            "friction": { "value": 0.1, "min": 0, "max": 0.5, "step": 0.01, "unit": "μ", "label": "Koefisien Gesek" }
        },
        "controls": ["mass", "force", "friction"],
        "outputs": ["acceleration", "netForce", "frictionForce"],
        "learningObjectives": [
            "Memahami hubungan proporsional antara gaya bersih dan percepatan",
            "Membuktikan bahwa massa memperbesar kelembaman (inersia) benda"
        ]
    }'::jsonb,
    'active',
    1
),
(
    'linear-regression',
    'Ordinary Least Squares Linear Regression',
    'Statistics',
    'statistics',
    'Aku mau ngerti regresi linear.',
    '{
        "engine": "statistics",
        "simulation": "linear_regression",
        "version": 1,
        "title": "Regresi Linear: Ordinary Least Squares",
        "description": "Eksperimen sebaran data 2D untuk mengamati bagaimana garis OLS meminimalkan total kuadrat residual dan mengukur R².",
        "parameters": {
            "trueSlope": { "value": 1.8, "min": -5, "max": 5, "step": 0.1, "label": "Kemiringan Sejati (Slope)" },
            "trueIntercept": { "value": 5, "min": -10, "max": 10, "step": 0.5, "label": "Titik Potong (Intercept)" },
            "noise": { "value": 4, "min": 0, "max": 15, "step": 0.5, "label": "Variansi Noise Acak" },
            "sampleSize": { "value": 25, "min": 10, "max": 60, "step": 5, "unit": "titik", "label": "Jumlah Sampel" }
        },
        "controls": ["trueSlope", "trueIntercept", "noise", "sampleSize"],
        "outputs": ["calcSlope", "calcIntercept", "rSquared", "correlationR"],
        "learningObjectives": [
            "Memahami cara garis OLS meminimalkan residual",
            "Melihat pengaruh noise acak terhadap koefisien determinasi R²"
        ]
    }'::jsonb,
    'active',
    1
),
(
    'supply-demand',
    'Market Equilibrium Coordinate',
    'Economics',
    'economics',
    'Kenapa harga memengaruhi permintaan?',
    '{
        "engine": "economics",
        "simulation": "supply_demand",
        "version": 1,
        "title": "Keseimbangan Pasar: Permintaan & Penawaran",
        "description": "Eksperimen mikroekonomi penentuan harga ekuilibrium P* dan kuantitas pasar Q* dari kurva supply dan demand.",
        "parameters": {
            "demandIntercept": { "value": 100, "min": 50, "max": 200, "step": 5, "unit": "$", "label": "Batas Harga Permintaan" },
            "demandSlope": { "value": -2, "min": -5, "max": -0.5, "step": 0.1, "label": "Elastisitas Permintaan" },
            "supplyIntercept": { "value": 20, "min": 0, "max": 80, "step": 5, "unit": "$", "label": "Biaya Dasar Penawaran" },
            "supplySlope": { "value": 2, "min": 0.5, "max": 5, "step": 0.1, "label": "Elastisitas Penawaran" }
        },
        "controls": ["demandIntercept", "demandSlope", "supplyIntercept", "supplySlope"],
        "outputs": ["equilibriumPrice", "equilibriumQuantity"],
        "learningObjectives": [
            "Memahami hukum permintaan (kurva miring ke bawah)",
            "Mengamati pergeseran titik ekuilibrium saat kurva bergeser"
        ]
    }'::jsonb,
    'active',
    1
)
ON CONFLICT (slug) DO NOTHING;
