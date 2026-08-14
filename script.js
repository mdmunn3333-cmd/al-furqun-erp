let appData = JSON.parse(localStorage.getItem('resell_erp_data')) || {
    credentials: { email: "admin@resell.com", pass: "123456" },
    products: ["Premium T-Shirt", "Casual Jeans"],
    suppliers: ["Fashion Hub BD", "Al-Furqun Mart"],
    orders: []
};

document.getElementById('oDate').valueAsDate = new Date();
document.getElementById('setAdminEmail').value = appData.credentials.email;
document.getElementById('setAdminPass').value = appData.credentials.pass;

function saveData() {
    localStorage.setItem('resell_erp_data', JSON.stringify(appData));
}

// Login System
function handleLogin() {
    const emailInput = document.getElementById('loginEmail').value;
    const passInput = document.getElementById('loginPass').value;

    if (emailInput === appData.credentials.email && passInput === appData.credentials.pass) {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
        document.getElementById('userDisplay').innerText = appData.credentials.email;
        refreshAll();
    } else {
        alert('Invalid Email or Password! Default is admin@resell.com / 123456');
    }
}

// Update Credentials
function updateCredentials() {
    const newEmail = document.getElementById('setAdminEmail').value;
    const newPass = document.getElementById('setAdminPass').value;
    if(newEmail && newPass) {
        appData.credentials.email = newEmail;
        appData.credentials.pass = newPass;
        saveData();
        document.getElementById('userDisplay').innerText = newEmail;
        alert('Credentials updated successfully!');
    } else {
        alert('Please fill out both fields!');
    }
}

// Navigation Switcher
function switchView(viewId, element) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active-view'));
    document.querySelectorAll('.sidebar-menu li').forEach(el => el.classList.remove('active'));
    
    document.getElementById(viewId).classList.add('active-view');
    element.classList.add('active');

    const titles = {
        'dashboard': 'Dashboard Overview',
        'sales': 'Sales & Orders Records',
        'customers': 'Customer Directory',
        'products': 'Product Management',
        'suppliers': 'Supplier Management',
        'accounts': 'Accounts & Financials',
        'settings': 'System Settings'
    };
    document.getElementById('pageTitle').innerText = titles[viewId];
    refreshAll();
}

// Add New Product
function addNewProduct() {
    const pName = document.getElementById('newProdName').value.trim();
    if(pName) {
        if(!appData.products.includes(pName)) {
            appData.products.push(pName);
            saveData();
            document.getElementById('newProdName').value = '';
            refreshAll();
            alert('Product added successfully!');
        } else {
            alert('Product already exists!');
        }
    } else {
        alert('Please enter a product name!');
    }
}

function deleteProduct(index) {
    if(confirm('Are you sure you want to delete this product?')) {
        appData.products.splice(index, 1);
        saveData();
        refreshAll();
    }
}

// Add New Supplier
function addNewSupplier() {
    const sName = document.getElementById('newSuppName').value.trim();
    if(sName) {
        if(!appData.suppliers.includes(sName)) {
            appData.suppliers.push(sName);
            saveData();
            document.getElementById('newSuppName').value = '';
            refreshAll();
            alert('Supplier added successfully!');
        } else {
            alert('Supplier already exists!');
        }
    } else {
        alert('Please enter a supplier name!');
    }
}

function deleteSupplier(index) {
    if(confirm('Are you sure you want to delete this supplier?')) {
        appData.suppliers.splice(index, 1);
        saveData();
        refreshAll();
    }
}

