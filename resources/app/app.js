// Browser Polyfill for running as a Standalone Web App
if (!window.electronAPI) {
    window.electronAPI = {
        syncDigitalForm: async (data) => {
            try {
                localStorage.setItem('itqan_synced_rooms', JSON.stringify(data.rooms));
            } catch (e) {}
            return { success: true };
        },
        updateTitle: (title) => {
            document.title = title;
        },
        openExternal: (url) => {
            window.open(url, '_blank');
        },
        backupProject: async () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", `itqan_backup_${new Date().toISOString().split('T')[0]}.json`);
            dlAnchorElem.click();
            return { success: true, name: `itqan_backup_${new Date().toISOString().split('T')[0]}.json`, path: 'مجلد التنزيلات (Downloads)' };
        },
        exportData: async (data) => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", `itqan_data_${new Date().toISOString().split('T')[0]}.json`);
            dlAnchorElem.click();
            return { success: true, path: 'مجلد التنزيلات (Downloads)' };
        },
        importData: () => {
            return new Promise((resolve) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return resolve({ error: 'لم يتم اختيار ملف' });
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const data = JSON.parse(event.target.result);
                            resolve({ success: true, data });
                        } catch (err) {
                            resolve({ error: 'صيغة الملف غير صحيحة' });
                        }
                    };
                    reader.readAsText(file);
                };
                input.click();
            });
        },
        exportForm: async () => {
            const a = document.createElement('a');
            a.href = 'booking_form_digital.html';
            a.download = 'Booking_Form_Digital.html';
            a.click();
            return { success: true, path: 'مجلد التنزيلات (Downloads)' };
        },
        openPath: () => {}
    };
}

// Default State (Demo Data)
const defaultState = {
    currentView: 'dashboard',
    currentDate: new Date(2026, 3, 16),
    appSettings: {
        logo: null,
        orgName: 'إدارة التعليم بمنطقة عسير',
        deptName: 'إدارة الاتصال المؤسسي',
        stamp: null,
        contactNumber: '0582233500 - 0590504047'
    },
    rooms: [
        { id: 1, name: 'قاعة المركز العلمي', status: 'available', icon: 'fa-chalkboard-user', type: 'hall' },
        { id: 2, name: 'مجلس بيت الطالب', status: 'available', icon: 'fa-couch', type: 'council' },
        { id: 3, name: 'مسرح التربية الخاصة بنين', status: 'available', icon: 'fa-landmark', type: 'theater' },
        { id: 4, name: 'مسرح التربية الخاصة بنات', status: 'busy', icon: 'fa-landmark', type: 'theater' },
        { id: 5, name: 'مسرح إدارة التعليم', status: 'available', icon: 'fa-landmark', type: 'theater' },
        { id: 6, name: 'قاعة الشؤون التعليمية', status: 'available', icon: 'fa-chalkboard-user', type: 'hall' }
    ],
    bookings: [
        { id: 1, title: 'مؤتمر التكنولوجيا والذكاء الاصطناعي', roomId: 6, date: new Date().toISOString().split('T')[0], time: '09:00', timePeriod: 'صباحاً', status: 'confirmed', entityName: 'إدارة التعليم', coordName: 'خالد العسيري', coordMobile: '0500000000', audienceCount: 100, eventTypes: ['ministerial'], needs: ['screens'] },
        { id: 2, title: 'ورشة عمل تطوير المهارات الرقمية', roomId: 1, date: new Date().toISOString().split('T')[0], time: '13:00', timePeriod: 'مساءً', status: 'pending', entityName: 'قسم التدريب', coordName: 'أحمد', coordMobile: '0511111111', audienceCount: 45, eventTypes: ['workshop'], needs: ['pc', 'screens'] }
    ],
    equipment: [
        { id: 1, name: 'ميكروفون لاسلكي Sony Pro', status: 'available', quantity: 4, icon: 'fa-microphone' },
        { id: 2, name: 'جهاز عرض 4K Epson Smart', status: 'available', quantity: 2, icon: 'fa-video' }
    ],
    bookingsSortCriteria: 'priority',
    bookingsStatusFilter: 'all',
    bookingsDateFilter: 'all',
    bookingsStartDate: '',
    bookingsEndDate: ''
};

// ===== Custom Cancellation Prompt (works in Electron with contextIsolation) =====
window._cancellationPromptCallback = null;

window.showCancellationPrompt = function() {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-prompt-modal');
        const input = document.getElementById('custom-prompt-input');
        if (!modal || !input) { resolve(null); return; }
        
        input.value = '';
        modal.style.display = 'flex';
        setTimeout(() => input.focus(), 100);
        
        window._cancellationPromptCallback = resolve;
    });
};

window.confirmCustomPrompt = function() {
    const modal = document.getElementById('custom-prompt-modal');
    const input = document.getElementById('custom-prompt-input');
    modal.style.display = 'none';
    if (window._cancellationPromptCallback) {
        window._cancellationPromptCallback(input.value.trim() || 'لم يتم تحديد سبب');
        window._cancellationPromptCallback = null;
    }
};

window.cancelCustomPrompt = function() {
    const modal = document.getElementById('custom-prompt-modal');
    modal.style.display = 'none';
    if (window._cancellationPromptCallback) {
        window._cancellationPromptCallback(null); // null = cancelled
        window._cancellationPromptCallback = null;
    }
};
// ===== End Custom Prompt =====

function startLiveClock() {
    const timeEl = document.getElementById('live-time');
    const dateEl = document.getElementById('live-date');
    if (!timeEl || !dateEl) return;

    const update = () => {
        const now = new Date();
        
        // Time
        timeEl.textContent = now.toLocaleTimeString('ar-SA-u-nu-latn', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // Date (Arabic with English Numerals)
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('ar-SA-u-nu-latn', options);
    };

    update();
    if (window.clockInterval) clearInterval(window.clockInterval);
    window.clockInterval = setInterval(update, 1000);
}

// Persistence Logic
function saveState() {
    try {
        const data = JSON.stringify(state);
        localStorage.setItem('itqan_state', data);
        localStorage.setItem('injaz_state', data); // Backup for compatibility
        syncRoomsWithDigitalForm();
        if (typeof updateNotifications === 'function') updateNotifications();
    } catch (e) {
        console.error("Local Storage Save Error:", e);
    }
}

function syncRoomsWithDigitalForm() {
    if (window.electronAPI && window.electronAPI.syncDigitalForm) {
        window.electronAPI.syncDigitalForm(state.rooms);
    }
}

function loadState() {
    try {
        let saved = localStorage.getItem('itqan_state');
        const backup = localStorage.getItem('injaz_state');
        
        // If itqan_state is missing or has no bookings, try to recover from injaz_state
        if (backup) {
            if (!saved) {
                saved = backup;
            } else {
                try {
                    const s1 = JSON.parse(saved);
                    const s2 = JSON.parse(backup);
                    if ((s1.bookings?.length || 0) < (s2.bookings?.length || 0)) {
                        saved = backup;
                    }
                } catch(e) { saved = backup; }
            }
        }

        if (saved) {
            const parsed = JSON.parse(saved);
            
            // Robust merging with defaultState
            const newState = { ...defaultState, ...parsed };
            
            // Deep merge appSettings
            newState.appSettings = { ...defaultState.appSettings, ...(parsed.appSettings || {}) };
            
            // Migration for department name update
            if (newState.appSettings.deptName === 'قسم الاتصال المؤسسي') {
                newState.appSettings.deptName = 'إدارة الاتصال المؤسسي';
            }
            
            // Ensure rooms and bookings are arrays
            if (!Array.isArray(newState.rooms)) newState.rooms = defaultState.rooms;
            if (!Array.isArray(newState.bookings)) newState.bookings = defaultState.bookings;
            if (!Array.isArray(newState.equipment)) newState.equipment = defaultState.equipment;

            // Date objects need to be re-instantiated
            newState.currentDate = new Date(newState.currentDate || new Date());
            newState.bookingsSortCriteria = newState.bookingsSortCriteria || 'priority';
            newState.bookingsStatusFilter = newState.bookingsStatusFilter || 'all';
            newState.bookingsDateFilter = newState.bookingsDateFilter || 'all';
            newState.bookingsStartDate = newState.bookingsStartDate || '';
            newState.bookingsEndDate = newState.bookingsEndDate || '';
            
            return newState;
        }
    } catch (e) {
        console.error("Local Storage Load/Parse Error:", e);
    }
    return JSON.parse(JSON.stringify(defaultState));
}

const state = loadState();

// Selectors
let navLinks = document.querySelectorAll('.nav-links li');
let views = document.querySelectorAll('.view');
const roomGridMini = document.querySelector('.room-grid-mini');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    renderDashboard();
    applySystemBranding();
    syncSettingsUI();
    updateStampPreview();
    startLiveClock();
    updateNotifications();
    window.loadBlacklist();
});

// Navigation logic (Updated to include click listeners for dynamically added tabs if any, though handled by navLinks selector)
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const viewId = link.getAttribute('data-view');
            switchView(viewId);
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function switchView(viewId) {
    // Re-query if views list is empty or stale (defensive)
    if (!views || views.length === 0) {
        views = document.querySelectorAll('.view');
    }

    views.forEach(view => {
        view.classList.remove('active');
        if (view.id === `${viewId}-view`) {
            view.classList.add('active');
        }
    });

    // Update Sidebar state
    if (!navLinks || navLinks.length === 0) {
        navLinks = document.querySelectorAll('.nav-links li');
    }
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-view') === viewId) {
            link.classList.add('active');
        }
    });

    state.currentView = viewId;
    
    // Render content based on view
    if (viewId === 'dashboard') {
        renderDashboard();
        startLiveClock(); // Refresh immediately
    }
    if (viewId === 'rooms') renderFullRoomGrid();
    if (viewId === 'calendar') renderCalendar();
    if (viewId === 'equipment') renderEquipmentGrid();
    if (viewId === 'bookings-list') {
        populateBookingsRoomSelector();
        renderBookingsList();
    }
    if (viewId === 'reports') {
        populateReportRoomSelector();
        updateReportFilter('all');
    }
    if (viewId === 'settings') syncSettingsUI();
    if (viewId === 'blacklist') window.renderBlacklistTable();
}

// Logo and Branding Logic
window.handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2 ميجابايت.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        state.appSettings.logo = e.target.result;
        saveState();
        applySystemBranding();
        syncSettingsUI();
        alert('✅ تم رفع وتطبيق الشعار المخصص بنجاح!');
    };
    reader.readAsDataURL(file);
};

window.resetLogo = () => {
    if (confirm('هل أنت متأكد من حذف الشعار المخصص والعودة للافتراضي؟')) {
        state.appSettings.logo = null;
        saveState();
        applySystemBranding();
        syncSettingsUI();
    }
};

window.handleStampUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.appSettings.stamp = e.target.result;
            saveState();
            syncSettingsUI();
            showToast('تم رفع الختم الرسمي بنجاح.', 'success');
        };
        reader.readAsDataURL(file);
    }
};

window.resetStamp = () => {
    if (confirm('هل أنت متأكد من حذف الختم الرسمي؟')) {
        state.appSettings.stamp = null;
        saveState();
        syncSettingsUI();
        showToast('تم حذف الختم بنجاح.', 'info');
    }
};

function updateStampPreview() {
    const previewImg = document.getElementById('stamp-preview-img');
    const noStampText = document.getElementById('no-stamp-text');
    if (!previewImg || !noStampText) return;

    if (state.appSettings.stamp) {
        previewImg.src = state.appSettings.stamp;
        previewImg.style.display = 'block';
        noStampText.style.display = 'none';
    } else {
        previewImg.style.display = 'none';
        noStampText.style.display = 'block';
    }
}
window.saveGeneralSettings = () => {
    const orgName = document.getElementById('setting-org-name').value;
    const deptName = document.getElementById('setting-dept-name').value;
    const contactNumber = document.getElementById('setting-contact-number').value;
    
    if (!orgName || !deptName || !contactNumber) {
        showToast('يرجى إكمال كافة البيانات قبل الحفظ.', 'error');
        return;
    }

    state.appSettings.orgName = orgName;
    state.appSettings.deptName = deptName;
    state.appSettings.contactNumber = contactNumber;
    saveState();
    applySystemBranding();
    showToast('تم حفظ التعديلات والبيانات المؤسسية بنجاح!', 'success');
};

// Premium Toast System
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 12px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 450px;
        transform: translateX(-50px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        border-right: 4px solid rgba(0,0,0,0.2);
    `;

    const icon = document.createElement('i');
    icon.className = `fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`;
    
    const text = document.createElement('span');
    text.textContent = message;
    text.style.flexGrow = '1';

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);

    // Auto remove
    setTimeout(() => {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// Global Search Implementation
window.handleGlobalSearch = (query) => {
    if (!query) {
        switchView(state.currentView); // Reset view
        return;
    }

    const q = query.toLowerCase();
    
    // Filter rooms or bookings based on current view
    if (state.currentView === 'rooms') {
        const filteredRooms = state.rooms.filter(r => r.name.toLowerCase().includes(q));
        renderFilteredRooms(filteredRooms);
    } else if (state.currentView === 'bookings-list' || state.currentView === 'dashboard') {
        // Find bookings matching query
        const filteredBookings = state.bookings.filter(b => 
            b.title.toLowerCase().includes(q) || 
            b.entityName.toLowerCase().includes(q) ||
            b.coordName.toLowerCase().includes(q)
        );
        
        if (state.currentView === 'dashboard') {
            renderFilteredAgenda(filteredBookings);
        } else {
            renderFilteredBookings(filteredBookings);
        }
    }
};

function renderFilteredRooms(rooms) {
    const container = document.getElementById('rooms-full-grid');
    if (!container) return;
    renderRoomListToContainer(rooms, container);
}

function renderFilteredAgenda(bookings) {
    const container = document.getElementById('daily-agenda-container');
    if (!container) return;
    renderAgendaListToContainer(bookings, container, true);
}

function applySystemBranding() {
    const logoBase64 = state.appSettings.logo;
    const orgName = state.appSettings.orgName || 'إدارة التعليم بمنطقة عسير';
    const deptName = state.appSettings.deptName || 'قسم الاتصال المؤسسي';
    const contactNumber = state.appSettings.contactNumber || '0582233500 - 0590504047';

    // 1. Dashboard / Header UI
    const headerLogoContainer = document.getElementById('system-header-logo-container');
    const previewImg = document.getElementById('logo-preview-img');
    const noLogoText = document.getElementById('no-logo-text');
    
    if (logoBase64) {
        if (headerLogoContainer) {
            headerLogoContainer.innerHTML = `<img src="${logoBase64}" style="max-height: 100%; border-radius: 5px; filter: brightness(0) invert(1);">`;
        }
        if (previewImg) {
            previewImg.src = logoBase64;
            previewImg.style.display = 'block';
            if (noLogoText) noLogoText.style.display = 'none';
        }
    } else {
        if (headerLogoContainer) headerLogoContainer.innerHTML = '';
        if (previewImg) {
            previewImg.src = '';
            previewImg.style.display = 'none';
            if (noLogoText) noLogoText.style.display = 'block';
        }
    }

    // 2. Apply to ALL Print Templates and UI Slots
    const templates = ['booking-request-print-template', 'all-bookings-print-template', 'calendar-print-template', 'short-report-print-template', 'event-notification-print-template', 'event-cancellation-print-template', 'blacklist-print-template', 'single-ban-print-template'];
    
    // Update Org/Dept Names everywhere (UI and Templates)
    document.querySelectorAll('.dynamic-org-name').forEach(el => el.textContent = orgName);
    document.querySelectorAll('.dynamic-dept-name').forEach(el => el.textContent = deptName);
    document.querySelectorAll('.dynamic-contact-number').forEach(el => el.textContent = contactNumber);

    templates.forEach(tid => {
        const t = document.getElementById(tid);
        if (!t) return;

        // Update Logo
        const lcs = t.querySelectorAll('.dynamic-print-logo-container');
        lcs.forEach(el => {
            if (logoBase64) {
                el.innerHTML = `<img src="${logoBase64}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
            } else {
                el.innerHTML = '<div style="width: 80px; height: 80px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: #aaa;">شعار</div>';
            }
        });

        // Update Stamp (Special handling for templates that have stamp containers)
        const stampImg = t.querySelector('#req-stamp-img');
        const stampPlace = t.querySelector('#stamp-placeholder');
        if (stampImg && stampPlace) {
            if (state.appSettings.stamp) {
                stampImg.src = state.appSettings.stamp;
                stampImg.style.display = 'block';
                stampPlace.style.display = 'none';
            } else {
                stampImg.style.display = 'none';
                stampPlace.style.display = 'block';
            }
        }
    });
}

function syncSettingsUI() {
    const orgInput = document.getElementById('setting-org-name');
    const deptInput = document.getElementById('setting-dept-name');
    const contactInput = document.getElementById('setting-contact-number');
    if (orgInput) orgInput.value = state.appSettings.orgName || '';
    if (deptInput) deptInput.value = state.appSettings.deptName || '';
    if (contactInput) contactInput.value = state.appSettings.contactNumber || '';
    updateStampPreview();
}

// Dashboard Rendering
function renderDashboard() {
    renderStats();
    renderMiniRoomGrid();
    renderDailyAgenda();
    
    const debugEl = document.getElementById('debug-info');
    if (debugEl) {
        debugEl.textContent = `B:${state.bookings.length} | R:${state.rooms.length}`;
        debugEl.style.display = 'block';
    }
}

