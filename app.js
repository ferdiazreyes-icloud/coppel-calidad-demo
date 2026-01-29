// ===== STATE MANAGEMENT =====
const state = {
    currentPage: 'login',
    user: null,
    inspections: [],
    providers: [],
    isOnline: navigator.onLine,
    pendingSync: 0,
    capturedPhotos: [], // Photos captured during current inspection form
    lastSyncTime: new Date(),
    syncQueue: [], // Queue of items pending sync
    isSyncing: false,
    // Filters for inspections page
    filters: {
        status: 'all', // all, pending, completed, rejected
        cedis: 'all',
        type: 'all',
        provider: 'all',
        search: ''
    }
};

// ===== MOCK DATA =====
const mockInspections = [
    {
        id: 1,
        sku: 'MUE-2847593',
        productName: 'Sala Modular 3 Piezas - Gris Oxford',
        provider: 'Muebles del Norte SA',
        cedis: 'CEDIS Guadalajara',
        inspector: 'Juan Pérez',
        type: 'Recepción',
        status: 'completed',
        receivedQty: 50,
        sampledQty: 10,
        rejectedQty: 1,
        findingsQty: 2,
        findings: ['Daño en empaque', 'Rayón en superficie'],
        photos: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        synced: true
    },
    {
        id: 2,
        sku: 'MUE-1938472',
        productName: 'Comedor 6 Sillas - Madera Natural',
        provider: 'Carpintería Moderna',
        cedis: 'CEDIS Monterrey',
        inspector: 'Juan Pérez',
        type: 'Recepción',
        status: 'pending',
        receivedQty: 25,
        sampledQty: 5,
        rejectedQty: 0,
        findingsQty: 0,
        findings: [],
        photos: 0,
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        synced: false
    },
    {
        id: 3,
        sku: 'MUE-7462918',
        productName: 'Recámara King Size - Cerezo',
        provider: 'Muebles Premium MX',
        cedis: 'CEDIS CDMX Norte',
        inspector: 'María González',
        type: 'Almacenaje',
        status: 'rejected',
        receivedQty: 30,
        sampledQty: 8,
        rejectedQty: 4,
        findingsQty: 6,
        findings: ['Piezas faltantes', 'Daño estructural', 'Humedad'],
        photos: 8,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        synced: true
    }
];

const mockProviders = [
    {
        id: 1, name: 'Muebles del Norte SA', code: 'PRV-001', score: 92, trend: 'up', inspections: 145, defectRate: 2.1, riskLevel: 'low',
        contact: { name: 'Carlos Mendoza', email: 'cmendoza@mueblesn.com', phone: '+52 33 1234 5678' },
        defectsByCategory: { 'Daño empaque': 12, 'Rayones': 8, 'Piezas faltantes': 3, 'Otros': 2 },
        trendData: [2.5, 2.3, 2.1, 2.4, 2.0, 2.1, 1.9],
        topIssues: ['Empaque insuficiente en esquinas', 'Rayones menores en superficies'],
        responseTime: 2.3
    },
    {
        id: 2, name: 'Carpintería Moderna', code: 'PRV-002', score: 78, trend: 'down', inspections: 89, defectRate: 8.5, riskLevel: 'medium',
        contact: { name: 'Ana García', email: 'agarcia@carpmod.mx', phone: '+52 81 9876 5432' },
        defectsByCategory: { 'Daño estructural': 18, 'Dimensiones': 12, 'Acabados': 15, 'Otros': 8 },
        trendData: [6.2, 7.1, 7.8, 8.0, 8.2, 8.5, 9.1],
        topIssues: ['Variación en dimensiones', 'Acabado irregular en barniz', 'Uniones débiles'],
        responseTime: 4.5
    },
    {
        id: 3, name: 'Muebles Premium MX', code: 'PRV-003', score: 45, trend: 'down', inspections: 67, defectRate: 18.2, riskLevel: 'high',
        contact: { name: 'Roberto Silva', email: 'rsilva@premium.mx', phone: '+52 55 5555 1234' },
        defectsByCategory: { 'Daño estructural': 35, 'Humedad': 22, 'Piezas faltantes': 18, 'Color incorrecto': 15, 'Otros': 12 },
        trendData: [12.5, 14.2, 15.8, 16.5, 17.2, 18.2, 19.5],
        topIssues: ['Problemas graves de humedad', 'Fallas estructurales recurrentes', 'Piezas faltantes en kits', 'Inconsistencia en colores'],
        responseTime: 8.2
    },
    {
        id: 4, name: 'Diseños Hogar SA', code: 'PRV-004', score: 88, trend: 'up', inspections: 203, defectRate: 3.8, riskLevel: 'low',
        contact: { name: 'María López', email: 'mlopez@disenoshogar.com', phone: '+52 33 8765 4321' },
        defectsByCategory: { 'Daño empaque': 15, 'Manchas': 8, 'Manual faltante': 5, 'Otros': 4 },
        trendData: [5.2, 4.8, 4.5, 4.2, 4.0, 3.8, 3.5],
        topIssues: ['Ocasionales manchas de fábrica'],
        responseTime: 1.8
    },
    {
        id: 5, name: 'Fábrica de Muebles MX', code: 'PRV-005', score: 71, trend: 'stable', inspections: 112, defectRate: 9.1, riskLevel: 'medium',
        contact: { name: 'Juan Ramírez', email: 'jramirez@fabmuebles.mx', phone: '+52 81 1111 2222' },
        defectsByCategory: { 'Tornillería': 22, 'Acabados': 18, 'Dimensiones': 12, 'Otros': 8 },
        trendData: [9.0, 9.2, 8.8, 9.1, 9.0, 9.1, 9.2],
        topIssues: ['Tornillería incompleta frecuente', 'Variaciones en acabado'],
        responseTime: 3.5
    }
];

const mockKPIs = {
    inspectionsToday: 24,
    inspectionsChange: 12,
    productsInspected: 847,
    productsChange: 8,
    defectRate: 4.2,
    defectChange: -0.8,
    criticalFindings: 3,
    criticalChange: 1
};

const findingCategories = [
    { name: 'Daño en empaque', severity: 'minor' },
    { name: 'Rayón en superficie', severity: 'minor' },
    { name: 'Pieza faltante', severity: 'major' },
    { name: 'Daño estructural', severity: 'critical' },
    { name: 'Manchas/Suciedad', severity: 'minor' },
    { name: 'Color incorrecto', severity: 'major' },
    { name: 'Dimensiones incorrectas', severity: 'major' },
    { name: 'Humedad/Mojado', severity: 'critical' },
    { name: 'Tornillería incompleta', severity: 'minor' },
    { name: 'Manual faltante', severity: 'minor' }
];

const severityConfig = {
    critical: { label: 'Crítico', color: 'var(--danger)', bg: 'var(--danger-light)', icon: 'alert-octagon' },
    major: { label: 'Mayor', color: 'var(--warning)', bg: 'var(--warning-light)', icon: 'alert-triangle' },
    minor: { label: 'Menor', color: 'var(--primary)', bg: 'rgba(30, 58, 95, 0.1)', icon: 'alert-circle' }
};

const cedisList = [
    'CEDIS Guadalajara',
    'CEDIS Monterrey',
    'CEDIS CDMX Norte',
    'CEDIS CDMX Sur',
    'CEDIS Puebla',
    'CEDIS Tijuana',
    'CEDIS Mérida'
];

const inspectionTypes = [
    'Recepción',
    'Almacenaje',
    'Transferencia',
    'Embarque',
    'Movimiento'
];

// ===== PRODUCT CATALOG (Mock SKU Database) =====
const productCatalog = [
    { sku: 'MUE-2847593', name: 'Sala Modular 3 Piezas - Gris Oxford', provider: 'Muebles del Norte SA', category: 'Salas' },
    { sku: 'MUE-1938472', name: 'Comedor 6 Sillas - Madera Natural', provider: 'Carpintería Moderna', category: 'Comedores' },
    { sku: 'MUE-7462918', name: 'Recámara King Size - Cerezo', provider: 'Muebles Premium MX', category: 'Recámaras' },
    { sku: 'MUE-3847291', name: 'Sofá Cama Individual - Azul Marino', provider: 'Diseños Hogar SA', category: 'Salas' },
    { sku: 'MUE-9182736', name: 'Mesa de Centro Cristal Templado', provider: 'Muebles del Norte SA', category: 'Mesas' },
    { sku: 'MUE-5647382', name: 'Librero 5 Niveles - Nogal', provider: 'Carpintería Moderna', category: 'Estantes' },
    { sku: 'MUE-8273645', name: 'Escritorio Ejecutivo L - Blanco', provider: 'Fábrica de Muebles MX', category: 'Oficina' },
    { sku: 'MUE-4738291', name: 'Cama Matrimonial con Cajones', provider: 'Muebles Premium MX', category: 'Recámaras' },
    { sku: 'MUE-6192837', name: 'Sillón Reclinable - Café', provider: 'Diseños Hogar SA', category: 'Salas' },
    { sku: 'MUE-2938475', name: 'Comoda 6 Cajones - Blanco', provider: 'Fábrica de Muebles MX', category: 'Recámaras' },
    { sku: 'MUE-7364528', name: 'Barra Desayunador 4 Bancos', provider: 'Carpintería Moderna', category: 'Comedores' },
    { sku: 'MUE-1847362', name: 'Ropero 3 Puertas Espejo', provider: 'Muebles del Norte SA', category: 'Recámaras' },
    { sku: 'MUE-5928374', name: 'Esquinero TV 55 Pulgadas', provider: 'Diseños Hogar SA', category: 'Muebles TV' },
    { sku: 'MUE-8475629', name: 'Tocador con Banco - Rosa', provider: 'Muebles Premium MX', category: 'Recámaras' },
    { sku: 'MUE-3746182', name: 'Mesa Lateral Set de 2', provider: 'Fábrica de Muebles MX', category: 'Mesas' },
    { sku: 'MUE-6283947', name: 'Cabecera Capitoneada Queen', provider: 'Muebles del Norte SA', category: 'Recámaras' },
    { sku: 'MUE-9473625', name: 'Silla Comedor Tapizada x4', provider: 'Carpintería Moderna', category: 'Comedores' },
    { sku: 'MUE-2746839', name: 'Vitrina Cristal 2 Puertas', provider: 'Diseños Hogar SA', category: 'Estantes' },
    { sku: 'MUE-8362719', name: 'Litera Individual Madera', provider: 'Muebles Premium MX', category: 'Recámaras' },
    { sku: 'MUE-4628193', name: 'Centro Entretenimiento 180cm', provider: 'Fábrica de Muebles MX', category: 'Muebles TV' }
];

