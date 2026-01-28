-- Add subscription columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN subscription_status text NOT NULL DEFAULT 'free' 
  CHECK (subscription_status IN ('active', 'inactive', 'free')),
ADD COLUMN subscription_expires_at timestamp with time zone;

-- Create index for faster subscription checks
CREATE INDEX idx_profiles_subscription_expires ON public.profiles(subscription_expires_at);

-- Comment for documentation
COMMENT ON COLUMN public.profiles.subscription_status IS 'Subscription status: active, inactive, or free';
COMMENT ON COLUMN public.profiles.subscription_expires_at IS 'When the subscription expires (null for free tier)';