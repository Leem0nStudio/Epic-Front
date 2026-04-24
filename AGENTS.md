# Pendientes del Proyecto

## Autenticación
- [ ] Implementar pagina/login con sign in/sign up de Supabase
- [ ] Crear AuthProvider para manejar estado de sesión

## Recruitment (Tavern)
- [ ] Conectar RecruitmentService con UI
- [ ] Manejar errores de autenticación en handleClaimRecruit/handleDiscardRecruit

## Party System
- [ ] Guardar party en Supabase al cambiar disposición
- [ ] Sincronizar party entre sesiones

## Persistencia
- [ ] Cargar saveData desde Supabase al iniciar
- [ ] Guardar cambios del jugador (roster, gold, etc.)

## UI
- [ ] Pantalla de inventory
- [ ] Detalles de unidad (stats, equipment)
- [ ] Battle screen completa
- [ ] Gacha visual con animaciones

## Bugs
- [x] Fix: Recargar página pierde datos del jugador
- [x] Fix: Errores de Hydration con Math.random()