// ===== HELPER FUNCTIONS =====
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    return date.toLocaleDateString('es-MX');
}

function formatDate(date) {
    return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'default') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== RENDER FUNCTIONS =====
function renderApp() {
    const app = document.getElementById('app');

    switch(state.currentPage) {
        case 'login':
            app.innerHTML = renderLoginPage();
            break;
        case 'dashboard':
            app.innerHTML = renderDashboardPage();
            break;
        case 'inspections':
            app.innerHTML = renderInspectionsPage();
            break;
        case 'providers':
            app.innerHTML = renderProvidersPage();
            break;
        case 'profile':
            app.innerHTML = renderProfilePage();
            break;
        default:
            app.innerHTML = renderDashboardPage();
    }

    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    attachEventListeners();
}

function renderNavbar() {
    const syncTimeAgo = getTimeSinceSync();
    return `
        <nav class="navbar">
            <div class="navbar-content">
                <div class="logo">
                    <div class="logo-dots">
                        <span class="logo-dot"></span>
                        <span class="logo-dot"></span>
                        <span class="logo-dot"></span>
                    </div>
                    <span>Coppel</span>
                </div>
                <div class="navbar-actions">
                    <button class="sync-status-btn ${state.isOnline ? '' : 'offline'} ${state.isSyncing ? 'syncing' : ''}" onclick="toggleOfflineMode()">
                        <div class="sync-indicator">
                            ${state.isSyncing ?
                                '<i data-lucide="loader-2" class="sync-spinner" style="width:16px;height:16px;"></i>' :
                                state.isOnline ?
                                    '<i data-lucide="wifi" style="width:16px;height:16px;"></i>' :
                                    '<i data-lucide="wifi-off" style="width:16px;height:16px;"></i>'
                            }
                        </div>
                        <div class="sync-info">
                            <span class="sync-status-text">${state.isSyncing ? 'Sincronizando...' : state.isOnline ? 'En línea' : 'Sin conexión'}</span>
                            <span class="sync-time">${state.isSyncing ? '' : syncTimeAgo}</span>
                        </div>
                        ${state.pendingSync > 0 ? `<span class="sync-badge">${state.pendingSync}</span>` : ''}
                    </button>
                    <button class="navbar-icon" onclick="showNotifications()">
                        <i data-lucide="bell" style="width:20px;height:20px;"></i>
                    </button>
                    <div class="user-avatar">${state.user?.initials || 'JP'}</div>
                </div>
            </div>
        </nav>
    `;
}

function getTimeSinceSync() {
    const now = new Date();
    const diff = now - state.lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Sync: ahora';
    if (minutes < 60) return `Sync: ${minutes}m`;
    return `Sync: ${hours}h`;
}

function toggleOfflineMode() {
    if (state.isSyncing) return;

    state.isOnline = !state.isOnline;

    if (state.isOnline && state.pendingSync > 0) {
        // Simulate sync when going online
        simulateSync();
    } else if (!state.isOnline) {
        showToast('📴 Modo sin conexión activado', 'default');
    }

    renderApp();
}

function simulateSync() {
    if (state.pendingSync === 0 || state.isSyncing) return;

    state.isSyncing = true;
    renderApp();
    showToast('🔄 Sincronizando datos...', 'default');

    // Simulate sync progress
    const totalItems = state.pendingSync;
    let syncedItems = 0;

    const syncInterval = setInterval(() => {
        syncedItems++;

        // Update inspections to synced
        const unsyncedInspection = mockInspections.find(i => !i.synced);
        if (unsyncedInspection) {
            unsyncedInspection.synced = true;
        }

        if (syncedItems >= totalItems) {
            clearInterval(syncInterval);
            state.pendingSync = 0;
            state.isSyncing = false;
            state.lastSyncTime = new Date();
            state.syncQueue = [];
            renderApp();
            showToast('✅ Sincronización completada', 'success');
        }
    }, 800);
}

function manualSync() {
    if (!state.isOnline) {
        showToast('Sin conexión. Los datos se sincronizarán cuando vuelvas a conectarte.', 'error');
        return;
    }

    if (state.pendingSync > 0) {
        simulateSync();
    } else {
        state.lastSyncTime = new Date();
        renderApp();
        showToast('Todo sincronizado', 'success');
    }
}

function renderBottomNav() {
    return `
        <nav class="bottom-nav">
            <button class="bottom-nav-item ${state.currentPage === 'dashboard' ? 'active' : ''}" onclick="navigate('dashboard')">
                <i data-lucide="layout-dashboard" style="width:24px;height:24px;"></i>
                <span>Inicio</span>
            </button>
            <button class="bottom-nav-item ${state.currentPage === 'inspections' ? 'active' : ''}" onclick="navigate('inspections')">
                <i data-lucide="clipboard-check" style="width:24px;height:24px;"></i>
                <span>Inspecciones</span>
            </button>
            <button class="bottom-nav-item ${state.currentPage === 'providers' ? 'active' : ''}" onclick="navigate('providers')">
                <i data-lucide="truck" style="width:24px;height:24px;"></i>
                <span>Proveedores</span>
            </button>
            <button class="bottom-nav-item ${state.currentPage === 'profile' ? 'active' : ''}" onclick="navigate('profile')">
                <i data-lucide="user" style="width:24px;height:24px;"></i>
                <span>Perfil</span>
            </button>
        </nav>
    `;
}

function renderLoginPage() {
    return `
        <div class="login-page">
            <div class="login-header">
                <div class="login-logo">
                    <div class="logo-dots">
                        <span class="logo-dot"></span>
                        <span class="logo-dot"></span>
                        <span class="logo-dot"></span>
                    </div>
                    <span>Coppel</span>
                </div>
                <p class="login-subtitle">Sistema de Inspección de Calidad</p>
            </div>
            <div class="login-content">
                <div class="login-card">
                    <h1 class="login-title">Iniciar Sesión</h1>
                    <form onsubmit="handleLogin(event)">
                        <div class="form-group">
                            <label class="form-label required">Correo electrónico</label>
                            <input type="email" class="form-input" placeholder="tu.correo@coppel.com" value="inspector@coppel.com" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Contraseña</label>
                            <input type="password" class="form-input" placeholder="••••••••" value="demo123" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">CEDIS</label>
                            <select class="form-select">
                                ${cedisList.map(c => `<option>${c}</option>`).join('')}
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block btn-lg mt-4">
                            Ingresar
                            <i data-lucide="arrow-right" style="width:20px;height:20px;"></i>
                        </button>
                    </form>
                    <p class="text-center text-gray-500 text-sm mt-4">
                        ¿Problemas para ingresar? Contacta a soporte
                    </p>
                </div>
            </div>
        </div>
    `;
}

function renderDashboardPage() {
    return `
        ${renderNavbar()}
        <main class="page">
            <div class="page-header">
                <h1 class="page-title">Buenos días, ${state.user?.name || 'Inspector'}</h1>
                <p class="page-subtitle">${new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-icon blue">
                        <i data-lucide="clipboard-check" style="width:20px;height:20px;"></i>
                    </div>
                    <div class="kpi-value">${mockKPIs.inspectionsToday}</div>
                    <div class="kpi-label">Inspecciones hoy</div>
                    <div class="kpi-change up">
                        <i data-lucide="trending-up" style="width:14px;height:14px;"></i>
                        +${mockKPIs.inspectionsChange}% vs ayer
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon green">
                        <i data-lucide="package-check" style="width:20px;height:20px;"></i>
                    </div>
                    <div class="kpi-value">${mockKPIs.productsInspected}</div>
                    <div class="kpi-label">Productos revisados</div>
                    <div class="kpi-change up">
                        <i data-lucide="trending-up" style="width:14px;height:14px;"></i>
                        +${mockKPIs.productsChange}%
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon yellow">
                        <i data-lucide="percent" style="width:20px;height:20px;"></i>
                    </div>
                    <div class="kpi-value">${mockKPIs.defectRate}%</div>
                    <div class="kpi-label">Tasa de defectos</div>
                    <div class="kpi-change up">
                        <i data-lucide="trending-down" style="width:14px;height:14px;"></i>
                        ${mockKPIs.defectChange}%
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon red">
                        <i data-lucide="alert-triangle" style="width:20px;height:20px;"></i>
                    </div>
                    <div class="kpi-value">${mockKPIs.criticalFindings}</div>
                    <div class="kpi-label">Hallazgos críticos</div>
                    <div class="kpi-change down">
                        <i data-lucide="trending-up" style="width:14px;height:14px;"></i>
                        +${mockKPIs.criticalChange}
                    </div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-header">
                    <i data-lucide="bar-chart-3" style="width:18px;height:18px;"></i>
                    Inspecciones últimos 7 días
                </div>
                <div class="chart-container">
                    ${renderBarChart([18, 24, 21, 28, 19, 24, 22], ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'])}
                </div>
            </div>

            <div class="card">
                <div class="card-header" style="justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="clock" style="width:18px;height:18px;"></i>
                        Inspecciones recientes
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="navigate('inspections')">Ver todas</button>
                </div>
                <div class="card-body" style="padding: 0.75rem;">
                    <div class="inspection-list">
                        ${mockInspections.slice(0, 3).map(renderInspectionItem).join('')}
                    </div>
                </div>
            </div>
        </main>
        ${renderBottomNav()}
        <button class="fab" onclick="openNewInspection()">
            <i data-lucide="plus" style="width:24px;height:24px;"></i>
        </button>
    `;
}

function renderBarChart(values, labels) {
    const max = Math.max(...values);
    return values.map((v, i) => `
        <div class="chart-bar" style="height: ${(v / max) * 100}%">
            <span class="chart-bar-label">${labels[i]}</span>
        </div>
    `).join('');
}