function renderAgendaListToContainer(bookings, container, isSearch = false) {
    if (bookings.length === 0) {
        container.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); opacity: 0.6; padding: 40px 0;">
                <i class="fas ${isSearch ? 'fa-search' : 'fa-calendar-day'}" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p>${isSearch ? 'لا يوجد نتائج مطابقة للبحث' : 'لا يوجد فعاليات مجدولة لليوم'}</p>
                ${!isSearch ? '<button class="btn-text" style="margin-top: 10px;" onclick="openRoomModal()">+ إضافة حجز</button>' : ''}
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="agenda-list" style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 5px;">
            ${bookings.map(book => {
                const room = state.rooms.find(r => r.id === book.roomId);
                const statusColor = book.status === 'confirmed' ? 'var(--accent)' : book.status === 'executed' ? '#6366f1' : book.status === 'pending' ? 'var(--warning)' : book.status === 'maintenance' ? '#f97316' : 'var(--danger)';
                return `
                    <div class="agenda-item" onclick="openViewModal(${book.id})" style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: 15px; display: flex; align-items: center; gap: 15px; border-right: 4px solid ${statusColor}; animation: slideInRight 0.4s ease; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.transform='translateX(-5px)'; this.style.background='rgba(255,255,255,0.06)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)';" onmouseout="this.style.transform='none'; this.style.background='rgba(255,255,255,0.03)'; this.style.boxShadow='none';">
                        <div class="agenda-time" style="text-align: center; min-width: 85px; border-left: 1px solid var(--glass-border); padding-left: 15px;">
                            <div style="font-size: 0.75rem; color: var(--primary-light); font-weight: 600;">${book.date}</div>
                            <div style="font-weight: 700; font-size: 1.1rem;">${formatTime12h(book.time)}</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted);">${book.timePeriod}</div>
                        </div>
                        <div class="agenda-info" style="flex-grow: 1;">
                            <h4 style="margin-bottom: 4px; font-size: 0.95rem;">${book.title}</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted);"><i class="fas fa-location-dot"></i> ${room ? room.name : 'قاعة غير معروفة'}</p>
                        </div>
                        <div class="agenda-status" style="font-size: 0.7rem; padding: 4px 10px; border-radius: 20px; background: ${statusColor}1A; color: ${statusColor}; font-weight: 600;">
                            ${book.status === 'confirmed' ? 'مؤكد' : book.status === 'executed' ? 'تم التنفيذ' : book.status === 'pending' ? 'قيد الانتظار' : book.status === 'maintenance' ? 'صيانة' : 'ملغي'}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderDailyAgenda() {
    const container = document.getElementById('daily-agenda-container');
    if (!container) return;

    const now = new Date();
    now.setHours(0,0,0,0);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Update label
    const label = document.getElementById('current-day-label');
    if (label) label.textContent = `(ابتداءً من اليوم)`;
    
    const titleEl = document.querySelector('.card-header h3');
    if (titleEl && titleEl.firstChild.textContent.includes('أجندة اليوم')) {
        titleEl.firstChild.textContent = 'الفعاليات القادمة ';
    }

    // Robust filter for today and future dates
    const upcomingBookings = state.bookings
        .filter(b => {
            if (!b.date) return false;
            // Handle both YYYY-MM-DD and DD/MM/YYYY
            let bDate;
            if (b.date.includes('-')) {
                bDate = new Date(b.date);
            } else if (b.date.includes('/')) {
                const parts = b.date.split('/');
                if (parts[0].length === 4) { // YYYY/MM/DD
                    bDate = new Date(parts[0], parts[1]-1, parts[2]);
                } else { // DD/MM/YYYY
                    bDate = new Date(parts[2], parts[1]-1, parts[0]);
                }
            } else {
                bDate = new Date(b.date);
            }
            bDate.setHours(0,0,0,0);
            return bDate >= now;
        })
        .sort((a, b) => {
            const dateA = a.date.includes('/') ? new Date(a.date.split('/').reverse().join('-')) : new Date(a.date);
            const dateB = b.date.includes('/') ? new Date(b.date.split('/').reverse().join('-')) : new Date(b.date);
            return dateA - dateB;
        })
        .slice(0, 25);

    if (upcomingBookings.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-muted); opacity: 0.6;">
                <i class="fas fa-calendar-day" style="font-size: 2.5rem; margin-bottom: 15px; display: block;"></i>
                <p>لا توجد فعاليات قادمة مجدولة حالياً</p>
                <button class="btn-text" style="margin-top: 10px;" onclick="renderAgendaListToContainer(state.bookings.slice(0, 5), container)">عرض آخر 5 حجوزات مسجلة</button>
            </div>
        `;
    } else {
        renderAgendaListToContainer(upcomingBookings, container);
    }
}

function renderStats() {
    const totalBookings = state.bookings.length;
    const confirmedBookings = state.bookings.filter(b => b.status === 'confirmed').length;
    const executedBookings = state.bookings.filter(b => b.status === 'executed').length;
    const pendingBookings = state.bookings.filter(b => b.status === 'pending').length;
    const roomCount = state.rooms.length;
    const equipCount = state.equipment.length;
    
    if (document.getElementById('stat-tasks')) {
        document.getElementById('stat-tasks').innerHTML = `
            ${confirmedBookings + executedBookings} <span style="font-size: 0.8rem; font-weight: 400; opacity: 0.7;">(و${pendingBookings} انتظار | ${executedBookings} تم تنفيذها)</span>
        `;
    }
    if (document.getElementById('stat-rooms')) document.getElementById('stat-rooms').textContent = `${roomCount} مقر ${roomCount > 0 ? '' : '(فارغ)'}`;
    if (document.getElementById('stat-equipment')) document.getElementById('stat-equipment').textContent = `${equipCount} نوع معدات`;
}

function renderMiniRoomGrid() {
    if (!roomGridMini) return;

    roomGridMini.innerHTML = state.rooms.map(room => `
        <div class="room-node-mini ${room.status}" style="position: relative; cursor: pointer;" onclick="${room.status === 'available' ? `bookRoom(${room.id})` : ''}">
            <i class="fas ${room.icon}"></i>
            <span>${room.name}</span>
            <div class="mini-room-overlay">
                ${room.status === 'available' ? '<i class="fas fa-plus"></i> حجز' : '<i class="fas fa-lock"></i>'}
            </div>
            <div class="status-dot"></div>
        </div>
    `).join('');
}

function renderRoomListToContainer(rooms, container) {
    container.innerHTML = rooms.map(room => `
        <div class="room-card-full ${room.status}">
            <div class="delete-btn" onclick="deleteRoom(${room.id})" title="حذف القاعة">
                <i class="fas fa-trash"></i>
            </div>
            <div class="edit-btn" onclick="editResource('room', ${room.id})" title="تعديل القاعة" style="position: absolute; top: 10px; left: 50px; background: rgba(99, 102, 241, 0.1); color: var(--primary-light); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(99, 102, 241, 0.2); z-index: 5;">
                <i class="fas fa-edit"></i>
            </div>
            <div class="room-header">
                <div class="room-icon-large">
                    <i class="fas ${room.icon}"></i>
                </div>
                <span class="room-status-badge">
                    ${room.status === 'available' ? 'متوفرة' : 'مشغولة'}
                </span>
            </div>
            <div class="room-details">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                    <span style="font-size: 0.7rem; background: var(--glass-bg); padding: 2px 6px; border-radius: 4px; color: var(--primary-light);">
                        ${room.type === 'theater' ? 'مسرح' : room.type === 'office' ? 'مكتب' : room.type === 'council' ? 'مجلس' : 'قاعة'}
                    </span>
                </div>
                <h3>${room.name}</h3>
                <p>السعة: ${room.status === 'available' ? '15-20 شخص' : 'قيد الاستخدام حالياً'}</p>
            </div>
            <div class="room-actions">
                <button class="btn-primary" onclick="openBookingModal(${room.id})">
                    حجز الموعد
                </button>
                <button class="btn-secondary" onclick="viewRoomDetails(${room.id})">التفاصيل</button>
            </div>
        </div>
    `).join('');
}

function renderFullRoomGrid() {
    const container = document.getElementById('rooms-full-grid');
    if (!container) return;
    renderRoomListToContainer(state.rooms, container);
}

function renderEquipmentGrid() {
    const container = document.getElementById('equipment-full-grid');
    if (!container) return;

    if (!state.equipment || state.equipment.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-muted);">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 20px; display: block; opacity: 0.3;"></i>
                <p>لا توجد معدات مسجلة حالياً</p>
                <button class="btn-secondary" style="margin-top: 15px;" onclick="openResourceModal('equipment')">أضف معدات الآن</button>
            </div>
        `;
        return;
    }

    container.innerHTML = state.equipment.map(item => `
        <div class="equipment-card">
            <div class="delete-btn" onclick="deleteEquipment(${item.id})" title="حذف المعدات">
                <i class="fas fa-trash"></i>
            </div>
            <div class="edit-btn" onclick="editResource('equipment', ${item.id})" title="تعديل المعدات" style="position: absolute; top: 10px; left: 50px; background: rgba(99, 102, 241, 0.1); color: var(--primary-light); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid rgba(99, 102, 241, 0.2); z-index: 5;">
                <i class="fas fa-edit"></i>
            </div>
            <div class="eq-header">
                <div class="eq-icon">
                    <i class="fas ${item.icon}"></i>
                </div>
                <span class="eq-status ${item.status}">
                    ${item.status === 'available' ? 'متوفر' : 'صيانة'}
                </span>
            </div>
            <div class="eq-info">
                <h3>${item.name}</h3>
                <p>الحالة التقنية: ممتازة</p>
            </div>
            <div class="eq-footer">
                <div class="eq-quantity">الكمية: ${item.quantity}</div>
                <button class="btn-text" onclick="deleteResource('equipment', ${item.id})" title="حذف المعدات"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function renderBookingsTableToContainer(bookings, container) {
    if (bookings.length === 0) {
        container.innerHTML = `
            <div style="padding: 60px 40px; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 15px;">
                <i class="fas fa-folder-open" style="font-size: 3.5rem; opacity: 0.3;"></i>
                <p style="font-size: 1.1rem;">لا توجد سجلات مطابقة في قاعدة البيانات</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table class="booking-table">
            <thead>
                <tr>
                    <th>المقر</th>
                    <th>مسمى الفعالية</th>
                    <th>تاريخ التنفيذ</th>
                    <th>وقت البدء</th>
                    <th>الحالة</th>
                    <th>خيارات الإتقان والطباعة</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(book => {
                    const room = state.rooms.find(r => r.id === book.roomId);
                    const hasEval = book.positives || book.negatives || book.recommendations;
                    const statusColor = book.status === 'confirmed' ? 'var(--accent)' : book.status === 'executed' ? '#6366f1' : book.status === 'pending' ? 'var(--warning)' : book.status === 'maintenance' ? '#f97316' : 'var(--danger)';
                    return `
                        <tr style="animation: fadeIn 0.3s ease;">
                            <td style="font-weight: 600; color: var(--primary-light);">${room ? room.name : 'قاعة محذوفة'}</td>
                            <td>${book.title}</td>
                            <td>${book.date}</td>
                            <td>${formatTime12h(book.time)} ${book.timePeriod}</td>
                            <td>
                                <span style="font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; background: ${statusColor}1A; color: ${statusColor}; font-weight: 600; border: 1px solid ${statusColor}33;">
                                    ${book.status === 'confirmed' ? 'مؤكد' : book.status === 'executed' ? 'تم التنفيذ' : book.status === 'pending' ? 'انتظار' : book.status === 'maintenance' ? 'صيانة' : 'ملغي'}
                                </span>
                            </td>
                            <td>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <button class="booking-action-btn action-edit" data-tooltip="تعديل الحجز" onclick="event.stopPropagation(); editBooking(${book.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="booking-action-btn action-letter" data-tooltip="خطاب الفعالية" onclick="event.stopPropagation(); printEventNotification(${book.id})">
                                        <i class="fas fa-envelope-open-text" style="color: #6366f1;"></i>
                                    </button>
                                    <button class="booking-action-btn action-cancel-letter" data-tooltip="خطاب إلغاء الفعالية" onclick="event.stopPropagation(); printEventCancellation(${book.id})">
                                        <i class="fas fa-calendar-times" style="color: #ef4444;"></i>
                                    </button>
                                    <button class="booking-action-btn" data-tooltip="${book.status === 'cancelled' ? 'إرسال إشعار إلغاء واتساب' : 'إرسال تأكيد واتساب'}" onclick="event.stopPropagation(); ${book.status === 'cancelled' ? `sendWhatsAppCancellation(${book.id})` : `sendWhatsAppConfirmation(${book.id})`}" style="border-color: rgba(37, 211, 102, 0.3);">
                                        <i class="fab fa-whatsapp" style="color: #25D366;"></i>
                                    </button>
                                    <button class="booking-action-btn action-eval" data-tooltip="التقييم والاتقان" onclick="event.stopPropagation(); openViewModal(${book.id})">
                                        <i class="fas fa-star" style="color: ${hasEval ? '#fbbf24' : 'inherit'};"></i>
                                    </button>
                                    <button class="booking-action-btn action-pdf" data-tooltip="طباعة الطلب" onclick="event.stopPropagation(); printBookingRequest(${book.id})">
                                        <i class="fas fa-file-pdf"></i>
                                    </button>
                                    <button class="booking-action-btn action-rpt" data-tooltip="تقرير الإتقان" onclick="event.stopPropagation(); printAchievementDirectly(${book.id})">
                                        <i class="fas fa-certificate"></i>
                                    </button>
                                    <button class="booking-action-btn action-ban" data-tooltip="حظر وإدراج في القائمة السوداء" onclick="event.stopPropagation(); window.openAddBlacklistModalFromBooking(${book.id})">
                                        <i class="fas fa-user-slash"></i>
                                    </button>
                                    <button class="booking-action-btn action-del" data-tooltip="حذف نهائي" onclick="event.stopPropagation(); deleteBooking(${book.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

window.handleBookingsSort = (criteria) => {
    state.bookingsSortCriteria = criteria;
    saveState();
    renderBookingsList();
};

function sortBookingsArray(bookings, criteria) {
    let sorted = [...bookings];
    const weights = { 'pending': 1, 'confirmed': 2, 'executed': 3, 'cancelled': 4, 'maintenance': 5 };

    if (criteria === 'priority') {
        sorted.sort((a, b) => {
            const weightA = weights[a.status] || 99;
            const weightB = weights[b.status] || 99;
            if (weightA !== weightB) return weightA - weightB;
            return new Date(a.date) - new Date(b.date);
        });
    } else if (criteria === 'date-desc') {
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (criteria === 'date-asc') {
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (criteria === 'title') {
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    } else if (criteria === 'entity') {
        sorted.sort((a, b) => (a.entityName || '').localeCompare(b.entityName || '', 'ar'));
    } else if (criteria === 'room') {
        sorted.sort((a, b) => {
            const roomA = state.rooms.find(r => r.id === a.roomId)?.name || '';
            const roomB = state.rooms.find(r => r.id === b.roomId)?.name || '';
            return roomA.localeCompare(roomB, 'ar');
        });
    } else if (criteria === 'status') {
        sorted.sort((a, b) => a.status.localeCompare(b.status, 'ar'));
    }
    return sorted;
}


function getFilteredBookings() {
    let filtered = [...state.bookings];
    
    // Sync custom date inputs with state in case change event hasn't fired yet
    const startInput = document.getElementById('bookings-start-date');
    const endInput = document.getElementById('bookings-end-date');
    if (startInput) state.bookingsStartDate = startInput.value;
    if (endInput) state.bookingsEndDate = endInput.value;
    
    // 1. Status Filter
    const statusFilter = state.bookingsStatusFilter || 'all';
    if (statusFilter !== 'all') {
        filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    // 2. Date Filter
    const dateFilter = state.bookingsDateFilter || 'all';
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (dateFilter === 'today') {
        const todayStr = today.toISOString().split('T')[0];
        filtered = filtered.filter(b => b.date === todayStr);
    } else if (dateFilter === 'week') {
        // Current week (Sunday to Saturday)
        const currentDay = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        filtered = filtered.filter(b => {
            if (!b.date) return false;
            const bDate = new Date(b.date);
            bDate.setHours(0,0,0,0);
            return bDate >= startOfWeek && bDate <= endOfWeek;
        });
    } else if (dateFilter === 'next-week') {
        // Next week (Sunday to Saturday)
        const currentDay = today.getDay();
        const startOfNextWeek = new Date(today);
        startOfNextWeek.setDate(today.getDate() - currentDay + 7);
        const endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
        
        filtered = filtered.filter(b => {
            if (!b.date) return false;
            const bDate = new Date(b.date);
            bDate.setHours(0,0,0,0);
            return bDate >= startOfNextWeek && bDate <= endOfNextWeek;
        });
    } else if (dateFilter === 'month') {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        filtered = filtered.filter(b => {
            if (!b.date) return false;
            const bDate = new Date(b.date);
            return bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear;
        });
    } else if (dateFilter === 'custom') {
        const startDateStr = state.bookingsStartDate || '';
        const endDateStr = state.bookingsEndDate || '';
        if (startDateStr) {
            const startDate = new Date(startDateStr);
            startDate.setHours(0,0,0,0);
            filtered = filtered.filter(b => {
                if (!b.date) return false;
                const bDate = new Date(b.date);
                bDate.setHours(0,0,0,0);
                return bDate >= startDate;
            });
        }
        if (endDateStr) {
            const endDate = new Date(endDateStr);
            endDate.setHours(0,0,0,0);
            filtered = filtered.filter(b => {
                if (!b.date) return false;
                const bDate = new Date(b.date);
                bDate.setHours(0,0,0,0);
                return bDate <= endDate;
            });
        }
    }
    
    // 3. Room Filter
    const roomFilter = state.bookingsRoomFilter || 'all';
    if (roomFilter !== 'all') {
        filtered = filtered.filter(b => String(b.roomId) === String(roomFilter));
    }
    
    return filtered;
}

function renderBookingsList() {
    const container = document.getElementById('bookings-table-container');
    if (!container) return;

    const sortSelect = document.getElementById('bookings-sort-select');
    if (sortSelect) sortSelect.value = state.bookingsSortCriteria || 'priority';

    const statusFilterSelect = document.getElementById('bookings-status-filter');
    if (statusFilterSelect) statusFilterSelect.value = state.bookingsStatusFilter || 'all';

    const roomFilterSelect = document.getElementById('bookings-room-filter');
    if (roomFilterSelect) roomFilterSelect.value = state.bookingsRoomFilter || 'all';

    const dateFilterSelect = document.getElementById('bookings-date-filter');
    if (dateFilterSelect) dateFilterSelect.value = state.bookingsDateFilter || 'all';

    const customRangeContainer = document.getElementById('bookings-custom-range-container');
    if (customRangeContainer) {
        customRangeContainer.style.display = (state.bookingsDateFilter === 'custom') ? 'flex' : 'none';
    }

    const startInput = document.getElementById('bookings-start-date');
    if (startInput) startInput.value = state.bookingsStartDate || '';

    const endInput = document.getElementById('bookings-end-date');
    if (endInput) endInput.value = state.bookingsEndDate || '';

    // Update print button label on render
    const printBtn = document.getElementById('print-bookings-btn');
    if (printBtn) {
        const status = state.bookingsStatusFilter || 'all';
        const dateF = state.bookingsDateFilter || 'all';
        
        const statusTexts = {
            all: 'كافة الحجوزات',
            confirmed: 'الحجوزات المعتمدة',
            pending: 'الحجوزات قيد الانتظار',
            executed: 'الحجوزات المنفذة',
            maintenance: 'جدول الصيانة',
            cancelled: 'الحجوزات الملغية'
        };
        
        const dateTexts = {
            all: '',
            today: ' اليوم',
            week: ' هذا الأسبوع',
            'next-week': ' الأسبوع القادم',
            month: ' هذا الشهر',
            custom: ' للفترة المحددة'
        };
        
        let printLabel = `طباعة ${statusTexts[status] || 'الحجوزات'}${dateTexts[dateF] || ''}`;
        const roomFilter = state.bookingsRoomFilter || 'all';
        if (roomFilter !== 'all') {
            const room = state.rooms.find(r => r.id === roomFilter);
            if (room) {
                printLabel += ` - مقر ${room.name}`;
            }
        }
        printBtn.innerHTML = `<i class="fas fa-print"></i> ${printLabel}`;
    }

    const filteredBookings = getFilteredBookings();
    const sortedBookings = sortBookingsArray(filteredBookings, state.bookingsSortCriteria || 'priority');
    renderBookingsTableToContainer(sortedBookings, container);
}

window.handleBookingsStatusFilter = (status) => {
    state.bookingsStatusFilter = status;
    saveState();
    renderBookingsList();
};

window.handleBookingsDateFilter = (value) => {
    state.bookingsDateFilter = value;
    const container = document.getElementById('bookings-custom-range-container');
    if (container) {
        container.style.display = value === 'custom' ? 'flex' : 'none';
    }
    saveState();
    renderBookingsList();
};

window.handleBookingsCustomDateChange = () => {
    const startInput = document.getElementById('bookings-start-date');
    const endInput = document.getElementById('bookings-end-date');
    if (startInput) state.bookingsStartDate = startInput.value;
    if (endInput) state.bookingsEndDate = endInput.value;
    saveState();
    renderBookingsList();
};

function populateBookingsRoomSelector() {
    const selector = document.getElementById('bookings-room-filter');
    if (!selector) return;
    
    const currentVal = selector.value;
    
    selector.innerHTML = '<option value="all" style="background: #1e293b;">كافة المقرات (الكل)</option>';
    state.rooms.forEach(room => {
        const opt = document.createElement('option');
        opt.value = room.id;
        opt.style.background = '#1e293b';
        opt.textContent = room.name;
        selector.appendChild(opt);
    });
    
    if (currentVal && Array.from(selector.options).some(opt => opt.value === currentVal)) {
        selector.value = currentVal;
    } else {
        selector.value = state.bookingsRoomFilter || 'all';
    }
}

window.handleBookingsRoomFilter = (roomId) => {
    state.bookingsRoomFilter = roomId;
    saveState();
    renderBookingsList();
};

function renderFilteredBookings(bookings) {
    const container = document.getElementById('bookings-table-container');
    if (!container) return;
    const sortedBookings = sortBookingsArray(bookings, state.bookingsSortCriteria || 'priority');
    renderBookingsTableToContainer(sortedBookings, container);
}

// New helper to bridge direct print from table to evaluation template
window.printAchievementDirectly = (id) => {
    const book = state.bookings.find(b => b.id === id);
    if (!book) return;

    // Fill the source template
    document.getElementById('rpt-title').textContent = book.title;
    document.getElementById('rpt-entity').textContent = book.entityName;
    document.getElementById('rpt-date').textContent = book.date;
    document.getElementById('rpt-positives').textContent = book.positives || 'لم يتم تسجيل إيجابيات';
    document.getElementById('rpt-negatives').textContent = book.negatives || 'لم يتم تسجيل ملاحظات سلبية';
    document.getElementById('rpt-recommendations').textContent = book.recommendations || 'لم يتم تسجيل توصيات';
    document.getElementById('rpt-today').textContent = new Date().toLocaleDateString('ar-SA-u-nu-latn');

    // Show in Premium Preview
    window.currentBookingForSharing = book;
    document.getElementById('paper-preview-container').innerHTML = document.getElementById('short-report-print-template').innerHTML;
    document.getElementById('report-preview-modal').classList.add('active');
};

function getHijriDateString(dateObj) {
    try {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(dateObj);
    } catch (e) {
        console.error("Hijri conversion error:", e);
        return "---";
    }
}

window.printEventNotification = (id) => {
    window.currentPrintContext = 'portrait';
    const book = state.bookings.find(b => b.id === id);
    if (!book) return;

    const room = state.rooms.find(r => r.id === book.roomId);
    
    // Formatting Hijri Date if not stored
    let hijriDate = book.dateHijri;
    if (!hijriDate || hijriDate.includes('---')) {
        hijriDate = getHijriDateString(new Date(book.date));
    }

    // Populate the notification template
    document.getElementById('notif-entity-name').textContent = book.entityName;
    document.getElementById('notif-event-title').textContent = book.title;
    document.getElementById('notif-room-name').textContent = room ? room.name : 'المقر المحدد';
    document.getElementById('notif-date-g').textContent = book.date;
    document.getElementById('notif-date-h').textContent = hijriDate;
    document.getElementById('notif-time').textContent = formatTime12h(book.time);
    document.getElementById('notif-period').textContent = book.timePeriod;

    // Clone to Paper Preview Container
    window.currentBookingForSharing = book;
    document.getElementById('paper-preview-container').innerHTML = document.getElementById('event-notification-print-template').innerHTML;

    // Show Preview Modal
    document.getElementById('report-preview-modal').classList.add('active');
};

window.printEventCancellation = (id) => {
    window.currentPrintContext = 'portrait';
    const book = state.bookings.find(b => b.id === id);
    if (!book) return;

    const room = state.rooms.find(r => r.id === book.roomId);
    
    // Formatting Hijri Date if not stored
    let hijriDate = book.dateHijri;
    if (!hijriDate || hijriDate.includes('---')) {
        hijriDate = getHijriDateString(new Date(book.date));
    }

    // Populate the cancellation template
    document.getElementById('cancel-entity-name').textContent = book.entityName;
    document.getElementById('cancel-event-title').textContent = book.title;
    document.getElementById('cancel-room-name').textContent = room ? room.name : 'المقر المحدد';
    document.getElementById('cancel-date-g').textContent = book.date;
    document.getElementById('cancel-date-h').textContent = hijriDate;
    document.getElementById('cancel-time').textContent = formatTime12h(book.time);
    document.getElementById('cancel-period').textContent = book.timePeriod;
    const cancelReasonEl = document.getElementById('cancel-reason');
    if (cancelReasonEl) {
        cancelReasonEl.textContent = book.cancellationReason || 'لم يتم تحديد سبب';
    }

    // Clone to Paper Preview Container
    window.currentBookingForSharing = book;
    document.getElementById('paper-preview-container').innerHTML = document.getElementById('event-cancellation-print-template').innerHTML;

    // Show Preview Modal
    document.getElementById('report-preview-modal').classList.add('active');
};

// Calendar Logic
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYearTitle = document.getElementById('calendar-month-year');
    if (!grid || !monthYearTitle) return;

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    
    // Set Header
    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    // Calculate Hijri Month for the middle of the month
    let hijriMonthYear = '';
    try {
        const middleDate = new Date(year, month, 15);
        hijriMonthYear = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {month: 'long', year: 'numeric'}).format(middleDate);
    } catch(e) {
        console.error("Hijri Header Error:", e);
    }

    monthYearTitle.textContent = `${arabicMonths[month]} ${year} / ${hijriMonthYear}`;

    // Get calendar math - Adjusted for Saturday start (Sat=0, Sun=1, etc.)
    const originalFirstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const firstDay = (originalFirstDay + 1) % 7; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Clear grid
    grid.innerHTML = '';

    // Today format for highlighting
    const trueToday = new Date();
    const todayStr = `${trueToday.getFullYear()}-${String(trueToday.getMonth() + 1).padStart(2, '0')}-${String(trueToday.getDate()).padStart(2, '0')}`;

    // Render empty slots 
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="calendar-day empty"></div>`;
    }

    // Render days
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const currentIterDate = new Date(year, month, i);

        // Fetch Hijri Day Number
        let hijriDay = '';
        try {
            hijriDay = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {day: 'numeric'}).format(currentIterDate);
        } catch(e) { 
            hijriDay = i; // Fallback to Gregorian day if Hijri fails
        }
        
        // Find matching data and determine period status
        const dayBookings = state.bookings.filter(b => b.date === dateStr);
        const hasMorning = dayBookings.some(b => b.timePeriod === 'صباحاً');
        const hasEvening = dayBookings.some(b => b.timePeriod === 'مساءً');
        
        const isToday = dateStr === todayStr ? 'today' : '';
        
        let eventsHtml = '';
        if (hasMorning && hasEvening) {
            eventsHtml = `<div class="cal-badge booking" style="background: linear-gradient(90deg, #4f46e5, #9333ea); color: white; justify-content: center;">
                <i class="fas fa-clock"></i> محجوز (الفترتين)
            </div>`;
        } else if (hasMorning) {
            eventsHtml = `<div class="cal-badge booking" style="background: rgba(79, 70, 229, 0.2); color: #818cf8; border-right: 4px solid #4f46e5;">
                <i class="fas fa-sun"></i> محجوز صباحي
            </div>`;
        } else if (hasEvening) {
            eventsHtml = `<div class="cal-badge booking" style="background: rgba(147, 51, 234, 0.2); color: #c084fc; border-right: 4px solid #9333ea;">
                <i class="fas fa-moon"></i> محجوز مسائي
            </div>`;
        }

        grid.innerHTML += `
            <div class="calendar-day ${isToday}" onclick="showDayDetails('${dateStr}')">
                <div class="calendar-day-header">
                    <span class="hijri-day-number">${hijriDay}</span>
                    <span class="calendar-day-number">${i}</span>
                </div>
                <div class="calendar-events">
                    ${eventsHtml}
                </div>
            </div>
        `;
    }
}

window.prevMonth = () => {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
};

window.nextMonth = () => {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
};

window.goToToday = () => {
    state.currentDate = new Date(); // Reset to OS current time
    renderCalendar();
};

// Action Handlers

window.bookRoom = (id) => {
    openBookingModal(id);
};

window.deleteRoom = (id) => {
    if (confirm('هل أنت متأكد من حذف هذه القاعة؟ سيؤدي ذلك لحذف حجوزاتها أيضاً.')) {
        state.rooms = state.rooms.filter(r => r.id !== id);
        state.bookings = state.bookings.filter(b => b.roomId !== id);
        saveState();
        renderFullRoomGrid();
        renderDashboard();
        renderCalendar();
        showToast('تم حذف القاعة وكافة حجوزاتها بنجاح', 'success');
    }
};

window.deleteEquipment = (id) => {
    if (confirm('هل أنت متأكد من حذف هذه المعدات؟')) {
        state.equipment = state.equipment.filter(e => e.id !== id);
        saveState();
        renderEquipmentGrid();
        showToast('تم حذف المعدة بنجاح', 'success');
    }
};

window.deleteBooking = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الحجز نهائياً؟')) {
        state.bookings = state.bookings.filter(b => b.id !== id);
        saveState();
        if (typeof closeDetailsModal === 'function') closeDetailsModal();
        if (state.currentView === 'bookings-list') renderBookingsList();
        if (state.currentView === 'calendar') renderCalendar();
        renderDashboard();
        showToast('تم حذف الحجز بنجاح', 'success');
    }
};

// Multi-Select Helpers
window.toggleMultiSelectDropdown = (e) => {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('multi-select-dropdown');
    if (dropdown) dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
};

window.toggleRoomSelection = (id, event) => {
    // If clicked on div, toggle the inner checkbox manually
    if (event && event.target.tagName.toLowerCase() !== 'input') {
        const checkbox = document.querySelector(`input[name="book-room-ids"][value="${id}"]`);
        if (checkbox) checkbox.checked = !checkbox.checked;
    }
    window.updateSelectedRoomsText();
};

window.updateSelectedRoomsText = () => {
    const checkboxes = Array.from(document.querySelectorAll('input[name="book-room-ids"]:checked'));
    const textSpan = document.getElementById('selected-rooms-text');
    if (!textSpan) return;
    
    if (checkboxes.length === 0) {
        textSpan.textContent = 'إضغط لاختيار المقر/المقرات...';
    } else if (checkboxes.length === 1) {
        const name = checkboxes[0].nextElementSibling.textContent;
        textSpan.textContent = name;
    } else {
        textSpan.textContent = `تم اختيار ${checkboxes.length} مقرات`;
    }
};

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('multi-select-dropdown');
    if (dropdown && dropdown.style.display === 'block') {
        if (!e.target.closest('.custom-multi-select')) {
            dropdown.style.display = 'none';
        }
    }
});

// Booking Specific Modal Logic
window.openBookingModal = (id = null) => {
    const modal = document.getElementById('booking-detail-modal');
    const container = document.getElementById('book-room-selector-container');
    const modalTitle = document.getElementById('booking-modal-title');
    const bookIdField = document.getElementById('book-id');

    if (modalTitle) modalTitle.textContent = 'نموذج طلب حجز فعالية';
    if (bookIdField) bookIdField.value = '';
    
    // Reset Other Event Type field
    const otherETInput = document.getElementById('book-other-event-type');
    const otherETWrapper = document.getElementById('other-event-type-input-wrapper');
    if (otherETInput) otherETInput.value = '';
    if (otherETWrapper) otherETWrapper.style.display = 'none';
    if (document.getElementById('event-type-other-checkbox')) document.getElementById('event-type-other-checkbox').checked = false;

    if (id) {
        const room = state.rooms.find(r => r.id === id);
        if (!room) return;
        document.getElementById('book-room-id').value = room.id;
        container.innerHTML = `<input type="text" id="book-room-name-display" value="${room.name}" readonly style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white;">`;
    } else {
        if (state.rooms.length === 0) {
            alert("يرجى إضافة قاعة أولاً لتتمكن من الحجز.");
            return;
        }
        document.getElementById('book-room-id').value = ''; 
        let options = [...state.rooms].sort((a, b) => b.id - a.id).map(r => `
            <div class="multi-select-item" onclick="window.toggleRoomSelection(${r.id}, event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <input type="checkbox" name="book-room-ids" value="${r.id}" onclick="event.stopPropagation(); window.updateSelectedRoomsText();" style="width: 16px; height: 16px; accent-color: var(--primary);">
                <span style="color: white; font-size: 0.9rem;">${r.name}</span>
            </div>
        `).join('');
        
        container.innerHTML = `
            <div class="custom-multi-select" style="position: relative; width: 100%;">
                <div onclick="window.toggleMultiSelectDropdown(event)" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--glass-border); background: #1e293b; color: white; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <span id="selected-rooms-text">إضغط لاختيار المقر/المقرات...</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div id="multi-select-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #1e293b; border: 1px solid var(--glass-border); border-radius: 8px; margin-top: 5px; z-index: 1000; max-height: 200px; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                    ${options}
                </div>
            </div>
        `;
    }
    modal.classList.add('active');

    // Pre-fill today's dates
    const now = new Date();
    const gregToday = now.toISOString().split('T')[0];
    document.getElementById('book-date').value = gregToday;

    // Intelligent Hijri calculation
    try {
        const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        document.getElementById('book-date-hijri').value = hijriFormatter.format(now);
    } catch (e) {
        console.warn('Hijri calculation failed', e);
    }

    // Add listener for live update when user changes date manually
    const dateInput = document.getElementById('book-date');
    if (dateInput) {
        dateInput.onchange = (e) => {
            const selectedDate = new Date(e.target.value);
            if (!isNaN(selectedDate)) {
                try {
                    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', {
                        day: 'numeric', month: 'long', year: 'numeric'
                    });
                    document.getElementById('book-date-hijri').value = formatter.format(selectedDate);
                } catch (err) {
                    console.warn('Hijri live update failed', err);
                }
            }
        };
    }
};

window.openMaintenanceFormModal = () => {
    const modal = document.getElementById('maintenance-form-modal');
    if (!modal) return;
    
    // Clear and set room options
    const roomSelect = document.getElementById('maint-room-id');
    if (roomSelect) {
        if (state.rooms.length === 0) {
            alert("يرجى إضافة قاعة أولاً لتتمكن من جدولة الصيانة.");
            return;
        }
        
        roomSelect.innerHTML = [...state.rooms].sort((a, b) => b.id - a.id).map(r => 
            `<option value="${r.id}">${r.name}</option>`
        ).join('');
    }
    
    // Reset form fields
    const form = document.getElementById('maintenance-form');
    if (form) {
        form.reset();
    }
    
    // Pre-fill today's date
    const maintDateInput = document.getElementById('maint-date');
    if (maintDateInput) {
        maintDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Reset hidden ID
    const maintIdField = document.getElementById('maint-id');
    if (maintIdField) maintIdField.value = '';
    
    modal.classList.add('active');
};

window.closeMaintenanceFormModal = () => {
    const modal = document.getElementById('maintenance-form-modal');
    if (modal) modal.classList.remove('active');
};

window.handleMaintenanceFormSubmit = (e) => {
    e.preventDefault();
    
    const roomId = parseInt(document.getElementById('maint-room-id').value);
    const maintType = document.getElementById('maint-type').value;
    const maintDate = document.getElementById('maint-date').value;
    const maintPeriod = document.querySelector('input[name="maint-period"]:checked').value;
    const maintPriority = document.getElementById('maint-priority').value;
    const maintTechnician = document.getElementById('maint-technician').value;
    const maintTechMobile = document.getElementById('maint-tech-mobile').value;
    const maintDesc = document.getElementById('maint-desc').value;
    
    const maintIdField = document.getElementById('maint-id');
    const isEdit = maintIdField && maintIdField.value !== '';
    const maintId = isEdit ? parseInt(maintIdField.value) : null;
    
    // Conflict Check
    const isConflict = state.bookings.some(b => 
        b.id !== maintId &&
        b.roomId === roomId && 
        b.date === maintDate && 
        (b.timePeriod === (maintPeriod === 'morning' ? 'صباحاً' : 'مساءً'))
    );
    
    if (isConflict) {
        const room = state.rooms.find(r => r.id === roomId);
        alert(`⚠️ تعارض: المقر "${room ? room.name : 'مجهول'}" لديه حجز أو أعمال صيانة مجدولة بالفعل في هذا التوقيت.`);
        return;
    }
    
    const typeTranslations = {
        audio: 'صيانة الصوتيات والأنظمة الصوتية',
        screens: 'صيانة شاشات العرض والبروجكتر',
        ac: 'صيانة التكييف والتهوية',
        electrical: 'صيانة الإضاءة والكهرباء',
        furniture: 'صيانة الأثاث والمقاعد والديكور',
        cleaning: 'أعمال نظافة وتهيئة عامة',
        other: 'أعمال صيانة وتجهيز أخرى'
    };
    const maintTypeName = typeTranslations[maintType] || 'أعمال صيانة عامة';
    const priorityText = maintPriority === 'urgent' ? '⚠️ عاجل جداً' : maintPriority === 'medium' ? 'متوسط' : 'عادي';
    
    const bookingData = {
        id: isEdit ? maintId : Date.now(),
        roomId: roomId,
        title: `صيانة: ${maintTypeName}`,
        entityType: 'management',
        entityName: 'إدارة الصيانة والتشغيل',
        coordName: maintTechnician,
        coordMobile: maintTechMobile,
        date: maintDate,
        dateHijri: getHijriDateString(new Date(maintDate)),
        time: maintPeriod === 'morning' ? '08:00' : '16:00',
        timePeriod: maintPeriod === 'morning' ? 'صباحاً' : 'مساءً',
        status: 'maintenance',
        duration: '4',
        audienceType: 'mixed',
        audienceCount: 0,
        actualCount: 0,
        eventTypes: ['other'],
        otherEventType: 'صيانة ومتابعة',
        vipGuest: `الأولوية: ${priorityText}`,
        activities: maintDesc,
        needs: [],
        otherNeedsText: ''
    };
    
    if (isEdit) {
        const idx = state.bookings.findIndex(b => b.id === maintId);
        if (idx !== -1) {
            state.bookings[idx] = bookingData;
        }
    } else {
        state.bookings.push(bookingData);
    }
    
    saveState();
    closeMaintenanceFormModal();
    if (state.currentView === 'calendar') renderCalendar();
    if (state.currentView === 'bookings-list') renderBookingsList();
    renderDashboard();
    
    showToast(isEdit ? 'تم تحديث طلب الصيانة بنجاح' : 'تم جدولة أعمال الصيانة وحظر المقر بنجاح', 'success');
};

window.closeBookingModal = () => {
    document.getElementById('booking-detail-modal').classList.remove('active');
    document.getElementById('booking-form').reset();
};

// Notification System
window.toggleNotificationDropdown = (e) => {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
};

function updateNotifications() {
    const badge = document.getElementById('notification-badge');
    const list = document.getElementById('notification-list');
    if (!badge || !list) return;

    const now = new Date();
    now.setHours(0,0,0,0);
    const twoDaysLater = new Date(now);
    twoDaysLater.setDate(now.getDate() + 2);

    const parseBookingDate = (dateStr) => {
        if (!dateStr) return null;
        let d;
        if (dateStr.includes('-')) {
            d = new Date(dateStr);
        } else if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts[0].length === 4) { // YYYY/MM/DD
                d = new Date(parts[0], parts[1]-1, parts[2]);
            } else { // DD/MM/YYYY
                d = new Date(parts[2], parts[1]-1, parts[0]);
            }
        } else {
            d = new Date(dateStr);
        }
        if (!d || isNaN(d.getTime())) return null;
        d.setHours(0,0,0,0);
        return d;
    };

    // 1. Upcoming Bookings (Today and Next 2 Days)
    const upcoming = state.bookings.filter(b => {
        const bDate = parseBookingDate(b.date);
        if (!bDate) return false;
        return bDate >= now && bDate <= twoDaysLater && b.status !== 'cancelled';
    });

    // 2. Past Unevaluated Bookings (Date before today, not cancelled, and no evaluation fields filled)
    const unevaluated = state.bookings.filter(b => {
        const bDate = parseBookingDate(b.date);
        if (!bDate) return false;
        const isPast = bDate < now;
        const hasNoEvaluation = !b.positives && !b.negatives && !b.recommendations;
        return isPast && b.status !== 'cancelled' && hasNoEvaluation;
    });

    const totalCount = upcoming.length + unevaluated.length;

    let html = '';
    
    if (upcoming.length > 0) {
        html += `<div style="font-size: 0.75rem; color: var(--primary-light); font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid var(--glass-border); padding-bottom: 3px;"><i class="fas fa-calendar-day"></i> فعاليات قادمة</div>`;
        html += upcoming.map(b => `
            <div class="notification-item" onclick="openViewModal(${b.id})" style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; border-right: 3px solid var(--primary); cursor: pointer; transition: background 0.2s; margin-bottom: 8px;">
                <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 3px; color: white;">${b.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">
                    <i class="fas fa-calendar-day"></i> ${b.date} | <i class="fas fa-clock"></i> ${b.time}
                </div>
            </div>
        `).join('');
    }

    if (unevaluated.length > 0) {
        html += `<div style="font-size: 0.75rem; color: #fbbf24; font-weight: bold; margin-top: 10px; margin-bottom: 8px; border-bottom: 1px solid var(--glass-border); padding-bottom: 3px;"><i class="fas fa-exclamation-triangle"></i> فعاليات لم يتم تقييمها</div>`;
        html += unevaluated.map(b => `
            <div class="notification-item" onclick="openViewModal(${b.id})" style="padding: 10px; background: rgba(251,191,36,0.03); border-radius: 8px; border-right: 3px solid #fbbf24; cursor: pointer; transition: background 0.2s; margin-bottom: 8px; border: 1px solid rgba(251,191,36,0.1); border-right: 3px solid #fbbf24;">
                <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 3px; color: white;"><i class="fas fa-star" style="color: rgba(251,191,36,0.4); font-size: 0.75rem;"></i> ${b.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
                    <span><i class="fas fa-calendar-alt"></i> ${b.date}</span>
                    <span style="color: #fbbf24; font-size: 0.7rem; background: rgba(251,191,36,0.1); padding: 1px 6px; border-radius: 4px;">اضغط للتقييم</span>
                </div>
            </div>
        `).join('');
    }

    if (totalCount > 0) {
        badge.textContent = totalCount;
        badge.style.display = 'block';
        list.innerHTML = `<div style="max-height: 350px; overflow-y: auto; padding-left: 5px;">${html}</div>`;
    } else {
        badge.style.display = 'none';
        list.innerHTML = '<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 10px 0;">لا يوجد تنبيهات حالياً</p>';
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
    const notifyDropdown = document.getElementById('notification-dropdown');
    if (notifyDropdown) notifyDropdown.style.display = 'none';
    
    const sortDropdown = document.getElementById('multi-select-dropdown');
    if (sortDropdown) sortDropdown.style.display = 'none';
});

window.sendWhatsAppMessageFromForm = () => {
    const coordName = document.getElementById('book-coord-name').value || 'المنسق الكريم';
    const title = document.getElementById('book-event-title').value || 'غير محدد';
    const date = document.getElementById('book-date').value || '';
    const dateHijri = document.getElementById('book-date-hijri').value || '';
    const time = document.getElementById('book-time').value || '';
    
    // Get Time Period
    const timePeriodRadio = document.querySelector('input[name="time-period"]:checked');
    const timePeriod = timePeriodRadio ? (timePeriodRadio.value === 'morning' ? 'صباحاً' : 'مساءً') : '';

    // Get Rooms
    const fixedRoomId = parseInt(document.getElementById('book-room-id').value);
    const multiSelectCheckboxes = Array.from(document.querySelectorAll('input[name="book-room-ids"]:checked'));
    
    let roomNames = [];
    if (multiSelectCheckboxes.length > 0) {
        roomNames = multiSelectCheckboxes.map(cb => cb.nextElementSibling.textContent.trim());
    } else if (!isNaN(fixedRoomId)) {
        const room = state.rooms.find(r => r.id === fixedRoomId);
        if (room) roomNames.push(room.name);
    }
    const roomNameStr = roomNames.length > 0 ? roomNames.join('، ') : 'قاعة غير محددة';

    let mobile = document.getElementById('book-coord-mobile').value || '';
    if (!mobile) {
        alert('يرجى إدخال رقم الجوال أولاً لتتمكن من إرسال الرسالة.');
        return;
    }

    // Clean and format mobile number for WhatsApp
    mobile = mobile.replace(/[^\d]/g, '');
    if (mobile.startsWith('0')) {
        mobile = '966' + mobile.substring(1);
    } else if (!mobile.startsWith('966')) {
        mobile = '966' + mobile; 
    }

    // Get Status
    const statusVal = document.getElementById('book-status').value;
    const statusLabels = { confirmed: '✅ مؤكد', pending: '🟡 قيد الانتظار', executed: '🟢 تحت التنفيذ', cancelled: '🔴 ملغي', maintenance: '🟠 صيانة' };
    const statusLabel = statusLabels[statusVal] || '⚪ غير محدد';

    let statusHeading = 'تم تأكيد حجزكم في نظام إتقان بنجاح:';
    if (statusVal === 'pending') {
        statusHeading = 'حجزكم في نظام إتقان قيد الانتظار حالياً:';
    } else if (statusVal === 'executed') {
        statusHeading = 'تم تنفيذ حجزكم في نظام إتقان بنجاح:';
    } else if (statusVal === 'maintenance') {
        statusHeading = 'تمت جدولة صيانة للمقر في نظام إتقان:';
    } else if (statusVal === 'cancelled') {
        statusHeading = 'تم إلغاء حجزكم في نظام إتقان بنجاح:';
    }

    let message = '';
    if (statusVal === 'cancelled') {
        message = `*مرحباً أ/ ${coordName}*،
${statusHeading}

📌 *الفعالية:* ${title}
📌 *المقر:* ${roomNameStr}
📌 *التاريخ:* ${dateHijri} (${date})
📌 *الوقت:* ${time} (${timePeriod})
📌 *الحالة:* ${statusLabel}
📌 *ونرفق لكم استمارة الحجز PDF*

نتمنى لكم فعالية ناجحة وموفقة. في حالة الإلغاء يرجى التواصل مع ${state.appSettings.deptName || 'إدارة الاتصال المؤسسي'}.`;
    } else {
        message = `*مرحباً أ/ ${coordName}*،
${statusHeading}

📌 *الفعالية:* ${title}
📌 *المقر:* ${roomNameStr}
📌 *التاريخ:* ${dateHijri} (${date})
📌 *الوقت:* ${time} (${timePeriod})
📌 *الحالة:* ${statusLabel}
📌 *ونرفق لكم استمارة الحجز PDF*

نتمنى لكم فعالية ناجحة وموفقة.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${mobile}?text=${encodedMessage}`;
    
    try {
        require('electron').shell.openExternal(whatsappUrl);
    } catch(e) {
        window.open(whatsappUrl, '_blank');
    }
};

window.sendWhatsAppCancellation = (id) => {
    const book = state.bookings.find(b => b.id === id);
    if (!book) {
        showToast('لم يتم العثور على بيانات الحجز.', 'error');
        return;
    }

    const room = state.rooms.find(r => r.id === book.roomId);
    const roomName = room ? room.name : 'المقر المحدد';
    const coordName = book.coordName || 'المنسق الكريم';

    // Formatting Hijri Date
    let hijriDate = book.dateHijri;
    if (!hijriDate || hijriDate.includes('---')) {
        try {
            hijriDate = getHijriDateString(new Date(book.date));
        } catch(e) {
            hijriDate = '';
        }
    }

    let mobile = book.coordMobile || '';
    if (!mobile) {
        showToast('لا يوجد رقم جوال مسجل للمنسق. يرجى تعديل الحجز وإضافة رقم الجوال.', 'error');
        return;
    }

    // Clean and format mobile number for WhatsApp
    mobile = mobile.replace(/[^\d]/g, '');
    if (mobile.startsWith('0')) {
        mobile = '966' + mobile.substring(1);
    } else if (!mobile.startsWith('966')) {
        mobile = '966' + mobile;
    }

    const message = `*مرحباً أ/ ${coordName}*،
تم الغاء حجزكم في نظام إتقان بنجاح:

📌 *الفعالية:* ${book.title}
📌 *المقر:* ${roomName}
📌 *التاريخ:* ${hijriDate ? hijriDate + ' هـ' : ''} (${book.date})
📌 *الوقت:* ${book.time} (${book.timePeriod})
📌 *الحالة:* 🔴 ملغي
📌 *ونرفق لكم استمارة الحجز PDF*

نتمنى لكم فعالية ناجحة وموفقة. في حالة الالغاء يرجى التواصل مع ${state.appSettings.deptName || 'إدارة الاتصال المؤسسي'}.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${mobile}?text=${encodedMessage}`;
    
    try {
        require('electron').shell.openExternal(whatsappUrl);
    } catch(e) {
        window.open(whatsappUrl, '_blank');
    }
};

window.sendWhatsAppConfirmation = (id) => {
    const book = state.bookings.find(b => b.id === id);
    if (!book) {
        showToast('لم يتم العثور على بيانات الحجز.', 'error');
        return;
    }

    const room = state.rooms.find(r => r.id === book.roomId);
    const roomName = room ? room.name : 'المقر المحدد';
    const coordName = book.coordName || 'المنسق الكريم';

    // Formatting Hijri Date
    let hijriDate = book.dateHijri;
    if (!hijriDate || hijriDate.includes('---')) {
        try {
            hijriDate = getHijriDateString(new Date(book.date));
        } catch(e) {
            hijriDate = '';
        }
    }

    let mobile = book.coordMobile || '';
    if (!mobile) {
        showToast('لا يوجد رقم جوال مسجل للمنسق. يرجى تعديل الحجز وإضافة رقم الجوال.', 'error');
        return;
    }

    // Clean and format mobile number for WhatsApp
    mobile = mobile.replace(/[^\d]/g, '');
    if (mobile.startsWith('0')) {
        mobile = '966' + mobile.substring(1);
    } else if (!mobile.startsWith('966')) {
        mobile = '966' + mobile;
    }

    const statusLabels = { confirmed: '✅ مؤكد', pending: '🟡 قيد الانتظار', executed: '🟢 تحت التنفيذ', cancelled: '🔴 ملغي', maintenance: '🟠 صيانة' };
    const statusLabel = statusLabels[book.status] || '⚪ غير محدد';

    let statusHeading = 'تم تأكيد حجزكم في نظام إتقان بنجاح:';
    if (book.status === 'pending') {
        statusHeading = 'حجزكم في نظام إتقان قيد الانتظار حالياً:';
    } else if (book.status === 'executed') {
        statusHeading = 'تم تنفيذ حجزكم في نظام إتقان بنجاح:';
    } else if (book.status === 'maintenance') {
        statusHeading = 'تمت جدولة صيانة للمقر في نظام إتقان:';
    }

    const message = `*مرحباً أ/ ${coordName}*،
${statusHeading}

📌 *الفعالية:* ${book.title}
📌 *المقر:* ${roomName}
📌 *التاريخ:* ${hijriDate ? hijriDate + ' هـ' : ''} (${book.date})
📌 *الوقت:* ${book.time} (${book.timePeriod})
📌 *الحالة:* ${statusLabel}
📌 *ونرفق لكم استمارة الحجز PDF*

نتمنى لكم فعالية ناجحة وموفقة.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${mobile}?text=${encodedMessage}`;
    
    try {
        require('electron').shell.openExternal(whatsappUrl);
    } catch(e) {
        window.open(whatsappUrl, '_blank');
    }
};

window.handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Check Blacklist
    const entityName = document.getElementById('book-entity-name').value;
    const coordName = document.getElementById('book-coord-name').value;
    const blacklistMatch = window.checkBlacklist(entityName, coordName);
    if (blacklistMatch) {
        alert(`🚨 حظر نظامي: لا يمكن إتمام هذا الحجز!\n\nاسم الكيان/الشخص: "${blacklistMatch.value}"\nنوع الحظر: ${blacklistMatch.type === 'entity' ? 'حظر جهة كاملة' : 'حظر منسق محدد'}\nسبب الحظر المدرج في القائمة السوداء:\n[ ${blacklistMatch.reason} ]`);
        return;
    }
    
    // Get all selected room IDs
    let selectedRoomIds = [];
    const fixedRoomId = parseInt(document.getElementById('book-room-id').value);
    const multiSelectCheckboxes = Array.from(document.querySelectorAll('input[name="book-room-ids"]:checked'));
    
    // Priority: If checkboxes are checked (multi-select is active), use them. 
    // Otherwise fallback to fixed hidden ID (used when booking from calendar or editing).
    if (multiSelectCheckboxes.length > 0) {
        selectedRoomIds = multiSelectCheckboxes.map(cb => parseInt(cb.value));
    } else if (!isNaN(fixedRoomId)) {
        selectedRoomIds = [fixedRoomId];
    }

    if (selectedRoomIds.length === 0) {
        alert('يرجى اختيار قاعة واحدة على الأقل.');
        return;
    }
    
    const timePeriod = document.querySelector('input[name="time-period"]:checked').value;
    const bookingDate = document.getElementById('book-date').value;
    const bookingIdField = document.getElementById('book-id');
    const isEdit = bookingIdField && bookingIdField.value !== '';
    const bookingId = isEdit ? parseInt(bookingIdField.value) : null;

    // Validation loop
    for (const rid of selectedRoomIds) {
        const isConflict = state.bookings.some(b => 
            b.id !== bookingId &&
            b.roomId === rid && 
            b.date === bookingDate && 
            (b.timePeriod === (timePeriod === 'morning' ? 'صباحاً' : 'مساءً'))
        );

        if (isConflict) {
            const room = state.rooms.find(r => r.id === rid);
            alert(`⚠️ تعارض: المقر "${room ? room.name : 'مجهول'}" محجوز بالفعل في هذا التوقيت.`);
            return;
        }
    }

    // Process bookings
    let successCount = 0;
    let cancellationReason = '';
    const statusVal = document.getElementById('book-status').value;
    if (statusVal === 'cancelled') {
        const existingBook = isEdit ? state.bookings.find(b => b.id === bookingId) : null;
        if (existingBook && existingBook.status === 'cancelled') {
            cancellationReason = existingBook.cancellationReason || 'لم يتم تحديد سبب';
        } else {
            const promptReason = await window.showCancellationPrompt();
            if (promptReason === null) return; // User cancelled the submission
            cancellationReason = promptReason || 'لم يتم تحديد سبب';
        }
    }

    selectedRoomIds.forEach((rid, index) => {
        const newBookingData = {
            id: isEdit && index === 0 ? bookingId : Date.now() + index,
            roomId: rid,
            title: document.getElementById('book-event-title').value,
            entityType: document.getElementById('book-entity-type').value,
            entityName: document.getElementById('book-entity-name').value,
            coordName: document.getElementById('book-coord-name').value,
            coordMobile: document.getElementById('book-coord-mobile').value,
            date: document.getElementById('book-date').value,
            dateHijri: document.getElementById('book-date-hijri').value,
            time: document.getElementById('book-time').value,
            timePeriod: timePeriod === 'morning' ? 'صباحاً' : 'مساءً',
            status: document.getElementById('book-status').value,
            showApproval: document.getElementById('book-show-approval').checked,
            duration: document.getElementById('book-duration').value,
            audienceType: document.getElementById('book-audience-type').value,
            audienceCount: parseInt(document.getElementById('book-audience-count').value) || 0,
            actualCount: parseInt(document.getElementById('book-actual-count').value) || 0,
            eventTypes: Array.from(document.querySelectorAll('input[name="event-type"]:checked')).map(cb => cb.value),
            otherEventType: document.getElementById('book-other-event-type').value,
            vipGuest: document.getElementById('book-vip-guest').value,
            activities: document.getElementById('book-activities').value,
            reason: document.getElementById('book-reason') ? document.getElementById('book-reason').value : '',
            needs: Array.from(document.querySelectorAll('input[name="need"]:checked')).map(cb => cb.value),
            otherNeedsText: document.getElementById('book-other-needs-text').value,
            cancellationReason: statusVal === 'cancelled' ? cancellationReason : ''
        };

        if (isEdit && index === 0) {
            const idx = state.bookings.findIndex(b => b.id === bookingId);
            if (idx !== -1) {
                newBookingData.positives = state.bookings[idx].positives;
                newBookingData.negatives = state.bookings[idx].negatives;
                newBookingData.recommendations = state.bookings[idx].recommendations;
                // Preserve cancellationReason if they didn't change status to cancelled just now
                if (statusVal === 'cancelled' && !cancellationReason) {
                    newBookingData.cancellationReason = state.bookings[idx].cancellationReason || 'لم يتم تحديد سبب';
                }
                state.bookings[idx] = newBookingData;
            }
        } else {
            state.bookings.push(newBookingData);
        }
        successCount++;
    });

    saveState();
    closeBookingModal();
    if (state.currentView === 'calendar') renderCalendar();
    if (state.currentView === 'bookings-list') renderBookingsList();
    renderDashboard();
    
    showToast(isEdit ? 'تم تحديث بيانات الحجز بنجاح' : `تم تسجيل الحجز لعدد (${successCount}) مقرات بنجاح`, 'success');
};

window.editBooking = (id) => {
    const book = state.bookings.find(b => b.id === id);
    if (!book) return;

    if (book.status === 'maintenance') {
        openMaintenanceFormModal();
        
        // Fill maintenance specific fields
        document.getElementById('maint-id').value = book.id;
        document.getElementById('maint-room-id').value = book.roomId;
        document.getElementById('maint-date').value = book.date;
        document.getElementById('maint-technician').value = book.coordName || 'فريق الصيانة والتشغيل';
        document.getElementById('maint-tech-mobile').value = book.coordMobile || '05XXXXXXXX';
        document.getElementById('maint-desc').value = book.activities || '';
        
        // Match period radio button
        const maintPeriodRadios = document.querySelectorAll('input[name="maint-period"]');
        maintPeriodRadios.forEach(r => {
            r.checked = (r.value === (book.timePeriod === 'صباحاً' ? 'morning' : 'evening'));
        });
        
        // Infer maintenance type
        const titleStr = book.title || '';
        const typeTranslationsInverse = {
            'صيانة الصوتيات والأنظمة الصوتية': 'audio',
            'صيانة شاشات العرض والبروجكتر': 'screens',
            'صيانة التكييف والتهوية': 'ac',
            'صيانة الإضاءة والكهرباء': 'electrical',
            'صيانة الأثاث والمقاعد والديكور': 'furniture',
            'أعمال نظافة وتهيئة عامة': 'cleaning',
            'أعمال صيانة وتجهيز أخرى': 'other'
        };
        let inferredType = 'other';
        for (const [key, val] of Object.entries(typeTranslationsInverse)) {
            if (titleStr.includes(key)) {
                inferredType = val;
                break;
            }
        }
        document.getElementById('maint-room-id').value = book.roomId; // safeguard
        document.getElementById('maint-type').value = inferredType;
        
        // Infer priority
        const priorityStr = book.vipGuest || '';
        let inferredPriority = 'normal';
        if (priorityStr.includes('عاجل')) inferredPriority = 'urgent';
        else if (priorityStr.includes('متوسط')) inferredPriority = 'medium';
        document.getElementById('maint-priority').value = inferredPriority;
        
        return; // Halt and exit standard booking edit
    }

    openBookingModal(book.roomId);
    
    // Fill the form
    document.getElementById('book-id').value = book.id;
    document.getElementById('book-event-title').value = book.title;
    document.getElementById('book-entity-type').value = book.entityType;
    document.getElementById('book-entity-name').value = book.entityName;
    document.getElementById('book-coord-name').value = book.coordName;
    document.getElementById('book-coord-mobile').value = book.coordMobile;
    document.getElementById('book-date').value = book.date;
    document.getElementById('book-date-hijri').value = book.dateHijri || '';
    document.getElementById('book-time').value = book.time;
    document.getElementById('book-duration').value = book.duration;
    document.getElementById('book-status').value = book.status || 'pending';
    document.getElementById('book-audience-type').value = book.audienceType;
    document.getElementById('book-audience-count').value = book.audienceCount;
    document.getElementById('book-actual-count').value = book.actualCount || 0;
    document.getElementById('book-vip-guest').value = book.vipGuest || '';
    document.getElementById('book-activities').value = book.activities || '';
    document.getElementById('book-other-needs-text').value = book.otherNeedsText || '';

    // Radios
    const timeRadios = document.querySelectorAll('input[name="time-period"]');
    timeRadios.forEach(r => {
        r.checked = (r.value === (book.timePeriod === 'صباحاً' ? 'morning' : 'evening'));
    });

    // Checkboxes
    document.querySelectorAll('input[name="event-type"]').forEach(cb => {
        cb.checked = book.eventTypes.includes(cb.value);
    });
    document.querySelectorAll('input[name="need"]').forEach(cb => {
        cb.checked = book.needs.includes(cb.value);
    });

    const otherETInput = document.getElementById('book-other-event-type');
    if (otherETInput) {
        otherETInput.value = book.otherEventType || '';
        window.toggleOtherEventTypeInput();
    }

    document.getElementById('booking-modal-title').textContent = 'تعديل بيانات الحجز الرسمي';
};

window.handlePDFImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        showToast('يرجى اختيار ملف PDF صالح.', 'error');
        return;
    }

    showToast('جاري تحليل ملف PDF واستخراج البيانات...', 'info');

    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Sort items by vertical position then horizontal to handle RTL/jumbled text
            const items = textContent.items.sort((a, b) => {
                if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
                    return b.transform[4] - a.transform[4]; // RTL: right to left
                }
                return b.transform[5] - a.transform[5]; // Top to bottom
            });

            const pageText = items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
        }

        console.log("--- PDF IMPORT DEBUG START ---");
        console.log("RAW TEXT EXTRACTED:");
        console.log(fullText);
        
        const data = parseBookingText(fullText);
        console.log("PARSED DATA:", data);
        
        fillBookingForm(data);
        console.log("--- PDF IMPORT DEBUG END ---");
        
        showToast('تمت محاولة استيراد البيانات. يرجى التأكد من دقة الخانات المعبأة.', 'success');
    } catch (error) {
        console.error("PDF Import Error:", error);
        showToast('حدث خطأ أثناء قراءة ملف PDF. قد يكون الملف محمياً أو بتنسيق غير مدعوم.', 'error');
    } finally {
        event.target.value = ''; 
    }
};

