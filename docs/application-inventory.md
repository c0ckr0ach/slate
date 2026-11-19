frontend: react + vite
frontend port: 5173
backend: node + express
language: typescript
default backend port: 4000
api routes: /api/v1
database: none
frontend:
    main.tsx: renders the app
    app.tsx: routing

backend:
    server.ts

commands:
frontend->
    dev: vite
    "build": "tsc -b && vite build",
    "preview": "vite preview"
backend->
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"