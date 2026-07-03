import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.tsx';
import { ScrollToTop } from './components/ScrollToTop.tsx';
import { Book } from './pages/Book.tsx';
import { Bookings } from './pages/Bookings.tsx';
import { Browse } from './pages/Browse.tsx';
import { Item } from './pages/Item.tsx';
import { NotFound } from './pages/NotFound.tsx';
import { SignIn } from './pages/SignIn.tsx';
import { AuthProvider } from './state/AuthContext.tsx';

export function App(): JSX.Element {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Browse />} />
            <Route path="item/:id" element={<Item />} />
            <Route path="item/:id/book" element={<Book />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="signin" element={<SignIn />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
