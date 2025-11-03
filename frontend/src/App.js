
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import AdminLogin from './pages/loginPage';
import Dashboard from './pages/dashboard';
import ClientData from './pages/client-data';
import VendorData from './pages/vendor';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<AdminLogin/>}  />
        <Route path='/dashboard' element={<Dashboard/>}  />
        <Route path='/client-list' element={<ClientData/>}  />
        <Route path='/vendor-list' element={<VendorData/>}  />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
