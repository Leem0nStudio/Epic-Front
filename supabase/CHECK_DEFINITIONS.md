# Verificar si las definiciones existen en la DB

Ejecuta estas queries en el SQL Editor de Supabase:

## 1. Verificar item_definitions
```sql
SELECT * FROM item_definitions LIMIT 5;
Failed to run sql query: ERROR:  42P01: relation "item_definitions" does not exist
LINE 1: SELECT * FROM item_definitions LIMIT 5;
                      ^
```

## 2. Verificar skill_definitions
```sql
SELECT * FROM skill_definitions LIMIT 5;
Failed to run sql query: ERROR:  42P01: relation "skill_definitions" does not exist
LINE 1: SELECT * FROM skill_definitions LIMIT 5;
                      ^
```

## 3. Ver todas las tablas disponibles
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
| table_name             |
| ---------------------- |
| party                  |
| recruitment_queue      |
| gacha_state            |
| campaign_progress      |
| player_daily_rewards   |
| players                |
| units                  |
| inventory              |
| game_configs           |
| jobs                   |
| skills                 |
| cards                  |
| weapons                |
| job_cores              |
| materials              |
| potentials             |
| job_skill_trees        |
| skill_module_tags      |
| skill_module_effects   |
| job_skill_modules      |
| tags                   |
| triggers               |
| effects                |
| skill_modules          |
| skill_fragments        |
| player_skill_fragments |
| player_learned_skills  |
| equipment_sets         |
| armors                 |
| accessories            |
| boots                  |
| chapters               |
| stages                 |
| unit_progress          |
```

## 4. Contar registros en cada tabla
```sql
SELECT 'item_definitions' as table_name, COUNT(*) as count FROM item_definitions
UNION ALL
SELECT 'skill_definitions', COUNT(*) FROM skill_definitions
UNION ALL
SELECT 'equipment_definitions', COUNT(*) FROM equipment_definitions
UNION ALL
SELECT 'cards', COUNT(*) FROM cards;
Failed to run sql query: ERROR:  42P01: relation "item_definitions" does not exist
LINE 1: SELECT 'item_definitions' as table_name, COUNT(*) as count FROM item_definitions
                                                                        ^
Note: A limit of 100 was applied to your query. If this was the cause of a syntax error, try selecting "No limit" instead and re-run the query.
```