window.handleJSONImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        showToast('يرجى اختيار ملف JSON صالح.', 'error');
        return;
    }

    showToast('جاري استيراد البيانات من ملف JSON...', 'info');

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const rawData = JSON.parse(e.target.result);
            
            // Map JSON fields to internal format
            const mappedData = {
                entityName: rawData.entityName,
                coordName: rawData.coordName,
                coordMobile: rawData.coordMobile,
                entityType: rawData.entityType === 'dept' || rawData.entityType === 'sect' || rawData.entityType === 'unit' ? 'management' : rawData.entityType,
                title: rawData.eventTitle,
                vipGuest: rawData.vipGuest,
                duration: rawData.duration,
                audienceCount: rawData.audienceCount,
                date: rawData.date,
                time: rawData.startTime,
                timePeriod: rawData.period === 'morning' ? 'صباحاً' : 'مساءً',
                audienceType: rawData.audienceGender === 'boys' ? 'boys' : rawData.audienceGender === 'girls' ? 'girls' : 'mixed',
                eventTypes: rawData.eventTypes || [],
                activities: rawData.activities || '',
                reason: rawData.reason || rawData.bookingReason || '',
                needs: rawData.needs || [],
                otherEventType: rawData.otherEventType || ''
            };

            // Find Room IDs by name (supports array or single string)
            const venueSource = rawData.venueNames || (rawData.venueName ? [rawData.venueName] : []);
            if (venueSource.length > 0) {
                const roomIds = [];
                const missingVenues = [];
                venueSource.forEach(vName => {
                    const room = state.rooms.find(r => 
                        normalizeArabic(r.name).includes(normalizeArabic(vName)) || 
                        normalizeArabic(vName).includes(normalizeArabic(r.name))
                    );
                    if (room) {
                        if (!roomIds.includes(room.id)) roomIds.push(room.id);
                    } else {
                        missingVenues.push(vName);
                    }
                });

                if (roomIds.length > 0) {
                    mappedData.roomId = roomIds[0]; // For fallback
                    mappedData.roomIds = roomIds;   // For multi-select
                }
                
                if (missingVenues.length > 0) {
                    showToast(`⚠️ لم يتم العثور على: (${missingVenues.join('، ')}) في قائمة القاعات.`, 'warning');
                    if (roomIds.length > 0) {
                        showToast(`ℹ️ تم تحديد ${roomIds.length} مقرات أخرى بنجاح.`, 'info');
                    }
                } else if (roomIds.length > 1) {
                    showToast(`✅ تم التعرف على ${roomIds.length} مقرات وتحديدها تلقائياً.`, 'success');
                }
            }

            fillBookingForm(mappedData);
            renderDashboard();
            if (state.currentView === 'calendar') renderCalendar();
            showToast('✅ تم استيراد بيانات الحجز بنجاح!', 'success');
        } catch (error) {
            console.error("JSON Import Error:", error);
            showToast('حدث خطأ أثناء معالجة ملف JSON. الملف قد يكون تالفاً.', 'error');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
};