// Create Order Function
function createOrder() {
    const newOrder = {
        date: document.getElementById('oDate').value,
        id: document.getElementById('oId').value || 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        source: document.getElementById('oSource').value,
        custName: document.getElementById('oCustName').value.trim(),
        phone: document.getElementById('oPhone').value.trim(),
        address: document.getElementById('oAddress').value.trim(),
        product: document.getElementById('oProductSelect').value,
        qty: parseFloat(document.getElementById('oQty').value) || 1,
        supplier: document.getElementById('oSupplierSelect').value,
        buyPrice: parseFloat(document.getElementById('oBuyPrice').value) || 0,
        sellPrice: parseFloat(document.getElementById('oSellPrice').value) || 0,
        delCharge: parseFloat(document.getElementById('oDelCharge').value) || 0,
        courCost: parseFloat(document.getElementById('oCourCost').value) || 0,
        packCost: parseFloat(document.getElementById('oPackCost').value) || 0,
        isReturn: document.getElementById('oReturn').value,
        retReason: document.getElementById('oRetReason').value || 'N/A',
        retCost: parseFloat(document.getElementById('oRetCost').value) || 0,
        tracking: document.getElementById('oTracking').value || 'N/A',
        courComp: document.getElementById('oCourComp').value || 'N/A',
        status: document.getElementById('oStatus').value
    };

    if(!newOrder.custName || !newOrder.product || !newOrder.sellPrice || !newOrder.supplier) {
        alert('Please fill out Customer Name, Product, Supplier, and Sell Price!');
        return;
    }

    appData.orders.unshift(newOrder);
    saveData();
    refreshAll();
    alert('Order created successfully!');
    
    // Clear form inputs
    document.getElementById('oCustName').value = '';
    document.getElementById('oPhone').value = '';
    document.getElementById('oAddress').value = '';
    document.getElementById('oBuyPrice').value = '';
    document.getElementById('oSellPrice').value = '';
}

// Delete Order
function deleteOrder(index) {
    if(confirm('Are you sure you want to delete this order?')) {
        appData.orders.splice(index, 1);
        saveData();
        refreshAll();
    }
}

