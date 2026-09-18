import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ClientesListPage } from './pages/clientes/ClientesListPage';
import { ClienteFormPage } from './pages/clientes/ClienteFormPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/clientes" replace /> },
  { path: '/clientes', element: <ClientesListPage /> },
  { path: '/clientes/novo', element: <ClienteFormPage /> },
  { path: '/clientes/:id', element: <ClienteFormPage /> },
]);