function normalizeArabic(text) {
    if (!text) return "";
    return text
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/[\u064B-\u0652]/g, '') // Remove tashkeel
        .trim();
}

function parseBookingText(text) {
    const data = {
        eventTypes: [],
        needs: [],
        roomId: null
    };

    const normalizedFullText = normalizeArabic(text);
    console.log("Normalized Text for Matching:", normalizedFullText);

    // Advanced extractor that looks for a label and finds the most likely value nearby
    const smartExtract = (labels) => {
        for (const label of labels) {
            const normalizedLabel = normalizeArabic(label);
            // Look for label in normalized text, then find corresponding part in original text
            const index = normalizedFullText.indexOf(normalizedLabel);
            if (index !== -1) {
                // Get text after the label (approx 100 chars)
                const afterText = text.substring(index + label.length).split('\n')[0];
                const cleanValue = afterText.replace(/^[:：\s-]+/, '').trim();
                if (cleanValue.length > 1) return cleanValue;
            }
        }
        return null;
    };

    // Mapping based on the provided form text
    data.entityName = smartExtract(['اسم الجهة', 'الجهة المستفيدة', 'الجهة']);
    data.coordName = smartExtract(['مسؤول التنسيق', 'المنسق']);
    data.coordMobile = smartExtract(['رقم الجوال', 'الجوال', 'هاتف']);
    data.eventTitle = smartExtract(['مسمى الفعالية', 'اسم الفعالية', 'عنوان الفعالية']);
    data.vipGuest = smartExtract(['الضيف / الراعي', 'الضيف', 'الراعي']);
    data.duration = smartExtract(['مدة الفعالية']);
    data.audienceCount = smartExtract(['العدد المتوقع', 'العدد الكلي', 'عدد الحضور']);
    data.reason = smartExtract(['سبب الحجز', 'الهدف من الحجز', 'الهدف من الفعالية', 'سبب أو هدف الحجز']);
    
    // Date extraction - more robust
    const dateMatch = text.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/);
    if (dateMatch) data.date = dateMatch[1];

    // Room Matching (Fuzzy)
    const roomKeywords = {
        1: ['المركز العلمي', 'مركز علمي'],
        2: ['بيت الطالب', 'مجلس بيت'],
        3: ['التربيه الخاصة بنين', 'التربية الخاصة بنين', 'تربيه خاصه بنين'],
        4: ['التربيه الخاصة بنات', 'التربية الخاصة بنات', 'تربيه خاصه بنات'],
        5: ['مسرح الادارة', 'مسرح الادرة', 'مسرح ادارة', 'مسرح التعليم'],
        6: ['الشؤون التعليمية', 'شؤون تعليمية']
    };

    for (const [id, keywords] of Object.entries(roomKeywords)) {
        if (keywords.some(k => normalizedFullText.includes(normalizeArabic(k)))) {
            data.roomId = parseInt(id);
            break;
        }
    }

    // Audience Type
    if (normalizedFullText.includes('بنين')) data.audienceType = 'boys';
    else if (normalizedFullText.includes('بنات')) data.audienceType = 'girls';

    // Technical Requirements (Needs)
    const needsMap = {
        'screens': ['شاشات عرض', 'شاشات'],
        'audio': ['صوتيات', 'نظام صوت'],
        'mic': ['ميكروفونات', 'مايكات'],
        'pc': ['كمبيوتر', 'حاسب'],
        'photo': ['تصوير'],
        'org': ['تنظيم'],
        'ministry': ['ربط وزارة', 'ربط الوزارة'],
        'live': ['بث مباشر', 'لايف']
    };

    for (const [key, keywords] of Object.entries(needsMap)) {
        if (keywords.some(k => normalizedFullText.includes(normalizeArabic(k)))) {
            data.needs.push(key);
        }
    }

    return data;
}

function fillBookingForm(data) {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.value = val;
    };

    setVal('book-id', data.id);
    setVal('book-entity-name', data.entityName);
    setVal('book-coord-name', data.coordName);
    setVal('book-entity-type', data.entityType || 'internal');
    setVal('book-status', data.status || 'pending');
    
    if (data.coordMobile) {
        let mobile = data.coordMobile.replace(/[^\d]/g, '');
        if (mobile.length > 10) mobile = mobile.substring(0, 10);
        setVal('book-coord-mobile', mobile);
    }
    
    setVal('book-event-title', data.title || data.eventTitle);
    setVal('book-vip-guest', data.vipGuest);
    setVal('book-duration', data.duration);
    setVal('book-audience-count', data.audienceCount);
    setVal('book-actual-count', data.actualCount);
    setVal('book-activities', data.activities);
    setVal('book-time', data.time);
    setVal('book-other-event-type', data.otherEventType || '');
    
    if (data.otherEventType) {
        const checkbox = document.getElementById('event-type-other-checkbox');
        if (checkbox) checkbox.checked = true;
        if (typeof window.toggleOtherEventTypeInput === 'function') window.toggleOtherEventTypeInput();
    }
    
    // Time Period Radio
    const period = data.timePeriod === 'صباحاً' ? 'morning' : 'evening';
    const radio = document.querySelector(`input[name="time-period"][value="${period}"]`);
    if (radio) radio.checked = true;

    // Room Selection (Updated for custom multi-select)
    if (data.roomId) {
        const roomIdHidden = document.getElementById('book-room-id');
        if (roomIdHidden) roomIdHidden.value = data.roomId;

        const cb = document.querySelector(`input[name="book-room-ids"][value="${data.roomId}"]`);
        if (cb) cb.checked = true;
    }
    
    if (data.roomIds && Array.isArray(data.roomIds)) {
        data.roomIds.forEach(rid => {
            const cb = document.querySelector(`input[name="book-room-ids"][value="${rid}"]`);
            if (cb) cb.checked = true;
        });
    }
    
    window.updateSelectedRoomsText();

    // Date parsing
    if (data.date) {
        setVal('book-date', data.date);
        setVal('book-date-hijri', data.dateHijri);
        document.getElementById('book-date').dispatchEvent(new Event('change'));
    }

    if (data.audienceType) {
        setVal('book-audience-type', data.audienceType);
    }

    // Populate Checkboxes
    document.querySelectorAll('input[name="need"]').forEach(cb => {
        cb.checked = data.needs && data.needs.includes(cb.value);
    });
    document.querySelectorAll('input[name="event-type"]').forEach(cb => {
        cb.checked = data.eventTypes && data.eventTypes.includes(cb.value);
    });
    setVal('book-other-needs-text', data.otherNeedsText);
    
    // Approval preference
    const approvalCheck = document.getElementById('book-show-approval');
    if (approvalCheck) {
        approvalCheck.checked = data.showApproval !== undefined ? data.showApproval : true;
    }
}

window.updateBookingStatusDirectly = async (newStatus) => {
    const id = parseInt(document.getElementById('evaluation-book-id').value);
    const book = state.bookings.find(b => b.id === id);
    if (book) {
        if (newStatus === 'cancelled') {
            const reason = await window.showCancellationPrompt();
            if (reason === null) return; // User clicked Cancel on prompt
            book.cancellationReason = reason || 'لم يتم تحديد سبب';
        } else {
            // If status is changed from cancelled to something else, clear cancellation reason
            book.cancellationReason = '';
        }
        book.status = newStatus;
        saveState();
        showToast('تم تحديث حالة الحجز بنجاح', 'success');
        openViewModal(id); // Refresh modal view
        if (state.currentView === 'bookings-list') renderBookingsList();
        if (state.currentView === 'calendar') renderCalendar();
        renderDashboard();
    }
};


window.openViewModal = (id) => {
    const book = state.bookings.find(b => b.id === id);
    if (!book) return;

    const room = state.rooms.find(r => r.id === book.roomId);
    const modal = document.getElementById('view-booking-modal');
    const content = document.getElementById('view-booking-content');

    const typeAr = { visit: 'زيارة وفد', meeting: 'لقاء', ministerial: 'برنامج وزاري', internal: 'برنامج داخلي', workshop: 'ورشة عمل', opening: 'افتتاح', party: 'حفل', other: 'أخرى' };
    const needAr = { 
        screens: 'شاشات عرض', 
        audio: 'صوتيات', 
        mic: 'ميكروفونات', 
        pc: 'أجهزة كمبيوتر', 
        photo: 'تصوير فيديو/فوتوغرافي', 
        org: 'تنظيم',
        ministry: 'ربط مع الوزارة',
        live: 'البث المباشر',
        other_need: 'أخرى (' + (book.otherNeedsText || '---') + ')'
    };

    content.innerHTML = `
        <div class="form-section">
            <h3 class="section-title">بيانات الجهة والمناسبة</h3>
            <div class="detail-row"><span class="detail-label">الجهة المنظمة:</span> <span class="detail-value">${book.entityName}</span></div>
            <div class="detail-row"><span class="detail-label">المسؤول/الجوال:</span> <span class="detail-value">${book.coordName} (${book.coordMobile})</span></div>
            <div class="detail-row"><span class="detail-label">عدد الحضور (المتوقع):</span> <span class="detail-value">${book.audienceCount || 0}</span></div>
            <div class="detail-row"><span class="detail-label">عدد الحضور (الفعلي):</span> <span class="detail-value">${book.actualCount || '---'}</span></div>
            <div class="detail-row"><span class="detail-label">سبب/هدف الحجز:</span> <span class="detail-value">${book.reason || 'غير محدد'}</span></div>
            ${book.status === 'cancelled' ? `
            <div class="detail-row" style="color: #ef4444; font-weight: bold; background: rgba(239, 68, 68, 0.05); padding: 8px; border-radius: 6px; border-right: 3px solid #ef4444; margin-top: 10px;">
                <span class="detail-label" style="color: #ef4444;">سبب إلغاء الحجز:</span> 
                <span class="detail-value" style="color: #ef4444;">${book.cancellationReason || 'لم يتم تحديد سبب'}</span>
            </div>` : ''}
        </div>
        <div class="form-section">
            <h3 class="section-title">التوقيت والمقر</h3>
            <div class="detail-row"><span class="detail-label">المقر (القاعة):</span> <span class="detail-value">${room ? room.name : 'قاعة محذوفة'}</span></div>
            <div class="detail-row"><span class="detail-label">التاريخ:</span> <span class="detail-value">${book.date} م (${book.dateHijri || '---'} هـ)</span></div>
            <div class="detail-row"><span class="detail-label">الوقت:</span> <span class="detail-value">${formatTime12h(book.time)} ${book.timePeriod}</span></div>
            <div class="detail-row"><span class="detail-label">المدة:</span> <span class="detail-value">${book.duration} ساعة</span></div>
        </div>
        <div class="form-section">
            <h3 class="section-title">التصنيفات والاحتياجات</h3>
            <div class="detail-row"><span class="detail-label">نوع الفعالية:</span> <span class="detail-value">${book.eventTypes.map(t => t === 'other' ? ('أخرى (' + (book.otherEventType || '---') + ')') : typeAr[t]).join('، ')}</span></div>
            <div class="detail-row"><span class="detail-label">الاحتياجات التقنية:</span> <span class="detail-value">${book.needs.length > 0 ? book.needs.map(n => needAr[n]).join('، ') : 'لا يوجد احتياجات خاصة'}</span></div>
            <div class="detail-row"><span class="detail-label">الراعي/الضيف:</span> <span class="detail-value">${book.vipGuest || 'لا يوجد'}</span></div>
        </div>
    `;

    modal.classList.add('active');

    // Populate evaluation fields
    document.getElementById('evaluation-book-id').value = id;
    document.getElementById('book-positives').value = book.positives || '';
    document.getElementById('book-negatives').value = book.negatives || '';
    document.getElementById('book-recommendations').value = book.recommendations || '';

    // Load event evidence
    window.currentEventEvidence = book.evidence || [];
    const fileInput = document.getElementById('event-evidence-upload');
    if (fileInput) fileInput.value = '';
    renderEventEvidenceThumbnails();
};
window.saveEventSummary = () => {
    const id = parseInt(document.getElementById('evaluation-book-id').value);
    const book = state.bookings.find(b => b.id === id);
    if (book) {
        book.positives = document.getElementById('book-positives').value;
        book.negatives = document.getElementById('book-negatives').value;
        book.recommendations = document.getElementById('book-recommendations').value;
        book.evidence = window.currentEventEvidence || [];
        saveState();
        alert('✅ تم حفظ تعديلات التقييم والإتقان بنجاح!');
        closeEvaluationModal();
        if (state.currentView === 'bookings-list') renderBookingsList();
    }
};

window.currentPrintContext = 'portrait'; // Global tracker for layout

window.printShortReport = () => {
    window.currentPrintContext = 'portrait';
    const id = parseInt(document.getElementById('evaluation-book-id').value);
    const book = state.bookings.find(b => b.id === id);
    if (!book) return;

    // 1. Fill the source template fields
    const titleEl = document.getElementById('rpt-title');
    const entityEl = document.getElementById('rpt-entity');
    const dateEl = document.getElementById('rpt-date');
    const todayEl = document.getElementById('rpt-today');
    const todayFooterEl = document.getElementById('rpt-today-footer');
    const positivesEl = document.getElementById('rpt-positives');
    const negativesEl = document.getElementById('rpt-negatives');
    const recommendationsEl = document.getElementById('rpt-recommendations');

    if (titleEl) titleEl.textContent = book.title;
    if (entityEl) entityEl.textContent = book.entityName || 'غير محدد';
    if (dateEl) dateEl.textContent = book.date;
    
    const todayStr = new Date().toLocaleDateString('ar-SA-u-nu-latn');
    if (todayEl) todayEl.textContent = todayStr;
    if (todayFooterEl) todayFooterEl.textContent = todayStr;

    if (positivesEl) positivesEl.textContent = book.positives || 'لا يوجد ملاحظات';
    if (negativesEl) negativesEl.textContent = book.negatives || 'لا يوجد ملاحظات';
    if (recommendationsEl) recommendationsEl.textContent = book.recommendations || 'لا يوجد ملاحظات';

    // Populate evidence in printed report
    const evidenceSection = document.getElementById('rpt-evidence-section');
    const evidenceGrid = document.getElementById('rpt-evidence-grid');
    if (evidenceSection && evidenceGrid) {
        if (book.evidence && book.evidence.length > 0) {
            evidenceSection.style.display = 'block';
            evidenceGrid.innerHTML = book.evidence.map(img => `
                <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; height: 180px; display: flex; align-items: center; justify-content: center; background: #f8fafc;">
                    <img src="${img}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
            `).join('');
        } else {
            evidenceSection.style.display = 'none';
            evidenceGrid.innerHTML = '';
        }
    }

    // Handle Stamp in template - disabled for evaluations
    const stampContainer = document.getElementById('rpt-stamp-container');
    if (stampContainer) {
        stampContainer.style.display = 'none';
    }
    // 2. Clone to Paper Preview Container
    const sourceHTML = document.getElementById('short-report-print-template').innerHTML;
    const previewContainer = document.getElementById('paper-preview-container');
    if (previewContainer) {
        previewContainer.style.width = '210mm';
        previewContainer.innerHTML = sourceHTML;
    }

    // 3. Set Global Title for Filename & Sharing
    window.currentBookingForSharing = book;
    window.currentReportTitle = book.title || 'تقرير فعالية';
    document.title = `تقرير - ${window.currentReportTitle}`;
    if (window.electronAPI && window.electronAPI.updateTitle) {
        window.electronAPI.updateTitle(document.title);
    }

    // 3. Show Modal
    const previewModal = document.getElementById('report-preview-modal');
    if (previewModal) {
        previewModal.classList.add('active');
    }
};

window.printCurrentBookingForm = () => {
    window.currentPrintContext = 'portrait';
    
    // 1. Map Select Values to Arabic Labels
    const entityTypeMap = { 'management': 'إدارة / قسم / وحدة', 'school': 'مدرسة', 'other': 'أخرى' };
    const audienceMap = { 'boys': 'بنين', 'girls': 'بنات', 'mixed': 'عام' };

    // 2. Gather Data from Modal Inputs
    const title = document.getElementById('book-event-title').value || '---';
    const entityName = document.getElementById('book-entity-name').value || '---';
    const entityType = entityTypeMap[document.getElementById('book-entity-type').value] || '---';
    const coord = document.getElementById('book-coord-name').value || '---';
    const mobile = document.getElementById('book-coord-mobile').value || '---';
    
    let roomNames = 'لم يتم اختيار مقر';
    const fixedRoomId = parseInt(document.getElementById('book-room-id').value);
    
    if (!isNaN(fixedRoomId)) {
        const room = state.rooms.find(r => r.id === fixedRoomId);
        if (room) roomNames = room.name;
    } else {
        const selectedCbs = Array.from(document.querySelectorAll('input[name="book-room-ids"]:checked'));
        if (selectedCbs.length > 0) {
            roomNames = selectedCbs.map(cb => {
                const r = state.rooms.find(rm => rm.id == cb.value);
                return r ? r.name : '';
            }).filter(n => n !== '').join(' ، ');
        }
    }
    
    const dateGr = document.getElementById('book-date').value || '--/--/----';
    const dateHi = document.getElementById('book-date-hijri').value;
    const period = document.querySelector('input[name="time-period"]:checked')?.value === 'morning' ? 'صباحاً' : 'مساءً';
    const time = document.getElementById('book-time').value || '--:--';
    const duration = document.getElementById('book-duration').value || '---';
    const audience = audienceMap[document.getElementById('book-audience-type').value] || '---';
    const expected = document.getElementById('book-audience-count').value || '0';
    
    const vip = document.getElementById('book-vip-guest').value || 'لا يوجد';
    const activities = document.getElementById('book-activities').value || 'لا توجد';
    
    // 3. Fill the source template
    document.getElementById('req-title').textContent = title;
    document.getElementById('req-entity').textContent = entityName;
    document.getElementById('req-entity-type').textContent = entityType;
    document.getElementById('req-coord').textContent = coord;
    document.getElementById('req-mobile').textContent = mobile;
    
    document.getElementById('req-room').textContent = roomNames;
    document.getElementById('req-date').textContent = `${dateGr}${dateHi ? ' ( ' + dateHi + ' )' : ''}`;
    document.getElementById('req-period').textContent = `${period} - الساعة: ${formatTime12h(time)}`;
    document.getElementById('req-duration').textContent = `${duration} ساعة`;
    document.getElementById('req-audience').textContent = audience;
    document.getElementById('req-expected').textContent = expected;
    
    document.getElementById('req-vip').textContent = vip;
    document.getElementById('req-activities').textContent = activities;
    document.getElementById('req-print-date').textContent = new Date().toLocaleString('ar-SA-u-nu-latn');

    // 4. Gather Event Types (Checkboxes)
    const typeCbs = Array.from(document.querySelectorAll('input[name="event-type"]:checked'));
    const typesHTML = typeCbs.map(cb => {
        let label = cb.parentElement.textContent.trim();
        if (cb.value === 'other') {
            const otherVal = document.getElementById('book-other-event-type').value.trim();
            label = `أخرى (${otherVal || '---'})`;
        }
        return `<div style="padding: 4px 10px; border: 1px solid #3b82f6; border-radius: 4px; background: #eff6ff;"><i class="fas fa-check-circle"></i> ${label}</div>`;
    });
    const typesContainer = document.getElementById('req-types-list');
    if (typesContainer) typesContainer.innerHTML = typesHTML.length > 0 ? typesHTML.join('') : 'لم يتم تحديد نوع';

    // 5. Gather Requirements (Checkboxes)
    const needs = Array.from(document.querySelectorAll('input[name="need"]:checked')).map(cb => {
        const label = cb.parentElement.textContent.trim();
        return `<div style="font-size: 0.95rem;"><i class="fas fa-check-square"></i> ${label}</div>`;
    });
    const otherText = document.getElementById('book-other-needs-text').value;
    if (otherText) {
        needs.push(`<div style="font-size: 0.95rem;"><i class="fas fa-check-square"></i> أخرى: ${otherText}</div>`);
    }
    const needsContainer = document.getElementById('req-needs-list');
    if (needsContainer) {
        needsContainer.innerHTML = needs.length > 0 ? needs.join('') : '<div style="color: #888;">لم يتم تحديد احتياجات</div>';
    }

    // 6. Clone to Paper Preview Container
    const previewContainer = document.getElementById('paper-preview-container');
    if (previewContainer) {
        previewContainer.style.width = '210mm';
        previewContainer.innerHTML = document.getElementById('booking-request-print-template').innerHTML;
    }
    
    // 7. Toggle Approval Row in Preview
    const showApproval = document.getElementById('book-show-approval').checked;
    const approvalRow = document.querySelector('#paper-preview-container #print-dept-approval-row');
    if (approvalRow) approvalRow.style.display = showApproval ? 'table-row' : 'none';

    // 8. Handle Stamp Image in Preview (From Global Settings)
    const stampImg = document.querySelector('#paper-preview-container #req-stamp-img');
    const stampPlace = document.querySelector('#paper-preview-container #stamp-placeholder');
    const globalStamp = state.appSettings.stamp;

    if (stampImg && stampPlace) {
        if (globalStamp) {
            stampImg.src = globalStamp;
            stampImg.style.display = 'block';
            stampPlace.style.display = 'none';
        } else {
            stampImg.style.display = 'none';
            stampPlace.style.display = 'block';
        }
    }

    // 9. Set Global Title for Filename & Sharing
    window.currentBookingForSharing = {
        title: title,
        entityName: entityName,
        coordName: coord,
        coordMobile: mobile,
        date: dateGr,
        location: roomNames,
        status: 'pending' // Default for new form
    };
    
    // 9. Show Preview Modal
    document.getElementById('report-preview-modal').classList.add('active');
};

