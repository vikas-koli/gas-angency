
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import AdminLogin from './pages/loginPage';
import Dashboard from './pages/dashboard';
import ClientData from './pages/client-data';
import VendorData from './pages/vendor';
import Stock from './pages/stock';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<AdminLogin/>}  />
        <Route path='/dashboard' element={<Dashboard/>}  />
        <Route path='/client-list' element={<ClientData/>}  />
        <Route path='/vendor-list' element={<VendorData/>}  />
        <Route path='/stock' element={<Stock/>}  />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
