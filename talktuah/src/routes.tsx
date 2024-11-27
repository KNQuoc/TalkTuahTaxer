// src/routes.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import About from './About';

const RoutesComponent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
};

export default RoutesComponent;