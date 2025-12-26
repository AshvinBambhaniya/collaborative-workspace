import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { WorkspaceView } from './pages/WorkspaceView';
import { EditorPage } from './pages/Editor';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'workspace/:workspaceId', element: <WorkspaceView /> },
    ],
  },
  {
    path: 'project/:projectId',
    element: (
        <ProtectedRoute>
            <SocketProvider>
                <DashboardLayout />
            </SocketProvider>
        </ProtectedRoute>
    ), // Reuse dashboard layout for nav, or create specialized EditorLayout
    children: [
         { index: true, element: <EditorPage /> } // Render editor inside layout
    ]
  }
]);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;