import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function RootLayout() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <>
      <Navbar />
      <Outlet />
      {isLanding && <Footer />}
    </>
  );
}
