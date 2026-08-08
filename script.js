// --- Login & Security Settings ---
let correctEmail = localStorage.getItem('erp_email') || "alffurqun@gmail.com";
let correctPassword = localStorage.getItem('erp_pass') || "123";
const MOCK_RESET_CODE = "1234";

const loginContainer = document.getElementById('login-container');
const erpContainer = document.getElementById('erp-container');
const loginBox = document.getElementById('login-box');
const forgotBox = document.getElementById('forgot-box');

const loginForm = document.getElementById('login-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLoginLink = document.getElementById('back-to-login-link');
const forgotEmailForm = document.getElementById('forgot-email-form');
const resetCodeForm = document.getElementById('reset-code-form');
const resetEmailInput = document.getElementById('reset-email');
const verificationCodeInput = document.getElementById('verification-code');
const newPasswordInput = document.getElementById('new-password');
const forgotError = document.getElementById('forgot-error');
const codeError = document.getElementById('code-error');

const settingsForm = document.getElementById('settings-form');
const settingsNewEmail = document.getElementById('settings-new-email');
const settingsNewPassword = document.getElementById('settings-new-password');

// --- Mobile Sidebar Toggle ---
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const sidebar = document.getElementById('sidebar');

if (menuToggleBtn && sidebar) {
    menuToggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

if (sessionStorage.getItem('isLoggedIn') === 'true') {
    loginContainer.style.display = 'none';
    erpContainer.style.display = 'flex';
}

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (loginEmailInput.value.trim() === correctEmail && loginPasswordInput.value.trim() === correctPassword) {
        sessionStorage.setItem('isLoggedIn', 'true');
        loginContainer.style.display = 'none';
        erpContainer.style.display = 'flex';
        loginError.style.display = 'none';
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
        updateERP();
    } else {
        loginError.style.display = 'block';
    }
});

logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    sessionStorage.removeItem('isLoggedIn');
    erpContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
    loginBox.style.display = 'block';
    forgotBox.style.display = 'none';
});

forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    loginBox.style.display = 'none';
    forgotBox.style.display = 'block';
    forgotEmailForm.style.display = 'block';
    resetCodeForm.style.display = 'none';
    forgotEmailForm.reset();
});

backToLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    forgotBox.style.display = 'none';
    loginBox.style.display = 'block';
});

forgotEmailForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (resetEmailInput.value.trim() === correctEmail) {
        forgotError.style.display = 'none';
        alert("Reset code sent! (Use test code: 1234)");
        forgotEmailForm.style.display = 'none';
        resetCodeForm.style.display = 'block';
    } else {
        forgotError.style.display = 'block';
    }
});

resetCodeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (verificationCodeInput.value.trim() === MOCK_RESET_CODE) {
        correctPassword = newPasswordInput.value.trim();
        localStorage.setItem('erp_pass', correctPassword);
        alert("Password updated successfully! Please login.");
        resetCodeForm.reset();
        forgotBox.style.display = 'none';
        loginBox.style.display = 'block';
    } else {
        codeError.style.display = 'block';
    }
});

settingsForm.addEventListener('submit', function(e) {
    e.preventDefault();
    correctEmail = settingsNewEmail.value.trim();
    correctPassword = settingsNewPassword.value.trim();
    localStorage.setItem('erp_email', correctEmail);
    localStorage.setItem('erp_pass', correctPassword);
    alert("Credentials updated! Please login again.");
    sessionStorage.removeItem('isLoggedIn');
    erpContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
    loginBox.style.display = 'block';
    settingsForm.reset();
});

// --- Return Dynamic Toggle ---
function toggleReturnFields() {
    const isReturn = document.getElementById('return-status').value;
    const dependents = document.querySelectorAll('.return-dependent');
    dependents.forEach(el => {
        el.style.display = (isReturn === 'YES') ? 'block' : 'none';
    });
}

