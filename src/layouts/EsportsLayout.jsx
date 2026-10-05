import { Outlet } from 'react-router-dom';
import EsportsNavbar from '../components/EsportsNavbar';
import './EsportsLayout.css';

const EsportsLayout = ({ user, coins, onLoginClick, onLogout }) => {
  return (
    <div className="esports-app-container">
      <EsportsNavbar 
        user={user} 
        coins={coins}
        onLoginClick={onLoginClick} 
        onLogout={onLogout}
      />
      <main className="esports-main-content">
        {/* Child routes map to this Outlet */}
        <Outlet context={{ coins }} />
      </main>
    </div>
  );
};

export default EsportsLayout;
