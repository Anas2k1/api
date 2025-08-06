
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [visited, setVisited] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null); // { id, username, email }
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [view, setView] = useState('home'); // 'home', 'visited', 'wishlist'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('https://restcountries.com/v3.1/all?fields=name,flags')
      .then(res => res.json())
      .then(data => setCountries(data))
      .finally(() => setLoading(false));
  }, []);

  // Fetch user info and lists if logged in
  useEffect(() => {
    if (!token) {
      setUser(null);
      setVisited([]);
      setWishlist([]);
      return;
    }
    setLoading(true);
    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(u => {
        setUser(u);
        setVisited(u.visitedCountries ? u.visitedCountries.map(c => c.name) : []);
        setWishlist(u.wishlistCountries ? u.wishlistCountries.map(c => c.name) : []);
      })
      .catch(() => { setUser(null); setVisited([]); setWishlist([]); })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <nav className="navbar">
        <a href="#" className="nav-link" onClick={() => { setShowLogin(false); setShowRegister(false); setView('home'); setError(''); }}>Home</a>
        <a href="#" className="nav-link" onClick={() => { setShowLogin(false); setShowRegister(false); setView('wishlist'); setError(''); }}>Wishlist</a>
        <a href="#" className="nav-link" onClick={() => { setShowLogin(false); setShowRegister(false); setView('visited'); setError(''); }}>Visited List</a>
        {user ? (
          <>
            <span style={{ marginLeft: 'auto', marginRight: '1rem' }}>Hello, {user.username}</span>
            <a href="#" className="nav-link" onClick={() => { setToken(''); localStorage.removeItem('token'); setUser(null); setVisited([]); setWishlist([]); setError(''); }}>Logout</a>
          </>
        ) : (
          <a href="#" className="nav-link" style={{ marginLeft: 'auto' }} onClick={() => { setShowLogin(true); setShowRegister(false); setError(''); }}>Login</a>
        )}
      </nav>
      {showRegister ? (
        <div className="register-page">
          <h2>Register</h2>
          <RegisterForm onSuccess={() => { setShowRegister(false); setShowLogin(true); setError(''); }} onError={setError} />
          <button type="button" style={{ marginLeft: '10px' }} onClick={() => { setShowRegister(false); setShowLogin(true); setError(''); }}>Back to Login</button>
        </div>
      ) : showLogin ? (
        <div className="login-page">
          <h2>Login</h2>
          <LoginForm onSuccess={({ token, user }) => { setToken(token); localStorage.setItem('token', token); setShowLogin(false); setError(''); }} onError={setError} />
          <button type="button" style={{ marginLeft: '10px' }} onClick={() => { setShowLogin(false); setShowRegister(true); setError(''); }}>Register</button>
        </div>
      ) : view === 'visited' ? (
        <>
          <h1>Visited List</h1>
          <ul>
            {visited.length === 0 && <li>No countries visited yet.</li>}
            {visited.map((name, idx) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>
        </>
      ) : view === 'wishlist' ? (
        <>
          <h1>Wishlist</h1>
          <ul>
            {wishlist.length === 0 && <li>No countries in wishlist yet.</li>}
            {wishlist.map((name, idx) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h1>Country List</h1>
          {loading && <div>Loading...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <div className="country-row">
            {countries.map((country, idx) => {
              const isVisited = visited.includes(country.name.common);
              const isWish = wishlist.includes(country.name.common);
              return (
                <div className="country-card" key={idx}>
                  <img src={country.flags.svg} alt={country.name.common} className="country-flag" />
                  <div>{country.name.common}</div>
                  <button
                    onClick={async () => {
                      if (!user) { setError('Please login to mark as visited.'); return; }
                      setLoading(true);
                      setError('');
                      try {
                        // Find or create country in backend
                        const res = await fetch('http://localhost:5000/api/countries', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ name: country.name.common })
                        });
                        const backendCountry = await res.json();
                        await fetch('http://localhost:5000/api/users/visited', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ countryId: backendCountry._id })
                        });
                        setVisited(v => [...v, country.name.common]);
                      } catch (e) { setError('Failed to update visited list.'); }
                      setLoading(false);
                    }}
                    style={{ background: isVisited ? '#4caf50' : undefined, color: isVisited ? 'white' : undefined }}
                    disabled={isVisited || loading}
                  >
                    {isVisited ? 'Visited' : 'Visit'}
                  </button>
                  <button
                    onClick={async () => {
                      if (!user) { setError('Please login to add to wishlist.'); return; }
                      setLoading(true);
                      setError('');
                      try {
                        // Find or create country in backend
                        const res = await fetch('http://localhost:5000/api/countries', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ name: country.name.common })
                        });
                        const backendCountry = await res.json();
                        await fetch('http://localhost:5000/api/users/wishlist', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ countryId: backendCountry._id })
                        });
                        setWishlist(w => [...w, country.name.common]);
                      } catch (e) { setError('Failed to update wishlist.'); }
                      setLoading(false);
                    }}
                    style={{ background: isWish ? '#1976d2' : undefined, color: isWish ? 'white' : undefined }}
                    disabled={isWish || loading}
                  >
                    {isWish ? 'Wishlisted' : 'Wishlist'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// RegisterForm and LoginForm components
function RegisterForm({ onSuccess, onError }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <form className="register-form" onSubmit={async e => {
      e.preventDefault();
      setLoading(true);
      onError('');
      try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
        onSuccess();
      } catch (err) {
        onError(err.message);
      }
      setLoading(false);
    }}>
      <div>
        <label>Username: </label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div>
        <label>Email: </label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password: </label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" disabled={loading}>Register</button>
    </form>
  );
}

function LoginForm({ onSuccess, onError }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <form className="login-form" onSubmit={async e => {
      e.preventDefault();
      setLoading(true);
      onError('');
      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        onSuccess({ token: data.token, user: data.user });
      } catch (err) {
        onError(err.message);
      }
      setLoading(false);
    }}>
      <div>
        <label>Username: </label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div>
        <label>Password: </label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" disabled={loading}>Login</button>
    </form>
  );
}

export default App;
