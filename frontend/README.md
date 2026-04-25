# ⚛️ Cloud Storage Frontend

Фронтенд-часть облачного хранилища, реализованная на React, TypeScript и Redux Toolkit.

## 🛠 Технологии
- **React 18** - библиотека для UI
- **TypeScript** - типизация
- **Redux Toolkit** - управление состоянием
- **React Router v6** - маршрутизация
- **Vite** - сборка и разработка
- **Axios** - HTTP запросы
- **CSS Modules** - стилизация

## 📦 Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

### 3. Сборка для production

```bash
npm run build
```

Собранные файлы будут находиться в директории dist/

## 📁 Структура проекта

```bash
cloud/
├── 📂 backend/
├── 📂 frontend/
│   ├── 📂 public/
│   ├── 📁 src/
│   │   ├── 📁 assets/
│   │   ├── 📁 components/
│   │   │   ├── 📂 Breadcrumbs/
│   │   │   │   └── 📄 Breadcrumbs.tsx
│   │   │   │   ├── 📄 Breadcrumbs.module.css
│   │   │   ├── 📂 icons/
│   │   │   │   ├── 📄 AdminPanel.tsx
│   │   │   │   ├── 📄 FileActions.tsx
│   │   │   │   ├── 📄 FileTypes.tsx
│   │   │   │   ├── 📄 System.tsx
│   │   │   │   ├── 📄 index.ts
│   │   │   ├── 📂 LoginForm/
│   │   │   │   └── 📄 LoginForm.tsx
│   │   │   ├── 📂 Modals/
│   │   │   │   ├── 📄 ConfirmActionModal.tsx
│   │   │   │   ├── 📄 CreateFolderModal.tsx
│   │   │   │   ├── 📄 DeleteConfirmModal.tsx
│   │   │   │   ├── 📄 FilePreviewModal.tsx
│   │   │   │   ├── 📄 RenameFileModal.tsx
│   │   │   │   ├── 📄 ShareModal.tsx
│   │   │   │   └── 📄 UploadFileModal.tsx
│   │   │   │   ├── 📄 Modals.module.css
│   │   │   ├── 📂 RegistrationForm/
│   │   │   │   └── 📄 RegistrationForm.tsx
│   │   │   ├── 📂 StorageFileList/
│   │   │   │   └── 📄 StorageFileList.tsx
│   │   │   │   ├── 📄 StorageFileList.module.css
│   │   │   ├── 📂 StorageSidebar/
│   │   │   │   └── 📄 StorageSidebar.tsx
│   │   │   │   ├── 📄 StorageSidebar.module.css
│   │   │   ├── 📂 Toolbar/
│   │   │   │   └── 📄 Toolbar.tsx
│   │   │   │   ├── 📄 Toolbar.module.css
│   │   │   └── 📁 ui/
│   │   │   │   ├── 📂 Button/
│   │   │   │   │   └── 📄 Button.tsx
│   │   │   │   │   ├── 📄 Button.module.css
│   │   │   │   ├── 📂 Form/
│   │   │   │   │   └── 📄 Form.tsx
│   │   │   │   │   ├── 📄 Form.module.css
│   │   │   │   ├── 📂 Icon/
│   │   │   │   │   ├── 📄 Icon.tsx
│   │   │   │   │   ├── 📄 Icon.module.css
│   │   │   │   │   └── 📄 index.js
│   │   │   │   ├── 📂 Input/
│   │   │   │   │   └── 📄 Input.tsx
│   │   │   │   │   ├── 📄 Input.module.css
│   │   │   │   ├── 📂 LoadingSpinner/
│   │   │   │   │   └── 📄 LoadingSpinner.tsx
│   │   │   │   │   ├── 📄 LoadingSpinner.module.css
│   │   │   │   ├── 📂 Skeleton/
│   │   │   │   │   └── 📄 SkeletonFileList.tsx
│   │   │   │   │   ├── 📄 Skeleton.module.css
│   │   │   │   ├── 📂 StorageFile/
│   │   │   │   │   └── 📄 StorageFile.tsx
│   │   │   │   │   ├── 📄 StorageFile.module.css
│   │   │   │   └── 📂 StorageFolder/
│   │   │   │   │   └── 📄 StorageFolder.tsx
│   │   │   │   │   ├── 📄 StorageFolder.module.css
│   │   ├── 📁 hooks/
│   │   │   ├── 📄 useAuth.ts
│   │   │   ├── 📄 useFolder.ts
│   │   │   └── 📄 usePermissions.ts
│   │   ├── 📂 Layouts/
│   │   │   ├── 📂 Footer/
│   │   │   │   └── 📄⚛️ Footer.tsx
│   │   │   │   ├── 📄 Footer.module.css
│   │   │   ├── 📂 Header/
│   │   │   │   └── 📄 Header.tsx
│   │   │   │   ├── 📄 Header.module.css
│   │   │   └── 📂 MainLayout/
│   │   │   │   └── 📄 MainLayout.tsx
│   │   │   │   ├── 📄 MainLayout.module.css
│   │   ├── 📁 pages/
│   │   │   ├── 📂 AdminPage/
│   │   │   │   └── 📄 AdminPage.tsx
│   │   │   │   ├── 📄 AdminPage.module.css
│   │   │   ├── 📂 HomePage/
│   │   │   │   └── 📄 HomePage.tsx
│   │   │   │   ├── 📄 HomePage.module.css
│   │   │   ├── 📂 LoginPage/
│   │   │   │   └── 📄 LoginPage.tsx
│   │   │   │   ├── 📄 LoginPage.module.css
│   │   │   ├── 📂 MainPage/
│   │   │   │   └── 📄 MainPage.tsx
│   │   │   │   ├── 📄 MainPage.module.css
│   │   │   ├── 📂 RegistrationPage/
│   │   │   │   └── 📄 RegistrationPage.tsx
│   │   │   │   ├── 📄 RegistrationPage.module.css
│   │   │   ├── 📂 SharedFilePage/
│   │   │   │   └── 📄 SharedFilePage.tsx
│   │   │   │   ├── 📄 SharedFilePage.module.css
│   │   │   └── 📂 UserStoragePage/
│   │   │   │   └── 📄 UserStoragePage.tsx
│   │   │   │   ├── 📄 UserStoragePage.module.css
│   │   ├── 📂 routes/
│   │   │   └── 📄 routes.tsx
│   │   ├── 📂 store/
│   │   │   ├── 📂 selectors/
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📂 slices/
│   │   │   │   ├── 📄 authSlice.ts
│   │   │   │   ├── 📄 filesSlice.ts
│   │   │   │   ├── 📄 foldersSlice.ts
│   │   │   │   ├── 📄 sharingSlice.ts
│   │   │   │   └── 📄 usersSlice.ts
│   │   │   ├── 📄 hooks.ts
│   │   │   └── 📄 store.ts
│   │   └── 📂 utils/
│   │   │   ├── 📄 clipboard.ts
│   │   │   ├── 📄 csrf.ts
│   │   │   ├── 📄 formatNumber.ts
│   │   │   └── 📄 validation.ts
│   │   ├── 📄 types.ts
│   │   ├── 📄 index.css
│   │   ├── 📄 index.tsx
│   ├── 📄 index.html
│   ├── 📄 README.md
│   ├── 📄 package-lock.json
│   ├── 📄 package.json
│   ├── 📄 eslint.config.js
│   ├── 📄 tsconfig.app.json
│   ├── 📄 tsconfig.json
│   ├── 📄 tsconfig.node.json
│   └── 📄 vite.config.ts
```

## 🔌 Коммуникация с бэкендом

Все API запросы направляются через прокси Vite

```bash
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

## 🔧 Переменные окружения

Создайте файл .env для настройки API URL в production

```bash
VITE_API_URL=https://your-domain.com/api
```