// --- ERP Data Management ---
const orderForm = document.getElementById('order-form');
const orderTableBody = document.getElementById('order-table-body');
const allOrdersTableBody = document.getElementById('all-orders-table-body');
const totalOrdersElem = document.getElementById('total-orders');
const totalSalesElem = document.getElementById('total-sales');
const totalProfitElem = document.getElementById('total-profit');

const productForm = document.getElementById('product-form');
const productTableBody = document.getElementById('product-table-body');
const customerTableBody = document.getElementById('customer-table-body');

let orders = JSON.parse(localStorage.getItem('al_furqun_orders')) || [];
let products = JSON.parse(localStorage.getItem('al_furqun_products')) || [];

function updateERP() {
    orderTableBody.innerHTML = '';
    allOrdersTableBody.innerHTML = '';
    let totalSales = 0;
    let totalNetProfit = 0;

    orders.forEach((ord, index) => {
        let revenue = Number(ord.sellPrice) * Number(ord.qty);
        let bPrice = Number(ord.buyPrice);
        let dCharge = Number(ord.deliveryCharge);
        let cCost = Number(ord.courierCost);
        let pCost = Number(ord.packagingCost);
        let rCost = ord.returnStatus === 'YES' ? Number(ord.returnCost) : 0;
        
        let finalProfit = revenue - bPrice - dCharge - cCost - pCost - rCost;
        totalSales += revenue;
        totalNetProfit += finalProfit;

        let rowHTML1 = `
            <td><b>${ord.date}</b><br><span style="color:#64748b; font-size:11px;">#${ord.orderId}</span></td>
            <td><b>${ord.customerName}</b><br><span style="color:#0284c7; font-size:11px;">${ord.source}</span></td>
            <td>${ord.productName} <br><span style="color:#64748b; font-size:11px;">Qty: ${ord.qty}</span></td>
            <td>Buy: ৳${bPrice}<br>Sell: ৳${revenue}<br>Paid: ৳${ord.customerPaid}</td>
            <td style="color: ${finalProfit >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">৳ ${finalProfit}</td>
            <td><span style="background:#e2e8f0; padding:3px 8px; border-radius:4px; font-size:11px;">${ord.status}</span><br><span style="font-size:11px; color:#64748b;">${ord.courier}</span></td>
            <td><button class="delete-btn" onclick="deleteOrder(${index})">Delete</button></td>
        `;
        let tr1 = document.createElement('tr');
        tr1.innerHTML = rowHTML1;
        orderTableBody.appendChild(tr1);

        let rowHTML2 = `
            <td>${ord.date}</td>
            <td>#${ord.orderId}</td>
            <td>${ord.source}</td>
            <td><b>${ord.customerName}</b><br>${ord.phone}<br><span style="font-size:11px; color:#64748b;">${ord.address}</span></td>
            <td>${ord.productName} (x${ord.qty})<br><span style="font-size:11px; color:#0284c7;">Sup: ${ord.supplier}</span></td>
            <td>${ord.supplier}</td>
            <td>Buy: ৳${bPrice}<br>Sell: ৳${revenue}</td>
            <td>Del: ৳${dCharge}<br>Cour: ৳${cCost}<br>Pack: ৳${pCost}</td>
            <td>Paid: ৳${ord.customerPaid}<br><b style="color:${finalProfit >= 0 ? '#10b981' : '#ef4444'};">Profit: ৳${finalProfit}</b></td>
            <td>${ord.returnStatus === 'YES' ? `<span style="color:#ef4444;">YES</span><br><span style="font-size:11px;">${ord.returnReason} (-৳${rCost})</span>` : 'NO'}</td>
            <td>${ord.courier || 'N/A'}<br><span style="font-size:11px; color:#64748b;">Trk: ${ord.trackingId || 'N/A'}</span></td>
            <td><span style="background:#f1f5f9; padding:3px 8px; border-radius:4px; font-size:11px;">${ord.status}</span></td>
            <td><button class="delete-btn" onclick="deleteOrder(${index})">Delete</button></td>
        `;
        let tr2 = document.createElement('tr');
        tr2.innerHTML = rowHTML2;
        allOrdersTableBody.appendChild(tr2);
    });

    totalOrdersElem.innerText = orders.length;
    totalSalesElem.innerText = `৳ ${totalSales}`;
    totalProfitElem.innerText = `৳ ${totalNetProfit}`;
    localStorage.setItem('al_furqun_orders', JSON.stringify(orders));

    productTableBody.innerHTML = '';
    products.forEach((prod) => {
        let pRow = document.createElement('tr');
        pRow.innerHTML = `<td>${prod.name}</td><td>৳ ${prod.buyPrice}</td><td>৳ ${prod.sellPrice}</td><td>${prod.stock}</td>`;
        productTableBody.appendChild(pRow);
    });
    localStorage.setItem('al_furqun_products', JSON.stringify(products));

    customerTableBody.innerHTML = '';
    let uniqueCustomers = {};
    orders.forEach(ord => {
        if(!uniqueCustomers[ord.phone]) {
            uniqueCustomers[ord.phone] = { name: ord.customerName, address: ord.address, count: 0 };
        }
        uniqueCustomers[ord.phone].count++;
    });

    for(let phone in uniqueCustomers) {
        let c = uniqueCustomers[phone];
        let cRow = document.createElement('tr');
        cRow.innerHTML = `<td>${c.name}</td><td>${phone}</td><td>${c.address}</td><td>${c.count} Order(s)</td>`;
        customerTableBody.appendChild(cRow);
    }
}

orderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const newOrder = {
        date: document.getElementById('order-date').value,
        orderId: document.getElementById('order-id').value,
        source: document.getElementById('order-source').value,
        customerName: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value,
        productName: document.getElementById('product-name').value,
        qty: document.getElementById('product-qty').value,
        supplier: document.getElementById('supplier-name').value,
        buyPrice: document.getElementById('buy-price').value,
        sellPrice: document.getElementById('sell-price').value,
        deliveryCharge: document.getElementById('delivery-charge').value,
        courierCost: document.getElementById('courier-cost').value,
        packagingCost: document.getElementById('packaging-cost').value,
        customerPaid: document.getElementById('customer-paid').value,
        returnStatus: document.getElementById('return-status').value,
        returnReason: document.getElementById('return-reason').value || '',
        returnCost: document.getElementById('return-cost').value || 0,
        trackingId: document.getElementById('tracking-id').value || '',
        courier: document.getElementById('courier-company').value,
        status: document.getElementById('customer-status').value
    };

    orders.unshift(newOrder);
    updateERP();
    orderForm.reset();
    document.getElementById('order-date').valueAsDate = new Date();
    toggleReturnFields();
});

function deleteOrder(index) {
    if(confirm("Are you sure you want to delete this order?")) {
        orders.splice(index, 1);
        updateERP();
    }
}

productForm.addEventListener('submit', function(e) {
    e.preventDefault();
    products.push({
        name: document.getElementById('p-name').value,
        buyPrice: document.getElementById('p-buy').value,
        sellPrice: document.getElementById('p-sell').value,
        stock: document.getElementById('p-stock').value
    });
    updateERP();
    productForm.reset();
});

const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('page-title');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        navLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        contentSections.forEach(section => section.style.display = 'none');
        const targetId = this.getAttribute('data-target');
        document.getElementById(targetId).style.display = 'block';

        pageTitle.innerText = this.innerText + ' Overview';

        // মোবাইলে কোনো অপশনে ক্লিক করলে অটো সাইডবার বন্ধ হয়ে যাবে
        if(window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    });
});

document.getElementById('order-date').valueAsDate = new Date();

if (sessionStorage.getItem('isLoggedIn') === 'true') {
    updateERP();
}
