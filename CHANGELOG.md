# Change Log

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-06-14

Versión inicial de la **Pokédex · Liquid Glass** sobre la PokeAPI.

### Added

- Galería por generación con buscador, filtro por tipo y favoritos persistentes.
- Ficha de detalle "Completo+" en español (descripción, stats, evolución, shiny, cry, formas, movimientos).
- Comparador de hasta 3 Pokémon con gráfico radar y tabla lado a lado.
- Compartir la ficha como imagen PNG (canvas).
- Tema automático claro/oscuro y diseño responsivo (escritorio a 2 paneles · móvil bottom-sheet).
- Caché con Jotai + IndexedDB (respaldo a localStorage) y PWA (offline de shell, artwork y API).
- Arquitectura atomic design, estado/caché con Jotai, datos vía `PokeApiService` (IoC + Zod) y `#libs/cache`.

### Removed

- Contenido de ejemplo del template (páginas/atoms/componentes demo).