// Customer Edit Functions
function openEditCustomer(phone) {
    // Find first order with this phone
    let ord = appData.orders.find(o => o.phone === phone);
    if(ord) {
        document.getElementById('editCustName').value = ord.custName;
        document.getElementById('editCustPhone').value = ord.phone;
        document.getElementById('editCustAddress').value = ord.address;
        document.getElementById('editCustIndex').value = phone;
        document.getElementById('editModal').style.display = 'flex';
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function saveCustomerEdit() {
    let oldPhone = document.getElementById('editCustIndex').value;
    let newName = document.getElementById('editCustName').value.trim();
    let newPhone = document.getElementById('editCustPhone').value.trim();
    let newAddress = document.getElementById('editCustAddress').value.trim();

    if(newName && newPhone) {
        // Update all orders having this customer phone
        appData.orders.forEach(ord => {
            if(ord.phone === oldPhone) {
                ord.custName = newName;
                ord.phone = newPhone;
                ord.address = newAddress;
            }
        });
        saveData();
        closeEditModal();
        refreshAll();
        alert('Customer info updated successfully!');
    } else {
        alert('Name and Phone cannot be empty!');
    }
}

// Refresh & Render All UI Data
function refreshAll() {
    const orders = appData.orders;
    
    let totalSalesAmount = 0;
    let totalNetProfit = 0;
    let customersMapObj = {};
    
    let totalRevenueAcc = 0;
    let totalExpensesAcc = 0;

    let salesHtml = '';

    orders.forEach((ord, index) => {
        let custKey = ord.phone;
        if(!customersMapObj[custKey]) {
            customersMapObj[custKey] = { name: ord.custName, phone: ord.phone, address: ord.address, count: 0 };
        }
        customersMapObj[custKey].count++;

        let itemExpense = ord.buyPrice + ord.courCost + ord.packCost;
        if(ord.isReturn === 'Yes') {
            itemExpense += ord.retCost;
        }
        let itemProfit = ord.sellPrice - itemExpense;

        if(ord.status === 'Delivered') {
            totalSalesAmount += ord.sellPrice;
            totalRevenueAcc += ord.sellPrice;
        }
        totalNetProfit += itemProfit;
        totalExpensesAcc += itemExpense;

        let statusBadge = ord.status === 'Delivered' ? 'badge-success' : (ord.status === 'On Hold' ? 'badge-warning' : 'badge-danger');
        salesHtml += `
            <tr>
                <td>${ord.date}</td>
                <td><b>${ord.id}</b></td>
                <td>${ord.custName}<br><small style="color:#94a3b8">${ord.phone}</small></td>
                <td>${ord.product} (${ord.qty}x)</td>
                <td>৳ ${ord.sellPrice}</td>
                <td style="color: ${itemProfit >= 0 ? '#4ade80' : '#f87171'}">৳ ${itemProfit}</td>
                <td><span class="${statusBadge}">${ord.status}</span></td>
                <td><button style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" onclick="deleteOrder(${index})">Delete</button></td>
            </tr>
        `;
    });

    // Dashboard Stats
    document.getElementById('statCustomers').innerText = Object.keys(customersMapObj).length;
    document.getElementById('statSales').innerText = '৳ ' + totalSalesAmount;
    document.getElementById('statProfit').innerText = '৳ ' + totalNetProfit;
    document.getElementById('statOrderCount').innerText = orders.length;

    // Sales Table
    document.getElementById('salesTableBody').innerHTML = salesHtml || '<tr><td colspan="8" style="text-align:center; color:#94a3b8;">No orders found.</td></tr>';

    // Customers Table
    let custHtml = '';
    for(let key in customersMapObj) {
        let c = customersMapObj[key];
        custHtml += `<tr><td><b>${c.name}</b></td><td>${c.phone}</td><td>${c.address}</td><td>${c.count} Orders</td><td><button style="background:#0ea5e9; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" onclick="openEditCustomer('${c.phone}')">Edit</button></td></tr>`;
    }
    document.getElementById('customerTableBody').innerHTML = custHtml || '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No customers yet.</td></tr>';

    // Render Product Dropdown & Product Table
    let prodSelect = document.getElementById('oProductSelect');
    prodSelect.innerHTML = '<option value="">Select Product</option>';
    let prodTableHtml = '';
    appData.products.forEach((p, idx) => {
        prodSelect.innerHTML += `<option value="${p}">${p}</option>`;
        prodTableHtml += `<tr><td><b>${p}</b></td><td><button style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" onclick="deleteProduct(${idx})">Delete</button></td></tr>`;
    });
    document.getElementById('productTableBody').innerHTML = prodTableHtml || '<tr><td colspan="2" style="text-align:center; color:#94a3b8;">No products added.</td></tr>';

    // Render Supplier Dropdown & Supplier Table
    let suppSelect = document.getElementById('oSupplierSelect');
    suppSelect.innerHTML = '<option value="">Select Supplier</option>';
    let suppTableHtml = '';
    appData.suppliers.forEach((s, idx) => {
        suppSelect.innerHTML += `<option value="${s}">${s}</option>`;
        suppTableHtml += `<tr><td><b>${s}</b></td><td><button style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" onclick="deleteSupplier(${idx})">Delete</button></td></tr>`;
    });
    document.getElementById('supplierTableBody').innerHTML = suppTableHtml || '<tr><td colspan="2" style="text-align:center; color:#94a3b8;">No suppliers added.</td></tr>';

    // Accounts View
    document.getElementById('accRevenue').innerText = '৳ ' + totalRevenueAcc;
    document.getElementById('accExpenses').innerText = '৳ ' + totalExpensesAcc;
    document.getElementById('accNetIncome').innerText = '৳ ' + totalNetProfit;
}
document.addEventListener("DOMContentLoaded", function() {
    const supplierForm = document.getElementById("supplierForm");
    const supplierTableBody = document.getElementById("supplierTableBody");

    // লোকাল স্টোরেজ থেকে ডাটা রিড করা
    let suppliers = JSON.parse(localStorage.getItem("al_furqun_suppliers")) || [];

    function renderTable() {
        supplierTableBody.innerHTML = "";
        
        if (suppliers.length === 0) {
            supplierTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #64748b; padding: 20px;">কোনো সাপ্লায়ারের তথ্য পাওয়া যায়নি।</td></tr>`;
            return;
        }

        suppliers.forEach((supplier) => {
            let tr = document.createElement("tr");

            tr.innerHTML = `
                <td><strong>${supplier.name}</strong></td>
                <td><a href="https://wa.me/${supplier.whatsapp}" target="_blank" class="wa-btn"><i class="fa-brands fa-whatsapp"></i> চ্যাট করুন</a></td>
                <td><a href="${supplier.link}" target="_blank" class="link-btn"><i class="fa-solid fa-globe"></i> ভিজিট লিঙ্ক</a></td>
            `;
            supplierTableBody.appendChild(tr);
        });
    }

    // ফর্ম সাবমিট ইভেন্ট
    supplierForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("supplierName").value.trim();
        const whatsapp = document.getElementById("whatsappNumber").value.trim();
        const link = document.getElementById("supplierLink").value.trim();

        if (name && whatsapp && link) {
            const newSupplier = { name, whatsapp, link };
            suppliers.push(newSupplier);
            
            // লোকাল স্টোরেজে সংরক্ষণ
            localStorage.setItem("al_furqun_suppliers", JSON.stringify(suppliers));

            // টেবিল রিফ্রেশ
            renderTable();

            // ফর্ম ক্লিয়ার
            supplierForm.reset();
        }
    });

    // পেজ লোড হলে টেবিল রেন্ডার করা
    renderTable();
});