window.printBookingRequest = (id) => {
    window.currentPrintContext = 'portrait';
    const book = state.bookings.find(b => b.id === id);
    if (!book) return;

    const room = state.rooms.find(r => r.id === book.roomId);
    const entityTypeMap = { 'management': 'إدارة / قسم / وحدة', 'school': 'مدرسة', 'other': 'أخرى' };
    const audienceMap = { 'boys': 'بنين', 'girls': 'بنات', 'mixed': 'عام' };
    const typeAr = { visit: 'زيارة وفد', meeting: 'لقاء', ministerial: 'برنامج وزاري', internal: 'برنامج داخلي', workshop: 'ورشة عمل', opening: 'افتتاح', party: 'حفل', other: 'أخرى' };
    const needAr = { screens: 'شاشات عرض', audio: 'صوتيات', mic: 'ميكروفونات', pc: 'أجهزة كمبيوتر', photo: 'تصوير', org: 'تنظيم', ministry: 'ربط وزارة', live: 'بث مباشر', other_need: 'أخرى' };

    // Fill source template
    document.getElementById('req-title').textContent = book.title;
    document.getElementById('req-entity').textContent = book.entityName;
    document.getElementById('req-entity-type').textContent = entityTypeMap[book.entityType] || '---';
    document.getElementById('req-coord').textContent = book.coordName;
    document.getElementById('req-mobile').textContent = book.coordMobile;
    document.getElementById('req-room').textContent = room ? room.name : 'قاعة محذوفة';
    document.getElementById('req-date').textContent = `${book.date} ( ${book.dateHijri || '---'} )`;
    document.getElementById('req-period').textContent = `${book.timePeriod} - الساعة: ${formatTime12h(book.time)}`;
    document.getElementById('req-duration').textContent = `${book.duration} ساعة`;
    document.getElementById('req-audience').textContent = audienceMap[book.audienceType] || '---';
    document.getElementById('req-expected').textContent = book.audienceCount || 0;
    document.getElementById('req-vip').textContent = book.vipGuest || 'لا يوجد';
    document.getElementById('req-activities').textContent = book.activities || 'لا توجد';
    
    const reqReasonEl = document.getElementById('req-reason');
    if (reqReasonEl) reqReasonEl.textContent = book.reason || 'لا يوجد';
    
    document.getElementById('req-print-date').textContent = new Date().toLocaleString('ar-SA-u-nu-latn');

    // Handle Checkboxes HTML
    const typesHTML = (book.eventTypes || []).map(t => `<div style="padding: 4px 10px; border: 1px solid #3b82f6; border-radius: 4px; background: #eff6ff;"><i class="fas fa-check-circle"></i> ${typeAr[t] || t}</div>`);
    document.getElementById('req-types-list').innerHTML = typesHTML.length > 0 ? typesHTML.join('') : 'لم يتم التحديد';

    const needsHTML = (book.needs || []).map(n => `<div style="font-size: 0.95rem;"><i class="fas fa-check-square"></i> ${needAr[n] || n}</div>`);
    if (book.otherNeedsText) needsHTML.push(`<div style="font-size: 0.95rem;"><i class="fas fa-check-square"></i> أخرى: ${book.otherNeedsText}</div>`);
    document.getElementById('req-needs-list').innerHTML = needsHTML.length > 0 ? needsHTML.join('') : 'لا يوجد احتياجات خاصة';

    // Clone to Paper Preview
    const previewContainer = document.getElementById('paper-preview-container');
    if (previewContainer) {
        previewContainer.style.width = '210mm';
        previewContainer.innerHTML = document.getElementById('booking-request-print-template').innerHTML;
    }
    
    // Toggle Approval Row in Preview
    const approvalRow = document.querySelector('#paper-preview-container #print-dept-approval-row');
    if (approvalRow) approvalRow.style.display = book.showApproval !== false ? 'table-row' : 'none';

    // Handle Stamp Image in Preview (From Global Settings)
    const stampImg = document.querySelector('#paper-preview-container #req-stamp-img');
    const stampPlace = document.querySelector('#paper-preview-container #stamp-placeholder');
    if (stampImg && stampPlace) {
        if (state.appSettings.stamp) {
            stampImg.src = state.appSettings.stamp;
            stampImg.style.display = 'block';
            stampPlace.style.display = 'none';
        } else {
            stampImg.style.display = 'none';
            stampPlace.style.display = 'block';
        }
    }

    // 3. Set Global Title for Filename & Sharing
    window.currentBookingForSharing = book;
    window.currentReportTitle = book.title || 'طلب حجز';
    document.title = `طلب حجز - ${window.currentReportTitle}`;

    document.getElementById('report-preview-modal').classList.add('active');
};

