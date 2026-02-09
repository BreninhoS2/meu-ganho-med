-- Grant admin role to breno augusto and joao barri
-- Admin role will be used to bypass plan restrictions

-- Insert admin role for breno augusto (if not exists)
INSERT INTO public.user_roles (user_id, role)
VALUES ('8845030b-34ba-4491-91ec-1eb50dce38c0', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert admin role for joao barri (if not exists)
INSERT INTO public.user_roles (user_id, role)
VALUES ('e399582a-821e-4cca-8dd0-244c2e4b55d0', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;