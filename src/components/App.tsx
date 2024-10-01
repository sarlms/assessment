import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Detail from './Detail';
import Home from './Home';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        {/*header with a link to reset filters and navigate to home page*/}
        <header>
          <Link to="/" state={{ resetFilters: true }}>
            {/*logo image for the header, src based on environment variable*/}
            <img src={`${process.env.PUBLIC_URL}/lizard-logo.png`} alt="Lizard Logo" className="lizard-logo" />
          </Link>
        </header>
        <main>
          {/*main routes of the application: home and detail page*/}
          <Routes>
            {/*route to home page*/}
            <Route path="/" element={<Home />} />
            {/*route to detail page with dynamic id*/}
            <Route path="/detail/:id" element={<Detail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
