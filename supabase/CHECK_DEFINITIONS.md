# Verificar si las definiciones existen en la DB

Ejecuta estas queries en el SQL Editor de Supabase:

## 1. Verificar item_definitions
```sql
SELECT * FROM item_definitions LIMIT 5;
```

## 2. Verificar skill_definitions
```sql
SELECT * FROM skill_definitions LIMIT 5;
```

## 3. Ver todas las tablas disponibles
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
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
```