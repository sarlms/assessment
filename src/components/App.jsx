import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import lizardLogo from '../assets/lizard-logo.png';
import Detail from './Detail'; // Le nouveau composant "Detail"
import Home from './Home'; // Nous allons déplacer le code actuel dans un composant Home

function App() {
  return (
    <Router>
      <div>
        <header>
          <img src={lizardLogo} alt="Lizard Logo" className="lizard-logo" />
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detail/:id" element={<Detail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
