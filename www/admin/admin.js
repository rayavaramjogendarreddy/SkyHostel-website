// Auth Guard - Run immediately
(function () {
    if (!sessionStorage.getItem('sky_admin_auth')) {
        window.location.href = 'login.html';
    }
})();

// Data Service Configuration
const STORAGE_KEYS = {
    ROOMS: 'sky_hostels_rooms',
    STUDENTS: 'sky_hostels_students',
    PAYMENTS: 'sky_hostels_payments',
    BOOKINGS: 'sky_hostels_bookings',
    CONFIG: 'sky_admin_config'
};

// Initial Data Generation
function generateInitialRooms() {
    const rooms = [];
    // Ground Floor: G1, G2
    rooms.push({ id: 1, number: 'G1', type: '5 Sharing', floor: 0, rent: 8000, capacity: 5, status: 'Available' });
    rooms.push({ id: 2, number: 'G2', type: '5 Sharing', floor: 0, rent: 8000, capacity: 5, status: 'Available' });

    // Rooms 1 to 20 (8 per floor)
    for (let i = 1; i <= 20; i++) {
        const floor = Math.ceil(i / 8);
        rooms.push({
            id: i + 2,
            number: i.toString(),
            type: '5 Sharing',
            floor: floor,
            rent: 8000,
            capacity: 5,
            status: 'Available'
        });
    }
    return rooms;
}

const MOCK_STUDENTS = [];

function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(generateInitialRooms()));
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(MOCK_STUDENTS));
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({ password: 'skyadmin' }));
    }
}

class DataService {
    static getItems(key) { return JSON.parse(localStorage.getItem(key)) || []; }
    static setItem(key, items) { localStorage.setItem(key, JSON.stringify(items)); }
}

