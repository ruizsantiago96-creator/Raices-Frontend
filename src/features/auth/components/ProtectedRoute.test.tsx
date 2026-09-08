import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../store/authStore';

// 1. Hacemos mock de Zustand (useAuthStore)
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// 2. Función auxiliar para renderizar con React Router y atrapar redirecciones
const renderWithRouter = (ui: React.ReactElement, initialRoute = '/ruta-protegida') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        {/* Rutas "trampa" para verificar si el Navigate funcionó */}
        <Route path="/" element={<div data-testid="landing-page">Landing Page</div>} />
        <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
        {/* La ruta donde montamos nuestro componente a probar */}
        <Route path="/ruta-protegida" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Test Suite: ProtectedRoute', () => {
  // Limpiamos los mocks antes de cada prueba para que no interfieran entre sí
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe redirigir a "/" (landing) si no hay token (Usuario no autenticado)', () => {
    // Simulamos estado sin token
    (useAuthStore as any).mockReturnValue({ token: null, user: null });

    renderWithRouter(
      <ProtectedRoute>
        <div>Contenido Secreto</div>
      </ProtectedRoute>
    );

    // Verificamos que se renderizó la página de inicio y NO el contenido protegido
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Secreto')).not.toBeInTheDocument();
  });

  it('Debe renderizar el contenido si hay token y NO se exige un rol específico', () => {
    // Simulamos estado con token válido (rol 'pcd')
    (useAuthStore as any).mockReturnValue({ 
      token: 'token-valido', 
      user: { role: 'pcd' } 
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Contenido General para Usuarios Logueados</div>
      </ProtectedRoute>
    );

    // Como no pasamos la prop "role", cualquier usuario con token debería verlo
    expect(screen.getByText('Contenido General para Usuarios Logueados')).toBeInTheDocument();
  });

  it('Debe redirigir a "/dashboard" si el rol no coincide con el exigido', () => {
    // Simulamos un usuario con rol 'tutor'
    (useAuthStore as any).mockReturnValue({ 
      token: 'token-valido', 
      user: { role: 'tutor' } 
    });

    // Protegemos la ruta exigiendo el rol 'admin'
    renderWithRouter(
      <ProtectedRoute role="admin">
        <div>Panel de Administración Exclusivo</div>
      </ProtectedRoute>
    );

    // Verificamos que fue pateado al dashboard
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.queryByText('Panel de Administración Exclusivo')).not.toBeInTheDocument();
  });

  it('Debe renderizar el contenido si el usuario tiene exactamente el rol exigido', () => {
    // Simulamos un usuario con rol 'empresa'
    (useAuthStore as any).mockReturnValue({ 
      token: 'token-valido', 
      user: { role: 'empresa' } 
    });

    renderWithRouter(
      <ProtectedRoute role="empresa">
        <div>Pantalla Dedicada para Empresas</div>
      </ProtectedRoute>
    );

    // Al coincidir el rol, el contenido debe mostrarse
    expect(screen.getByText('Pantalla Dedicada para Empresas')).toBeInTheDocument();
  });
});