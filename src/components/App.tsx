import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import lizardLogo from '../assets/lizard-logo.png';
import Detail from './Detail';
import Home from './Home';

const App: React.FC = () => {
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