// UI Controller
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    const moduleContainer = document.getElementById('module-container');
    const moduleTitle = document.getElementById('module-title');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile Sidebar Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.getElementById('mobile-sidebar-overlay');

    const toggleSidebar = () => {
        if (sidebar && mobileOverlay) {
            sidebar.classList.toggle('open');
            mobileOverlay.classList.toggle('show');
        }
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleSidebar);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const module = link.getAttribute('data-module');
            navLinks.forEach(n => n.classList.remove('active'));
            link.classList.add('active');
            loadModule(module);

            // Close sidebar on mobile after clicking a link
            if (sidebar && sidebar.classList.contains('open')) {
                toggleSidebar();
            }
        });
    });

    function loadModule(module) {
        moduleTitle.textContent = module.charAt(0).toUpperCase() + module.slice(1);
        switch (module) {
            case 'overview': renderOverview(); break;
            case 'rooms': renderRoomsPanel(); break;
            case 'students': renderStudentsList(); break;
            case 'bookings': renderBookings(); break;
            case 'payments': renderPayments(); break;
            case 'account': renderAccount(); break;
            default: moduleContainer.innerHTML = `<div class="stat-card"><h2>Module coming soon</h2></div>`;
        }
    }

    function renderOverview() {
        const rooms = DataService.getItems(STORAGE_KEYS.ROOMS);
        const students = DataService.getItems(STORAGE_KEYS.STUDENTS);
        const available = rooms.filter(r => r.status === 'Available').length;
        const occupied = rooms.filter(r => r.status === 'Occupied').length;

        moduleContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><h3>Total Rooms</h3><p>${rooms.length}</p></div>
                <div class="stat-card"><h3>Available</h3><p>${available}</p></div>
                <div class="stat-card"><h3>Occupied</h3><p>${occupied}</p></div>
                <div class="stat-card"><h3>Students</h3><p>${students.length}</p></div>
            </div>
            <div class="stat-card" style="text-align: left;">
                <h2>Recent Activity</h2>
                <div style="margin-top:1rem; opacity:0.8; line-height:2;">
                    <p>• Administrator logged in successfully</p>
                    <p>• Room management updated to 5-member config</p>
                    <p>• Payment collection ledger updated</p>
                </div>
            </div>
        `;
    }

    function renderRoomsPanel() {
        const rooms = DataService.getItems(STORAGE_KEYS.ROOMS);
        moduleContainer.innerHTML = `
            <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
                <h2>Room Management</h2>
                <button onclick="openAddRoomModal()" class="action-btn">+ Add Room</button>
            </div>
            <div class="rooms-grid">
                ${rooms.map(room => `
                    <div class="room-card ${room.status.toLowerCase()}" onclick="openRoomDetails(${room.id})">
                        <h4>Room ${room.number}</h4>
                        <span>${room.type}</span><br>
                        <small>${room.status}</small>
                    </div>
                `).join('')}
            </div>`;
    }

    function renderStudentsList() {
        const students = DataService.getItems(STORAGE_KEYS.STUDENTS);
        const rooms = DataService.getItems(STORAGE_KEYS.ROOMS);
        moduleContainer.innerHTML = `
            <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <h2>Student Directory</h2>
                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <input type="text" id="studentSearch" placeholder="Search by name, mobile, or room..." onkeyup="filterStudents()" style="padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: white; width: 250px;">
                    <select id="studentStatusFilter" onchange="filterStudents()" style="padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: #1a1f2e; color: white;">
                        <option value="all">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                    </select>
                    <button onclick="openAddStudentModal()" class="action-btn">+ Add Student</button>
                </div>
            </div>
            <div class="stat-card">
                <table>
                    <thead><tr><th>Name</th><th>Mobile</th><th>Room #</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody id="studentsTableBody">
                        ${students.map(s => {
            const room = rooms.find(r => r.id === s.roomId);
            return `
                                <tr class="student-row" data-name="${s.name ? s.name.toLowerCase() : ''}" data-mobile="${s.mobile || ''}" data-room="${room ? room.number : ''}" data-status="${s.status}">
                                    <td><strong onclick="openStudentDetails(${s.id})" style="cursor:pointer; color:var(--sky);">${s.name}</strong></td>
                                    <td>${s.mobile}</td>
                                    <td><span onclick="openRoomDetails(${s.roomId})" style="cursor:pointer; text-decoration:underline;">${room ? room.number : 'None'}</span></td>
                                    <td><span style="color:${s.status === 'Paid' ? '#10b981' : '#ef4444'}">${s.status}</span></td>
                                    <td>
                                        <button onclick="openStudentDetails(${s.id})" class="text-btn">View</button>
                                        <button onclick="deleteStudent(${s.id})" class="text-btn danger">Delete</button>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    function renderBookings() {
        const bookings = DataService.getItems(STORAGE_KEYS.BOOKINGS);

        moduleContainer.innerHTML = `
            <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
                <h2>Online & Manual Bookings</h2>
                <button onclick="openAddBookingModal()" class="action-btn">+ Add Booking</button>
            </div>
            <div class="stat-card" style="margin-top:1.5rem;">
                <table>
                    <thead><tr><th>ID</th><th>Applicant</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${DataService.getItems(STORAGE_KEYS.BOOKINGS).map(b => `
                            <tr>
                                <td>#${b.id}</td><td>${b.name}</td><td>${b.date}</td>
                                <td style="color:#f59e0b">${b.status}</td>
                                <td>
                                    <button onclick="approveBooking(${b.id})" class="text-btn">Approve</button>
                                    <button onclick="deleteBooking(${b.id})" class="text-btn danger">Delete</button>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="5" style="text-align:center; padding:2rem; opacity:0.5;">No bookings available</td></tr>'}
                    </tbody>
                </table>
            </div>`;
    }

    function renderPayments() {
        const payments = DataService.getItems(STORAGE_KEYS.PAYMENTS);
        const students = DataService.getItems(STORAGE_KEYS.STUDENTS);
        const rooms = DataService.getItems(STORAGE_KEYS.ROOMS);
        const total = payments.reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0);

        moduleContainer.innerHTML = `
            <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
                <h2>Offline Payment Collection</h2>
                <button onclick="openRecordPaymentModal()" class="action-btn">+ Record Payment</button>
            </div>
            <div class="stats-grid">
                <div class="stat-card"><h3>Cash Handled</h3><p>₹${total.toLocaleString()}</p></div>
                <div class="stat-card"><h3>Transactions</h3><p>${payments.length}</p></div>
            </div>
            <div class="stat-card">
                <table>
                    <thead><tr><th>Student</th><th>Room</th><th>Amount</th><th>Method</th><th>Date</th></tr></thead>
                    <tbody>
                        ${payments.map(p => {
            const student = students.find(s => s.id === p.studentId);
            const room = student ? rooms.find(r => r.id === student.roomId) : null;
            return `<tr><td>${student ? student.name : 'Unknown'}</td><td>${room ? room.number : '---'}</td><td>₹${(parseInt(p.amount) || 0).toLocaleString()}</td><td>${p.mode}</td><td>${p.date}</td></tr>`;
        }).reverse().join('') || '<tr><td colspan="5" style="text-align:center; padding:2rem; opacity:0.5;">No records</td></tr>'}
                    </tbody>
                </table>
            </div>`;
    }

    function renderAccount() {
        moduleContainer.innerHTML = `
            <div style="margin-bottom: 2rem;"><h2>Admin Account Settings</h2></div>
            <div class="stat-card" style="max-width:500px; text-align:left;">
                <h3>Change Administrator Password</h3>
                <form id="change-pass-form" class="admin-form" style="margin-top:1.5rem;">
                    <div class="form-group"><label>New Password</label><input type="password" id="new-pass" required></div>
                    <button type="submit" class="action-btn" style="width:100%">Update Password</button>
                </form>
                <div style="margin-top:3rem; border-top:1px solid rgba(255,255,255,0.1); padding-top:2rem;">
                    <button onclick="logout()" class="logout-btn" style="width:100%; border:1px solid #ef4444; color:#ef4444; background:transparent; padding:0.8rem; border-radius:12px; cursor:pointer;">Logout from Dashboard</button>
                </div>
            </div>
        `;

        document.getElementById('change-pass-form').onsubmit = (e) => {
            e.preventDefault();
            const newPass = document.getElementById('new-pass').value;
            DataService.setItem(STORAGE_KEYS.CONFIG, { password: newPass });
            alert('Administrator password updated successfully!');
            logout();
        };
    }

    // Global Helpers
    const overlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal');

    window.closeModal = () => overlay.classList.add('hidden');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', window.closeModal);
    }

    window.logout = () => { sessionStorage.removeItem('sky_admin_auth'); window.location.href = '../index.html'; };

    window.openRoomDetails = (id) => {
        const rooms = DataService.getItems(STORAGE_KEYS.ROOMS);
        const students = DataService.getItems(STORAGE_KEYS.STUDENTS);
        const room = rooms.find(r => r.id === id);
        if (!room) return;
        const occupants = students.filter(s => s.roomId === id);

        modalBody.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>Room ${room.number}</h2>
                <button onclick="deleteRoom(${room.id})" class="text-btn danger">Delete Room</button>
            </div>
            <p style="opacity:0.7;">${room.type} | Max: ${room.capacity}</p>
            <hr style="margin:1.5rem 0; opacity:0.1;">
            <h3>Occupants (${occupants.length}/${room.capacity})</h3>
            <div style="margin-top:1rem;">
                ${occupants.map(s => `
                    <div onclick="openStudentDetails(${s.id})" style="padding:1rem; background:rgba(255,255,255,0.05); margin-bottom:0.5rem; border-radius:10px; cursor:pointer;">
                        <strong>${s.name}</strong> - ${s.mobile}
                    </div>
                `).join('') || '<p style="opacity:0.5;">Empty</p>'}
            </div>
        `;
        overlay.classList.remove('hidden');
    };

    window.openStudentDetails = (id) => {
        const s = DataService.getItems(STORAGE_KEYS.STUDENTS).find(x => x.id === id);
        const rooms = DataService.getItems(STORAGE_KEYS.ROOMS);
        const r = rooms.find(x => x.id === s.roomId);

        modalBody.innerHTML = `
            <h2>Student Profile</h2>
            <div style="background:rgba(255,255,255,0.03); padding:1.5rem; border-radius:15px; line-height:2.2; margin-top:1.5rem;">
                <p><strong>Name:</strong> ${s.name}</p>
                <p><strong>Mobile:</strong> ${s.mobile}</p>
                <p><strong>Father:</strong> ${s.fatherName || '---'}</p>
                <p><strong>Aadhar:</strong> ${s.aadhar || '---'}</p>
                <p><strong>Room:</strong> <span onclick="openRoomDetails(${s.roomId})" style="cursor:pointer; color:var(--sky);">${r ? r.number : 'None'}</span></p>
                <p><strong>Status:</strong> ${s.status}</p>
            </div>
            <button onclick="window.closeModal()" class="action-btn" style="width:100%; margin-top:2rem;">Close</button>
        `;
        overlay.classList.remove('hidden');
    };

    window.openAddStudentModal = () => {
        const rooms = DataService.getItems(STORAGE_KEYS.ROOMS);
        const students = DataService.getItems(STORAGE_KEYS.STUDENTS);
        const available = rooms.filter(r => students.filter(st => st.roomId === r.id).length < r.capacity);

        modalBody.innerHTML = `
            <h2>Register Student</h2>
            <form id="student-form" class="admin-form">
                <div class="form-group"><label>Full Name</label><input type="text" id="s-name" required></div>
                <div class="form-group"><label>Mobile</label><input type="tel" id="s-mobile" required></div>
                <div class="form-group"><label>Father Name</label><input type="text" id="s-father"></div>
                <div class="form-group"><label>Aadhar</label><input type="text" id="s-aadhar"></div>
                <div class="form-group"><label>Room</label><select id="s-room">${available.map(r => `<option value="${r.id}">${r.number}</option>`).join('')}</select></div>
                <button type="submit" class="action-btn" style="width:100%">Register</button>
            </form>
        `;
        overlay.classList.remove('hidden');
        document.getElementById('student-form').onsubmit = (e) => {
            e.preventDefault();
            const current = DataService.getItems(STORAGE_KEYS.STUDENTS);
            current.push({ id: Date.now(), name: document.getElementById('s-name').value, mobile: document.getElementById('s-mobile').value, fatherName: document.getElementById('s-father').value, aadhar: document.getElementById('s-aadhar').value, roomId: parseInt(document.getElementById('s-room').value), joining: new Date().toLocaleDateString(), status: 'Pending' });
            DataService.setItem(STORAGE_KEYS.STUDENTS, current);
            window.closeModal(); renderStudentsList();
        };
    };

    window.openRecordPaymentModal = () => {
        const students = DataService.getItems(STORAGE_KEYS.STUDENTS);
        modalBody.innerHTML = `
            <h2>Record Payment</h2>
            <form id="payment-form" class="admin-form">
                <div class="form-group"><label>Student</label><select id="p-student">${students.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select></div>
                <div class="form-group"><label>Amount</label><input type="number" id="p-amount" required></div>
                <div class="form-group"><label>Mode</label><select id="p-mode"><option>Cash</option><option>Online Entry</option></select></div>
                <button type="submit" class="action-btn" style="width:100%">Save Payment</button>
            </form>
        `;
        overlay.classList.remove('hidden');
        document.getElementById('payment-form').onsubmit = (e) => {
            e.preventDefault();
            const cur = DataService.getItems(STORAGE_KEYS.PAYMENTS);
            cur.push({ id: Date.now(), studentId: parseInt(document.getElementById('p-student').value), amount: document.getElementById('p-amount').value, mode: document.getElementById('p-mode').value, date: new Date().toLocaleDateString() });
            DataService.setItem(STORAGE_KEYS.PAYMENTS, cur);
            window.closeModal(); renderPayments();
        };
    };

    window.openAddBookingModal = () => {
        modalBody.innerHTML = `
            <h2>Add New Booking</h2>
            <form id="booking-form" class="admin-form">
                <div class="form-group"><label>Applicant Name</label><input type="text" id="b-name" required></div>
                <div class="form-group"><label>Room Type Preference</label>
                    <select id="b-type">
                        <option>5 Sharing</option>
                        <option>4 Sharing</option>
                        <option>3 Sharing</option>
                    </select>
                </div>
                <button type="submit" class="action-btn" style="width:100%">Create Booking</button>
            </form>
        `;
        overlay.classList.remove('hidden');
        document.getElementById('booking-form').onsubmit = (e) => {
            e.preventDefault();
            const currentBookings = DataService.getItems(STORAGE_KEYS.BOOKINGS);
            // generate a random unique ID for the front-end display purpose
            const newId = Math.floor(Math.random() * 900) + 100;
            currentBookings.push({
                id: newId,
                name: document.getElementById('b-name').value,
                type: document.getElementById('b-type').value,
                date: new Date().toLocaleDateString(),
                status: 'Pending'
            });
            DataService.setItem(STORAGE_KEYS.BOOKINGS, currentBookings);
            window.closeModal(); renderBookings();
        };
    };

    window.deleteStudent = (id) => { if (confirm('Remove student?')) { DataService.setItem(STORAGE_KEYS.STUDENTS, DataService.getItems(STORAGE_KEYS.STUDENTS).filter(x => x.id !== id)); window.closeModal(); renderStudentsList(); } };
    window.deleteRoom = (id) => { if (confirm('Delete room?')) { DataService.setItem(STORAGE_KEYS.ROOMS, DataService.getItems(STORAGE_KEYS.ROOMS).filter(x => x.id !== id)); window.closeModal(); renderRoomsPanel(); } };
    window.approveBooking = (id) => {
        const currentBookings = DataService.getItems(STORAGE_KEYS.BOOKINGS);
        const b = currentBookings.find(x => x.id === id);
        if (b) { b.status = 'Approved'; DataService.setItem(STORAGE_KEYS.BOOKINGS, currentBookings); renderBookings(); }
    };
    window.deleteBooking = (id) => {
        if (confirm('Delete this booking?')) {
            DataService.setItem(STORAGE_KEYS.BOOKINGS, DataService.getItems(STORAGE_KEYS.BOOKINGS).filter(x => x.id !== id));
            renderBookings();
        }
    };

    window.filterStudents = () => {
        const searchQuery = document.getElementById('studentSearch').value.toLowerCase();
        const statusFilter = document.getElementById('studentStatusFilter').value;
        const rows = document.querySelectorAll('.student-row');

        rows.forEach(row => {
            const name = row.getAttribute('data-name');
            const mobile = row.getAttribute('data-mobile');
            const room = row.getAttribute('data-room');
            const status = row.getAttribute('data-status');

            const matchesSearch = name.includes(searchQuery) || mobile.includes(searchQuery) || room.includes(searchQuery);
            const matchesStatus = statusFilter === 'all' || status === statusFilter;

            if (matchesSearch && matchesStatus) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    };

    window.loadModule = loadModule;
    loadModule('overview');
});
