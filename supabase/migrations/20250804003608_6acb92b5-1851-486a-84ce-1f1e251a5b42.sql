-- Check current functions that might have mua_id references
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_definition ILIKE '%mua_id%';