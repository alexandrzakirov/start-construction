-- Supabase Database Schema for Start Construction PWA
-- Run this SQL in the Supabase dashboard SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DOCUMENTS table - stores document metadata and deadlines
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  type TEXT,
  path TEXT,
  file_size INTEGER,
  deadline DATE,
  is_annual BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT
);

-- INSURANCE table - tracks insurance policies and expiry dates
CREATE TABLE insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'GL', 'Workers Comp', 'Auto', 'Bond', 'Umbrella'
  provider TEXT,
  policy_number TEXT,
  expiry_date DATE,
  premium_amount DECIMAL(10, 2),
  renewal_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DISTRIBUTIONS table - tracks shareholder distributions and estimated tax deadlines
CREATE TABLE distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  distribution_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  is_estimated_tax_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CHECKLIST table - compliance tasks throughout the year
CREATE TABLE checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMP,
  category TEXT, -- 'Annual', 'Quarterly', 'Monthly', 'Ad-hoc'
  priority TEXT DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SUBCONTRACTORS table - tracks 1099 subcontractors and payments
CREATE TABLE subcontractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ein_ssn TEXT,
  w9_on_file BOOLEAN DEFAULT FALSE,
  w9_date DATE,
  address TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SUBCONTRACTOR_PAYMENTS table - tracks monthly payments for 1099 tracking
CREATE TABLE subcontractor_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subcontractor_id UUID REFERENCES subcontractors(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  invoice_number TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SETTINGS table - stores user configuration and company data
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  company_type TEXT,
  cslb_license TEXT,
  state TEXT,
  city TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false}',
  last_backup TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ACTIVITY_LOG table - tracks all changes for audit purposes
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  table_name TEXT NOT NULL,
  record_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_deadline ON documents(deadline);
CREATE INDEX idx_insurance_user_id ON insurance(user_id);
CREATE INDEX idx_insurance_expiry ON insurance(expiry_date);
CREATE INDEX idx_distributions_user_id ON distributions(user_id);
CREATE INDEX idx_distributions_date ON distributions(distribution_date);
CREATE INDEX idx_checklist_user_id ON checklist(user_id);
CREATE INDEX idx_checklist_due_date ON checklist(due_date);
CREATE INDEX idx_checklist_completed ON checklist(is_completed);
CREATE INDEX idx_subcontractors_user_id ON subcontractors(user_id);
CREATE INDEX idx_subcontractor_payments_user_id ON subcontractor_payments(user_id);
CREATE INDEX idx_settings_user_id ON settings(user_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY documents_rls ON documents 
  USING (auth.uid() = user_id);

CREATE POLICY insurance_rls ON insurance
  USING (auth.uid() = user_id);

CREATE POLICY distributions_rls ON distributions
  USING (auth.uid() = user_id);

CREATE POLICY checklist_rls ON checklist
  USING (auth.uid() = user_id);

CREATE POLICY subcontractors_rls ON subcontractors
  USING (auth.uid() = user_id);

CREATE POLICY subcontractor_payments_rls ON subcontractor_payments
  USING (auth.uid() = user_id);

CREATE POLICY settings_rls ON settings
  USING (auth.uid() = user_id);

CREATE POLICY activity_log_rls ON activity_log
  USING (auth.uid() = user_id);