window.printAllBookings = () => {
    window.currentPrintContext = 'landscape';
    
    const bookingsToPrint = getFilteredBookings();
    
    if (bookingsToPrint.length === 0) {
        alert('لا توجد حجوزات تطابق الفلاتر المحددة لطباعتها.');
        return;
    }

    // 1. Sort bookings by date 
    const sorted = bookingsToPrint.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 2. Map status to print title parts
    const statusFilter = state.bookingsStatusFilter || 'all';
    const statusTitles = {
        all: 'تقرير بكافة الحجوزات والفعاليات المسجلة',
        confirmed: 'تقرير بالحجوزات والفعاليات المعتمدة والمؤكدة',
        pending: 'تقرير بالحجوزات والفعاليات قيد الانتظار',
        executed: 'تقرير بالحجوزات والفعاليات التي تم تنفيذها',
        maintenance: 'جدول وأعمال الصيانة المخططة للمقرات',
        cancelled: 'سجل الحجوزات والفعاليات الملغية'
    };
    
    const dateFilter = state.bookingsDateFilter || 'all';
    const dateTitles = {
        all: '',
        today: ' (اليوم)',
        week: ' (للأسبوع الحالي)',
        'next-week': ' (للأسبوع القادم)',
        month: ' (للشهر الحالي)'
    };
    
    let printTitle = statusTitles[statusFilter] || 'تقرير بالحجوزات والفعاليات';
    if (dateFilter === 'custom') {
        const startText = state.bookingsStartDate ? state.bookingsStartDate.split('-').reverse().join('-') : '';
        const endText = state.bookingsEndDate ? state.bookingsEndDate.split('-').reverse().join('-') : '';
        if (startText && endText) {
            printTitle += ` للفترة من ${startText} إلى ${endText}`;
        } else if (startText) {
            printTitle += ` من تاريخ ${startText}`;
        } else if (endText) {
            printTitle += ` حتى تاريخ ${endText}`;
        }
    } else {
        printTitle += dateTitles[dateFilter] || '';
    }
    
    const roomFilter = state.bookingsRoomFilter || 'all';
    if (roomFilter !== 'all') {
        const room = state.rooms.find(r => r.id === roomFilter);
        if (room) {
            printTitle += ` - مقر: ${room.name}`;
        }
    }
    
    // 3. Update title in source template
    const printTitleEl = document.getElementById('all-bookings-print-title');
    if (printTitleEl) {
        printTitleEl.textContent = printTitle;
    }

    // 4. Build Table Body with a nice status column if printing "all"
    const hasStatusColumn = statusFilter === 'all';
    
    // We should also adapt the table headers dynamically in the template first
    const printTemplateDiv = document.getElementById('all-bookings-print-template');
    if (printTemplateDiv) {
        const tableHeader = printTemplateDiv.querySelector('thead tr');
        if (tableHeader) {
            tableHeader.innerHTML = `
                <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">التاريخ</th>
                <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">الوقت</th>
                <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">الفعالية</th>
                <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">المقر / القاعة</th>
                <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">الجهة المنظمة</th>
                ${hasStatusColumn ? '<th style="padding: 12px; border: 1px solid #ddd; text-align: right;">الحالة</th>' : ''}
            `;
        }
    }

    const tableHtml = sorted.map(b => {
        const room = state.rooms.find(r => r.id === b.roomId);
        const statusTranslations = {
            confirmed: 'مؤكد',
            pending: 'انتظار',
            executed: 'تم التنفيذ',
            maintenance: 'صيانة',
            cancelled: 'ملغي'
        };
        const statusText = statusTranslations[b.status] || b.status;
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; border: 1px solid #ddd;">${b.date}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${formatTime12h(b.time)}</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${b.title}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${room ? room.name : 'قاعة محذوفة'}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${b.entityName}</td>
                ${hasStatusColumn ? `<td style="padding: 10px; border: 1px solid #ddd;">${statusText}</td>` : ''}
            </tr>
        `;
    }).join('');

    document.getElementById('all-bookings-count').textContent = sorted.length;
    document.getElementById('all-bookings-gen-date').textContent = new Date().toLocaleString('ar-SA-u-nu-latn');

    // 5. Inject and Show Preview
    document.getElementById('all-bookings-table-body').innerHTML = tableHtml;
    const previewContainer = document.getElementById('paper-preview-container');
    if (previewContainer) {
        previewContainer.style.width = '297mm';
        previewContainer.innerHTML = document.getElementById('all-bookings-print-template').innerHTML;
    }
    document.getElementById('report-preview-modal').classList.add('active');
};

window.printCalendar = () => {
    window.currentPrintContext = 'landscape';
    const monthTitle = document.getElementById('calendar-month-year').textContent;
    const weekdays = document.querySelector('.calendar-weekdays').innerHTML;
    const grid = document.getElementById('calendar-grid').innerHTML;

    // 1. Build the Calendar Grid (Top Part) - Modern Planner Print Style
    const printGridHtml = `
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-bottom: 5px; text-align: center;">
            ${weekdays.replace(/div/g, 'div style="padding: 10px; font-weight: 800; color: #64748b; font-size: 0.8rem; text-transform: uppercase;"')}
        </div>
        <div class="print-calendar-grid">
            ${grid.replace(/calendar-day/g, 'print-calendar-day')
                  .replace(/calendar-events/g, 'print-calendar-events')}
        </div>
    `;

    // 3. Inject into Template
    document.getElementById('cal-print-title').textContent = monthTitle;
    const printDateEl = document.getElementById('rpt-print-date');
    if (printDateEl) printDateEl.textContent = new Date().toLocaleString('ar-SA-u-nu-latn');
    document.getElementById('cal-print-grid-container').innerHTML = printGridHtml;

    // 4. Show Preview
    const previewContainer = document.getElementById('paper-preview-container');
    if (previewContainer) {
        previewContainer.style.width = '297mm';
        previewContainer.innerHTML = document.getElementById('calendar-print-template').innerHTML;
    }
    document.getElementById('report-preview-modal').classList.add('active');
};

window.confirmFinalPrint = () => {
    // 1. Prepare Global Print Area
    const previewContainer = document.getElementById('paper-preview-container');
    const printArea = document.getElementById('global-print-area');
    printArea.innerHTML = previewContainer.innerHTML;
    
    // 2. Explicitly update the <title> tag for the OS to catch it
    const originalTitle = "إتقان - نظام الإنجاز";
    const reportTitle = window.currentReportTitle ? `تقرير - ${window.currentReportTitle}` : `Itqan-Report-${new Date().toLocaleDateString('ar-SA')}`;
    
    document.title = reportTitle;
    let titleTag = document.querySelector('title');
    if (titleTag) titleTag.textContent = reportTitle;
    if (window.electronAPI && window.electronAPI.updateTitle) {
        window.electronAPI.updateTitle(reportTitle);
    }
    
    // 3. Set Active States and Inject Dynamic Page Style for margins
    document.body.classList.add('is-printing');
    
    let printStyle = document.getElementById('dynamic-print-page-style');
    if (!printStyle) {
        printStyle = document.createElement('style');
        printStyle.id = 'dynamic-print-page-style';
        document.head.appendChild(printStyle);
    }
    
    if (window.currentPrintContext === 'landscape') {
        document.body.classList.add('print-landscape');
        printStyle.textContent = `@page { size: landscape; margin: 0; }`;
    } else {
        printStyle.textContent = `@page { size: portrait; margin: 0; }`;
    }
    
    // 4. Trigger Print after a LONGER stabilization delay for the OS to sync the title
    setTimeout(() => {
        window.print();
        
        // 5. Guaranteed Cleanup after print dialog
        setTimeout(() => {
            document.body.classList.remove('is-printing');
            document.body.classList.remove('print-landscape');
            printArea.innerHTML = '';
            
            // Clean up dynamic page style
            const styleEl = document.getElementById('dynamic-print-page-style');
            if (styleEl) styleEl.remove();
            
            // document.title = originalTitle; 
            // if (titleTag) titleTag.textContent = originalTitle;
            closeReportPreview();
        }, 1000); 
    }, 1200); // Increased to 1.2 seconds to ensure title sync
};

window.closeReportPreview = () => {
    document.getElementById('report-preview-modal').classList.remove('active');
    document.title = "إتقان - نظام الإنجاز"; // Reset title on close
};

window.exportToWord = () => {
    const previewContainer = document.getElementById('paper-preview-container');
    
    // Get Data
    const orgName = previewContainer.querySelector('.dynamic-org-name')?.textContent || 'وزارة التعليم';
    const deptName = previewContainer.querySelector('.dynamic-dept-name')?.textContent || 'إدارة الاتصال المؤسسي';
    const logoSrc = previewContainer.querySelector('.dynamic-print-logo-container img')?.src || '';
    const titleText = previewContainer.querySelector('.header-center div')?.textContent || 'تقرير تقييم فعالية';
    
    const rptTitle = previewContainer.querySelector('#rpt-title')?.textContent || '';
    const rptEntity = previewContainer.querySelector('#rpt-entity')?.textContent || '';
    const rptDate = previewContainer.querySelector('#rpt-date')?.textContent || '';
    const rptToday = previewContainer.querySelector('#rpt-today')?.textContent || '';
    
    const positives = previewContainer.querySelector('#rpt-positives')?.innerHTML || '';
    const negatives = previewContainer.querySelector('#rpt-negatives')?.innerHTML || '';
    const recommendations = previewContainer.querySelector('#rpt-recommendations')?.innerHTML || '';
    const footerDate = previewContainer.querySelector('#rpt-today-footer')?.textContent || '';

    // Construct Word-Friendly Table Layout
    const wordHTML = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <style>
                @page { size: A4; margin: 0.7in; }
                body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 15pt; }
                .header-table td { vertical-align: middle; padding: 5pt; }
                .section-header { background-color: #f1f5f9; font-weight: bold; padding: 8pt; border: 1pt solid #cbd5e1; }
                .section-content { padding: 10pt; border: 1pt solid #cbd5e1; min-height: 100pt; }
                .info-label { font-weight: bold; background-color: #f8fafc; border: 1pt solid #e2e8f0; padding: 5pt; width: 150pt; }
                .info-value { border: 1pt solid #e2e8f0; padding: 5pt; }
            </style>
        </head>
        <body>
            <!-- Header Table -->
            <table class="header-table" style="border-bottom: 2pt solid #3b82f6;">
                <tr>
                    <td style="width: 33%; text-align: center; font-size: 10pt;">
                        المملكة العربية السعودية<br>
                        وزارة التعليم<br>
                        ${orgName}<br>
                        ${deptName}
                    </td>
                    <td style="width: 33%; text-align: center;">
                        <div style="border: 1pt solid #3b82f6; padding: 5pt; border-radius: 15pt; color: #3b82f6; font-weight: bold; font-size: 12pt;">
                            تقرير تقييم فعالية
                        </div>
                    </td>
                    <td style="width: 33%; text-align: left;">
                        ${logoSrc ? `<img src="${logoSrc}" width="100" height="100" style="width: 100pt; height: 100pt;">` : ''}
                    </td>
                </tr>
            </table>

            <!-- Info Table -->
            <table>
                <tr><td class="info-label">مسمى الفعالية:</td><td class="info-value">${rptTitle}</td></tr>
                <tr><td class="info-label">الجهة المنظمة:</td><td class="info-value">${rptEntity}</td></tr>
                <tr><td class="info-label">تاريخ التنفيذ:</td><td class="info-value">${rptDate}</td></tr>
                <tr><td class="info-label">تاريخ التقرير:</td><td class="info-value">${rptToday}</td></tr>
            </table>

            <!-- Positives -->
            <table style="border: 1pt solid #10b981;">
                <tr><td style="background-color: #10b981; color: white; font-weight: bold; padding: 6pt;">الإيجابيات ومكاسب الفعالية</td></tr>
                <tr><td style="padding: 10pt; line-height: 1.6;">${positives}</td></tr>
            </table>

            <!-- Negatives -->
            <table style="border: 1pt solid #ef4444;">
                <tr><td style="background-color: #ef4444; color: white; font-weight: bold; padding: 6pt;">السلبيات وملاحظات التحسين</td></tr>
                <tr><td style="padding: 10pt; line-height: 1.6;">${negatives}</td></tr>
            </table>

            <!-- Recommendations -->
            <table style="border: 1pt solid #6366f1;">
                <tr><td style="background-color: #6366f1; color: white; font-weight: bold; padding: 6pt;">التوصيات والمقترحات التطويرية</td></tr>
                <tr><td style="padding: 10pt; line-height: 1.6;">${recommendations}</td></tr>
            </table>

            <p style="font-size: 8pt; color: #94a3b8; text-align: left; margin-top: 20pt;">
                نظام إتقان - إدارة الاتصال المؤسسي<br>
                تم استخراج التقرير آلياً بتاريخ: ${footerDate}
            </p>
        </body>
        </html>
    `;

    const filename = rptTitle ? `تقرير - ${rptTitle}.doc` : `Itqan-Report-${new Date().getTime()}.doc`;
    const blob = new Blob(['\ufeff', wordHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.shareToWhatsApp = () => {
    console.log("WhatsApp Share Triggered");
    
    // 1. Try to get data from global variable (Report Preview)
    let book = window.currentBookingForSharing;
    console.log("Global book:", book);
    
    // 2. Fallback: Try to get data from Evaluation modal state
    if (!book) {
        const bookId = document.getElementById('evaluation-book-id')?.value;
        console.log("Modal bookId:", bookId);
        if (bookId) {
            book = state.bookings.find(b => b.id == bookId);
            console.log("Found in state:", book);
        }
    }

    // 3. Last Resort: Gather data directly from the Booking Form if open
    if (!book && document.getElementById('booking-detail-modal')?.classList.contains('active')) {
        console.log("Gathering from form fields...");
        book = {
            title: document.getElementById('book-event-title').value,
            entityName: document.getElementById('book-entity-name').value,
            coordName: document.getElementById('book-coord-name').value,
            coordMobile: document.getElementById('book-coord-mobile').value,
            date: document.getElementById('book-date').value,
            location: 'قيد التحديد',
            status: document.getElementById('book-status').value
        };
        if (!book.title) book = null;
    }

    if (!book) {
        showToast('لا توجد بيانات كافية للمشاركة', 'error');
        return;
    }
    
    const statusLabels = {
        confirmed: '✅ مؤكد',
        pending: '🟡 قيد الانتظار',
        executed: '🟢 تحت التنفيذ',
        cancelled: '🔴 ملغي',
        maintenance: '🟠 صيانة'
    };
    const statusText = statusLabels[book.status] || '⚪ غير محدد';
    
    let statusHeading = 'إشعار فعالية من نظام إتقان';
    if (book.status === 'pending') {
        statusHeading = 'إشعار فعالية قيد الانتظار من نظام إتقان';
    } else if (book.status === 'executed') {
        statusHeading = 'إشعار إنجاز فعالية من نظام إتقان';
    } else if (book.status === 'maintenance') {
        statusHeading = 'إشعار صيانة مقر من نظام إتقان';
    } else if (book.status === 'cancelled') {
        statusHeading = 'إشعار إلغاء فعالية من نظام إتقان';
    }

    const text = `*🔔 ${statusHeading}*\n\n` +
                 `*الفعالية:* ${book.title}\n` +
                 `*الجهة المنظمة:* ${book.entityName || 'غير محدد'}\n` +
                 `*التاريخ:* ${book.date}\n` +
                 `*الحالة:* ${statusText}\n\n` +
                 `--------------------------\n` +
                 `_تم الإرسال آلياً عبر نظام إتقان لإدارة الموارد_`;
    
    let mobile = book.coordMobile || '';
    mobile = mobile.replace(/[^\d]/g, '');
    if (mobile.startsWith('0')) {
        mobile = '966' + mobile.substring(1);
    } else if (mobile && !mobile.startsWith('966')) {
        mobile = '966' + mobile;
    }

    const url = mobile ? `https://wa.me/${mobile}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    if (window.electronAPI && window.electronAPI.openExternal) {
        window.electronAPI.openExternal(url);
    } else {
        window.open(url, '_blank');
    }
    
    showToast('جاري فتح واتساب للمشاركة...', 'success');
};

window.printBlankRequest = () => {
    // 1. Details with placeholders
    document.getElementById('req-title').textContent = "....................................................................";
    document.getElementById('req-entity').textContent = "....................................................................";
    document.getElementById('req-room').textContent = "....................................................................";
    document.getElementById('req-date').textContent = "........................... (...........................)";
    const periodEl = document.getElementById('req-period');
    if (periodEl) periodEl.textContent = "صباحاً [ ]  -  مساءً [ ]";
    document.getElementById('req-print-date').textContent = "--/--/----";

    // 2. Full Technical Checklist
    const allNeeds = [
        { k: 'screens', v: 'شاشات عرض' }, { k: 'audio', v: 'صوتيات' }, 
        { k: 'mic', v: 'ميكروفونات' }, { k: 'pc', v: 'أجهزة كمبيوتر' },
        { k: 'photo', v: 'تصوير' }, { k: 'org', v: 'تنظيم' },
        { k: 'ministry', v: 'ربط وزارة' }, { k: 'live', v: 'بث مباشر' },
        { k: 'other_need', v: 'أخرى (................)' }
    ];
    const list = document.getElementById('req-needs-list');
    if (list) {
        list.innerHTML = allNeeds.map(n => `
            <div style="font-size: 0.95rem;"><i class="far fa-square"></i> ${n.v}</div>
        `).join('');
    }

    // 3. Show Modal
    const previewContainer = document.getElementById('paper-preview-container');
    if (previewContainer) {
        previewContainer.style.width = '210mm';
        previewContainer.innerHTML = document.getElementById('booking-request-print-template').innerHTML;
    }
    document.getElementById('report-preview-modal').classList.add('active');
};

window.closeViewModal = () => {
    document.getElementById('view-booking-modal').classList.remove('active');
};

window.openRoomModal = () => {
    // Open the booking modal with the room selector enabled
    window.openBookingModal(null);
};

// Resource Modal Logic
window.openResourceModal = (type, id = null) => {
    const modal = document.getElementById('resource-modal');
    const title = document.getElementById('res-modal-title');
    const resType = document.getElementById('res-type');
    const resIdField = document.getElementById('res-id') || { value: '' }; // Safety if HTML update failed
    const roomFields = document.getElementById('room-fields');
    const equipmentFields = document.getElementById('equipment-fields');

    modal.classList.add('active');
    resType.value = type;
    
    if (id) {
        resIdField.value = id;
        const item = type === 'room' ? state.rooms.find(r => r.id === id) : state.equipment.find(e => e.id === id);
        if (item) {
            title.textContent = `تعديل بيانات ${type === 'room' ? 'المقر' : 'المعدة'}`;
            document.getElementById('res-name').value = item.name;
            if (type === 'room') {
                document.getElementById('res-category').value = item.type;
            } else {
                document.getElementById('res-quantity').value = item.quantity;
            }
        }
    } else {
        resIdField.value = '';
        document.getElementById('resource-form').reset();
        title.textContent = `إضافة ${type === 'room' ? 'قاعة جديدة' : 'معدات جديدة'}`;
    }

    if (type === 'room') {
        roomFields.style.display = 'block';
        equipmentFields.style.display = 'none';
    } else {
        roomFields.style.display = 'none';
        equipmentFields.style.display = 'block';
    }
};

window.closeResourceModal = () => {
    document.getElementById('resource-modal').classList.remove('active');
    document.getElementById('resource-form').reset();
};

window.handleResourceSubmit = (e) => {
    e.preventDefault();
    const type = document.getElementById('res-type').value;
    const resIdField = document.getElementById('res-id') || { value: '' };
    const name = document.getElementById('res-name').value;
    const isEdit = resIdField.value !== '';

    if (type === 'room') {
        const category = document.getElementById('res-category').value;
        const icon = category === 'theater' ? 'fa-landmark' : category === 'office' ? 'fa-user-tie' : category === 'council' ? 'fa-couch' : 'fa-chalkboard-user';
        
        let editId = resIdField.value ? parseInt(resIdField.value) : null;
        if (isEdit && !isNaN(editId)) {
            const room = state.rooms.find(r => r.id === editId);
            if (room) {
                room.name = name;
                room.type = category;
                room.icon = icon;
            }
        } else {
            state.rooms.push({
                id: Date.now(),
                name: name,
                type: category,
                status: 'available',
                icon: icon
            });
        }
        renderFullRoomGrid();
    } else {
        const quantity = document.getElementById('res-quantity').value;
        const icon = name.includes('كاميرا') ? 'fa-camera-retro' : name.includes('شاشة') ? 'fa-tv' : name.includes('صوت') ? 'fa-volume-up' : 'fa-tools';
        let editId = resIdField.value ? parseInt(resIdField.value) : null;
        if (isEdit && !isNaN(editId)) {
            const equip = state.equipment.find(e => e.id === editId);
            if (equip) {
                equip.name = name;
                equip.quantity = quantity;
                equip.icon = icon;
            }
        } else {
            state.equipment.push({
                id: Date.now(),
                name: name,
                quantity: quantity,
                status: 'available',
                icon: icon
            });
        }
        renderEquipmentGrid();
    }

    saveState();
    renderStats();
    renderDashboard();
    closeResourceModal();
    alert(isEdit ? 'تم تحديث البيانات بنجاح!' : 'تمت الإضافة بنجاح!');
};

window.editResource = (type, id) => {
    window.openResourceModal(type, id);
};

window.deleteResource = (type, id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    
    if (type === 'room') {
        state.rooms = state.rooms.filter(r => r.id !== id);
        renderFullRoomGrid();
    } else {
        state.equipment = state.equipment.filter(e => e.id !== id);
        renderEquipmentGrid();
    }
    
    saveState();
    renderStats();
    renderDashboard();
};

// Duplicate deleteBooking removed (using the one at line 651)

// Duplicate editBooking removed (using the one at line 818 approx)

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const icon = themeToggle.querySelector('i');
        const isDark = icon.classList.contains('fa-moon');
        
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
            document.documentElement.style.setProperty('--bg-dark', '#f8fafc');
            document.documentElement.style.setProperty('--bg-card', '#ffffff');
            document.documentElement.style.setProperty('--text-main', '#0f172a');
            document.documentElement.style.setProperty('--text-muted', '#64748b');
            document.documentElement.style.setProperty('--glass-bg', 'rgba(0,0,0,0.05)');
            document.documentElement.style.setProperty('--glass-border', 'rgba(0,0,0,0.1)');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            document.documentElement.style.setProperty('--bg-dark', '#0f172a');
            document.documentElement.style.setProperty('--bg-card', 'rgba(30, 41, 59, 0.7)');
            document.documentElement.style.setProperty('--text-main', '#f8fafc');
            document.documentElement.style.setProperty('--text-muted', '#94a3b8');
            document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.03)');
            document.documentElement.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
        }
    });
}

// Reports Logic
function populateReportRoomSelector() {
    const selector = document.getElementById('report-room-filter');
    if (!selector) return;
    
    // Save current selection if any
    const currentVal = selector.value;
    
    // Reset and add rooms
    selector.innerHTML = '<option value="all">كافة المقرات</option>';
    state.rooms.forEach(room => {
        const opt = document.createElement('option');
        opt.value = room.id;
        opt.textContent = room.name;
        selector.appendChild(opt);
    });
    
    // Restore selection
    if (currentVal && Array.from(selector.options).some(opt => opt.value === currentVal)) {
        selector.value = currentVal;
    }
}

function updateReportFilter(period) {
    // Update active button UI
    if (period !== 'custom') {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-period') === period);
        });
    }

    let filtered = [...state.bookings];
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // 1. Time Filtering
    if (period === 'month') {
        filtered = filtered.filter(b => {
            const bDate = new Date(b.date);
            return (bDate.getMonth() + 1) === currentMonth && bDate.getFullYear() === currentYear;
        });
    } else if (period === 'year') {
        filtered = filtered.filter(b => {
            const bDate = new Date(b.date);
            return bDate.getFullYear() === currentYear;
        });
    } else if (period === 'custom') {
        const start = document.getElementById('report-start-date').value;
        const end = document.getElementById('report-end-date').value;
        
        if (start || end) {
            filtered = filtered.filter(b => {
                const bDate = b.date; // already YYYY-MM-DD
                if (start && bDate < start) return false;
                if (end && bDate > end) return false;
                return true;
            });
        }
    }

    // 2. Venue Filtering
    const roomFilter = document.getElementById('report-room-filter');
    if (roomFilter && roomFilter.value !== 'all') {
        const selectedRoomId = parseInt(roomFilter.value);
        filtered = filtered.filter(b => b.roomId === selectedRoomId);
    }

    renderReports(filtered);
}

function renderReports(filteredData) {
    const dataToUse = filteredData || state.bookings;
    const kpiContainer = document.getElementById('reports-kpi');
    const roomUsageBars = document.getElementById('room-usage-bars');
    const entityDist = document.getElementById('entity-dist-circles');
    const eventTypeCloud = document.getElementById('event-type-cloud');
    const needsRanking = document.getElementById('needs-ranking-list');
    const shiftWrapper = document.getElementById('shift-comparison-wrapper');

    if (!kpiContainer) return;

    // 1. Data Aggregation
    const totalBookings = dataToUse.length;
    const totalExpected = dataToUse.reduce((sum, b) => sum + (parseInt(b.audienceCount) || 0), 0);
    const totalActual = dataToUse.reduce((sum, b) => sum + (parseInt(b.actualCount) || 0), 0);
    
    const roomCounts = {};
    const typeCounts = {};
    const needCounts = {};
    const entityCounts = { management: 0, school: 0, other: 0 };
    const shiftCounts = { morning: 0, evening: 0 };

    dataToUse.forEach(b => {
        // Rooms
        roomCounts[b.roomId] = (roomCounts[b.roomId] || 0) + 1;
        // Event Types
        if (b.eventTypes) b.eventTypes.forEach(t => typeCounts[t] = (typeCounts[t] || 0) + 1);
        // Needs
        if (b.needs) b.needs.forEach(n => needCounts[n] = (needCounts[n] || 0) + 1);
        // Entities
        if (b.entityType) entityCounts[b.entityType] = (entityCounts[b.entityType] || 0) + 1;
        // Shifts
        if (b.timePeriod === 'صباحاً') shiftCounts.morning++;
        else if (b.timePeriod === 'مساءً') shiftCounts.evening++;
    });

    // Most Busy Room
    let busyRoom = '---';
    let maxB = 0;
    Object.entries(roomCounts).forEach(([rid, c]) => {
        if (c > maxB) {
            maxB = c;
            const r = state.rooms.find(rm => rm.id == rid);
            if (r) busyRoom = r.name;
        }
    });

    // 2. Render KPIs (Monthly Summary Context)
    kpiContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon tasks-icon"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-info"><h3>إجمالي الفعاليات</h3><p class="stat-value">${totalBookings}</p></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon rooms-icon"><i class="fas fa-users-viewfinder"></i></div>
            <div class="stat-info"><h3>الحضور المتوقع</h3><p class="stat-value">${totalExpected}</p></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon completion-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;"><i class="fas fa-user-check"></i></div>
            <div class="stat-info"><h3>الحضور الفعلي</h3><p class="stat-value">${totalActual}</p></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon completion-icon"><i class="fas fa-trophy"></i></div>
            <div class="stat-info"><h3>القاعة الأكثر نشاطاً</h3><p class="stat-value" style="font-size: 1.1rem;">${busyRoom}</p></div>
        </div>
    `;

    // 3. Room Occupancy Bars
    roomUsageBars.innerHTML = state.rooms.map(r => {
        const c = roomCounts[r.id] || 0;
        const p = totalBookings > 0 ? (c / totalBookings) * 100 : 0;
        return `
            <div class="bar-item">
                <div class="bar-label">${r.name}</div>
                <div class="bar-container"><div class="bar-fill" style="width: ${p}%"></div></div>
                <div class="bar-value">${c}</div>
            </div>
        `;
    }).join('');

    // 4. Entity Distribution (Progress Circles)
    const entityLabels = { management: 'إدارات', school: 'مدارس', other: 'أقسام أخرى' };
    const entityColors = { management: '#6366f1', school: '#10b981', other: '#f59e0b' };
    
    entityDist.innerHTML = Object.keys(entityCounts).map(key => {
        const pct = totalBookings > 0 ? Math.round((entityCounts[key] / totalBookings) * 100) : 0;
        const offset = 251 - (251 * pct) / 100;
        return `
            <div class="progress-circle">
                <svg><circle class="bg" cx="45" cy="45" r="40"/><circle class="progress" cx="45" cy="45" r="40" style="stroke-dashoffset: ${offset}; stroke: ${entityColors[key]};"/></svg>
                <div class="circle-info"><span class="circle-pct">${pct}%</span><span class="circle-label">${entityLabels[key]}</span></div>
            </div>
        `;
    }).join('');

    // 5. Event Classification
    const typeAr = { visit: 'زيارة وفد', meeting: 'لقاء', ministerial: 'برنامج وزاري', internal: 'برنامج داخلي', workshop: 'ورشة عمل', opening: 'افتتاح', party: 'حفل', other: 'أخرى' };
    eventTypeCloud.innerHTML = Object.entries(typeCounts).map(([t, c]) => `
        <div class="tag-item ${c > 2 ? 'hot' : ''}">${typeAr[t] || t} (${c})</div>
    `).join('') || '<p class="text-muted">لا توجد بيانات</p>';

    // 6. Resource Consumption
    const needAr = { 
        screens: 'شاشات عرض', 
        audio: 'صوتيات', 
        mic: 'ميكروفونات', 
        pc: 'أجهزة كمبيوتر', 
        photo: 'تصوير فيديو/فوتوغرافي', 
        org: 'تنظيم',
        ministry: 'ربط مع الوزارة',
        live: 'البث المباشر',
        other_need: 'أخرى'
    };
    const needIcons = { 
        screens: 'fa-tv', 
        audio: 'fa-volume-up', 
        mic: 'fa-microphone', 
        pc: 'fa-laptop', 
        photo: 'fa-camera-retro', 
        org: 'fa-users-cog',
        ministry: 'fa-link',
        live: 'fa-broadcast-tower',
        other_need: 'fa-plus-circle'
    };
    
    needsRanking.innerHTML = Object.entries(needCounts).sort((a,b) => b[1]-a[1]).map(([n, c]) => `
        <div class="need-rank-item">
            <div class="need-name"><i class="fas ${needIcons[n] || 'fa-tools'}"></i> ${needAr[n] || n}</div>
            <div class="need-count">${c} طلب</div>
        </div>
    `).join('') || '<p class="text-muted">لا يوجد استهلاك مسجل</p>';

    // 7. Shift Comparison
    const totalShifts = (shiftCounts.morning + shiftCounts.evening) || 0;
    const mPct = totalShifts > 0 ? Math.round((shiftCounts.morning / totalShifts) * 100) : 0;
    const ePct = totalShifts > 0 ? Math.round((shiftCounts.evening / totalShifts) * 100) : 0;

    shiftWrapper.innerHTML = `
        <div class="shift-item">
            <div class="shift-info"><div class="shift-label"><i class="fas fa-sun morning-icon"></i> الفترة الصباحية</div><div class="shift-pct">${mPct}%</div></div>
            <div class="shift-bar-outer"><div class="shift-bar-inner morning-bar" style="width: ${mPct}%"></div></div>
        </div>
        <div class="shift-item" style="margin-top: 20px;">
            <div class="shift-info"><div class="shift-label"><i class="fas fa-moon evening-icon"></i> الفترة المسائية</div><div class="shift-pct">${ePct}%</div></div>
            <div class="shift-bar-outer"><div class="shift-bar-inner evening-bar" style="width: ${ePct}%"></div></div>
        </div>
    `;

    // Animations
    setTimeout(() => {
        document.querySelectorAll('.bar-fill, .shift-bar-inner').forEach(el => {
            const finalW = el.style.width;
            el.style.width = '0%';
            setTimeout(() => el.style.width = finalW, 50);
        });
    }, 100);
};

window.viewRoomDetails = (id) => {
    const room = state.rooms.find(r => r.id === id);
    if (!room) return;

    // Initialize evidence array
    window.currentRoomEvidence = [];
    
    // Clear input element
    const fileInput = document.getElementById('room-evidence-upload');
    if (fileInput) fileInput.value = '';

    const modal = document.getElementById('room-details-modal');
    const infoDisplay = document.getElementById('room-info-display');
    const scheduleList = document.getElementById('room-schedule-list');
    const bookBtn = document.getElementById('book-now-from-details');
    const printReportBtn = document.getElementById('print-room-report-btn');
    const printMonthlyReportBtn = document.getElementById('print-room-monthly-report-btn');

    // Set default value for month select to current month
    const monthSelect = document.getElementById('print-room-month-select');
    if (monthSelect) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        monthSelect.value = `${yyyy}-${mm}`;
    }

    // 1. Info
    const bookingsCount = state.bookings.filter(b => b.roomId === id).length;
    infoDisplay.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h4 style="margin: 0; color: var(--primary-light); font-size: 1.2rem;">${room.name}</h4>
                <p style="margin: 5px 0 0; font-size: 0.85rem; color: var(--text-muted);">
                    <i class="fas ${room.icon}"></i> التصنيف: ${room.type === 'theater' ? 'مسرح' : room.type === 'office' ? 'مكتب' : room.type === 'council' ? 'مجلس' : 'قاعة'}
                </p>
            </div>
            <div style="text-align: left;">
                <span class="room-status-badge ${room.status}" style="font-size: 0.75rem;">${room.status === 'available' ? 'جاهزة للاستقبال' : 'مشغولة حالياً'}</span>
                <p style="margin: 5px 0 0; font-size: 0.8rem; color: var(--text-muted);">إجمالي الحجوزات: ${bookingsCount}</p>
            </div>
        </div>
    `;

    // 2. Schedule
    const upcoming = state.bookings
        .filter(b => b.roomId === id)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (upcoming.length === 0) {
        scheduleList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-muted);">لا توجد حجوزات مجدولة مسبقاً لهذا المقر.</div>';
    } else {
        scheduleList.innerHTML = upcoming.map(b => `
            <div style="padding: 12px; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between;">
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${b.title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${b.entityName}</div>
                </div>
                <div style="text-align: left;">
                    <div style="font-size: 0.8rem; color: var(--primary-light);">${b.date}</div>
                    <div style="font-size: 0.75rem;">${b.timePeriod} (${formatTime12h(b.time)})</div>
                </div>
            </div>
        `).join('');
    }

    // Render evidence thumbnails (should be empty now)
    renderRoomEvidenceThumbnails();

    // 3. Action
    bookBtn.onclick = () => {
        closeRoomDetailsModal();
        openBookingModal(id);
    };

    if (printReportBtn) {
        printReportBtn.onclick = () => {
            printRoomReport(id, null);
        };
    }
    if (printMonthlyReportBtn) {
        printMonthlyReportBtn.onclick = () => {
            const selectedMonth = monthSelect ? monthSelect.value : null;
            printRoomReport(id, selectedMonth);
        };
    }

    modal.classList.add('active');
};

window.closeRoomDetailsModal = () => {
    document.getElementById('room-details-modal').classList.remove('active');
};

window.handleRoomEvidenceUpload = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!window.currentRoomEvidence) {
        window.currentRoomEvidence = [];
    }

    let loadedCount = 0;
    const targetLength = files.length;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
            showToast('حجم الصورة كبير جداً. يرجى اختيار صور أقل من 5 ميجابايت.', 'error');
            loadedCount++;
            continue;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            window.currentRoomEvidence.push(e.target.result);
            loadedCount++;
            if (loadedCount === targetLength) {
                renderRoomEvidenceThumbnails();
                showToast('✅ تم إرفاق الشواهد بنجاح!', 'success');
            }
        };
        reader.readAsDataURL(file);
    }
};

window.removeRoomEvidence = (index) => {
    if (window.currentRoomEvidence) {
        window.currentRoomEvidence.splice(index, 1);
        renderRoomEvidenceThumbnails();
        showToast('تمت إزالة الصورة من الشواهد', 'info');
    }
};

window.renderRoomEvidenceThumbnails = () => {
    const container = document.getElementById('room-evidence-thumbnails');
    if (!container) return;

    if (!window.currentRoomEvidence || window.currentRoomEvidence.length === 0) {
        container.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-muted);">لا توجد شواهد مرفقة حالياً</span>';
        return;
    }

    container.innerHTML = window.currentRoomEvidence.map((img, index) => `
        <div style="position: relative; width: 75px; height: 75px; border-radius: 8px; overflow: hidden; border: 2px solid var(--glass-border); background: rgba(0,0,0,0.2);">
            <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;">
            <button onclick="removeRoomEvidence(${index})" style="position: absolute; top: 2px; left: 2px; background: rgba(239, 68, 68, 0.85); border: none; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.85rem; line-height: 1; outline: none;">&times;</button>
        </div>
    `).join('');
};

window.printRoomReport = (roomId, targetMonth = null) => {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return;

    window.currentPrintContext = 'portrait';

    const categoryMap = {
        theater: 'مسرح / قاعة احتفالات',
        hall: 'قاعة تدريب / ورش',
        office: 'مكتب / غرفة اجتماعات',
        council: 'مجلس'
    };

    // 1. Populate room general info
    document.getElementById('room-rpt-name').textContent = room.name;
    document.getElementById('room-rpt-category').textContent = categoryMap[room.type] || 'قاعة / مقر';
    document.getElementById('room-rpt-date').textContent = new Date().toLocaleDateString('ar-SA-u-nu-latn');

    // 2. Populate bookings table
    let bookings = state.bookings.filter(b => b.roomId === roomId);

    let isMonthly = false;
    let monthNameGregorian = '';

    if (targetMonth && targetMonth !== 'all') {
        isMonthly = true;
        const [year, month] = targetMonth.split('-').map(Number);
        
        bookings = bookings.filter(b => {
            const bDate = new Date(b.date);
            return (bDate.getMonth() + 1) === month && bDate.getFullYear() === year;
        });

        // Get Gregorian month name in Arabic (e.g. "يونيو 2026")
        try {
            const dateObj = new Date(year, month - 1, 1);
            monthNameGregorian = dateObj.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
        } catch (e) {
            monthNameGregorian = `${month}-${year}`;
        }
    }

    // Update titles and badges dynamically
    const titleBadge = document.getElementById('room-rpt-title-badge');
    if (titleBadge) {
        titleBadge.textContent = isMonthly ? `تقرير المقر والحجوزات لشهر ${monthNameGregorian}` : 'تقرير المقر والحجوزات الشامل';
    }

    const tableTitleEl = document.getElementById('room-rpt-table-title');
    if (tableTitleEl) {
        tableTitleEl.innerHTML = `<i class="fas fa-calendar-alt"></i> ` + (isMonthly ? `جدول الفعاليات والحجوزات لشهر ${monthNameGregorian}` : 'جدول الفعاليات والحجوزات القادمة');
    }

    bookings.sort((a, b) => new Date(a.date) - new Date(b.date));

    const tableBody = document.getElementById('room-rpt-bookings-table-body');
    if (tableBody) {
        if (bookings.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 12px; color: #64748b; border: 1px solid #cbd5e1;">${isMonthly ? 'لا توجد حجوزات مجدولة لهذا الشهر في هذا المقر.' : 'لا توجد حجوزات مجدولة مسبقاً لهذا المقر.'}</td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = bookings.map(b => `
                <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${b.date}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${b.timePeriod} (${formatTime12h(b.time)})</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e3a8a;">${b.title}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${b.entityName}</td>
                </tr>
            `).join('');
        }
    }

    // 3. Populate evidence grid
    const evidenceSection = document.getElementById('room-rpt-evidence-section');
    const evidenceGrid = document.getElementById('room-rpt-evidence-grid');
    if (evidenceSection && evidenceGrid) {
        if (window.currentRoomEvidence && window.currentRoomEvidence.length > 0) {
            evidenceSection.style.display = 'block';
            evidenceGrid.innerHTML = window.currentRoomEvidence.map(img => `
                <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; height: 180px; display: flex; align-items: center; justify-content: center; background: #f8fafc;">
                    <img src="${img}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
            `).join('');
        } else {
            evidenceSection.style.display = 'none';
            evidenceGrid.innerHTML = '';
        }
    }

    // Apply system branding
    applySystemBranding();

    // 4. Inject template into preview container
    const previewContainer = document.getElementById('paper-preview-container');
    if (previewContainer) {
        previewContainer.style.width = '210mm';
        previewContainer.innerHTML = document.getElementById('room-report-print-template').innerHTML;
    }

    // Open print preview modal
    const reportTitleText = isMonthly ? `تقرير مقر لشهر ${monthNameGregorian} - ${room.name}` : `تقرير مقر - ${room.name}`;
    window.currentReportTitle = reportTitleText;
    document.title = reportTitleText;
    
    closeRoomDetailsModal();
    document.getElementById('report-preview-modal').classList.add('active');
};

window.printComprehensiveReport = () => {
    window.currentPrintContext = 'portrait';
    
    const logoBase64 = state.appSettings.logo;
    const orgName = state.appSettings.orgName || 'إدارة التعليم بمنطقة عسير';
    const deptName = state.appSettings.deptName || 'قسم الاتصال المؤسسي';
    
    const logoHtml = logoBase64 
        ? `<img src="${logoBase64}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`
        : `<div style="width: 80px; height: 80px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: #aaa;">شعار</div>`;

    const bookings = [...state.bookings].sort((a, b) => new Date(a.date) - new Date(b.date));
    const totalBookingsCount = bookings.length;
    const totalRoomsCount = state.rooms.length;
    
    const bookingsTableRows = bookings.length === 0 
        ? `<tr><td colspan="6" style="text-align: center; padding: 12px; color: #64748b; border: 1px solid #cbd5e1;">لا توجد حجوزات مسجلة في النظام حالياً.</td></tr>`
        : bookings.map(b => {
            const room = state.rooms.find(r => r.id === b.roomId);
            const statusTranslations = {
                confirmed: 'مؤكد',
                pending: 'انتظار',
                executed: 'تم التنفيذ',
                maintenance: 'صيانة',
                cancelled: 'ملغي'
            };
            const statusText = statusTranslations[b.status] || b.status;
            return `
                <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${b.date}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${formatTime12h(b.time)}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e3a8a;">${b.title}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${room ? room.name : 'قاعة محذوفة'}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${b.entityName}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${statusText}</td>
                </tr>
            `;
        }).join('');

    let comprehensiveHtml = `
        <div class="print-page-unified print-theme-blue" style="min-height: 297mm; display: flex; flex-direction: column; box-sizing: border-box;">
            <div class="print-header-unified">
                <div class="header-right-info" style="width: 38%; text-align: right; font-weight: bold; line-height: 1.6; font-size: 1.05rem; color: #1e293b;">
                    المملكة العربية السعودية<br>
                    وزارة التعليم<br>
                    <span>${orgName}</span><br>
                    <span>${deptName}</span>
                </div>
                <div class="header-center-logo-place"></div>
                <div class="header-left-logo-container dynamic-print-logo-container" style="width: 130px; height: 130px; display: flex; align-items: center; justify-content: flex-end;">
                    ${logoHtml}
                </div>
            </div>

            <div class="print-title-badge-container" style="text-align: center; margin-bottom: 30px; width: 100%;">
                <div class="print-title-badge-unified" style="font-size: 1.35rem; font-weight: 800; color: #3b82f6; border: 2px solid #3b82f6; padding: 8px 35px; border-radius: 50px; display: inline-block; background: #eff6ff;">
                    التقرير الشامل للحجوزات والفعاليات والمقرات
                </div>
            </div>

            <div class="print-info-box-unified" style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 22px; margin-bottom: 30px;">
                <table class="print-info-table-unified" style="width: 100%; border-collapse: collapse; font-size: 1.1rem; color: #1e293b;">
                    <tr style="border-bottom: 1.5px solid #edf2f7;">
                        <td class="label" style="font-weight: 800; width: 200px; color: #475569; padding: 12px 10px;">إجمالي المقرات المسجلة:</td>
                        <td class="value" style="font-weight: 600; padding: 12px 10px;">${totalRoomsCount} مقر / قاعة</td>
                        <td class="label" style="font-weight: 800; width: 200px; color: #475569; padding: 12px 10px;">إجمالي الفعاليات المسجلة:</td>
                        <td class="value" style="font-weight: 600; padding: 12px 10px;">${totalBookingsCount} فعالية</td>
                    </tr>
                    <tr>
                        <td class="label" style="font-weight: 800; width: 200px; color: #475569; padding: 12px 10px;">تاريخ استخراج التقرير:</td>
                        <td class="value" style="font-weight: 600; padding: 12px 10px;" colspan="3">${new Date().toLocaleString('ar-SA-u-nu-latn')}</td>
                    </tr>
                </table>
            </div>

            <div class="print-section-unified" style="margin-bottom: 25px; width: 100%;">
                <div class="print-section-title-unified" style="background: #f8fafc; padding: 10px 15px; border-right: 5px solid #3b82f6; font-size: 1.1rem; font-weight: 800; margin-bottom: 15px; color: #1e293b; border-radius: 0 4px 4px 0; border-left: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                    <i class="fas fa-clipboard-list"></i> جدول الفعاليات الشامل بجميع المقرات والقاعات
                </div>
                <table class="print-table-unified" style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-top: 15px; color: #1e293b;">
                    <thead>
                        <tr>
                            <th style="background: #f8fafc; border: 1px solid #cbd5e1; border-bottom: 2.5px solid #3b82f6; padding: 10px; text-align: right; font-weight: 800;">التاريخ</th>
                            <th style="background: #f8fafc; border: 1px solid #cbd5e1; border-bottom: 2.5px solid #3b82f6; padding: 10px; text-align: right; font-weight: 800;">الوقت</th>
                            <th style="background: #f8fafc; border: 1px solid #cbd5e1; border-bottom: 2.5px solid #3b82f6; padding: 10px; text-align: right; font-weight: 800;">الفعالية</th>
                            <th style="background: #f8fafc; border: 1px solid #cbd5e1; border-bottom: 2.5px solid #3b82f6; padding: 10px; text-align: right; font-weight: 800;">المقر / القاعة</th>
                            <th style="background: #f8fafc; border: 1px solid #cbd5e1; border-bottom: 2.5px solid #3b82f6; padding: 10px; text-align: right; font-weight: 800;">الجهة المنظمة</th>
                            <th style="background: #f8fafc; border: 1px solid #cbd5e1; border-bottom: 2.5px solid #3b82f6; padding: 10px; text-align: right; font-weight: 800;">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookingsTableRows}
                    </tbody>
                </table>
            </div>

            <div class="print-footer-unified" style="margin-top: auto; border-top: 1.5px solid #edf2f7; padding-top: 18px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #64748b; width: 100%;">
                <div>نظام إتقان - إدارة الموارد والفعاليات</div>
                <div class="footer-left-info" style="font-style: italic;">صفحة 1 من ${totalRoomsCount + 1}</div>
            </div>
        </div>
    `;

    const categoryMap = {
        theater: 'مسرح / قاعة احتفالات',
        hall: 'قاعة تدريب / ورش',
        office: 'مكتب / غرفة اجتماعات',
        council: 'مجلس'
    };

    state.rooms.forEach((room, roomIdx) => {
        const roomBookings = bookings.filter(b => b.roomId === room.id);
        const roomBookingsCount = roomBookings.length;
        
        const roomBookingsTableRows = roomBookingsCount === 0 
            ? `<tr><td colspan="4" style="text-align: center; padding: 12px; color: #64748b; border: 1px solid #cbd5e1;">لا توجد حجوزات مجدولة مسبقاً لهذا المقر.</td></tr>`
            : roomBookings.map(b => `
                <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${b.date}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${b.timePeriod || '---'} (${formatTime12h(b.time)})</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e3a8a;">${b.title}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">${b.entityName}</td>
                </tr>
            `).join('');

        comprehensiveHtml += `
            <div class="print-page-unified print-theme-blue" style="min-height: 297mm; display: flex; flex-direction: column; box-sizing: border-box; page-break-before: always; break-before: page;">
                <div class="print-header-unified">
                    <div class="header-right-info" style="width: 38%; text-align: right; font-weight: bold; line-height: 1.6; font-size: 1.05rem; color: #1e293b;">
                        المملكة العربية السعودية<br>
                        وزارة التعليم<br>
                        <span>${orgName}</span><br>
                        <span>${deptName}</span>
                    </div>
                    <div class="header-center-logo-place"></div>
                    <div class="header-left-logo-container dynamic-print-logo-container" style="width: 130px; height: 130px; display: flex; align-items: center; justify-content: flex-end;">
                        ${logoHtml}
                    </div>
                </div>

                <div class="print-title-badge-container" style="text-align: center; margin-bottom: 30px; width: 100%;">
                    <div class="print-title-badge-unified" style="font-size: 1.35rem; font-weight: 800; color: #3b82f6; border: 2px solid #3b82f6; padding: 8px 35px; border-radius: 50px; display: inline-block; background: #eff6ff;">
                        تقرير المقر والحجوزات الشامل
                    </div>
                </div>

                <div class="print-info-box-unified" style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 22px; margin-bottom: 30px;">
                    <table class="print-info-table-unified" style="width: 100%; border-collapse: collapse; font-size: 1.1rem; color: #1e293b;">
                        <tr style="border-bottom: 1.5px solid #edf2f7;">
                            <td class="label" style="font-weight: 800; width: 160px; color: #475569; padding: 12px 10px;">اسم المقر:</td>
                            <td class="value" style="font-weight: 600; padding: 12px 10px; font-weight: bold;">${room.name}</td>
                            <td class="label" style="font-weight: 800; width: 160px; color: #475569; padding: 12px 10px;">تصنيف المقر:</td>
                            <td class="value" style="font-weight: 600; padding: 12px 10px;">${categoryMap[room.type] || 'قاعة / مقر'}</td>
                        </tr>
                        <tr>
                            <td class="label" style="font-weight: 800; width: 160px; color: #475569; padding: 12px 10px;">تاريخ التقرير:</td>
                            <td class="value" style="font-weight: 600; padding: 12px 10px;">${new Date().toLocaleDateString('ar-SA-u-nu-latn')}</td>
                            <td class="label" style="font-weight: 800; width: 160px; color: #475569; padding: 12px 10px;">عدد الفعاليات:</td>
                            <td class="value" style="font-weight: 600; padding: 12px 10px;">${roomBookingsCount} فعالية مسجلة</td>
                        </tr>
                    </table>
                </div>

                <div class="print-section-unified" style="margin-bottom: 25px; width: 100%;">
                    <div class="print-section-title-unified" style="background: #f8fafc; padding: 10px 15px; border-right: 5px solid #3b82f6; font-size: 1.1rem; font-weight: 800; margin-bottom: 15px; color: #1e293b; border-radius: 0 4px 4px 0; border-left: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <i class="fas fa-calendar-alt"></i> جدول الفعاليات والحجوزات القادمة للمقر
                    </div>
                    <table class="print-table-unified" style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-top: 15px; color: #1e293b;">
                        <thead>
                            <tr>
                                <th style="width: 20%; padding: 8px; text-align: right; background: #e2e8f0; color: #1e293b; border: 1px solid #cbd5e1; font-weight: 800;">التاريخ</th>
                                <th style="width: 20%; padding: 8px; text-align: right; background: #e2e8f0; color: #1e293b; border: 1px solid #cbd5e1; font-weight: 800;">الفترة</th>
                                <th style="width: 35%; padding: 8px; text-align: right; background: #e2e8f0; color: #1e293b; border: 1px solid #cbd5e1; font-weight: 800;">الفعالية</th>
                                <th style="width: 25%; padding: 8px; text-align: right; background: #e2e8f0; color: #1e293b; border: 1px solid #cbd5e1; font-weight: 800;">الجهة المنظمة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${roomBookingsTableRows}
                        </tbody>
                    </table>
                </div>

                <div class="print-footer-unified" style="margin-top: auto; border-top: 1.5px solid #edf2f7; padding-top: 18px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #64748b; width: 100%;">
                    <div>نظام إتقان - إدارة الموارد والفعاليات</div>
                    <div class="footer-left-info" style="font-style: italic;">صفحة ${roomIdx + 2} من ${totalRoomsCount + 1}</div>
                </div>
            </div>
        `;
    });

    const previewContainer = document.getElementById('paper-preview-container');
    if (previewContainer) {
        previewContainer.style.width = '210mm';
        previewContainer.innerHTML = comprehensiveHtml;
    }

    const reportTitleText = 'التقرير الشامل للمقرات والفعاليات';
    window.currentReportTitle = reportTitleText;
    document.title = reportTitleText;
    document.getElementById('report-preview-modal').classList.add('active');
};

window.printAllEvaluations = () => {
    window.currentPrintContext = 'portrait';
    
    // Get all bookings that have evaluations
    const evaluatedBookings = state.bookings.filter(b => b.positives || b.negatives || b.recommendations);
    
    if (evaluatedBookings.length === 0) {
        alert('لا توجد فعاليات تم تقييمها وتسجيل إيجابيات/سلبيات لها حتى الآن لطباعتها.');
        return;
    }
    
    // Sort by date
    evaluatedBookings.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get branding info
    const logoBase64 = state.appSettings.logo;
    const orgName = state.appSettings.orgName || 'إدارة التعليم بمنطقة عسير';
    const deptName = state.appSettings.deptName || 'قسم الاتصال المؤسسي';
    
    const logoHtml = logoBase64 
        ? `<img src="${logoBase64}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`
        : `<div style="width: 80px; height: 80px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: #aaa;">شعار</div>`;

    let comprehensiveHtml = '';
    const totalCount = evaluatedBookings.length;

    evaluatedBookings.forEach((book, idx) => {
        // Build evidence grid if any
        let evidenceHtml = '';
        if (book.evidence && book.evidence.length > 0) {
            const gridItems = book.evidence.map(img => `
                <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; height: 180px; display: flex; align-items: center; justify-content: center; background: #f8fafc;">
                    <img src="${img}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
            `).join('');
            evidenceHtml = `
                <div class="print-section-unified" style="margin-bottom: 25px; width: 100%;">
                    <div class="print-section-title-unified" style="background: #f8fafc; padding: 10px 15px; border-right: 5px solid #3b82f6; font-size: 1.1rem; font-weight: 800; margin-bottom: 15px; color: #1e293b; border-radius: 0 4px 4px 0; border-left: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <i class="fas fa-camera"></i> الشواهد المرئية والصور التوثيقية للفعالية
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
                        ${gridItems}
                    </div>
                </div>
            `;
        }

        comprehensiveHtml += `
            <div class="print-page-unified print-theme-blue" style="min-height: 297mm; display: flex; flex-direction: column; box-sizing: border-box; ${idx > 0 ? 'page-break-before: always; break-before: page;' : ''}">
                <div class="print-header-unified">
                    <div class="header-right-info" style="width: 38%; text-align: right; font-weight: bold; line-height: 1.6; font-size: 1.05rem; color: #1e293b;">
                        المملكة العربية السعودية<br>
                        وزارة التعليم<br>
                        <span>${orgName}</span><br>
                        <span>${deptName}</span>
                    </div>
                    <div class="header-center-logo-place"></div>
                    <div class="header-left-logo-container dynamic-print-logo-container" style="width: 130px; height: 130px; display: flex; align-items: center; justify-content: flex-end;">
                        ${logoHtml}
                    </div>
                </div>

                <div class="print-title-badge-container" style="text-align: center; margin-bottom: 30px; width: 100%;">
                    <div class="print-title-badge-unified" style="font-size: 1.35rem; font-weight: 800; color: #3b82f6; border: 2px solid #3b82f6; padding: 8px 35px; border-radius: 50px; display: inline-block; background: #eff6ff;">
                        تقرير تقييم فعالية
                    </div>
                </div>

                <div class="print-info-box-unified" style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 22px; margin-bottom: 30px;">
                    <table class="print-info-table-unified" style="width: 100%; border-collapse: collapse; font-size: 1.1rem; color: #1e293b;">
                        <tr style="border-bottom: 1.5px solid #edf2f7;">
                            <td class="label" style="font-weight: 800; width: 160px; color: #475569; padding: 12px 10px;">الفعالية:</td>
                            <td class="value" style="font-weight: 600; padding: 12px 10px; font-weight: bold;">${book.title}</td>
                        </tr>
                        <tr style="border-bottom: 1.5px solid #edf2f7;">
                            <td class="label" style="font-weight: 800; width: 160px; color: #475569; padding: 12px 10px;">الجهة المنظمة:</td>
                            <td class="value" style="font-weight: 600; padding: 12px 10px;">${book.entityName}</td>
                        </tr>
                        <tr style="border-bottom: 1.5px solid #edf2f7;">
                            <td class="label" style="font-weight: 800; width: 160px; color: #475569; padding: 12px 10px;">تاريخ التنفيذ:</td>
                            <td class="value" style="font-weight: 600; padding: 12px 10px;">${book.date}</td>
                        </tr>
                        <tr>
                            <td class="label" style="font-weight: 800; width: 160px; color: #475569; padding: 12px 10px;">تاريخ التقرير:</td>
                            <td class="value" style="font-weight: 600; padding: 12px 10px;">${new Date().toLocaleDateString('ar-SA-u-nu-latn')}</td>
                        </tr>
                    </table>
                </div>

                <div class="print-section-unified" style="margin-bottom: 25px; width: 100%;">
                    <div class="print-section-title-unified" style="background: #f8fafc; padding: 10px 15px; border-right: 5px solid #3b82f6; font-size: 1.1rem; font-weight: 800; margin-bottom: 15px; color: #1e293b; border-radius: 0 4px 4px 0; border-left: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <i class="fas fa-plus-circle"></i> الإيجابيات ومكاسب الفعالية
                    </div>
                    <div style="padding: 10px; line-height: 1.8; font-size: 1.05rem; min-height: 80px; white-space: pre-wrap; color: #1e293b;">${book.positives || 'لم يتم تسجيل إيجابيات'}</div>
                </div>

                <div class="print-section-unified" style="margin-bottom: 25px; width: 100%;">
                    <div class="print-section-title-unified" style="background: #f8fafc; padding: 10px 15px; border-right: 5px solid #3b82f6; font-size: 1.1rem; font-weight: 800; margin-bottom: 15px; color: #1e293b; border-radius: 0 4px 4px 0; border-left: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <i class="fas fa-minus-circle"></i> السلبيات وملاحظات التحسين
                    </div>
                    <div style="padding: 10px; line-height: 1.8; font-size: 1.05rem; min-height: 80px; white-space: pre-wrap; color: #1e293b;">${book.negatives || 'لم يتم تسجيل ملاحظات سلبية'}</div>
                </div>

                <div class="print-section-unified" style="margin-bottom: 25px; width: 100%;">
                    <div class="print-section-title-unified" style="background: #f8fafc; padding: 10px 15px; border-right: 5px solid #3b82f6; font-size: 1.1rem; font-weight: 800; margin-bottom: 15px; color: #1e293b; border-radius: 0 4px 4px 0; border-left: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <i class="fas fa-lightbulb"></i> التوصيات والمقترحات التطويرية
                    </div>
                    <div style="padding: 10px; line-height: 1.8; font-size: 1.05rem; min-height: 80px; white-space: pre-wrap; color: #1e293b;">${book.recommendations || 'لم يتم تسجيل توصيات'}</div>
                </div>

                ${evidenceHtml}

                <div class="print-footer-unified" style="margin-top: auto; border-top: 1.5px solid #edf2f7; padding-top: 18px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #64748b; width: 100%;">
                    <div>نظام إتقان - إدارة الموارد والفعاليات</div>
                    <div class="footer-left-info" style="font-style: italic;">صفحة ${idx + 1} من ${totalCount}</div>
                </div>
            </div>
        `;
    });

    const previewContainer = document.getElementById('paper-preview-container');
    if (previewContainer) {
        previewContainer.style.width = '210mm';
        previewContainer.innerHTML = comprehensiveHtml;
    }

    const reportTitleText = 'التقرير الشامل لتقييمات الفعاليات';
    window.currentReportTitle = reportTitleText;
    document.title = reportTitleText;
    document.getElementById('report-preview-modal').classList.add('active');
};

window.handleEventEvidenceUpload = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!window.currentEventEvidence) {
        window.currentEventEvidence = [];
    }

    let loadedCount = 0;
    const targetLength = files.length;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
            showToast('حجم الصورة كبير جداً. يرجى اختيار صور أقل من 5 ميجابايت.', 'error');
            loadedCount++;
            continue;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            window.currentEventEvidence.push(e.target.result);
            loadedCount++;
            if (loadedCount === targetLength) {
                renderEventEvidenceThumbnails();
                showToast('✅ تم إرفاق شواهد الفعالية بنجاح!', 'success');
            }
        };
        reader.readAsDataURL(file);
    }
};

window.removeEventEvidence = (index) => {
    if (window.currentEventEvidence) {
        window.currentEventEvidence.splice(index, 1);
        renderEventEvidenceThumbnails();
        showToast('تمت إزالة الصورة من شواهد الفعالية', 'info');
    }
};

window.renderEventEvidenceThumbnails = () => {
    const container = document.getElementById('event-evidence-thumbnails');
    if (!container) return;

    if (!window.currentEventEvidence || window.currentEventEvidence.length === 0) {
        container.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-muted);">لا توجد شواهد مرفقة حالياً</span>';
        return;
    }

    container.innerHTML = window.currentEventEvidence.map((img, index) => `
        <div style="position: relative; width: 75px; height: 75px; border-radius: 8px; overflow: hidden; border: 2px solid var(--glass-border); background: rgba(0,0,0,0.2);">
            <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;">
            <button onclick="removeEventEvidence(${index})" style="position: absolute; top: 2px; left: 2px; background: rgba(239, 68, 68, 0.85); border: none; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.85rem; line-height: 1; outline: none;">&times;</button>
        </div>
    `).join('');
};

