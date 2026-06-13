# GitHub Issue Commands

## Labels

```bash
gh label create epic --repo andyromerodev/otogyn --color B60205 --description "Epic umbrella issue"
gh label create feature --repo andyromerodev/otogyn --color 1D76DB --description "Feature work"
gh label create bug --repo andyromerodev/otogyn --color D73A4A --description "Bug fix"
gh label create docs --repo andyromerodev/otogyn --color 0E8A16 --description "Documentation work"
gh label create architecture --repo andyromerodev/otogyn --color 5319E7 --description "Architecture decision"
gh label create database --repo andyromerodev/otogyn --color C2E0C6 --description "Database and schema"
gh label create security --repo andyromerodev/otogyn --color D93F0B --description "Security and privacy"
gh label create ui --repo andyromerodev/otogyn --color FBCA04 --description "UI and UX"
gh label create auth --repo andyromerodev/otogyn --color 0052CC --description "Authentication and sessions"
gh label create appointments --repo andyromerodev/otogyn --color 006B75 --description "Appointments domain"
gh label create patients --repo andyromerodev/otogyn --color 0B7285 --description "Patients domain"
gh label create dashboard --repo andyromerodev/otogyn --color 1A7F37 --description "Dashboard work"
gh label create assistant-role --repo andyromerodev/otogyn --color 8250DF --description "Assistant permissions"
gh label create backend --repo andyromerodev/otogyn --color 4C1 --description "Backend work"
gh label create testing --repo andyromerodev/otogyn --color C5DEF5 --description "Testing"
gh label create mvp --repo andyromerodev/otogyn --color EDEDED --description "MVP scope"
gh label create high-priority --repo andyromerodev/otogyn --color B60205 --description "Highest priority"
gh label create medium-priority --repo andyromerodev/otogyn --color FBCA04 --description "Medium priority"
gh label create low-priority --repo andyromerodev/otogyn --color 0E8A16 --description "Low priority"
```

## Issues

```bash
gh issue create --repo andyromerodev/otogyn --title "E1: Arquitectura base del MVP" --label epic --label architecture --label docs --label mvp
gh issue create --repo andyromerodev/otogyn --title "E2: Backend y base de datos con Neon" --label epic --label backend --label database --label mvp
gh issue create --repo andyromerodev/otogyn --title "E3: Auth y roles" --label epic --label auth --label security --label assistant-role
gh issue create --repo andyromerodev/otogyn --title "E4: Dashboard administrativo" --label epic --label dashboard --label ui --label mvp
gh issue create --repo andyromerodev/otogyn --title "E5: Pacientes" --label epic --label patients --label backend --label ui
gh issue create --repo andyromerodev/otogyn --title "E6: Citas" --label epic --label appointments --label backend --label high-priority
gh issue create --repo andyromerodev/otogyn --title "E7: Agenda y calendario" --label epic --label appointments --label ui --label medium-priority
gh issue create --repo andyromerodev/otogyn --title "E8: Servicios medicos" --label epic --label backend --label ui --label medium-priority
gh issue create --repo andyromerodev/otogyn --title "E9: Disponibilidad" --label epic --label database --label appointments --label medium-priority
gh issue create --repo andyromerodev/otogyn --title "E10: Reserva publica" --label epic --label ui --label security --label medium-priority
gh issue create --repo andyromerodev/otogyn --title "E11: Seguridad y privacidad" --label epic --label security --label mvp --label high-priority
gh issue create --repo andyromerodev/otogyn --title "E12: Testing" --label epic --label testing --label high-priority
gh issue create --repo andyromerodev/otogyn --title "E13: UI/UX responsive" --label epic --label ui --label mvp --label medium-priority
gh issue create --repo andyromerodev/otogyn --title "E14: Deploy" --label epic --label docs --label backend --label low-priority
```
