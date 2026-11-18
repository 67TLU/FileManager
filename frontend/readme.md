src/
├── app/                      # App-level setup
│   ├── routes/               # React Router config
│   │   ├── index.tsx
│   │   ├── auth.routes.tsx
│   │   ├── employee.routes.tsx
│   │   └── admin.routes.tsx
│   └── providers.tsx         # QueryClient, AuthProvider wrapper
│
├── components/               # Shared components
│   ├── ui/                   # shadcn components (auto-generated)
│   ├── layout/
│   │   ├── app-sidebar.tsx
│   │   ├── header.tsx
│   │   └── breadcrumb-nav.tsx
│   ├── common/
│   │   ├── page-header.tsx
│   │   ├── data-table.tsx
│   │   ├── loading-spinner.tsx
│   │   └── empty-state.tsx
│   └── forms/
│       └── form-field.tsx
│
├── features/                 # Feature-based modules
│   ├── auth/
│   │   ├── api/
│   │   │   └── auth.api.ts
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   └── use-login.ts
│   │   ├── stores/
│   │   │   └── auth.store.ts
│   │   ├── pages/
│   │   │   ├── login.page.tsx
│   │   │   ├── forgot-password.page.tsx
│   │   │   └── reset-password.page.tsx
│   │   └── components/
│   │       └── login-form.tsx
│   │
│   ├── users/
│   ├── departments/
│   ├── resources/
│   ├── folders/
│   └── search/
│
├── lib/                      # Utilities
│   ├── api-client.ts         # Axios instance
│   ├── utils.ts              # cn() helper
│   ├── constants.ts
│   └── types.ts
│
├── hooks/                    # Global hooks
│   ├── use-debounce.ts
│   └── use-local-storage.ts
│
├── main.tsx
└── App.tsx