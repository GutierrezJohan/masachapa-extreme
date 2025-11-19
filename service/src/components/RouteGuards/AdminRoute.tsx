import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

type AdminRouteProps = RouteProps & { children: React.ReactElement };

const AdminRoute: React.FC<AdminRouteProps> = ({ children, ...rest }) => {
  const user = getUser();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAdmin = !!user && user.tipo === 'administrador' && !!token;

  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAdmin ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location, reason: 'admin_only' },
            }}
          />
        )
      }
    />
  );
};

export default AdminRoute;
