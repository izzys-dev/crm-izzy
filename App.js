import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Users, Plus, Search, BarChart3, Clock, Star, Phone, Mail, Building2, Trash2, LogOut, MessageSquare, CheckCircle, AlertCircle, Lock, Eye, Edit3, ChevronLeft, Download, Upload, Settings, Menu, X } from 'lucide-react';

const API_URL = (() => {
  const hostname = window.location.hostname;
  const port = 3001;
  return `http://${hostname}:${port}`;
})();

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function CRMApp() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    agent_id: ''
  });

  const [agentFormData, setAgentFormData] = useState({
    username: '',
    name: '',
    password: ''
  });

  const [interactionData, setInteractionData] = useState({
    type: 'call',
    notes: '',
    quality_score: 5,
    experience_rating: 5,
    duration: '',
    result: 'completada'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyUser();
    }
  }, []);

  const verifyUser = async () => {
    try {
      const response = await axiosInstance.get('/api/me');
      setUser(response.data);
      loadData();
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const loadData = async () => {
    try {
      const [customersRes, agentsRes, analyticsRes] = await Promise.all([
        axiosInstance.get('/api/customers'),
        axiosInstance.get('/api/agents'),
        axiosInstance.get('/api/analytics')
      ]);
      setCustomers(customersRes.data);
      setAgents(agentsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const response = await axios.post(`${API_URL}/api/login`, loginData);
      localStorage.setItem('token', response.data.token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      setLoginData({ username: '', password: '' });
      loadData();
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView('login');
    setSelectedCustomer(null);
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    try {
      await axiosInstance.post('/api/customers', formData);
      setFormData({ name: '', email: '', phone: '', company: '', agent_id: '' });
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error adding customer:', err);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('¿Eliminar cliente?')) {
      try {
        await axiosInstance.delete(`/api/customers/${id}`);
        loadData();
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
      } catch (err) {
        console.error('Error deleting customer:', err);
      }
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (!agentFormData.username || !agentFormData.name) return;
    try {
      await axiosInstance.post('/api/agents', agentFormData);
      setAgentFormData({ username: '', name: '', password: '' });
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error adding agent:', err);
    }
  };

  const handleDeleteAgent = async (id) => {
    if (window.confirm('¿Eliminar agente?')) {
      try {
        await axiosInstance.delete(`/api/agents/${id}`);
        loadData();
      } catch (err) {
        console.error('Error deleting agent:', err);
      }
    }
  };

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const res = await axiosInstance.get(`/api/customers/${customer.id}/interactions`);
      setInteractions(res.data);
    } catch (err) {
      console.error('Error loading interactions:', err);
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await axiosInstance.post(`/api/customers/${selectedCustomer.id}/interactions`, interactionData);
      setInteractionData({
        type: 'call',
        notes: '',
        quality_score: 5,
        experience_rating: 5,
        duration: '',
        result: 'completada'
      });
      handleSelectCustomer(selectedCustomer);
      loadData();
    } catch (err) {
      console.error('Error adding interaction:', err);
    }
  };

  const handleExportCustomers = async () => {
    try {
      const data = customers.map(c => ({
        Nombre: c.name,
        Email: c.email,
        Celular: c.phone,
        Empresa: c.company
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
      XLSX.writeFile(wb, `clientes_${new Date().getTime()}.xlsx`);
    } catch (err) {
      console.error('Error exporting:', err);
    }
  };

  const handleImportCustomers = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axiosInstance.post('/api/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`✅ ${res.data.importados} clientes importados`);
      loadData();
    } catch (err) {
      alert('Error importando archivo');
    }
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-logo">
            <div className="logo-circle">CV</div>
            <h1>conversa</h1>
            <p>RELACIONES QUE AVANZAN</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Usuario</label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                placeholder="tu.usuario"
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && <div className="error-message">{loginError}</div>}

            <button type="submit" disabled={loading} className="btn-primary-full">
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="login-hint">Demo: admin / admin123</p>
        </div>
      </div>
    );
  }

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="crm-container">
      <Sidebar 
        view={view} 
        setView={setView} 
        user={user} 
        onLogout={handleLogout}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="main-content">
        <TopBar 
          user={user} 
          view={view}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="content-area">
          {view === 'dashboard' && (
            <DashboardView 
              analytics={analytics}
              customers={customers}
              agents={agents}
              onViewCustomers={() => setView('customers')}
              onViewAgents={() => setView('agents')}
            />
          )}

          {view === 'customers' && (
            <CustomersView
              customers={filteredCustomers}
              selectedCustomer={selectedCustomer}
              interactions={interactions}
              interactionData={interactionData}
              setInteractionData={setInteractionData}
              onSelectCustomer={handleSelectCustomer}
              onAddInteraction={handleAddInteraction}
              onDeleteCustomer={handleDeleteCustomer}
              onAddClick={() => setShowModal(true)}
              onExport={handleExportCustomers}
              onImport={handleImportCustomers}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              agents={agents}
            />
          )}

          {view === 'agents' && user?.role === 'admin' && (
            <AgentsView
              agents={agents}
              onAddClick={() => setShowModal(true)}
              onDeleteAgent={handleDeleteAgent}
            />
          )}
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {view === 'customers' ? (
            <CustomerForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddCustomer}
              onCancel={() => setShowModal(false)}
              agents={agents}
            />
          ) : (
            <AgentForm
              formData={agentFormData}
              setFormData={setAgentFormData}
              onSubmit={handleAddAgent}
              onCancel={() => setShowModal(false)}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

function Sidebar({ view, setView, user, onLogout, open, onToggle }) {
  return (
    <div className={`sidebar ${open ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-circle">CV</div>
          <div className="logo-text">
            <h2>conversa</h2>
            <span>CRM</span>
          </div>
        </div>
        <button className="close-sidebar" onClick={onToggle}>
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavItem 
          icon={<BarChart3 size={20} />} 
          label="Dashboard" 
          active={view === 'dashboard'}
          onClick={() => setView('dashboard')}
        />
        <NavItem 
          icon={<Users size={20} />} 
          label="Clientes" 
          active={view === 'customers'}
          onClick={() => setView('customers')}
        />
        {user?.role === 'admin' && (
          <NavItem 
            icon={<Users size={20} />} 
            label="Agentes" 
            active={view === 'agents'}
            onClick={() => setView('agents')}
          />
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div className="user-details">
            <p className="user-name">{user?.username}</p>
            <p className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Agente'}</p>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          <LogOut size={16} /> Salir
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function TopBar({ user, view, onMenuToggle }) {
  const viewTitles = {
    dashboard: 'Dashboard',
    customers: 'Clientes',
    agents: 'Agentes',
    tasks: 'Tareas'
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-label">SISTEMA / RELACIONES</span>
          <h1>{viewTitles[view] || 'CRM'}</h1>
        </div>
      </div>
      <div className="top-bar-right">
        <Settings size={20} className="icon-settings" />
      </div>
    </div>
  );
}

function DashboardView({ analytics, customers, agents, onViewCustomers, onViewAgents }) {
  return (
    <div className="dashboard-view">
      <h2 className="section-title">Todo bajo control.</h2>
      <p className="section-subtitle">El pulso de tu cartera, sin ruido.</p>

      <div className="metrics-grid">
        <MetricCard
          title="Clientes activos"
          value={customers.length}
          icon={<Users size={24} />}
          color="blue"
          onClick={onViewCustomers}
        />
        <MetricCard
          title="Interacciones"
          value={analytics?.totalInteractions || 0}
          icon={<MessageSquare size={24} />}
          color="orange"
        />
        <MetricCard
          title="Calidad media"
          value={`${analytics?.avgQualityScore || 0}/10`}
          icon={<Star size={24} />}
          color="yellow"
        />
        <MetricCard
          title="Experiencia"
          value={`${analytics?.avgExperienceRating || 0}/10`}
          icon={<Star size={24} />}
          color="green"
        />
      </div>

      {agents.length > 0 && (
        <div className="agents-section">
          <h3>Equipo comercial</h3>
          <div className="agents-list">
            {agents.map(agent => (
              <div key={agent.id} className="agent-card">
                <div className="agent-avatar">{agent.name[0]}</div>
                <div className="agent-info">
                  <p className="agent-name">{agent.name}</p>
                  <p className="agent-username">@{agent.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, color, onClick }) {
  return (
    <div 
      className={`metric-card metric-${color}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <p className="metric-label">{title}</p>
        <p className="metric-value">{value}</p>
      </div>
    </div>
  );
}

function CustomersView({
  customers,
  selectedCustomer,
  interactions,
  interactionData,
  setInteractionData,
  onSelectCustomer,
  onAddInteraction,
  onDeleteCustomer,
  onAddClick,
  onExport,
  onImport,
  searchTerm,
  onSearchChange,
  agents
}) {
  return (
    <div className="customers-view">
      <div className="customers-header">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa o email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="action-buttons">
          <button className="btn-secondary" onClick={onExport}>
            <Download size={16} /> Exportar
          </button>
          <label className="btn-secondary">
            <Upload size={16} /> Importar
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv"
              onChange={onImport}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn-primary" onClick={onAddClick}>
            <Plus size={16} /> Nuevo cliente
          </button>
        </div>
      </div>

      <div className="customers-container">
        <div className="customers-list">
          {customers.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>Tu cartera está vacía</p>
              <small>Añade el primer cliente para empezar.</small>
            </div>
          ) : (
            customers.map(customer => (
              <div
                key={customer.id}
                className={`customer-item ${selectedCustomer?.id === customer.id ? 'selected' : ''}`}
                onClick={() => onSelectCustomer(customer)}
              >
                <div className="customer-avatar">{customer.name[0]}</div>
                <div className="customer-info">
                  <p className="customer-name">{customer.name}</p>
                  <p className="customer-company">{customer.company || 'Sin empresa'}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedCustomer && (
          <div className="customer-details">
            <CustomerDetails
              customer={selectedCustomer}
              interactions={interactions}
              interactionData={interactionData}
              setInteractionData={setInteractionData}
              onAddInteraction={onAddInteraction}
              onDelete={onDeleteCustomer}
              agents={agents}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerDetails({
  customer,
  interactions,
  interactionData,
  setInteractionData,
  onAddInteraction,
  onDelete,
  agents
}) {
  return (
    <div className="customer-details-panel">
      <div className="customer-header">
        <div className="customer-avatar-large">{customer.name[0]}</div>
        <div className="customer-header-info">
          <h2>{customer.name}</h2>
          <p>{customer.company || 'Sin empresa'}</p>
        </div>
        <button 
          className="btn-delete"
          onClick={() => onDelete(customer.id)}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="customer-info-grid">
        <div className="info-item">
          <Mail size={16} />
          <div>
            <p className="label">Email</p>
            <p className="value">{customer.email || 'N/A'}</p>
          </div>
        </div>
        <div className="info-item">
          <Phone size={16} />
          <div>
            <p className="label">Teléfono</p>
            <p className="value">{customer.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="interaction-section">
        <h3>Registrar interacción</h3>
        <form onSubmit={onAddInteraction} className="interaction-form">
          <div className="form-row">
            <div className="form-group">
              <label>Tipo</label>
              <select
                value={interactionData.type}
                onChange={(e) => setInteractionData({...interactionData, type: e.target.value})}
              >
                <option value="call">Llamada</option>
                <option value="email">Email</option>
                <option value="visit">Visita</option>
                <option value="meeting">Reunión</option>
                <option value="support">Soporte</option>
              </select>
            </div>
            <div className="form-group">
              <label>Resultado</label>
              <select
                value={interactionData.result}
                onChange={(e) => setInteractionData({...interactionData, result: e.target.value})}
              >
                <option value="completada">Completada</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Calidad (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={interactionData.quality_score}
                onChange={(e) => setInteractionData({...interactionData, quality_score: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Experiencia (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={interactionData.experience_rating}
                onChange={(e) => setInteractionData({...interactionData, experience_rating: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notas</label>
            <textarea
              value={interactionData.notes}
              onChange={(e) => setInteractionData({...interactionData, notes: e.target.value})}
              placeholder="Describe la interacción..."
              rows="4"
            />
          </div>

          <button type="submit" className="btn-primary">Guardar interacción</button>
        </form>
      </div>

      {interactions.length > 0 && (
        <div className="interactions-list">
          <h3>Historial de interacciones</h3>
          {interactions.map((interaction, idx) => (
            <div key={idx} className="interaction-item">
              <div className="interaction-type">{interaction.type}</div>
              <div className="interaction-content">
                <p className="interaction-notes">{interaction.notes}</p>
                <div className="interaction-scores">
                  <span>Calidad: {interaction.quality_score}/10</span>
                  <span>Experiencia: {interaction.experience_rating}/10</span>
                </div>
              </div>
              <div className="interaction-date">
                {new Date(interaction.created_at).toLocaleDateString('es-ES')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentsView({ agents, onAddClick, onDeleteAgent }) {
  return (
    <div className="agents-view">
      <div className="agents-header">
        <h2>Equipo comercial</h2>
        <p>Quién mueve la relación.</p>
        <button className="btn-primary" onClick={onAddClick}>
          <Plus size={16} /> Nuevo agente
        </button>
      </div>

      <div className="agents-grid">
        {agents.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>Sin agentes</p>
          </div>
        ) : (
          agents.map(agent => (
            <div key={agent.id} className="agent-card-full">
              <div className="agent-avatar-full">{agent.name[0]}</div>
              <h3>{agent.name}</h3>
              <p className="agent-username">@{agent.username}</p>
              <button 
                className="btn-delete-small"
                onClick={() => onDeleteAgent(agent.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CustomerForm({ formData, setFormData, onSubmit, onCancel, agents }) {
  return (
    <form onSubmit={onSubmit} className="modal-form">
      <h3>Nuevo cliente</h3>
      <p>Los datos esenciales para que el equipo llegue preparado.</p>

      <div className="form-group">
        <label>Nombre completo *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Nombre del cliente"
          required
        />
      </div>

      <div className="form-group">
        <label>Empresa</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({...formData, company: e.target.value})}
          placeholder="Nombre de la empresa"
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="email@empresa.com"
        />
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="+34 XXX XXX XXX"
        />
      </div>

      <div className="form-group">
        <label>Asignar a agente</label>
        <select
          value={formData.agent_id}
          onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
        >
          <option value="">Sin asignar</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
      </div>

      <div className="form-buttons">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Añadir cliente
        </button>
      </div>
    </form>
  );
}

function AgentForm({ formData, setFormData, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="modal-form">
      <h3>Nuevo agente</h3>
      <p>Crea un acceso para una persona del equipo comercial.</p>

      <div className="form-group">
        <label>Nombre *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Nombre del agente"
          required
        />
      </div>

      <div className="form-group">
        <label>Usuario *</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          placeholder="nombre.usuario"
          required
        />
      </div>

      <div className="form-group">
        <label>Contraseña inicial</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder="Dejar en blanco para usar: agent123"
        />
      </div>

      <div className="form-buttons">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Crear agente
        </button>
      </div>
    </form>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
}
