import { useState } from 'react';
import { RBACProvider, Can, ScopeGuard, ProtectedRoute } from '@react-enterprise-rbac/react';
import { mockUsers } from './mocks/users';
import './App.css';

const Dashboard = () => {
  // const { can } = usePermission();
  
  return (
    <div className="dashboard-content">
      <h1>Enterprise Dashboard</h1>
      <p>Welcome to the multi-org access control demo.</p>
      
      <div className="stats-grid">
        <Can permission="analytics.view">
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">$1.2M</p>
          </div>
        </Can>
        
        <div className="stat-card">
          <h3>Active Tasks</h3>
          <p className="stat-value">42</p>
        </div>
        
        <ScopeGuard scope="region" scopeId="mumbai" permission="task.edit">
          <div className="stat-card highlight">
            <h3>Mumbai Operations</h3>
            <p>You have management access to this region.</p>
            <button className="btn-primary">Manage Region</button>
          </div>
        </ScopeGuard>
      </div>

      <section className="task-section">
        <h2>Tasks</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TASK-101</td>
              <td>Update Safety Protocols</td>
              <td><span className="badge badge-pending">Pending</span></td>
              <td>
                <Can permission="task.edit">
                  <button className="btn-icon">Edit</button>
                </Can>
                <Can permission="task.delete">
                  <button className="btn-icon danger">Delete</button>
                </Can>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(mockUsers.admin);

  return (
    <RBACProvider user={currentUser}>
      <div className="app-container">
        <aside className="sidebar">
          <div className="logo">RBAC Enterprise</div>
          <nav>
            <ul>
              <li>Dashboard</li>
              <Can permission="users.view">
                <li>User Management</li>
              </Can>
              <Can permission="settings.view">
                <li>Settings</li>
              </Can>
            </ul>
          </nav>
          
          <div className="user-switcher">
            <label>Switch Role:</label>
            <select 
              value={Object.keys(mockUsers).find(k => mockUsers[k].id === currentUser.id)}
              onChange={(e) => setCurrentUser(mockUsers[e.target.value])}
            >
              <option value="admin">Admin (Global)</option>
              <option value="regionManager">Region Manager (Mumbai)</option>
              <option value="siteManager">Site Manager (Site 101)</option>
              <option value="auditor">Auditor (Read-Only)</option>
            </select>
          </div>
        </aside>

        <main className="main-content">
          <header className="top-header">
            <div className="user-info">
              <span>{currentUser.id}</span>
              <span className="badge">{currentUser.roles[0]}</span>
            </div>
          </header>
          
          <ProtectedRoute permission="dashboard.view">
            <Dashboard />
          </ProtectedRoute>
        </main>
      </div>
    </RBACProvider>
  );
}

export default App;
