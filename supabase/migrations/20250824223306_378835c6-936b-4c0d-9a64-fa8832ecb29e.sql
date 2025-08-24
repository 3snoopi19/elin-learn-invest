-- Create router_accounts table for connected bank/credit accounts
CREATE TABLE public.router_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'plaid', 'manual', etc.
  account_id TEXT NOT NULL, -- External account ID from provider
  type TEXT NOT NULL, -- 'checking', 'savings', 'credit_card', 'loan'
  name TEXT NOT NULL,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider, account_id)
);

-- Create router_rules table for Smart Rules
CREATE TABLE public.router_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'percent_to_savings', 'fixed_payment', 'threshold_topup'
  config_json JSONB NOT NULL, -- Rule configuration
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create router_moves_sim table for simulation cache
CREATE TABLE public.router_moves_sim (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  moves_json JSONB NOT NULL, -- Simulated moves and projections
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.router_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.router_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.router_moves_sim ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for router_accounts
CREATE POLICY "Users can manage own router accounts" 
ON public.router_accounts 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for router_rules
CREATE POLICY "Users can manage own router rules" 
ON public.router_rules 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for router_moves_sim
CREATE POLICY "Users can manage own router simulations" 
ON public.router_moves_sim 
FOR ALL 
USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_router_accounts_updated_at
BEFORE UPDATE ON public.router_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_router_rules_updated_at
BEFORE UPDATE ON public.router_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();