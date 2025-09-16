import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import ContentPage from '@/pages/ContentPage';
import PlayerPage from '@/pages/PlayerPage';
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import TermsOfService from '@/pages/legal/TermsOfService';
import DMCAPolicy from '@/pages/legal/DMCAPolicy';
import AboutUs from '@/pages/legal/AboutUs';
import Contact from '@/pages/legal/Contact';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/content/:type/:id" element={<ContentPage />} />
        <Route path="/player/:type/:id" element={<PlayerPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/dmca" element={<DMCAPolicy />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;