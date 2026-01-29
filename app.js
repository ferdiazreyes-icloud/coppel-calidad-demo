// ===== STATE MANAGEMENT =====
const state = {
    currentPage: 'login',
    user: null,
    inspections: [],
    providers: [],
    isOnline: navigator.onLine,
    pendingSync: 0,
    capturedPhotos: [] // Photos captured during current inspection form
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
    { id: 1, name: 'Muebles del Norte SA', code: 'PRV-001', score: 92, trend: 'up', inspections: 145, defectRate: 2.1, riskLevel: 'low' },
    { id: 2, name: 'Carpintería Moderna', code: 'PRV-002', score: 78, trend: 'down', inspections: 89, defectRate: 8.5, riskLevel: 'medium' },
    { id: 3, name: 'Muebles Premium MX', code: 'PRV-003', score: 45, trend: 'down', inspections: 67, defectRate: 18.2, riskLevel: 'high' },
    { id: 4, name: 'Diseños Hogar SA', code: 'PRV-004', score: 88, trend: 'up', inspections: 203, defectRate: 3.8, riskLevel: 'low' },
    { id: 5, name: 'Fábrica de Muebles MX', code: 'PRV-005', score: 71, trend: 'stable', inspections: 112, defectRate: 9.1, riskLevel: 'medium' }
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
    'Daño en empaque',
    'Rayón en superficie',
    'Pieza faltante',
    'Daño estructural',
    'Manchas/Suciedad',
    'Color incorrecto',
    'Dimensiones incorrectas',
    'Humedad/Mojado',
    'Tornillería incompleta',
    'Manual faltante'
];

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
                    <div class="sync-status">
                        <span class="sync-dot ${state.isOnline ? '' : 'offline'}"></span>
                        <span>${state.isOnline ? 'Conectado' : 'Sin conexión'}</span>
                        ${state.pendingSync > 0 ? `<span>(${state.pendingSync} pendientes)</span>` : ''}
                    </div>
                    <button class="navbar-icon" onclick="showNotifications()">
                        <i data-lucide="bell" style="width:20px;height:20px;"></i>
                    </button>
                    <div class="user-avatar">${state.user?.initials || 'JP'}</div>
                </div>
            </div>
        </nav>
    `;
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
    return `
        ${renderNavbar()}
        <main class="page">
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1 class="page-title">Inspecciones</h1>
                    <p class="page-subtitle">${mockInspections.length} inspecciones registradas</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="openNewInspection()">
                    <i data-lucide="plus" style="width:18px;height:18px;"></i>
                    Nueva
                </button>
            </div>

            <div class="tabs">
                <button class="tab active">Todas</button>
                <button class="tab">Pendientes</button>
                <button class="tab">Completadas</button>
                <button class="tab">Rechazadas</button>
            </div>

            <div class="inspection-list">
                ${mockInspections.map(renderInspectionItem).join('')}
            </div>
        </main>
        ${renderBottomNav()}
        <button class="fab" onclick="openNewInspection()">
            <i data-lucide="plus" style="width:24px;height:24px;"></i>
        </button>
    `;
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
                            <input type="text" class="form-input" name="sku" placeholder="Ej: MUE-1234567" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Nombre del Producto</label>
                            <input type="text" class="form-input" name="productName" placeholder="Se autocompleta con el SKU">
                        </div>

                        <div class="quantity-row">
                            <div class="form-group">
                                <label class="form-label required">Cantidad Recibida</label>
                                <div class="quantity-input">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('received', -1)">-</button>
                                    <input type="number" class="quantity-value" name="receivedQty" value="0" min="0">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('received', 1)">+</button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">Cantidad Muestreada</label>
                                <div class="quantity-input">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('sampled', -1)">-</button>
                                    <input type="number" class="quantity-value" name="sampledQty" value="0" min="0">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('sampled', 1)">+</button>
                                </div>
                            </div>
                        </div>

                        <div class="quantity-row">
                            <div class="form-group">
                                <label class="form-label">Cantidad Rechazada</label>
                                <div class="quantity-input">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('rejected', -1)">-</button>
                                    <input type="number" class="quantity-value" name="rejectedQty" value="0" min="0">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('rejected', 1)">+</button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Con Hallazgos</label>
                                <div class="quantity-input">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('findings', -1)">-</button>
                                    <input type="number" class="quantity-value" name="findingsQty" value="0" min="0">
                                    <button type="button" class="quantity-btn" onclick="adjustQty('findings', 1)">+</button>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Hallazgos</label>
                            <div class="checkbox-group">
                                ${findingCategories.map(f => `
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="findings" value="${f}">
                                        ${f}
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
                        <div style="position: absolute; top: 12px; right: 12px; background: var(--success); color: white; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;">
                            <i data-lucide="check" style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;"></i>
                            Capturada
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

        // Generate simulated photo (placeholder with furniture-related content)
        const photoTypes = [
            { text: 'Vista+General', color: '3B82F6' },
            { text: 'Detalle+Producto', color: '10B981' },
            { text: 'Etiqueta', color: 'F59E0B' },
            { text: 'Empaque', color: '8B5CF6' },
            { text: 'Defecto', color: 'EF4444' },
            { text: 'Acabado', color: 'EC4899' },
            { text: 'Estructura', color: '06B6D4' },
            { text: 'Ensamble', color: '84CC16' }
        ];

        const photoType = photoTypes[state.capturedPhotos.length % photoTypes.length];
        const timestamp = Date.now();
        const photoUrl = `https://placehold.co/800x600/${photoType.color}/white?text=${photoType.text}%0A${new Date().toLocaleTimeString('es-MX')}`;

        // Store temporarily for confirmation
        window.pendingPhoto = {
            url: photoUrl,
            type: photoType.text.replace('+', ' '),
            timestamp: timestamp
        };

        // Show preview
        previewImg.src = photoUrl;
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
        showToast(`Ver proveedor ${provider.name}`);
    }
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
