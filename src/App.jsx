import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Hair from './pages/Hair';
import Face from './pages/Face';
import Body from './pages/Body';
import Analytics from './pages/Analytics';
import Purchases from './pages/Purchases';
import Settings from './pages/Settings';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hair" element={<Hair />} />
          <Route path="/face" element={<Face />} />
          <Route path="/body" element={<Body />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