// --- Maintenance & Backup Functions ---

window.showMaintMessage = (text, type = 'success') => {
    const el = document.getElementById('maintenance-status');
    if (!el) return;
    el.style.display = 'block';
    el.style.background = type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    el.style.color = type === 'success' ? '#10b981' : '#ef4444';
    el.style.border = `1px solid ${type === 'success' ? '#10b981' : '#ef4444'}`;
    el.innerHTML = text;
};

window.runProjectBackup = async () => {
    window.showMaintMessage('<i class="fas fa-spinner fa-spin"></i> جاري إنشاء نسخة شاملة للمشروع، يرجى الانتظار...', 'success');
    
    try {
        const result = await window.electronAPI.backupProject();
        if (result.success) {
            window.showMaintMessage(`
                <div style="font-weight: bold; margin-bottom: 5px;">✅ تم إنشاء النسخة الاحتياطية بنجاح!</div>
                <div style="font-size: 0.8rem;">الملف: ${result.name}</div>
                <button onclick="window.electronAPI.openPath('${result.path.replace(/\\/g, '\\\\')}')" style="margin-top: 10px; padding: 5px 15px; border-radius: 6px; border: 1px solid #10b981; background: transparent; color: #10b981; cursor: pointer;">
                    <i class="fas fa-folder-open"></i> فتح موقع الملف
                </button>
            `, 'success');
        } else {
            window.showMaintMessage('❌ فشل إنشاء النسخة: ' + result.error, 'error');
        }
    } catch (e) {
        window.showMaintMessage('❌ خطأ في النظام: ' + e.message, 'error');
    }
};

window.runDataExport = async () => {
    try {
        const result = await window.electronAPI.exportData(state);
        if (result.success) {
            window.showMaintMessage(`✅ تم تصدير البيانات بنجاح إلى: <br> <span style="font-size: 0.8rem; opacity: 0.8;">${result.path}</span>`, 'success');
        }
    } catch (e) {
        window.showMaintMessage('❌ فشل التصدير: ' + e.message, 'error');
    }
};

window.runDataImport = async () => {
    if (!confirm('تحذير: استيراد بيانات جديدة سيؤدي لمسح البيانات الحالية واستبدالها. هل أنت متأكد؟')) return;

    try {
        const result = await window.electronAPI.importData();
        if (result.success && result.data) {
            // Update state and persist
            Object.assign(state, result.data);
            saveState();
            
            window.showMaintMessage('✅ تم استيراد البيانات بنجاح! جاري تحديث البرنامج...', 'success');
            setTimeout(() => location.reload(), 1500);
        } else if (result.error) {
            window.showMaintMessage('❌ خطأ في الاستيراد: ' + result.error, 'error');
        }
    } catch (e) {
        window.showMaintMessage('❌ خطأ في النظام: ' + e.message, 'error');
    }
};

window.runFormExport = async () => {
    try {
        const result = await window.electronAPI.exportForm();
        if (result.success) {
            window.showMaintMessage(`✅ تم تصدير النموذج بنجاح إلى: <br> <span style="font-size: 0.8rem; opacity: 0.8;">${result.path}</span>`, 'success');
        } else if (result.error) {
            window.showMaintMessage('❌ فشل التصدير: ' + result.error, 'error');
        }
    } catch (e) {
        window.showMaintMessage('❌ فشل التصدير: ' + e.message, 'error');
    }
};

