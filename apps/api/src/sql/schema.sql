-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_login TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','worker')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);

-- TEMPLATES (recurring mandatory tasks)
CREATE TABLE IF NOT EXISTS mandatory_task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily','weekly','custom')),
  week_days JSONB NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_admin_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user_active ON mandatory_task_templates(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_templates_deleted ON mandatory_task_templates(deleted_at);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
  is_project BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('pending','in_progress','done','missed')) DEFAULT 'pending',

  assigned_date DATE NOT NULL,
  visible_date DATE NOT NULL,

  template_id UUID NULL REFERENCES mandatory_task_templates(id) ON DELETE SET NULL,
  one_off_by_admin BOOLEAN NOT NULL DEFAULT FALSE,

  is_carryover BOOLEAN NOT NULL DEFAULT FALSE,
  carryover_from_date DATE NULL,

  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  completed_date DATE NULL,

  created_by TEXT NOT NULL CHECK (created_by IN ('admin','worker')),
  created_by_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,

  deleted_at TIMESTAMPTZ NULL,
  deleted_by_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_visible ON tasks(user_id, visible_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_assigned ON tasks(user_id, assigned_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks(deleted_at);
DROP INDEX IF EXISTS idx_tasks_template_assigned;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_tpl_assigned_unique ON tasks(template_id, assigned_date) WHERE template_id IS NOT NULL;

-- COMMENTS
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL, -- ["1st line", "2nd line", ...]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_task ON task_comments(task_id);

-- DAY CLOSURES
CREATE TABLE IF NOT EXISTS day_closures (
  date DATE PRIMARY KEY,
  closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_by TEXT NOT NULL DEFAULT 'system'
);
