import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { EMPRESA_HOME, EMPRESA_EDITAR } from '../lib/empresaRole';

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
        <Route path="/empresa/dashboard" element={<div data-testid="empresa-dashboard">Portal Empresa</div>} />
        {/* La ruta donde montamos nuestro componente a probar */}
        <Route path="/ruta-protegida" element={ui} />
        <Route path="/feed" element={ui} />
        <Route path="/empresa/editar" element={ui} />
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
    // Simulamos un usuario con rol 'empresa', dentro de su propia superficie
    (useAuthStore as any).mockReturnValue({ 
      token: 'token-valido', 
      user: { role: 'empresa' } 
    });

    renderWithRouter(
      <ProtectedRoute role="empresa">
        <div>Pantalla Dedicada para Empresas</div>
      </ProtectedRoute>,
      '/empresa/editar'
    );

    // Al coincidir el rol, el contenido debe mostrarse
    expect(screen.getByText('Pantalla Dedicada para Empresas')).toBeInTheDocument();
  });

  // ── Persona moral (empresa): nunca debe caer en el panel de usuario ──

  it('Debe expulsar a la empresa de las rutas de usuario estándar hacia /empresa/dashboard', () => {
    (useAuthStore as any).mockReturnValue({ 
      token: 'token-valido', 
      user: { role: 'empresa' } 
    });

    // /feed es la superficie estándar (Inicio, Oportunidades, Mis Rutas)
    renderWithRouter(
      <ProtectedRoute>
        <div>Feed de usuario</div>
      </ProtectedRoute>,
      '/feed'
    );

    expect(screen.getByTestId('empresa-dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Feed de usuario')).not.toBeInTheDocument();
  });

  it('Debe dejar pasar a la empresa dentro de su propia superficie', () => {
    (useAuthStore as any).mockReturnValue({ 
      token: 'token-valido', 
      user: { role: 'empresa' } 
    });

    renderWithRouter(
      <ProtectedRoute role="empresa">
        <div>Portal de empresa</div>
      </ProtectedRoute>,
      '/empresa/editar'
    );

    expect(screen.getByText('Portal de empresa')).toBeInTheDocument();
  });

  it('Debe tratar institution con tipo=empresa como persona moral', () => {
    (useAuthStore as any).mockReturnValue({ 
      token: 'token-valido', 
      user: { role: 'institution', tipo: 'empresa' } 
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Feed de usuario</div>
      </ProtectedRoute>,
      '/feed'
    );

    expect(screen.getByTestId('empresa-dashboard')).toBeInTheDocument();
  });

  it('Debe reconocer el rol crudo `rol: "empresa"` sin normalizar', () => {
    (useAuthStore as any).mockReturnValue({ 
      token: 'token-valido', 
      user: { role: undefined, rol: 'empresa' } 
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Feed de usuario</div>
      </ProtectedRoute>,
      '/feed'
    );

    expect(screen.getByTestId('empresa-dashboard')).toBeInTheDocument();
  });

  it('No debe dejar a una institución (sin tipo=empresa) fuera de sus rutas', () => {
    (useAuthStore as any).mockReturnValue({ 
      token: 'token-valido', 
      user: { role: 'institution' } 
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Vista institucional</div>
      </ProtectedRoute>,
      '/feed'
    );

    expect(screen.getByText('Vista institucional')).toBeInTheDocument();
  });

  it('No debe generar bucle: la redirección por rol de una empresa va a su portal', () => {
    (useAuthStore as any).mockReturnValue({ 
      token: 'token-valido', 
      user: { role: 'empresa' } 
    });

    // Ruta protegida exigiendo 'admin' pero ya estamos en la superficie empresa
    renderWithRouter(
      <ProtectedRoute role="admin">
        <div>Panel admin</div>
      </ProtectedRoute>,
      '/empresa/editar'
    );

    expect(screen.getByTestId('empresa-dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Panel admin')).not.toBeInTheDocument();
  });

  // ── Regresión: bucle infinito de redirección ───────────────────────
  // App.tsx protege /empresa/dashboard con role="empresa". Una persona moral
  // puede llegar con role='institution' + tipo='empresa'. Si el guard
  // comparara user.role en crudo, la rechazaría y la enviaría a EMPRESA_HOME,
  // que es la ruta en la que ya está: bucle infinito y pantalla en blanco.
  it('no debe crear un bucle al validar el guard de la propia home de empresa', () => {
    (useAuthStore as any).mockReturnValue({
      token: 'token-valido',
      user: { role: 'institution', tipo: 'empresa' },
    });

    // Router dedicado: aquí /empresa/dashboard monta el propio guard, igual que
    // en App.tsx. Si el guard se rechazara a sí mismo, volvería a redirigir a
    // EMPRESA_HOME indefinidamente (bucle) en vez de renderizar su contenido.
    render(
      <MemoryRouter initialEntries={[EMPRESA_HOME]}>
        <Routes>
          <Route
            path={EMPRESA_HOME}
            element={
              <ProtectedRoute role="empresa">
                <div>Portal de empresa</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Renderiza el portal, no un redirect en bucle
    expect(screen.getByText('Portal de empresa')).toBeInTheDocument();
  });

  it('no debe crear un bucle con el rol crudo `rol: "empresa"` sin normalizar', () => {
    (useAuthStore as any).mockReturnValue({
      token: 'token-valido',
      user: { role: undefined, rol: 'empresa' },
    });

    renderWithRouter(
      <ProtectedRoute role="empresa">
        <div>Portal de empresa</div>
      </ProtectedRoute>,
      EMPRESA_EDITAR
    );

    expect(screen.getByText('Portal de empresa')).toBeInTheDocument();
  });

  it('una empresa no debe poder abrir el portal de institución', () => {
    (useAuthStore as any).mockReturnValue({
      token: 'token-valido',
      user: { role: 'institution', tipo: 'empresa' },
    });

    renderWithRouter(
      <ProtectedRoute role="institution">
        <div>Portal institucional</div>
      </ProtectedRoute>,
      '/ruta-protegida'
    );

    // Va a su propio portal, no al de institución
    expect(screen.getByTestId('empresa-dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Portal institucional')).not.toBeInTheDocument();
  });
});