window.showDayDetails = (dateStr) => {
    const dayBookings = state.bookings.filter(b => b.date === dateStr);
    if (dayBookings.length === 0) return;

    const body = document.getElementById('booking-details-body');
    body.innerHTML = dayBookings.map(b => {
        const room = state.rooms.find(r => r.id === b.roomId);
        return `
            <div class="glass-card" style="padding: 20px; border-right: 4px solid var(--primary); background: rgba(0, 210, 255, 0.02); margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: var(--primary); font-weight: 800; font-size: 1.1rem;">${b.title}</span>
                    <span class="cal-badge" style="background: rgba(0, 210, 255, 0.1); color: var(--primary);">${b.timePeriod}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.9rem; margin-bottom: 15px;">
                    <div><i class="fas fa-university" style="color: var(--secondary);"></i> <strong>الجهة:</strong> ${b.entityName}</div>
                    <div><i class="fas fa-map-marker-alt" style="color: var(--secondary);"></i> <strong>المقر:</strong> ${room ? room.name : '---'}</div>
                    <div><i class="fas fa-clock" style="color: var(--secondary);"></i> <strong>الوقت:</strong> ${formatTime12h(b.time)}</div>
                    <div><i class="fas fa-calendar-alt" style="color: var(--secondary);"></i> <strong>التاريخ:</strong> ${b.date}</div>
                </div>
                <div style="display: flex; gap: 10px; border-top: 1px solid var(--glass-border); padding-top: 10px;">
                    <button class="btn-secondary" onclick="editBooking(${b.id})" style="flex: 1; padding: 6px; font-size: 0.85rem; background: rgba(0, 210, 255, 0.1); border-color: var(--primary); color: var(--primary);">
                        <i class="fas fa-edit"></i> تعديل الحجز
                    </button>
                    <button class="btn-secondary" onclick="deleteBooking(${b.id})" style="flex: 1; padding: 6px; font-size: 0.85rem; background: rgba(239, 68, 68, 0.1); border-color: var(--danger); color: var(--danger);">
                        <i class="fas fa-trash"></i> حذف الحجز
                    </button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('booking-details-modal').classList.add('active');
};

window.closeDetailsModal = () => {
    document.getElementById('booking-details-modal').classList.remove('active');
};

window.editBooking = (id) => {
    const book = state.bookings.find(b => b.id === id);
    if (!book) return;

    const idField = document.getElementById('book-id');
    if (idField) idField.value = id;
    
    closeDetailsModal();
    
    // Open the booking form modal
    const modal = document.getElementById('booking-detail-modal'); // Based on your code it might be booking-detail-modal
    if (modal) modal.classList.add('active');
    
    // Populate form with existing data
    fillBookingForm(book);
    
    // Change button text and title
    const submitBtn = document.querySelector('#booking-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'تحديث بيانات الحجز';
    
    const modalTitle = document.getElementById('booking-modal-title');
    if (modalTitle) modalTitle.textContent = 'تعديل بيانات الحجز';
};

window.closeBookingModal = () => {
    const modal = document.getElementById('booking-detail-modal');
    if (modal) modal.classList.remove('active');
    
    const form = document.getElementById('booking-form');
    if (form) form.reset();
    
    const idField = document.getElementById('book-id');
    if (idField) idField.value = '';
    
    const submitBtn = document.querySelector('#booking-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'تأكيد الحجز الفاخر';
    
    const modalTitle = document.getElementById('booking-modal-title');
    if (modalTitle) modalTitle.textContent = 'حجز موعد جديد';
};

// Duplicate deleteBooking removed
// Multi-Select Dropdown Helpers
window.toggleMultiSelectDropdown = (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('multi-select-dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
};

window.toggleOtherEventTypeInput = () => {
    const checkbox = document.getElementById('event-type-other-checkbox');
    const wrapper = document.getElementById('other-event-type-input-wrapper');
    if (checkbox && wrapper) {
        wrapper.style.display = checkbox.checked ? 'block' : 'none';
        if (checkbox.checked) document.getElementById('book-other-event-type').focus();
    }
};

window.toggleRoomSelection = (id, e) => {
    e.stopPropagation();
    const cb = document.querySelector(`input[name="book-room-ids"][value="${id}"]`);
    if (cb) {
        cb.checked = !cb.checked;
        window.updateSelectedRoomsText();
    }
};

window.updateSelectedRoomsText = () => {
    const cbs = Array.from(document.querySelectorAll('input[name="book-room-ids"]:checked'));
    const textEl = document.getElementById('selected-rooms-text');
    if (!textEl) return;
    
    if (cbs.length === 0) {
        textEl.textContent = 'إضغط لاختيار المقر/المقرات...';
    } else if (cbs.length === 1) {
        const roomName = cbs[0].parentElement.querySelector('span').textContent;
        textEl.textContent = roomName;
    } else {
        const firstRoom = cbs[0].parentElement.querySelector('span').textContent;
        textEl.textContent = `${firstRoom} (+${cbs.length - 1} أخرى)`;
    }
};

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    const dropdown = document.getElementById('multi-select-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    
    const blacklistDropdown = document.getElementById('blacklist-reason-dropdown');
    if (blacklistDropdown) {
        blacklistDropdown.style.display = 'none';
        const chevron = document.querySelector('#blacklist-reason-header i');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
});

function formatTime12h(time24) {
    if (!time24 || !time24.includes(':')) return time24;
    let [hours, minutes] = time24.split(':');
    hours = parseInt(hours);
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// ==========================================
// Smart Evaluation Assistant Helper Functions (LocalStorage & Dynamic Presets)
// ==========================================
const defaultEvalPresets = {
    positives: [
        { title: 'المحتوى', content: 'قيمة المادة المقدمة، كفاءة المتحدثين، ملاءمة المحتوى للجمهور' },
        { title: 'الحضور', content: 'تحقيق العدد المستهدف، تنوع الفئات، مستوى التفاعل' },
        { title: 'الهوية والاتصال', content: 'وضوح الشعارات، قوة الحملة الإعلانية، سهولة الوصول للموقع' },
        { title: 'التجهيزات التقنية', content: 'جودة الصوت والصورة، ثبات الإنترنت، جودة العرض المرئي' },
        { title: 'الضيافة والاستقبال', content: 'جودة الاستقبال، سرعة التسجيل، مستوى التموين/Catering' }
    ],
    negatives: [
        { title: 'إدارة الوقت', content: 'تأخر البدء، تجاوز الوقت المحدد للفقرات، طول فترات الاستراحة' },
        { title: 'الأمن والسلامة', content: 'نقص الكوادر الأمنية، غياب التفتيش النسائي، سوء مخارج الطوارئ' },
        { title: 'الدعم اللوجستي', content: 'مشاكل التكييف/الإضاءة، نقص المرافق الأساسية، عدم جاهزية دورات المياه' },
        { title: 'إدارة الحشود', content: 'تكدس عند المداخل، تداخل المسارات، غياب اللوحات الإرشادية' },
        { title: 'التواصل الميداني', content: 'تضارب معلومات المنظمين، غياب نقطة استعلامات واضحة' }
    ],
    recommendations: [
        { title: 'تفعيل الـ Checklist', content: 'اعتماد قائمة مراجعة نهائية قبل انطلاق الفعالية بـ 24 ساعة (Final Walkthrough)' },
        { title: 'توزيع المهام', content: 'وجود هيكل تنظيمي واضح (مراقب فني، مسؤول أمني، مشرف حشود) مع أجهزة اتصال لاسلكية' },
        { title: 'خطط الطوارئ', content: 'توفير فريق فني مرابط وصيانة دورية فورية لأي عطل طارئ' },
        { title: 'تجربة العميل (UX)', content: 'تخصيص فريق سرية لمراجعة مسار الزائر من الباب وحتى الخروج لرصد أي مضايقات' },
        { title: 'التوثيق والتقييم', content: 'توزيع استبيان رقمي سريع (QR Code) للجمهور أثناء الفعالية لقياس الرضا الفوري' }
    ]
};

window.evaluationPresets = {};

window.loadEvaluationPresets = function() {
    const saved = localStorage.getItem('itqan_evaluation_presets');
    if (saved) {
        try {
            window.evaluationPresets = JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing evaluation presets', e);
            window.evaluationPresets = JSON.parse(JSON.stringify(defaultEvalPresets));
        }
    } else {
        window.evaluationPresets = JSON.parse(JSON.stringify(defaultEvalPresets));
        localStorage.setItem('itqan_evaluation_presets', JSON.stringify(window.evaluationPresets));
    }
};

window.renderEvaluationPresets = function() {
    if (!window.evaluationPresets || Object.keys(window.evaluationPresets).length === 0) {
        window.loadEvaluationPresets();
    }
    
    const categories = ['positives', 'negatives', 'recommendations'];
    const textareaIds = {
        positives: 'book-positives',
        negatives: 'book-negatives',
        recommendations: 'book-recommendations'
    };
    const chipClasses = {
        positives: 'success-chip',
        negatives: 'danger-chip',
        recommendations: 'primary-chip'
    };
    const headers = {
        positives: '💡 معايير النجاح (اضغط للإضافة السريعة):',
        negatives: '💡 الفجوات التشغيلية (اضغط للإضافة السريعة):',
        recommendations: '💡 خارطة الطريق والحلول (اضغط للإضافة السريعة):'
    };

    categories.forEach(category => {
        const container = document.getElementById(`${category}-presets-container`);
        if (!container) return;

        const targetId = textareaIds[category];
        const chipClass = chipClasses[category];
        const labelText = headers[category];

        let html = `<span style="font-size: 0.75rem; color: var(--text-muted); width: 100%; margin-bottom: 2px; display: block;">${labelText}</span>`;

        // Render current list of preset chips
        window.evaluationPresets[category].forEach((preset, index) => {
            html += `
                <div class="eval-chip ${chipClass}">
                    <span class="chip-text" onclick="window.appendEvaluationPreset('${targetId}', '${preset.title}', '${preset.content}')" style="cursor: pointer;">
                        <i class="fas fa-plus"></i> ${preset.title}
                    </span>
                    <span class="chip-delete" onclick="window.deleteEvaluationPreset('${category}', ${index})" title="حذف">&times;</span>
                </div>
            `;
        });

        // Add "+ Add Custom Criteria" button
        html += `
            <button type="button" class="eval-chip add-preset-btn" onclick="window.toggleAddPresetForm('${category}')" style="border-style: dashed; border-color: rgba(255,255,255,0.2); background: transparent; color: var(--primary-light);">
                <i class="fas fa-plus-circle"></i> + معيار جديد
            </button>
        `;

        container.innerHTML = html;
    });
};

window.toggleAddPresetForm = function(category) {
    const form = document.getElementById(`add-preset-form-${category}`);
    if (!form) return;
    if (form.style.display === 'none') {
        form.style.display = 'block';
        const titleInput = document.getElementById(`new-preset-title-${category}`);
        const contentInput = document.getElementById(`new-preset-content-${category}`);
        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';
        if (titleInput) titleInput.focus();
    } else {
        form.style.display = 'none';
    }
};

window.addEvaluationPreset = function(category) {
    const titleInput = document.getElementById(`new-preset-title-${category}`);
    const contentInput = document.getElementById(`new-preset-content-${category}`);
    if (!titleInput || !contentInput) return;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        if (typeof showToast === 'function') {
            showToast('يرجى كتابة عنوان المعيار وتفاصيله أولاً!', 'warning');
        } else {
            alert('يرجى كتابة عنوان المعيار وتفاصيله أولاً!');
        }
        return;
    }

    if (!window.evaluationPresets[category]) {
        window.evaluationPresets[category] = [];
    }
    
    const exists = window.evaluationPresets[category].some(p => p.title.toLowerCase() === title.toLowerCase());
    if (exists) {
        if (typeof showToast === 'function') {
            showToast('هذا المعيار موجود بالفعل في القائمة!', 'warning');
        } else {
            alert('هذا المعيار موجود بالفعل في القائمة!');
        }
        return;
    }

    window.evaluationPresets[category].push({ title, content });
    localStorage.setItem('itqan_evaluation_presets', JSON.stringify(window.evaluationPresets));
    window.renderEvaluationPresets();
    window.toggleAddPresetForm(category);

    if (typeof showToast === 'function') {
        showToast(`تمت إضافة معيار [${title}] كخيار سريع`, 'success');
    }
};

window.deleteEvaluationPreset = function(category, index) {
    if (!window.evaluationPresets[category]) return;
    
    const preset = window.evaluationPresets[category][index];
    if (!preset) return;

    if (!confirm(`هل أنت متأكد من رغبتك في حذف المعيار [${preset.title}] من قائمة الخيارات السريعة؟`)) return;

    window.evaluationPresets[category].splice(index, 1);
    localStorage.setItem('itqan_evaluation_presets', JSON.stringify(window.evaluationPresets));
    window.renderEvaluationPresets();

    if (typeof showToast === 'function') {
        showToast(`تم حذف المعيار [${preset.title}] من القائمة`, 'info');
    }
};

window.appendEvaluationPreset = function(targetId, title, content) {
    const textarea = document.getElementById(targetId);
    if (!textarea) return;
    
    let currentText = textarea.value.trim();
    const newItem = `* **${title}:** ${content}.`;
    
    if (currentText) {
        if (currentText.includes(title)) {
            if (typeof showToast === 'function') {
                showToast(`المعيار [${title}] مضاف بالفعل!`, 'info');
            } else {
                alert(`المعيار [${title}] مضاف بالفعل!`);
            }
            return;
        }
        textarea.value = currentText + '\n' + newItem;
    } else {
        textarea.value = newItem;
    }
    
    textarea.dispatchEvent(new Event('input'));
    
    if (typeof showToast === 'function') {
        showToast(`تمت إضافة معيار [${title}] بنجاح`, 'success');
    }
};

window.fillSpecificReportPreset = function() {
    const positives = `* **جودة المحتوى:** قوة الطرح وتمكن المتحدثين من المادة العلمية.
* **الإقبال الجماهيري:** حضور لافت وتفاعل ملموس من المستهدفين.
* **الهوية البصرية:** حملة تسويقية ناجحة وتصميم بصري جذاب وواضح.`;

    const negatives = `* **انعدام الدعم الفني:** مخاطرة عالية لغياب فرق الصيانة (تكييف، كهرباء، تقنية).
* **غياب الكادر النسائي:** قصور أمني وتنظيمي في التعامل مع الحضور النسائي بخصوصية.
* **ضعف الإدارة الميدانية:** عشوائية في توجيه الحشود وتضارب في المعلومات بسبب غياب فريق التنظيم.`;

    const recommendations = `* **التعاقد المسبق:** إلزام شركات الصيانة والتشغيل بالتواجد الميداني قبل وأثناء الفعالية.
* **تكامل الفريق الأمني:** توفير كوادر نسائية متخصصة للأمن والسلامة لضمان الانسيابية.
* **هيكلة التنظيم:** تعيين فريق تنظيم ميداني (بزي موحد) ومهام محددة لإدارة تدفق الزوار.
* **قائمة التدقيق (Checklist):** عدم تفعيل أي فعالية مستقبلاً دون التأكد من جاهزية "المرفقات والخدمات" تقنياً وبشرياً.`;

    const posField = document.getElementById('book-positives');
    const negField = document.getElementById('book-negatives');
    const recField = document.getElementById('book-recommendations');

    if (posField) {
        posField.value = positives;
        posField.dispatchEvent(new Event('input'));
    }
    if (negField) {
        negField.value = negatives;
        negField.dispatchEvent(new Event('input'));
    }
    if (recField) {
        recField.value = recommendations;
        recField.dispatchEvent(new Event('input'));
    }

    if (typeof showToast === 'function') {
        showToast('⚡ تم تعبئة تقرير الحدث الحالي بنجاح!', 'success');
    }
};

window.clearEvaluationFields = function() {
    if (!confirm('هل أنت متأكد من رغبتك في مسح كافة حقول التقييم الحالية؟')) return;
    
    const posField = document.getElementById('book-positives');
    const negField = document.getElementById('book-negatives');
    const recField = document.getElementById('book-recommendations');

    if (posField) {
        posField.value = '';
        posField.dispatchEvent(new Event('input'));
    }
    if (negField) {
        negField.value = '';
        negField.dispatchEvent(new Event('input'));
    }
    if (recField) {
        recField.value = '';
        recField.dispatchEvent(new Event('input'));
    }

    if (typeof showToast === 'function') {
        showToast('تم مسح كافة الحقول بنجاح', 'info');
    }
};

// Auto boot on load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.loadEvaluationPresets();
    window.renderEvaluationPresets();
    window.loadBlacklist();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.loadEvaluationPresets();
        window.renderEvaluationPresets();
        window.loadBlacklist();
    });
}

// ==========================================
// Blacklist (القائمة السوداء) Management Logic
// ==========================================
const defaultBlacklist = [
    { type: 'entity', value: 'مؤسسة التنظيم العشوائي', reason: 'عدم الالتزام بضوابط المحافظة على الأجهزة والصوتيات وترك المسرح بحالة فوضى وتلف التمديدات.', date: '2026-05-01' },
    { type: 'coordinator', value: 'خالد بن محمد', reason: 'تكرار إلغاء الحجوزات المؤكدة في وقت حرج جداً دون إخطار مسبق مما تسبب في هدر حجوزات مسرح الإدارة.', date: '2026-05-05' }
];

window.blacklistData = [];

window.loadBlacklist = function() {
    const saved = localStorage.getItem('itqan_blacklist');
    if (saved) {
        try {
            window.blacklistData = JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing blacklist data', e);
            window.blacklistData = JSON.parse(JSON.stringify(defaultBlacklist));
        }
    } else {
        window.blacklistData = JSON.parse(JSON.stringify(defaultBlacklist));
        localStorage.setItem('itqan_blacklist', JSON.stringify(window.blacklistData));
    }
};

window.renderBlacklistTable = function(searchQuery = '') {
    if (!window.blacklistData || window.blacklistData.length === 0) {
        window.loadBlacklist();
    }
    
    const tbody = document.getElementById('blacklist-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    const query = (searchQuery || '').trim().toLowerCase();

    const filtered = window.blacklistData.filter(item => {
        if (!query) return true;
        const val = item.value.toLowerCase();
        const reason = item.reason.toLowerCase();
        const typeText = item.type === 'entity' ? 'جهة' : 'منسق';
        return val.includes(query) || reason.includes(query) || typeText.includes(query);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    <i class="fas fa-user-shield" style="font-size: 2.5rem; display: block; margin-bottom: 12px; color: var(--text-muted); opacity: 0.5;"></i>
                    لا توجد جهات أو منسقين محظورين يطابقون البحث حالياً.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach((item, index) => {
        const typeBadge = item.type === 'entity' 
            ? `<span style="background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;"><i class="fas fa-building"></i> جهة منظمة</span>`
            : `<span style="background: rgba(245,158,11,0.1); color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;"><i class="fas fa-user"></i> منسق فعالية</span>`;

        const originalIndex = window.blacklistData.indexOf(item);

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--glass-border)';
        tr.style.height = '60px';
        tr.style.cursor = 'pointer';
        tr.style.transition = 'background 0.2s ease';
        tr.innerHTML = `
            <td style="padding: 10px;">${typeBadge}</td>
            <td style="padding: 10px; font-weight: 700; color: white;">${item.value}</td>
            <td style="padding: 10px; max-width: 350px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; white-space: normal;">${item.reason}</td>
            <td style="padding: 10px; font-size: 0.8rem; color: var(--text-muted);">${item.date || '---'}</td>
            <td style="padding: 10px; text-align: left;">
                <button type="button" class="btn-secondary" onclick="window.deleteBlacklistEntry(${originalIndex})" style="padding: 5px 12px; border-color: rgba(255,255,255,0.1); color: #ef4444; background: rgba(239,68,68,0.05); font-size: 0.75rem; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-trash-can"></i> إزالة
                </button>
            </td>
        `;

        // Click row to show details modal
        tr.onclick = (e) => {
            if (e.target.closest('button')) return;
            window.openBlacklistDetails(item);
        };

        // Hover styles
        tr.addEventListener('mouseenter', () => { tr.style.background = 'rgba(239, 68, 68, 0.03)'; });
        tr.addEventListener('mouseleave', () => { tr.style.background = 'transparent'; });

        tbody.appendChild(tr);
    });
};

// Multi-Select Blacklist Reasons Helpers
window.toggleBlacklistReasonDropdown = (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('blacklist-reason-dropdown');
    const chevron = document.querySelector('#blacklist-reason-header i');
    if (dropdown) {
        const isShown = dropdown.style.display === 'block';
        dropdown.style.display = isShown ? 'none' : 'block';
        if (chevron) {
            chevron.style.transform = isShown ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }
};

window.toggleBlacklistReasonSelection = (bandKey, e) => {
    e.stopPropagation();
    const cb = document.getElementById(`reason-${bandKey}`);
    if (cb) {
        cb.checked = !cb.checked;
        window.updateSelectedBlacklistReasonsText();
    }
};

window.updateSelectedBlacklistReasonsText = () => {
    const checkedBoxes = Array.from(document.querySelectorAll('input[name="blacklist-reasons-checkboxes"]:checked'));
    const textEl = document.getElementById('selected-blacklist-reasons-text');
    const textarea = document.getElementById('blacklist-reason');
    
    if (!textEl) return;
    
    if (checkedBoxes.length === 0) {
        textEl.textContent = 'اضغط لاختيار بند أو أكثر من بنود المخالفة...';
        textEl.style.color = '#cbd5e1';
    } else if (checkedBoxes.length === 1) {
        const name = checkedBoxes[0].parentElement.querySelector('span').textContent;
        textEl.textContent = name;
        textEl.style.color = 'white';
    } else {
        const first = checkedBoxes[0].parentElement.querySelector('span').textContent;
        textEl.textContent = `${first} (+${checkedBoxes.length - 1} بنود أخرى)`;
        textEl.style.color = 'white';
    }
    
    // Toggle other/custom reason text area
    const customChecked = checkedBoxes.some(cb => cb.value === 'custom');
    if (textarea) {
        if (customChecked) {
            textarea.style.display = 'block';
            textarea.setAttribute('required', 'true');
            // Don't auto-reset value so they don't lose typed text if toggled, but ensure it starts empty if it was hidden
            if (textarea.style.display === 'none') {
                textarea.value = '';
            }
        } else {
            textarea.style.display = 'none';
            textarea.removeAttribute('required');
        }
    }
};

window.openAddBlacklistModal = function(isFromBooking) {
    if (!isFromBooking) {
        window.pendingBlacklistEntity = null;
        window.pendingBlacklistCoordinator = null;
    }
    const modal = document.getElementById('blacklist-modal');
    if (modal) {
        modal.classList.add('active');
        const form = document.getElementById('blacklist-form');
        if (form) form.reset();
        
        // Reset custom checkboxes and text field
        const checkboxes = document.querySelectorAll('input[name="blacklist-reasons-checkboxes"]');
        checkboxes.forEach(cb => cb.checked = false);
        
        const dropdown = document.getElementById('blacklist-reason-dropdown');
        if (dropdown) dropdown.style.display = 'none';
        
        const chevron = document.querySelector('#blacklist-reason-header i');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
        
        window.updateSelectedBlacklistReasonsText();
        
        const textarea = document.getElementById('blacklist-reason');
        if (textarea) {
            textarea.value = '';
            textarea.style.display = 'none';
            textarea.removeAttribute('required');
        }
        
        document.getElementById('blacklist-value').focus();
    }
};

window.closeBlacklistModal = function() {
    const modal = document.getElementById('blacklist-modal');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.handleBlacklistSubmit = function(e) {
    if (e) e.preventDefault();
    
    const type = document.getElementById('blacklist-type').value;
    const value = document.getElementById('blacklist-value').value.trim();
    
    // Construct concatenated reasons list
    const checkedBoxes = Array.from(document.querySelectorAll('input[name="blacklist-reasons-checkboxes"]:checked'));
    if (checkedBoxes.length === 0) {
        if (typeof showToast === 'function') {
            showToast('يرجى اختيار بند واحد على الأقل من مبررات الحظر!', 'warning');
        } else {
            alert('يرجى اختيار بند واحد على الأقل من مبررات الحظر!');
        }
        return;
    }

    let reasonsArray = [];
    checkedBoxes.forEach(cb => {
        if (cb.value !== 'custom') {
            reasonsArray.push(cb.value);
        } else {
            const customText = document.getElementById('blacklist-reason').value.trim();
            if (customText) {
                reasonsArray.push(`أخرى: ${customText}`);
            } else {
                // If custom is checked but empty, prompt user or add a placeholder
                reasonsArray.push('أخرى (سبب مخصص)');
            }
        }
    });

    const reason = reasonsArray.join('\n');

    if (!value || !reason) {
        if (typeof showToast === 'function') {
            showToast('يرجى تعبئة كافة الحقول المطلوبة أولاً!', 'warning');
        } else {
            alert('يرجى تعبئة كافة الحقول المطلوبة أولاً!');
        }
        return;
    }

    // Check duplicate
    const exists = window.blacklistData.some(item => item.value.toLowerCase() === value.toLowerCase() && item.type === type);
    if (exists) {
        if (typeof showToast === 'function') {
            showToast('هذا الاسم أو الجهة مدرجة بالفعل في القائمة السوداء!', 'warning');
        } else {
            alert('هذا الاسم أو الجهة مدرجة بالفعل في القائمة السوداء!');
        }
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    window.blacklistData.push({ type, value, reason, date: today });
    localStorage.setItem('itqan_blacklist', JSON.stringify(window.blacklistData));
    
    window.renderBlacklistTable();
    window.closeBlacklistModal();

    if (typeof showToast === 'function') {
        showToast('تمت إضافة الكيان إلى القائمة السوداء وتفعيل الحظر التلقائي!', 'success');
    }
};

window.deleteBlacklistEntry = function(index) {
    const item = window.blacklistData[index];
    if (!item) return;

    if (!confirm(`هل أنت متأكد من رغبتك في إزالة [ ${item.value} ] وحذفه من القائمة السوداء؟`)) return;

    window.blacklistData.splice(index, 1);
    localStorage.setItem('itqan_blacklist', JSON.stringify(window.blacklistData));
    window.renderBlacklistTable();

    if (typeof showToast === 'function') {
        showToast('تمت إزالة الكيان بنجاح من القائمة السوداء', 'info');
    }
};

window.checkBlacklist = function(entityName, coordinatorName) {
    if (!window.blacklistData || window.blacklistData.length === 0) {
        window.loadBlacklist();
    }

    const ent = (entityName || '').trim().toLowerCase();
    const coord = (coordinatorName || '').trim().toLowerCase();

    for (let item of window.blacklistData) {
        const val = item.value.trim().toLowerCase();
        if (item.type === 'entity' && ent && ent.includes(val)) {
            return item;
        }
        if (item.type === 'coordinator' && coord && coord.includes(val)) {
            return item;
        }
    }
    return null;
};

window.printBlacklist = () => {
    window.currentPrintContext = 'landscape';
    if (!window.blacklistData || window.blacklistData.length === 0) {
        window.loadBlacklist();
    }
    
    if (window.blacklistData.length === 0) {
        alert('لا توجد جهات أو منسقين محظورين في القائمة السوداء لطباعتها.');
        return;
    }

    // Build Table Body
    const tableHtml = window.blacklistData.map(item => {
        const typeText = item.type === 'entity' ? 'جهة منظمة' : 'منسق فعالية';
        return `
            <tr style="border-bottom: 1px solid #eee; height: 35px;">
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${typeText}</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #b91c1c;">${item.value}</td>
                <td style="padding: 10px; border: 1px solid #ddd; white-space: normal; line-height: 1.5; max-width: 380px;">${item.reason}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.date || '---'}</td>
            </tr>
        `;
    }).join('');

    document.getElementById('blacklist-print-count').textContent = window.blacklistData.length;
    document.getElementById('blacklist-print-gen-date').textContent = new Date().toLocaleString('ar-SA-u-nu-latn');

    // Inject and Show Preview
    document.getElementById('blacklist-print-table-body').innerHTML = tableHtml;
    
    // Set preview
    const previewContainer = document.getElementById('paper-preview-container');
    if (previewContainer) {
        previewContainer.style.width = '297mm';
        previewContainer.innerHTML = document.getElementById('blacklist-print-template').innerHTML;
    }
    
    // Open preview modal
    window.currentReportTitle = 'القائمة السوداء';
    document.title = `تقرير القائمة السوداء - ${new Date().toISOString().split('T')[0]}`;
    document.getElementById('report-preview-modal').classList.add('active');
};

window.openBlacklistDetails = function(item) {
    window.currentSelectedBlacklistItem = item;
    
    const modal = document.getElementById('blacklist-details-modal');
    if (!modal) return;

    const typeBadge = item.type === 'entity' 
        ? `<span style="background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); padding: 5px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;"><i class="fas fa-building"></i> جهة منظمة</span>`
        : `<span style="background: rgba(245,158,11,0.1); color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); padding: 5px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;"><i class="fas fa-user"></i> منسق فعالية</span>`;

    document.getElementById('blacklist-details-type').innerHTML = typeBadge;
    document.getElementById('blacklist-details-value').textContent = item.value;
    document.getElementById('blacklist-details-reason').textContent = item.reason;
    document.getElementById('blacklist-details-date').textContent = item.date || '---';

    modal.classList.add('active');
};

window.closeBlacklistDetailsModal = function() {
    const modal = document.getElementById('blacklist-details-modal');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.printSingleBlacklist = function() {
    const item = window.currentSelectedBlacklistItem;
    if (!item) return;

    window.currentPrintContext = 'portrait';

    const typeText = item.type === 'entity' ? 'جهة منظمة كاملة' : 'منسق فعالية محدد';
    const randomBanId = Math.floor(1000 + Math.random() * 9000);

    document.getElementById('ban-print-id').textContent = randomBanId;
    document.getElementById('ban-print-type').textContent = typeText;
    document.getElementById('ban-print-value').textContent = item.value;
    document.getElementById('ban-print-date').textContent = item.date || '---';
    document.getElementById('ban-print-reason').textContent = item.reason;
    document.getElementById('ban-print-gen-date').textContent = new Date().toLocaleString('ar-SA-u-nu-latn');

    // Populate digital seal values inside single ban template before moving to preview
    const template = document.getElementById('single-ban-print-template');
    if (template) {
        template.querySelectorAll('.ban-print-archive-id-seal').forEach(el => el.textContent = randomBanId);
        template.querySelectorAll('.ban-print-date-seal').forEach(el => el.textContent = item.date || '---');
    }

    // System branding is applied dynamically to templates list
    const previewContainer = document.getElementById('paper-preview-container');
    if (previewContainer) {
        previewContainer.style.width = '210mm';
        previewContainer.innerHTML = document.getElementById('single-ban-print-template').innerHTML;
    }
    
    // Open preview modal
    window.currentReportTitle = `قرار حظر - ${item.value}`;
    document.title = `قرار حظر - ${item.value}`;
    document.getElementById('report-preview-modal').classList.add('active');
};

window.deleteCurrentBlacklistItem = function() {
    const item = window.currentSelectedBlacklistItem;
    if (!item) return;

    const originalIndex = window.blacklistData.indexOf(item);
    if (originalIndex === -1) return;

    if (!confirm(`هل أنت متأكد من رغبتك في إزالة [ ${item.value} ] وحذفه من القائمة السوداء؟`)) return;

    window.blacklistData.splice(originalIndex, 1);
    localStorage.setItem('itqan_blacklist', JSON.stringify(window.blacklistData));
    
    window.renderBlacklistTable();
    window.closeBlacklistDetailsModal();

    if (typeof showToast === 'function') {
        showToast('تمت إزالة الكيان بنجاح من القائمة السوداء', 'info');
    }
};

window.openAddBlacklistModalFromBooking = function(bookingId) {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    window.pendingBlacklistEntity = booking.entityName;
    window.pendingBlacklistCoordinator = booking.coordName;

    // Open add blacklist modal with isFromBooking = true
    window.openAddBlacklistModal(true);

    const typeSelect = document.getElementById('blacklist-type');
    const valInput = document.getElementById('blacklist-value');

    if (typeSelect && valInput) {
        typeSelect.value = 'entity';
        valInput.value = booking.entityName;
    }

    // Direct user to Blacklist view so they see the modal clearly
    if (typeof switchView === 'function') {
        switchView('blacklist');
    }
};

window.handleBlacklistTypeChange = function(type) {
    const valInput = document.getElementById('blacklist-value');
    if (!valInput) return;

    if (window.pendingBlacklistEntity && window.pendingBlacklistCoordinator) {
        valInput.value = type === 'entity' ? window.pendingBlacklistEntity : window.pendingBlacklistCoordinator;
    }
};
