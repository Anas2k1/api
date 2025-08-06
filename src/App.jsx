
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,flags')
      .then(res => res.json())
      .then(data => setCountries(data));
  }, []);

  return (
    <div>
      <nav className="navbar">
        <a href="#" className="nav-link">Home</a>
        <a href="#" className="nav-link">Wishlist</a>
        <a href="#" className="nav-link">Visited List</a>
        <a href="#" className="nav-link" style={{ marginLeft: 'auto' }}>Login</a>
      </nav>
      <h1>Country List</h1>
      <div className="country-row">
        {countries.map((country, idx) => (
          <div className="country-card" key={idx}>
            <img src={country.flags.svg} alt={country.name.common} className="country-flag" />
            <div>{country.name.common}</div>
            <button>Visited</button>
            <button>Wishlist</button>
          </div>
        ))}
      </div>
  );
    </div>
  );
}

export default App;