function renderInspectionItem(inspection) {
    const statusClass = inspection.status === 'completed' ? 'completed' :
                       inspection.status === 'rejected' ? 'rejected' : 'pending';
    const badgeClass = inspection.status === 'completed' ? 'badge-success' :
                      inspection.status === 'rejected' ? 'badge-danger' : 'badge-warning';
    const statusText = inspection.status === 'completed' ? 'Completada' :
                      inspection.status === 'rejected' ? 'Rechazada' : 'Pendiente';

    return `
        <div class="inspection-item" onclick="viewInspection(${inspection.id})">
            <div class="inspection-status ${statusClass}"></div>
            <div class="inspection-content">
                <div class="inspection-header">
                    <span class="inspection-sku">${inspection.sku}</span>
                    <span class="inspection-time">${formatTime(inspection.timestamp)}</span>
                </div>
                <div class="inspection-details">${inspection.productName}</div>
                <div class="inspection-meta">
                    <span>${inspection.cedis}</span>
                    <span>•</span>
                    <span>${inspection.type}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                    <span class="inspection-badge ${badgeClass}">${statusText}</span>
                    <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; color: var(--gray-500);">
                        ${inspection.findingsQty > 0 ? `
                            <span style="display: flex; align-items: center; gap: 0.25rem;">
                                <i data-lucide="alert-circle" style="width:14px;height:14px;color:var(--warning);"></i>
                                ${inspection.findingsQty} hallazgos
                            </span>
                        ` : ''}
                        ${inspection.photos > 0 ? `
                            <span style="display: flex; align-items: center; gap: 0.25rem;">
                                <i data-lucide="camera" style="width:14px;height:14px;"></i>
                                ${inspection.photos}
                            </span>
                        ` : ''}
                        ${!inspection.synced ? `
                            <span style="display: flex; align-items: center; gap: 0.25rem; color: var(--warning);">
                                <i data-lucide="cloud-off" style="width:14px;height:14px;"></i>
                                Sin sync
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderInspectionsPage() {
    const filteredInspections = getFilteredInspections();
    const uniqueProviders = [...new Set(mockInspections.map(i => i.provider))];

    return `
        ${renderNavbar()}
        <main class="page">
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1 class="page-title">Inspecciones</h1>
                    <p class="page-subtitle">${filteredInspections.length} de ${mockInspections.length} inspecciones</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="openNewInspection()">
                    <i data-lucide="plus" style="width:18px;height:18px;"></i>
                    Nueva
                </button>
            </div>

            <!-- Search Bar -->
            <div class="search-bar">
                <i data-lucide="search" style="width:18px;height:18px;color:var(--gray-400);"></i>
                <input type="text" class="search-input" placeholder="Buscar por SKU, producto..." value="${state.filters.search}" oninput="updateFilter('search', this.value)">
                ${state.filters.search ? `<button class="search-clear" onclick="updateFilter('search', '')"><i data-lucide="x" style="width:16px;height:16px;"></i></button>` : ''}
            </div>

            <!-- Status Tabs -->
            <div class="tabs">
                <button class="tab ${state.filters.status === 'all' ? 'active' : ''}" onclick="updateFilter('status', 'all')">
                    Todas <span class="tab-count">${mockInspections.length}</span>
                </button>
                <button class="tab ${state.filters.status === 'pending' ? 'active' : ''}" onclick="updateFilter('status', 'pending')">
                    Pendientes <span class="tab-count">${mockInspections.filter(i => i.status === 'pending').length}</span>
                </button>
                <button class="tab ${state.filters.status === 'completed' ? 'active' : ''}" onclick="updateFilter('status', 'completed')">
                    Completadas <span class="tab-count">${mockInspections.filter(i => i.status === 'completed').length}</span>
                </button>
                <button class="tab ${state.filters.status === 'rejected' ? 'active' : ''}" onclick="updateFilter('status', 'rejected')">
                    Rechazadas <span class="tab-count">${mockInspections.filter(i => i.status === 'rejected').length}</span>
                </button>
            </div>

            <!-- Filter Dropdowns -->
            <div class="filter-row">
                <div class="filter-item">
                    <select class="filter-select" onchange="updateFilter('cedis', this.value)">
                        <option value="all" ${state.filters.cedis === 'all' ? 'selected' : ''}>Todos los CEDIS</option>
                        ${cedisList.map(c => `<option value="${c}" ${state.filters.cedis === c ? 'selected' : ''}>${c.replace('CEDIS ', '')}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-item">
                    <select class="filter-select" onchange="updateFilter('type', this.value)">
                        <option value="all" ${state.filters.type === 'all' ? 'selected' : ''}>Todos los tipos</option>
                        ${inspectionTypes.map(t => `<option value="${t}" ${state.filters.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-item">
                    <select class="filter-select" onchange="updateFilter('provider', this.value)">
                        <option value="all" ${state.filters.provider === 'all' ? 'selected' : ''}>Todos los proveedores</option>
                        ${uniqueProviders.map(p => `<option value="${p}" ${state.filters.provider === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>
            </div>

            <!-- Active Filters -->
            ${hasActiveFilters() ? `
            <div class="active-filters">
                <span class="active-filters-label">Filtros activos:</span>
                ${state.filters.status !== 'all' ? `<span class="filter-chip" onclick="updateFilter('status', 'all')">${state.filters.status === 'pending' ? 'Pendientes' : state.filters.status === 'completed' ? 'Completadas' : 'Rechazadas'} <i data-lucide="x" style="width:12px;height:12px;"></i></span>` : ''}
                ${state.filters.cedis !== 'all' ? `<span class="filter-chip" onclick="updateFilter('cedis', 'all')">${state.filters.cedis.replace('CEDIS ', '')} <i data-lucide="x" style="width:12px;height:12px;"></i></span>` : ''}
                ${state.filters.type !== 'all' ? `<span class="filter-chip" onclick="updateFilter('type', 'all')">${state.filters.type} <i data-lucide="x" style="width:12px;height:12px;"></i></span>` : ''}
                ${state.filters.provider !== 'all' ? `<span class="filter-chip" onclick="updateFilter('provider', 'all')">${state.filters.provider} <i data-lucide="x" style="width:12px;height:12px;"></i></span>` : ''}
                ${state.filters.search ? `<span class="filter-chip" onclick="updateFilter('search', '')">"${state.filters.search}" <i data-lucide="x" style="width:12px;height:12px;"></i></span>` : ''}
                <button class="clear-all-filters" onclick="clearAllFilters()">Limpiar todos</button>
            </div>
            ` : ''}

            <!-- Results -->
            ${filteredInspections.length > 0 ? `
                <div class="inspection-list">
                    ${filteredInspections.map(renderInspectionItem).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <i data-lucide="search-x" style="width:48px;height:48px;color:var(--gray-300);"></i>
                    <h3>No se encontraron inspecciones</h3>
                    <p>Intenta ajustar los filtros o realizar una nueva búsqueda</p>
                    <button class="btn btn-secondary" onclick="clearAllFilters()">Limpiar filtros</button>
                </div>
            `}
        </main>
        ${renderBottomNav()}
        <button class="fab" onclick="openNewInspection()">
            <i data-lucide="plus" style="width:24px;height:24px;"></i>
        </button>
    `;
}

function getFilteredInspections() {
    return mockInspections.filter(inspection => {
        // Status filter
        if (state.filters.status !== 'all' && inspection.status !== state.filters.status) {
            return false;
        }
        // CEDIS filter
        if (state.filters.cedis !== 'all' && inspection.cedis !== state.filters.cedis) {
            return false;
        }
        // Type filter
        if (state.filters.type !== 'all' && inspection.type !== state.filters.type) {
            return false;
        }
        // Provider filter
        if (state.filters.provider !== 'all' && inspection.provider !== state.filters.provider) {
            return false;
        }
        // Search filter
        if (state.filters.search) {
            const search = state.filters.search.toLowerCase();
            const matchesSku = inspection.sku.toLowerCase().includes(search);
            const matchesProduct = inspection.productName.toLowerCase().includes(search);
            const matchesProvider = inspection.provider.toLowerCase().includes(search);
            if (!matchesSku && !matchesProduct && !matchesProvider) {
                return false;
            }
        }
        return true;
    });
}

function updateFilter(filterKey, value) {
    state.filters[filterKey] = value;
    renderApp();
}

function hasActiveFilters() {
    return state.filters.status !== 'all' ||
           state.filters.cedis !== 'all' ||
           state.filters.type !== 'all' ||
           state.filters.provider !== 'all' ||
           state.filters.search !== '';
}

function clearAllFilters() {
    state.filters = {
        status: 'all',
        cedis: 'all',
        type: 'all',
        provider: 'all',
        search: ''
    };
    renderApp();
}

function renderProvidersPage() {
    return `
        ${renderNavbar()}
        <main class="page">
            <div class="page-header">
                <h1 class="page-title">Proveedores</h1>
                <p class="page-subtitle">Desempeño y cumplimiento</p>
            </div>

            <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.5rem;">
                <div class="kpi-card">
                    <div class="kpi-value" style="color: var(--success);">3</div>
                    <div class="kpi-label">Riesgo Bajo</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value" style="color: var(--warning);">2</div>
                    <div class="kpi-label">Riesgo Medio</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value" style="color: var(--danger);">1</div>
                    <div class="kpi-label">Riesgo Alto</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <i data-lucide="list" style="width:18px;height:18px;"></i>
                    Lista de Proveedores
                </div>
                <div class="provider-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Proveedor</th>
                                <th>Puntaje</th>
                                <th>Defectos</th>
                                <th>Riesgo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mockProviders.map(p => `
                                <tr onclick="viewProvider(${p.id})">
                                    <td>
                                        <div class="provider-name">${p.name}</div>
                                        <div class="text-xs text-gray-500">${p.code} • ${p.inspections} inspecciones</div>
                                    </td>
                                    <td>
                                        <span class="provider-score" style="color: ${p.score >= 80 ? 'var(--success)' : p.score >= 60 ? 'var(--warning)' : 'var(--danger)'}">
                                            ${p.score}
                                            ${p.trend === 'up' ? '<i data-lucide="trending-up" style="width:14px;height:14px;"></i>' :
                                              p.trend === 'down' ? '<i data-lucide="trending-down" style="width:14px;height:14px;"></i>' : ''}
                                        </span>
                                    </td>
                                    <td>${p.defectRate}%</td>
                                    <td>
                                        <span class="risk-badge risk-${p.riskLevel}">
                                            ${p.riskLevel === 'low' ? 'BAJO' : p.riskLevel === 'medium' ? 'MEDIO' : 'ALTO'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
        ${renderBottomNav()}
    `;
}

function renderProfilePage() {
    return `
        ${renderNavbar()}
        <main class="page">
            <div class="card mb-4">
                <div class="card-body" style="text-align: center; padding: 2rem;">
                    <div class="user-avatar" style="width: 80px; height: 80px; font-size: 2rem; margin: 0 auto 1rem;">
                        ${state.user?.initials || 'JP'}
                    </div>
                    <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.25rem;">
                        ${state.user?.name || 'Juan Pérez'}
                    </h2>
                    <p class="text-gray-500">${state.user?.role || 'Inspector de Calidad'}</p>
                    <p class="text-sm text-gray-400 mt-2">${state.user?.cedis || 'CEDIS Guadalajara'}</p>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-header">
                    <i data-lucide="bar-chart-2" style="width:18px;height:18px;"></i>
                    Mi Desempeño (Este mes)
                </div>
                <div class="card-body">
                    <div class="kpi-grid" style="grid-template-columns: repeat(2, 1fr);">
                        <div class="kpi-card">
                            <div class="kpi-value">156</div>
                            <div class="kpi-label">Inspecciones</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-value">98.2%</div>
                            <div class="kpi-label">Precisión</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-body" style="padding: 0;">
                    <button class="btn btn-secondary btn-block" style="justify-content: flex-start; border-radius: 0; padding: 1rem 1.25rem; border-bottom: 1px solid var(--gray-200);">
                        <i data-lucide="settings" style="width:20px;height:20px;"></i>
                        Configuración
                    </button>
                    <button class="btn btn-secondary btn-block" style="justify-content: flex-start; border-radius: 0; padding: 1rem 1.25rem; border-bottom: 1px solid var(--gray-200);">
                        <i data-lucide="help-circle" style="width:20px;height:20px;"></i>
                        Ayuda
                    </button>
                    <button class="btn btn-secondary btn-block" style="justify-content: flex-start; border-radius: 0; padding: 1rem 1.25rem; color: var(--danger);" onclick="handleLogout()">
                        <i data-lucide="log-out" style="width:20px;height:20px;"></i>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </main>
        ${renderBottomNav()}
    `;
}

function renderInspectionModal() {
    return `
        <div class="modal-overlay" id="inspectionModal">
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">Nueva Inspección</h2>
                    <button class="modal-close" onclick="closeModal()">
                        <i data-lucide="x" style="width:18px;height:18px;"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="inspectionForm">
                        <div class="form-group">
                            <label class="form-label required">Tipo de Inspección</label>
                            <select class="form-select" name="type" required>
                                ${inspectionTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label required">CEDIS</label>
                            <select class="form-select" name="cedis" required>
                                ${cedisList.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label required">SKU / Código de Producto</label>
                            <div class="autocomplete-container">
                                <div class="sku-input-wrapper">
                                    <i data-lucide="search" class="sku-search-icon"></i>
                                    <input type="text" class="form-input sku-input-field" name="sku" id="skuInput" placeholder="Buscar SKU o nombre de producto..." autocomplete="off" required
                                        oninput="handleSkuInput(this.value)"
                                        onfocus="showSkuDropdown()"
                                        onclick="showSkuDropdown()">
                                    <button type="button" class="sku-clear-btn" id="skuClearBtn" onclick="clearSkuInput()" style="display: none;">
                                        <i data-lucide="x" style="width:16px;height:16px;"></i>
                                    </button>
                                    <i data-lucide="chevron-down" class="sku-dropdown-icon" id="skuDropdownIcon" onclick="toggleSkuDropdown()"></i>
                                </div>
                                <div class="autocomplete-dropdown" id="skuDropdown">
                                    <div class="autocomplete-header">
                                        <span class="autocomplete-title">Catálogo de productos</span>
                                        <span class="autocomplete-count" id="skuResultCount">${productCatalog.length} productos</span>
                                    </div>
                                    <div class="autocomplete-list" id="skuList"></div>
                                </div>
                            </div>
                            <p class="form-hint" id="skuHint">
                                <i data-lucide="info" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>
                                Selecciona un producto del catálogo
                            </p>
                        </div>

                        <div class="form-group" id="productNameGroup">
                            <label class="form-label">Nombre del Producto</label>
                            <input type="text" class="form-input" name="productName" id="productNameInput" placeholder="Se completa automáticamente al seleccionar SKU" readonly>
                        </div>

                        <div class="form-group" id="providerInfo" style="display: none;">
                            <div class="product-info-card">
                                <div class="product-info-header">
                                    <i data-lucide="package-check" style="width:16px;height:16px;color:var(--success);"></i>
                                    <span>Producto encontrado en catálogo</span>
                                </div>
                                <div class="product-info-details">
                                    <div><strong>Proveedor:</strong> <span id="productProvider">-</span></div>
                                    <div><strong>Categoría:</strong> <span id="productCategory">-</span></div>
                                </div>
                            </div>
                        </div>

                        <div class="quantity-row">
                            <div class="form-group">
                                <label class="form-label required">Recibidos</label>
                                <div class="quantity-input">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('received', -1)">−</button>
                                    <input type="number" class="quantity-value" name="receivedQty" value="0" min="0" inputmode="numeric">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('received', 1)">+</button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">Muestreados</label>
                                <div class="quantity-input">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('sampled', -1)">−</button>
                                    <input type="number" class="quantity-value" name="sampledQty" value="0" min="0" inputmode="numeric">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('sampled', 1)">+</button>
                                </div>
                            </div>
                        </div>

                        <div class="quantity-row">
                            <div class="form-group">
                                <label class="form-label">Rechazados</label>
                                <div class="quantity-input">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('rejected', -1)">−</button>
                                    <input type="number" class="quantity-value" name="rejectedQty" value="0" min="0" inputmode="numeric">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('rejected', 1)">+</button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Con Hallazgos</label>
                                <div class="quantity-input">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('findings', -1)">−</button>
                                    <input type="number" class="quantity-value" name="findingsQty" value="0" min="0" inputmode="numeric">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('findings', 1)">+</button>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Hallazgos</label>
                            <div class="severity-legend">
                                <span class="severity-tag critical"><i data-lucide="alert-octagon" style="width:10px;height:10px;"></i> Crítico</span>
                                <span class="severity-tag major"><i data-lucide="alert-triangle" style="width:10px;height:10px;"></i> Mayor</span>
                                <span class="severity-tag minor"><i data-lucide="alert-circle" style="width:10px;height:10px;"></i> Menor</span>
                            </div>
                            <div class="checkbox-group">
                                ${findingCategories.map(f => `
                                    <label class="checkbox-item severity-${f.severity}" data-severity="${f.severity}">
                                        <input type="checkbox" name="findings" value="${f.name}">
                                        <span class="severity-indicator ${f.severity}"></span>
                                        ${f.name}
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Evidencia Fotográfica</label>
                            <div class="photo-grid" id="photoGrid">
                                ${renderPhotoGrid()}
                            </div>
                            <p class="form-hint" id="photoHint">Mínimo 3 fotos si hay hallazgos</p>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Comentarios</label>
                            <textarea class="form-textarea" name="comments" placeholder="Observaciones adicionales..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" style="flex: 1;" onclick="saveDraft()">
                        <i data-lucide="save" style="width:18px;height:18px;"></i>
                        Guardar Borrador
                    </button>
                    <button class="btn btn-primary" style="flex: 1;" onclick="submitInspection()">
                        <i data-lucide="send" style="width:18px;height:18px;"></i>
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===== EVENT HANDLERS =====
function handleLogin(event) {
    event.preventDefault();
    state.user = {
        name: 'Juan Pérez',
        initials: 'JP',
        email: 'inspector@coppel.com',
        role: 'Inspector de Calidad',
        cedis: 'CEDIS Guadalajara'
    };
    state.currentPage = 'dashboard';
    state.inspections = [...mockInspections];
    state.providers = [...mockProviders];
    renderApp();
    showToast('Bienvenido, Juan', 'success');
}

function handleLogout() {
    state.user = null;
    state.currentPage = 'login';
    renderApp();
    showToast('Sesión cerrada');
}

function navigate(page) {
    state.currentPage = page;
    renderApp();
}

function openNewInspection() {
    // Reset captured photos for new inspection
    state.capturedPhotos = [];

    const modal = document.getElementById('inspectionModal');
    if (!modal) {
        document.body.insertAdjacentHTML('beforeend', renderInspectionModal());
        if (window.lucide) lucide.createIcons();
    }
    setTimeout(() => {
        document.getElementById('inspectionModal').classList.add('active');
    }, 10);

    // Add checkbox toggle functionality
    document.querySelectorAll('.checkbox-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') {
                const checkbox = this.querySelector('input');
                checkbox.checked = !checkbox.checked;
                this.classList.toggle('selected', checkbox.checked);
            }
        });
    });
}

function closeModal() {
    const modal = document.getElementById('inspectionModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
    // Clear captured photos when closing
    state.capturedPhotos = [];
}

function adjustQty(field, delta) {
    const fieldMap = {
        'received': 'receivedQty',
        'sampled': 'sampledQty',
        'rejected': 'rejectedQty',
        'findings': 'findingsQty'
    };
    const input = document.querySelector(`[name="${fieldMap[field]}"]`);
    if (input) {
        const newValue = Math.max(0, parseInt(input.value || 0) + delta);
        input.value = newValue;
    }
}

// ===== SKU AUTOCOMPLETE =====
let skuDropdownOpen = false;

function showSkuDropdown() {
    const dropdown = document.getElementById('skuDropdown');
    const input = document.getElementById('skuInput');
    const icon = document.getElementById('skuDropdownIcon');

    if (!dropdown) return;

    skuDropdownOpen = true;
    dropdown.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';

    // Render all products or filtered
    renderSkuList(input.value || '');
}

function hideSkuDropdown() {
    const dropdown = document.getElementById('skuDropdown');
    const icon = document.getElementById('skuDropdownIcon');

    if (!dropdown) return;

    skuDropdownOpen = false;
    dropdown.style.display = 'none';
    if (icon) icon.style.transform = '';
}

function toggleSkuDropdown() {
    if (skuDropdownOpen) {
        hideSkuDropdown();
    } else {
        showSkuDropdown();
        document.getElementById('skuInput').focus();
    }
}

function handleSkuInput(value) {
    const dropdown = document.getElementById('skuDropdown');
    const clearBtn = document.getElementById('skuClearBtn');

    // Show/hide clear button
    if (clearBtn) {
        clearBtn.style.display = value ? 'flex' : 'none';
    }

    // Show dropdown and render filtered list
    if (!skuDropdownOpen) {
        showSkuDropdown();
    } else {
        renderSkuList(value);
    }

    // Clear product info when typing
    if (value !== document.getElementById('skuInput').dataset.selectedSku) {
        clearProductInfo();
    }
}

function renderSkuList(searchValue) {
    const list = document.getElementById('skuList');
    const countEl = document.getElementById('skuResultCount');
    const hint = document.getElementById('skuHint');

    if (!list) return;

    const searchTerm = (searchValue || '').toUpperCase().trim();

    let matches;
    if (!searchTerm) {
        // Show all products grouped by category
        matches = [...productCatalog];
    } else {
        // Filter by search term
        matches = productCatalog.filter(p =>
            p.sku.toUpperCase().includes(searchTerm) ||
            p.name.toUpperCase().includes(searchTerm) ||
            p.provider.toUpperCase().includes(searchTerm) ||
            p.category.toUpperCase().includes(searchTerm)
        );
    }

    // Update count
    if (countEl) {
        countEl.textContent = searchTerm
            ? `${matches.length} de ${productCatalog.length}`
            : `${productCatalog.length} productos`;
    }

    // Update hint
    if (hint) {
        if (searchTerm && matches.length === 0) {
            hint.innerHTML = '<i data-lucide="alert-circle" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;color:var(--warning);"></i>No encontrado - puedes ingresar SKU manualmente';
            hint.style.color = 'var(--warning)';
        } else if (searchTerm) {
            hint.innerHTML = `<i data-lucide="filter" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>${matches.length} producto${matches.length !== 1 ? 's' : ''} coincide${matches.length !== 1 ? 'n' : ''}`;
            hint.style.color = 'var(--primary)';
        } else {
            hint.innerHTML = '<i data-lucide="info" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>Selecciona un producto del catálogo';
            hint.style.color = '';
        }
        if (window.lucide) lucide.createIcons();
    }

    if (matches.length === 0) {
        list.innerHTML = `
            <div class="autocomplete-empty">
                <i data-lucide="package-x" style="width:32px;height:32px;"></i>
                <p>No se encontraron productos</p>
                <span>Intenta con otro término o ingresa el SKU manualmente</span>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    // Group by category for better organization
    const categories = {};
    matches.forEach(p => {
        if (!categories[p.category]) {
            categories[p.category] = [];
        }
        categories[p.category].push(p);
    });

    let html = '';
    Object.keys(categories).sort().forEach(category => {
        html += `<div class="autocomplete-category-header">${category}</div>`;
        categories[category].forEach(p => {
            html += `
                <div class="autocomplete-item" data-sku="${p.sku}">
                    <div class="autocomplete-item-icon">
                        <i data-lucide="package" style="width:20px;height:20px;"></i>
                    </div>
                    <div class="autocomplete-item-content">
                        <div class="autocomplete-item-main">
                            <span class="autocomplete-sku">${searchTerm ? highlightMatch(p.sku, searchTerm) : p.sku}</span>
                            <span class="autocomplete-name">${searchTerm ? highlightMatch(p.name, searchTerm) : p.name}</span>
                        </div>
                        <div class="autocomplete-item-meta">
                            <span class="autocomplete-provider">${searchTerm ? highlightMatch(p.provider, searchTerm) : p.provider}</span>
                        </div>
                    </div>
                    <i data-lucide="chevron-right" class="autocomplete-item-arrow"></i>
                </div>
            `;
        });
    });

    list.innerHTML = html;

    // Add click handlers using event delegation
    list.querySelectorAll('.autocomplete-item[data-sku]').forEach(item => {
        item.addEventListener('mousedown', function(e) {
            e.preventDefault(); // Prevent input blur
            const sku = this.dataset.sku;
            if (sku) selectProduct(sku);
        });
    });

    if (window.lucide) lucide.createIcons();
}

function highlightMatch(text, term) {
    if (!term) return text;
    const index = text.toUpperCase().indexOf(term);
    if (index === -1) return text;
    return text.substring(0, index) +
           '<mark>' + text.substring(index, index + term.length) + '</mark>' +
           text.substring(index + term.length);
}

function selectProduct(sku) {
    const product = productCatalog.find(p => p.sku === sku);
    if (!product) {
        console.error('Product not found:', sku);
        return;
    }

    console.log('Selecting product:', product);

    const skuInput = document.getElementById('skuInput');
    if (skuInput) {
        skuInput.value = product.sku;
        skuInput.dataset.selectedSku = product.sku;
    }

    // Set product name and add selected style
    const productNameInput = document.getElementById('productNameInput');
    if (productNameInput) {
        productNameInput.value = product.name;
        productNameInput.classList.add('product-name-selected');
    }

    hideSkuDropdown();

    // Show product info card
    const providerInfo = document.getElementById('providerInfo');
    const productProvider = document.getElementById('productProvider');
    const productCategory = document.getElementById('productCategory');

    if (providerInfo) providerInfo.style.display = 'block';
    if (productProvider) productProvider.textContent = product.provider;
    if (productCategory) productCategory.textContent = product.category;

    // Update hint
    const hint = document.getElementById('skuHint');
    if (hint) {
        hint.innerHTML = '<i data-lucide="check-circle" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;color:var(--success);"></i>Producto seleccionado correctamente';
        hint.style.color = 'var(--success)';
    }

    // Show clear button
    const clearBtn = document.getElementById('skuClearBtn');
    if (clearBtn) clearBtn.style.display = 'flex';

    if (window.lucide) lucide.createIcons();
}

function clearSkuInput() {
    const skuInput = document.getElementById('skuInput');
    skuInput.value = '';
    delete skuInput.dataset.selectedSku;

    document.getElementById('skuClearBtn').style.display = 'none';
    clearProductInfo();

    // Reset hint
    const hint = document.getElementById('skuHint');
    hint.innerHTML = '<i data-lucide="info" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>Selecciona un producto del catálogo';
    hint.style.color = '';

    skuInput.focus();
    showSkuDropdown();

    if (window.lucide) lucide.createIcons();
}

function clearProductInfo() {
    const productNameInput = document.getElementById('productNameInput');
    if (productNameInput) {
        productNameInput.value = '';
        productNameInput.classList.remove('product-name-selected');
    }

    const providerInfo = document.getElementById('providerInfo');
    if (providerInfo) providerInfo.style.display = 'none';
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('skuDropdown');
    const container = document.querySelector('.autocomplete-container');
    if (dropdown && container && !container.contains(e.target)) {
        hideSkuDropdown();
    }
});

// ===== PHOTO CAPTURE SIMULATION =====
function renderPhotoGrid() {
    const photos = state.capturedPhotos.map((photo, index) => `
        <div class="photo-item photo-captured" style="position: relative;">
            <img src="${photo.url}" alt="Foto ${index + 1}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--border-radius);">
            <button type="button" class="photo-delete-btn" onclick="deletePhoto(${index})" title="Eliminar foto">
                <i data-lucide="x" style="width:14px;height:14px;"></i>
            </button>
            <div class="photo-number">${index + 1}</div>
        </div>
    `).join('');

    const addButton = state.capturedPhotos.length < 10 ? `
        <div class="photo-item photo-add" onclick="capturePhoto()">
            <i data-lucide="camera" style="width:24px;height:24px;"></i>
            <span>Agregar</span>
        </div>
    ` : '';

    return photos + addButton;
}

function updatePhotoGrid() {
    const photoGrid = document.getElementById('photoGrid');
    const photoHint = document.getElementById('photoHint');

    if (photoGrid) {
        photoGrid.innerHTML = renderPhotoGrid();
        if (window.lucide) lucide.createIcons();
    }

    if (photoHint) {
        const count = state.capturedPhotos.length;
        if (count === 0) {
            photoHint.innerHTML = 'Mínimo 3 fotos si hay hallazgos';
            photoHint.style.color = '';
        } else if (count < 3) {
            photoHint.innerHTML = `<i data-lucide="alert-circle" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>${count} foto${count > 1 ? 's' : ''} - Faltan ${3 - count} para completar el mínimo`;
            photoHint.style.color = 'var(--warning)';
        } else {
            photoHint.innerHTML = `<i data-lucide="check-circle" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>${count} foto${count > 1 ? 's' : ''} capturada${count > 1 ? 's' : ''}`;
            photoHint.style.color = 'var(--success)';
        }
        if (window.lucide) lucide.createIcons();
    }
}

function capturePhoto() {
    if (state.capturedPhotos.length >= 10) {
        showToast('Máximo 10 fotos por inspección', 'error');
        return;
    }

    // Show camera simulation modal
    showCameraModal();
}

function showCameraModal() {
    const existingModal = document.getElementById('cameraModal');
    if (existingModal) existingModal.remove();

    const cameraModalHTML = `
        <div class="modal-overlay active" id="cameraModal" style="z-index: 1100;">
            <div class="modal" style="max-width: 400px;">
                <div class="modal-header" style="background: #000; color: white;">
                    <h2 class="modal-title" style="color: white;">
                        <i data-lucide="camera" style="width:20px;height:20px;display:inline;vertical-align:middle;margin-right:8px;"></i>
                        Cámara
                    </h2>
                    <button class="modal-close" onclick="closeCameraModal()" style="background: rgba(255,255,255,0.2); color: white;">
                        <i data-lucide="x" style="width:18px;height:18px;"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 0; background: #1a1a1a;">
                    <!-- Camera viewfinder simulation -->
                    <div id="cameraViewfinder" style="aspect-ratio: 4/3; background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                        <!-- Scanning animation -->
                        <div class="camera-scan-line"></div>

                        <!-- Center focus indicator -->
                        <div style="width: 80px; height: 80px; border: 2px solid rgba(255,255,255,0.5); border-radius: 8px; position: relative;">
                            <div style="position: absolute; top: -2px; left: -2px; width: 20px; height: 20px; border-top: 3px solid var(--accent); border-left: 3px solid var(--accent);"></div>
                            <div style="position: absolute; top: -2px; right: -2px; width: 20px; height: 20px; border-top: 3px solid var(--accent); border-right: 3px solid var(--accent);"></div>
                            <div style="position: absolute; bottom: -2px; left: -2px; width: 20px; height: 20px; border-bottom: 3px solid var(--accent); border-left: 3px solid var(--accent);"></div>
                            <div style="position: absolute; bottom: -2px; right: -2px; width: 20px; height: 20px; border-bottom: 3px solid var(--accent); border-right: 3px solid var(--accent);"></div>
                        </div>

                        <!-- Camera info overlay -->
                        <div style="position: absolute; top: 12px; left: 12px; color: white; font-size: 0.75rem; opacity: 0.7;">
                            <div>DEMO MODE</div>
                        </div>
                        <div style="position: absolute; top: 12px; right: 12px; color: white; font-size: 0.75rem; opacity: 0.7;">
                            <div id="cameraTime">${new Date().toLocaleTimeString('es-MX')}</div>
                        </div>
                        <div style="position: absolute; bottom: 12px; left: 12px; right: 12px; display: flex; justify-content: space-between; color: white; font-size: 0.6875rem; opacity: 0.7;">
                            <span>Foto ${state.capturedPhotos.length + 1}/10</span>
                            <span>Enfoque automático</span>
                        </div>
                    </div>

                    <!-- Preview section (hidden initially) -->
                    <div id="photoPreview" style="display: none; aspect-ratio: 4/3; position: relative;">
                        <img id="previewImage" src="" style="width: 100%; height: 100%; object-fit: cover;">
                        <!-- Success badge -->
                        <div style="position: absolute; top: 12px; right: 12px; background: var(--success); color: white; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;">
                            <i data-lucide="check" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>
                            Capturada
                        </div>
                        <!-- Photo info overlay at bottom -->
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 2rem 1rem 1rem 1rem;">
                            <div id="previewPhotoType" style="color: white; font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.25rem;"></div>
                            <div id="previewTimestamp" style="color: rgba(255,255,255,0.7); font-size: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="clock" style="width:12px;height:12px;"></i>
                                <span></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="background: #000; border-top: none; justify-content: center; padding: 1.5rem;">
                    <!-- Capture button -->
                    <div id="captureControls">
                        <button type="button" class="camera-capture-btn" onclick="simulateCapture()">
                            <div class="camera-capture-btn-inner"></div>
                        </button>
                        <p style="color: rgba(255,255,255,0.6); font-size: 0.75rem; text-align: center; margin-top: 0.75rem;">Toca para capturar</p>
                    </div>

                    <!-- After capture controls (hidden initially) -->
                    <div id="afterCaptureControls" style="display: none; width: 100%;">
                        <div style="display: flex; gap: 0.75rem;">
                            <button type="button" class="btn btn-secondary" style="flex: 1; background: rgba(255,255,255,0.1); color: white; border: none;" onclick="retakePhoto()">
                                <i data-lucide="refresh-cw" style="width:18px;height:18px;"></i>
                                Repetir
                            </button>
                            <button type="button" class="btn btn-primary" style="flex: 1;" onclick="confirmPhoto()">
                                <i data-lucide="check" style="width:18px;height:18px;"></i>
                                Usar foto
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', cameraModalHTML);
    if (window.lucide) lucide.createIcons();

    // Update time every second
    const timeInterval = setInterval(() => {
        const timeEl = document.getElementById('cameraTime');
        if (timeEl) {
            timeEl.textContent = new Date().toLocaleTimeString('es-MX');
        } else {
            clearInterval(timeInterval);
        }
    }, 1000);
}

function simulateCapture() {
    const viewfinder = document.getElementById('cameraViewfinder');
    const preview = document.getElementById('photoPreview');
    const previewImg = document.getElementById('previewImage');
    const captureControls = document.getElementById('captureControls');
    const afterControls = document.getElementById('afterCaptureControls');

    // Flash effect
    viewfinder.style.transition = 'background 0.1s';
    viewfinder.style.background = 'white';

    // Camera shutter sound simulation (visual feedback)
    setTimeout(() => {
        viewfinder.style.background = '';

        // Real furniture images from Unsplash for realistic demo
        const furniturePhotos = [
            { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop', type: 'Vista General - Sofá' },
            { url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop', type: 'Detalle - Silla' },
            { url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=600&fit=crop', type: 'Mesa Comedor' },
            { url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop', type: 'Sala Completa' },
            { url: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=600&fit=crop', type: 'Cama King Size' },
            { url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&h=600&fit=crop', type: 'Detalle Acabado' },
            { url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop', type: 'Escritorio' },
            { url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=600&fit=crop', type: 'Recámara' },
            { url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&h=600&fit=crop', type: 'Sofá Modular' },
            { url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop', type: 'Sillón Individual' }
        ];

        const photoData = furniturePhotos[state.capturedPhotos.length % furniturePhotos.length];
        const timestamp = Date.now();
        const photoUrl = photoData.url;

        // Store temporarily for confirmation
        window.pendingPhoto = {
            url: photoUrl,
            type: photoData.type,
            timestamp: timestamp
        };

        // Show preview
        previewImg.src = photoUrl;

        // Update photo info overlay
        const photoTypeEl = document.getElementById('previewPhotoType');
        const timestampEl = document.getElementById('previewTimestamp');
        if (photoTypeEl) photoTypeEl.textContent = photoData.type;
        if (timestampEl) {
            const timeStr = new Date().toLocaleString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timestampEl.querySelector('span').textContent = timeStr;
        }

        viewfinder.style.display = 'none';
        preview.style.display = 'block';
        captureControls.style.display = 'none';
        afterControls.style.display = 'block';

        if (window.lucide) lucide.createIcons();
    }, 150);
}

function retakePhoto() {
    const viewfinder = document.getElementById('cameraViewfinder');
    const preview = document.getElementById('photoPreview');
    const captureControls = document.getElementById('captureControls');
    const afterControls = document.getElementById('afterCaptureControls');

    window.pendingPhoto = null;

    viewfinder.style.display = 'flex';
    preview.style.display = 'none';
    captureControls.style.display = 'block';
    afterControls.style.display = 'none';
}

function confirmPhoto() {
    if (window.pendingPhoto) {
        state.capturedPhotos.push(window.pendingPhoto);
        window.pendingPhoto = null;

        updatePhotoGrid();
        showToast(`Foto ${state.capturedPhotos.length} guardada`, 'success');

        // Check if user wants to add more photos
        if (state.capturedPhotos.length < 10) {
            // Reset to camera view for next photo
            retakePhoto();

            // Update photo count in viewfinder
            const countEl = document.querySelector('#cameraViewfinder span');
            if (countEl) {
                countEl.textContent = `Foto ${state.capturedPhotos.length + 1}/10`;
            }
        } else {
            closeCameraModal();
            showToast('Máximo de fotos alcanzado', 'success');
        }
    }
}

function deletePhoto(index) {
    if (index >= 0 && index < state.capturedPhotos.length) {
        state.capturedPhotos.splice(index, 1);
        updatePhotoGrid();
        showToast('Foto eliminada');
    }
}

function closeCameraModal() {
    const modal = document.getElementById('cameraModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
    window.pendingPhoto = null;
}

function saveDraft() {
    showToast('Borrador guardado', 'success');
    closeModal();
}

function submitInspection() {
    const form = document.getElementById('inspectionForm');
    const formData = new FormData(form);

    // Validate
    const sku = formData.get('sku');
    const receivedQty = parseInt(formData.get('receivedQty'));
    const sampledQty = parseInt(formData.get('sampledQty'));

    if (!sku) {
        showToast('Ingresa el SKU del producto', 'error');
        return;
    }

    if (receivedQty <= 0) {
        showToast('La cantidad recibida debe ser mayor a 0', 'error');
        return;
    }

    if (sampledQty > receivedQty) {
        showToast('La cantidad muestreada no puede ser mayor a la recibida', 'error');
        return;
    }

    // Validate photos if there are findings
    const selectedFindings = formData.getAll('findings');
    if (selectedFindings.length > 0 && state.capturedPhotos.length < 3) {
        showToast('Se requieren mínimo 3 fotos cuando hay hallazgos', 'error');
        return;
    }

    // Create inspection
    const inspection = {
        id: Date.now(),
        sku: sku,
        productName: formData.get('productName') || 'Producto ' + sku,
        provider: 'Proveedor Demo',
        cedis: formData.get('cedis'),
        inspector: state.user?.name || 'Inspector',
        type: formData.get('type'),
        status: 'completed',
        receivedQty: receivedQty,
        sampledQty: sampledQty,
        rejectedQty: parseInt(formData.get('rejectedQty')) || 0,
        findingsQty: parseInt(formData.get('findingsQty')) || 0,
        findings: selectedFindings,
        photos: state.capturedPhotos.length,
        photoUrls: state.capturedPhotos.map(p => p.url),
        timestamp: new Date(),
        synced: state.isOnline
    };

    mockInspections.unshift(inspection);

    if (!state.isOnline) {
        state.pendingSync++;
    }

    showToast('Inspección registrada', 'success');
    closeModal();
    renderApp();
}

function viewInspection(id) {
    const inspection = mockInspections.find(i => i.id === id);
    if (inspection) {
        openInspectionDetail(inspection);
    }
}

function openInspectionDetail(inspection) {
    // Remove existing modal if any
    const existingModal = document.getElementById('inspectionDetailModal');
    if (existingModal) existingModal.remove();

    const statusClass = inspection.status === 'completed' ? 'completed' :
                       inspection.status === 'rejected' ? 'rejected' : 'pending';
    const badgeClass = inspection.status === 'completed' ? 'badge-success' :
                      inspection.status === 'rejected' ? 'badge-danger' : 'badge-warning';
    const statusText = inspection.status === 'completed' ? 'Completada' :
                      inspection.status === 'rejected' ? 'Rechazada' : 'Pendiente';

    // Use real photo URLs if available, otherwise generate placeholders
    let photoPlaceholders = [];
    if (inspection.photoUrls && inspection.photoUrls.length > 0) {
        photoPlaceholders = inspection.photoUrls;
    } else {
        for (let i = 0; i < inspection.photos; i++) {
            const colors = ['3B82F6', '10B981', 'F59E0B', 'EF4444', '8B5CF6', 'EC4899'];
            const color = colors[i % colors.length];
            photoPlaceholders.push(`https://placehold.co/200x200/${color}/white?text=Foto+${i + 1}`);
        }
    }

    const modalHTML = `
        <div class="modal-overlay active" id="inspectionDetailModal" onclick="closeDetailModal(event)">
            <div class="modal" onclick="event.stopPropagation()" style="max-height: 95vh;">
                <div class="modal-header" style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;">
                    <div>
                        <h2 class="modal-title" style="color: white;">${inspection.sku}</h2>
                        <p style="font-size: 0.875rem; opacity: 0.9; margin-top: 0.25rem;">${inspection.productName}</p>
                    </div>
                    <button class="modal-close" onclick="closeDetailModal()" style="background: rgba(255,255,255,0.2); color: white;">
                        <i data-lucide="x" style="width:18px;height:18px;"></i>
                    </button>
                </div>

                <div class="modal-body" style="padding: 0;">
                    <!-- Status Banner -->
                    <div style="padding: 1rem 1.25rem; background: ${inspection.status === 'completed' ? 'var(--success-light)' : inspection.status === 'rejected' ? 'var(--danger-light)' : 'var(--warning-light)'}; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span class="inspection-badge ${badgeClass}" style="font-size: 0.8125rem; padding: 0.375rem 0.75rem;">
                                ${inspection.status === 'completed' ? '<i data-lucide="check-circle" style="width:14px;height:14px;"></i>' :
                                  inspection.status === 'rejected' ? '<i data-lucide="x-circle" style="width:14px;height:14px;"></i>' :
                                  '<i data-lucide="clock" style="width:14px;height:14px;"></i>'}
                                ${statusText}
                            </span>
                            ${inspection.synced ?
                                '<span style="font-size: 0.75rem; color: var(--success); display: flex; align-items: center; gap: 0.25rem;"><i data-lucide="cloud" style="width:14px;height:14px;"></i> Sincronizado</span>' :
                                '<span style="font-size: 0.75rem; color: var(--warning); display: flex; align-items: center; gap: 0.25rem;"><i data-lucide="cloud-off" style="width:14px;height:14px;"></i> Pendiente sync</span>'}
                        </div>
                        <span style="font-size: 0.75rem; color: var(--gray-600);">${formatDate(inspection.timestamp)}</span>
                    </div>

                    <!-- Info Grid -->
                    <div style="padding: 1.25rem; border-bottom: 1px solid var(--gray-200);">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                            <div class="detail-item">
                                <div style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.25rem;">
                                    <i data-lucide="building-2" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>
                                    CEDIS
                                </div>
                                <div style="font-weight: 500;">${inspection.cedis}</div>
                            </div>
                            <div class="detail-item">
                                <div style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.25rem;">
                                    <i data-lucide="clipboard-list" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>
                                    Tipo
                                </div>
                                <div style="font-weight: 500;">${inspection.type}</div>
                            </div>
                            <div class="detail-item">
                                <div style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.25rem;">
                                    <i data-lucide="truck" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>
                                    Proveedor
                                </div>
                                <div style="font-weight: 500;">${inspection.provider}</div>
                            </div>
                            <div class="detail-item">
                                <div style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.25rem;">
                                    <i data-lucide="user" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>
                                    Inspector
                                </div>
                                <div style="font-weight: 500;">${inspection.inspector}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Quantities -->
                    <div style="padding: 1.25rem; border-bottom: 1px solid var(--gray-200);">
                        <h3 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="package" style="width:16px;height:16px;"></i>
                            Cantidades
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
                            <div style="text-align: center; padding: 0.75rem; background: var(--gray-50); border-radius: var(--border-radius);">
                                <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${inspection.receivedQty}</div>
                                <div style="font-size: 0.6875rem; color: var(--gray-500);">Recibidos</div>
                            </div>
                            <div style="text-align: center; padding: 0.75rem; background: var(--gray-50); border-radius: var(--border-radius);">
                                <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${inspection.sampledQty}</div>
                                <div style="font-size: 0.6875rem; color: var(--gray-500);">Muestreados</div>
                            </div>
                            <div style="text-align: center; padding: 0.75rem; background: ${inspection.rejectedQty > 0 ? 'var(--danger-light)' : 'var(--gray-50)'}; border-radius: var(--border-radius);">
                                <div style="font-size: 1.25rem; font-weight: 700; color: ${inspection.rejectedQty > 0 ? 'var(--danger)' : 'var(--primary)'};">${inspection.rejectedQty}</div>
                                <div style="font-size: 0.6875rem; color: var(--gray-500);">Rechazados</div>
                            </div>
                            <div style="text-align: center; padding: 0.75rem; background: ${inspection.findingsQty > 0 ? 'var(--warning-light)' : 'var(--gray-50)'}; border-radius: var(--border-radius);">
                                <div style="font-size: 1.25rem; font-weight: 700; color: ${inspection.findingsQty > 0 ? 'var(--warning)' : 'var(--primary)'};">${inspection.findingsQty}</div>
                                <div style="font-size: 0.6875rem; color: var(--gray-500);">Con hallazgos</div>
                            </div>
                        </div>
                    </div>

                    <!-- Findings -->
                    ${inspection.findings && inspection.findings.length > 0 ? `
                    <div style="padding: 1.25rem; border-bottom: 1px solid var(--gray-200);">
                        <h3 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="alert-triangle" style="width:16px;height:16px;color:var(--warning);"></i>
                            Hallazgos (${inspection.findings.length})
                        </h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${inspection.findings.map(f => `
                                <span style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 0.75rem; background: var(--warning-light); color: var(--warning); border-radius: 9999px; font-size: 0.8125rem; font-weight: 500;">
                                    <i data-lucide="alert-circle" style="width:14px;height:14px;"></i>
                                    ${f}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Photos -->
                    ${inspection.photos > 0 ? `
                    <div style="padding: 1.25rem; border-bottom: 1px solid var(--gray-200);">
                        <h3 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="camera" style="width:16px;height:16px;"></i>
                            Evidencia Fotográfica (${inspection.photos})
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                            ${photoPlaceholders.map((url, i) => `
                                <div style="aspect-ratio: 1; border-radius: var(--border-radius); overflow: hidden; cursor: pointer;" onclick="showPhotoFullscreen('${url}', ${i + 1})">
                                    <img src="${url}" alt="Foto ${i + 1}" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Timeline -->
                    <div style="padding: 1.25rem;">
                        <h3 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="history" style="width:16px;height:16px;"></i>
                            Historial
                        </h3>
                        <div class="timeline">
                            ${generateTimeline(inspection)}
                        </div>
                    </div>
                </div>

                <div class="modal-footer" style="flex-wrap: wrap; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-sm" onclick="downloadReport(${inspection.id})" style="flex: 1;">
                        <i data-lucide="download" style="width:16px;height:16px;"></i>
                        Descargar PDF
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="shareInspection(${inspection.id})" style="flex: 1;">
                        <i data-lucide="share-2" style="width:16px;height:16px;"></i>
                        Compartir
                    </button>
                    ${inspection.status === 'pending' ? `
                    <button class="btn btn-primary btn-sm" onclick="editInspection(${inspection.id})" style="flex: 1;">
                        <i data-lucide="edit" style="width:16px;height:16px;"></i>
                        Editar
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (window.lucide) lucide.createIcons();
}

function generateTimeline(inspection) {
    const events = [
        {
            icon: 'clipboard-check',
            title: 'Inspección creada',
            description: `Por ${inspection.inspector}`,
            time: inspection.timestamp,
            color: 'var(--primary)'
        }
    ];

    if (inspection.findings && inspection.findings.length > 0) {
        events.push({
            icon: 'alert-triangle',
            title: `${inspection.findings.length} hallazgos registrados`,
            description: inspection.findings.slice(0, 2).join(', ') + (inspection.findings.length > 2 ? '...' : ''),
            time: new Date(inspection.timestamp.getTime() + 60000),
            color: 'var(--warning)'
        });
    }

    if (inspection.photos > 0) {
        events.push({
            icon: 'camera',
            title: `${inspection.photos} fotos adjuntadas`,
            description: 'Evidencia fotográfica',
            time: new Date(inspection.timestamp.getTime() + 120000),
            color: 'var(--primary)'
        });
    }

    if (inspection.synced) {
        events.push({
            icon: 'cloud',
            title: 'Sincronizado con servidor',
            description: 'Datos respaldados',
            time: new Date(inspection.timestamp.getTime() + 180000),
            color: 'var(--success)'
        });
    }

    if (inspection.status === 'completed') {
        events.push({
            icon: 'check-circle',
            title: 'Inspección completada',
            description: 'Proceso finalizado',
            time: new Date(inspection.timestamp.getTime() + 240000),
            color: 'var(--success)'
        });
    } else if (inspection.status === 'rejected') {
        events.push({
            icon: 'x-circle',
            title: 'Lote rechazado',
            description: 'No cumple criterios de calidad',
            time: new Date(inspection.timestamp.getTime() + 240000),
            color: 'var(--danger)'
        });
    }

    return events.map((event, index) => `
        <div style="display: flex; gap: 1rem; ${index < events.length - 1 ? 'padding-bottom: 1rem;' : ''}">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: ${event.color}15; color: ${event.color}; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="${event.icon}" style="width:16px;height:16px;"></i>
                </div>
                ${index < events.length - 1 ? '<div style="flex: 1; width: 2px; background: var(--gray-200); margin-top: 0.5rem;"></div>' : ''}
            </div>
            <div style="flex: 1; padding-bottom: 0.5rem;">
                <div style="font-weight: 500; font-size: 0.875rem;">${event.title}</div>
                <div style="font-size: 0.75rem; color: var(--gray-500);">${event.description}</div>
                <div style="font-size: 0.6875rem; color: var(--gray-400); margin-top: 0.25rem;">${formatDate(event.time)}</div>
            </div>
        </div>
    `).join('');
}

function closeDetailModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('inspectionDetailModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function showPhotoFullscreen(url, index) {
    showToast(`Vista completa: Foto ${index}`);
    // In a real app, this would open a fullscreen image viewer
}

function downloadReport(id) {
    showToast('Generando PDF...', 'success');
    // In a real app, this would generate and download a PDF
}

function shareInspection(id) {
    const inspection = mockInspections.find(i => i.id === id);
    if (inspection && navigator.share) {
        navigator.share({
            title: `Inspección ${inspection.sku}`,
            text: `Inspección de ${inspection.productName} - ${inspection.status}`,
            url: window.location.href
        });
    } else {
        showToast('Link copiado al portapapeles', 'success');
    }
}

function editInspection(id) {
    closeDetailModal();
    showToast('Función de edición (próximamente)');
}

function viewProvider(id) {
    const provider = mockProviders.find(p => p.id === id);
    if (provider) {
        openProviderDetail(provider);
    }
}

function openProviderDetail(provider) {
    const existingModal = document.getElementById('providerDetailModal');
    if (existingModal) existingModal.remove();

    const riskColors = {
        low: { bg: 'var(--success-light)', text: 'var(--success)', label: 'BAJO' },
        medium: { bg: 'var(--warning-light)', text: 'var(--warning)', label: 'MEDIO' },
        high: { bg: 'var(--danger-light)', text: 'var(--danger)', label: 'ALTO' }
    };
    const risk = riskColors[provider.riskLevel];

    // Generate defects pie chart data
    const defectEntries = Object.entries(provider.defectsByCategory);
    const totalDefects = defectEntries.reduce((sum, [_, v]) => sum + v, 0);
    const defectColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    // Generate trend sparkline
    const maxTrend = Math.max(...provider.trendData);
    const trendPoints = provider.trendData.map((v, i) =>
        `${(i / (provider.trendData.length - 1)) * 100},${100 - (v / maxTrend) * 80}`
    ).join(' ');

    // Get recent inspections for this provider
    const providerInspections = mockInspections.filter(i => i.provider === provider.name).slice(0, 3);

    const modalHTML = `
        <div class="modal-overlay active" id="providerDetailModal" onclick="closeProviderDetail(event)">
            <div class="modal" onclick="event.stopPropagation()" style="max-height: 95vh;">
                <div class="modal-header" style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white;">
                    <div>
                        <h2 class="modal-title" style="color: white;">${provider.name}</h2>
                        <p style="font-size: 0.875rem; opacity: 0.9; margin-top: 0.25rem;">${provider.code}</p>
                    </div>
                    <button class="modal-close" onclick="closeProviderDetail()" style="background: rgba(255,255,255,0.2); color: white;">
                        <i data-lucide="x" style="width:18px;height:18px;"></i>
                    </button>
                </div>

                <div class="modal-body" style="padding: 0;">
                    <!-- Score & Risk Banner -->
                    <div style="padding: 1.25rem; background: var(--gray-50); display: flex; justify-content: space-around; text-align: center; border-bottom: 1px solid var(--gray-200);">
                        <div>
                            <div style="font-size: 2rem; font-weight: 700; color: ${provider.score >= 80 ? 'var(--success)' : provider.score >= 60 ? 'var(--warning)' : 'var(--danger)'};">
                                ${provider.score}
                                ${provider.trend === 'up' ? '<i data-lucide="trending-up" style="width:20px;height:20px;"></i>' :
                                  provider.trend === 'down' ? '<i data-lucide="trending-down" style="width:20px;height:20px;"></i>' :
                                  '<i data-lucide="minus" style="width:20px;height:20px;"></i>'}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--gray-500);">Puntaje</div>
                        </div>
                        <div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-700);">${provider.defectRate}%</div>
                            <div style="font-size: 0.75rem; color: var(--gray-500);">Tasa Defectos</div>
                        </div>
                        <div>
                            <span style="display: inline-block; padding: 0.5rem 1rem; background: ${risk.bg}; color: ${risk.text}; border-radius: 9999px; font-size: 0.75rem; font-weight: 700;">
                                ${risk.label}
                            </span>
                            <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: 0.25rem;">Riesgo</div>
                        </div>
                    </div>

                    <!-- KPIs Row -->
                    <div style="padding: 1rem 1.25rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; border-bottom: 1px solid var(--gray-200);">
                        <div style="text-align: center; padding: 0.75rem; background: var(--gray-50); border-radius: var(--border-radius);">
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${provider.inspections}</div>
                            <div style="font-size: 0.6875rem; color: var(--gray-500);">Inspecciones</div>
                        </div>
                        <div style="text-align: center; padding: 0.75rem; background: var(--gray-50); border-radius: var(--border-radius);">
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${provider.responseTime}d</div>
                            <div style="font-size: 0.6875rem; color: var(--gray-500);">Tiempo Resp.</div>
                        </div>
                        <div style="text-align: center; padding: 0.75rem; background: var(--gray-50); border-radius: var(--border-radius);">
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${totalDefects}</div>
                            <div style="font-size: 0.6875rem; color: var(--gray-500);">Hallazgos Total</div>
                        </div>
                    </div>

                    <!-- Trend Chart -->
                    <div style="padding: 1.25rem; border-bottom: 1px solid var(--gray-200);">
                        <h3 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="trending-up" style="width:16px;height:16px;"></i>
                            Tendencia Tasa de Defectos (7 días)
                        </h3>
                        <div style="height: 80px; position: relative; background: var(--gray-50); border-radius: var(--border-radius); padding: 0.5rem;">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <polyline
                                    points="${trendPoints}"
                                    fill="none"
                                    stroke="${provider.trend === 'down' ? 'var(--danger)' : provider.trend === 'up' ? 'var(--success)' : 'var(--primary)'}"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                ${provider.trendData.map((v, i) => `
                                    <circle
                                        cx="${(i / (provider.trendData.length - 1)) * 100}"
                                        cy="${100 - (v / maxTrend) * 80}"
                                        r="3"
                                        fill="${provider.trend === 'down' ? 'var(--danger)' : provider.trend === 'up' ? 'var(--success)' : 'var(--primary)'}"
                                    />
                                `).join('')}
                            </svg>
                            <div style="display: flex; justify-content: space-between; font-size: 0.625rem; color: var(--gray-400); margin-top: 0.25rem;">
                                <span>Hace 7d</span>
                                <span>Hoy</span>
                            </div>
                        </div>
                    </div>

                    <!-- Defects Breakdown -->
                    <div style="padding: 1.25rem; border-bottom: 1px solid var(--gray-200);">
                        <h3 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="pie-chart" style="width:16px;height:16px;"></i>
                            Defectos por Categoría
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${defectEntries.map(([category, count], i) => `
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div style="width: 12px; height: 12px; border-radius: 2px; background: ${defectColors[i % defectColors.length]};"></div>
                                    <span style="flex: 1; font-size: 0.8125rem;">${category}</span>
                                    <div style="width: 100px; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                                        <div style="height: 100%; width: ${(count / totalDefects) * 100}%; background: ${defectColors[i % defectColors.length]};"></div>
                                    </div>
                                    <span style="font-size: 0.75rem; font-weight: 600; color: var(--gray-600); min-width: 40px; text-align: right;">${count} (${Math.round((count / totalDefects) * 100)}%)</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Top Issues -->
                    <div style="padding: 1.25rem; border-bottom: 1px solid var(--gray-200);">
                        <h3 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="alert-triangle" style="width:16px;height:16px;color:var(--warning);"></i>
                            Problemas Principales
                        </h3>
                        <ul style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
                            ${provider.topIssues.map(issue => `
                                <li style="font-size: 0.8125rem; color: var(--gray-700);">${issue}</li>
                            `).join('')}
                        </ul>
                    </div>

                    <!-- Contact Info -->
                    <div style="padding: 1.25rem; border-bottom: 1px solid var(--gray-200);">
                        <h3 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="user" style="width:16px;height:16px;"></i>
                            Contacto
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8125rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="user" style="width:14px;height:14px;color:var(--gray-400);"></i>
                                <span>${provider.contact.name}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="mail" style="width:14px;height:14px;color:var(--gray-400);"></i>
                                <a href="mailto:${provider.contact.email}" style="color: var(--primary);">${provider.contact.email}</a>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="phone" style="width:14px;height:14px;color:var(--gray-400);"></i>
                                <span>${provider.contact.phone}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Inspections -->
                    ${providerInspections.length > 0 ? `
                    <div style="padding: 1.25rem;">
                        <h3 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="clipboard-list" style="width:16px;height:16px;"></i>
                            Inspecciones Recientes
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${providerInspections.map(insp => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--gray-50); border-radius: var(--border-radius); cursor: pointer;" onclick="closeProviderDetail(); viewInspection(${insp.id});">
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.8125rem;">${insp.sku}</div>
                                        <div style="font-size: 0.75rem; color: var(--gray-500);">${insp.productName}</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <span class="inspection-badge ${insp.status === 'completed' ? 'badge-success' : insp.status === 'rejected' ? 'badge-danger' : 'badge-warning'}" style="font-size: 0.6875rem;">
                                            ${insp.status === 'completed' ? 'Completada' : insp.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                                        </span>
                                        <div style="font-size: 0.6875rem; color: var(--gray-400); margin-top: 0.25rem;">${formatTime(insp.timestamp)}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div class="modal-footer" style="flex-wrap: wrap; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-sm" onclick="exportProviderReport(${provider.id})" style="flex: 1;">
                        <i data-lucide="download" style="width:16px;height:16px;"></i>
                        Exportar PDF
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="sendProviderAlert(${provider.id})" style="flex: 1;">
                        <i data-lucide="send" style="width:16px;height:16px;"></i>
                        Enviar Alerta
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (window.lucide) lucide.createIcons();
}

function closeProviderDetail(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('providerDetailModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function exportProviderReport(id) {
    const provider = mockProviders.find(p => p.id === id);
    showToast(`Generando reporte de ${provider?.name}...`, 'success');
}

function sendProviderAlert(id) {
    const provider = mockProviders.find(p => p.id === id);
    showToast(`Alerta enviada a ${provider?.contact.email}`, 'success');
}

function showNotifications() {
    showToast('No hay notificaciones nuevas');
}

function attachEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
        state.isOnline = true;
        renderApp();
        showToast('Conexión restaurada', 'success');
    });

    window.addEventListener('offline', () => {
        state.isOnline = false;
        renderApp();
        showToast('Sin conexión - Modo offline', 'error');
    });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    renderApp();
});

// Export for global access
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.navigate = navigate;
window.openNewInspection = openNewInspection;
window.closeModal = closeModal;
window.closeDetailModal = closeDetailModal;
window.adjustQty = adjustQty;
window.capturePhoto = capturePhoto;
window.saveDraft = saveDraft;
window.submitInspection = submitInspection;
window.viewInspection = viewInspection;
window.viewProvider = viewProvider;
window.showNotifications = showNotifications;
window.showPhotoFullscreen = showPhotoFullscreen;
window.downloadReport = downloadReport;
window.shareInspection = shareInspection;
window.editInspection = editInspection;
window.deletePhoto = deletePhoto;
window.closeCameraModal = closeCameraModal;
window.simulateCapture = simulateCapture;
window.retakePhoto = retakePhoto;
window.confirmPhoto = confirmPhoto;
window.toggleOfflineMode = toggleOfflineMode;
window.manualSync = manualSync;
window.handleSkuInput = handleSkuInput;
window.selectProduct = selectProduct;
window.showSkuDropdown = showSkuDropdown;
window.hideSkuDropdown = hideSkuDropdown;
window.toggleSkuDropdown = toggleSkuDropdown;
window.clearSkuInput = clearSkuInput;
window.closeProviderDetail = closeProviderDetail;
window.exportProviderReport = exportProviderReport;
window.sendProviderAlert = sendProviderAlert;
window.updateFilter = updateFilter;
window.clearAllFilters = clearAllFilters;
