-- Copy and paste this into the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
ON public.links
FOR SELECT
TO public
USING (true);

-- Allow public insert access (For MVP purposes)
CREATE POLICY "Allow public insert"
ON public.links
FOR INSERT
TO public
WITH CHECK (true);
