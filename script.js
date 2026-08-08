// Sidebar Navigation Switching
const menuLinks = document.querySelectorAll('.sidebar-menu a');
const contentSections = document.querySelectorAll('.content-section');

menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        menuLinks.forEach(item => item.classList.remove('active'));
        contentSections.forEach(sec => sec.classList.remove('active'));

        link.classList.add('active');
        const target = document.getElementById(link.getAttribute('data-target'));
        if (target) target.classList.add('active');
    });
});

// --- ERP Data Management ---
const orderForm = document.getElementById('order-form');
const orderTableBody = document.getElementById('order-table-body');
const allOrdersTableBody = document.getElementById('all-orders-table-body');
const totalOrdersElem = document.getElementById('total-orders');
const totalSalesElem = document.getElementById('total-sales');
const totalProfitElem = document.getElementById('total-profit');
const totalLossElem = document.getElementById('total-loss');

const productForm = document.getElementById('product-form');
const productTableBody = document.getElementById('product-table-body');
const customerTableBody = document.getElementById('customer-table-body');

let orders = JSON.parse(localStorage.getItem('al_furqun_orders')) || [];
let products = JSON.parse(localStorage.getItem('al_furqun_products')) || [];

// Handle New Order Submission
if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let newOrder = {
            date: document.getElementById('order-date').value,
            orderId: document.getElementById('order-id').value,
            customerName: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            address: document.getElementById('customer-address').value,
            productName: document.getElementById('product-name').value,
            qty: document.getElementById('order-qty').value,
            buyPrice: document.getElementById('buy-price').value,
            sellPrice: document.getElementById('sell-price').value,
            deliveryCharge: document.getElementById('delivery-charge').value,
            courierCost: document.getElementById('courier-cost').value,
            packagingCost: document.getElementById('packaging-cost').value,
            customerPaid: document.getElementById('customer-paid').value,
            source: document.getElementById('order-source').value,
            status: document.getElementById('order-status').value,
            supplier: 'N/A',
            returnStatus: 'NO',
            returnCost: 0,
            trackingId: 'N/A'
        };

        orders.push(newOrder);
        updateERP();
        orderForm.reset();
        alert('Order Added Successfully!');
    });
}

// Handle Product Addition
if (productForm) {
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let newProd = {
            name: document.getElementById('prod-name').value,
            buyPrice: document.getElementById('prod-buy').value,
            sellPrice: document.getElementById('prod-sell').value,
            stock: document.getElementById('prod-stock').value
        };
        products.push(newProd);
        updateERP();
        productForm.reset();
    });
}

function updateERP() {
    if (orderTableBody) orderTableBody.innerHTML = '';
    if (allOrdersTableBody) allOrdersTableBody.innerHTML = '';
    
    let totalSales = 0;
    let totalProfit = 0;
    let totalLoss = 0;

    orders.forEach((ord, index) => {
        let revenue = Number(ord.sellPrice) * Number(ord.qty);
        let bPrice = Number(ord.buyPrice);
        let dCharge = Number(ord.deliveryCharge);
        let cCost = Number(ord.courierCost);
        let pCost = Number(ord.packagingCost);
        let rCost = ord.returnStatus === 'YES' ? Number(ord.returnCost) : 0;
        
        let finalProfit = revenue - bPrice - dCharge - cCost - pCost - rCost;
        totalSales += revenue;

        // প্রফিট এবং লস আলাদা হিসাব করা
        if (finalProfit >= 0) {
            totalProfit += finalProfit;
        } else {
            totalLoss += Math.abs(finalProfit);
        }

        // Recent Orders Table Row
        if (orderTableBody) {
            let tr1 = document.createElement('tr');
            tr1.innerHTML = `
                <td><b>${ord.date}</b><br><span style="color:#64748b; font-size:11px;">#${ord.orderId}</span></td>
                <td><b>${ord.customerName}</b><br><span style="color:#0284c7; font-size:11px;">${ord.source}</span></td>
                <td>${ord.productName} <br><span style="color:#64748b; font-size:11px;">Qty: ${ord.qty}</span></td>
                <td>Buy: ৳${bPrice}<br>Sell: ৳${revenue}<br>Paid: ৳${ord.customerPaid}</td>
                <td style="color: ${finalProfit >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">৳ ${finalProfit}</td>
                <td><span style="background:#e2e8f0; padding:3px 8px; border-radius:4px; font-size:11px;">${ord.status}</span></td>
                <td><button class="delete-btn" onclick="deleteOrder(${index})">Delete</button></td>
            `;
            orderTableBody.appendChild(tr1);
        }

        // All Orders Table Row
        if (allOrdersTableBody) {
            let tr2 = document.createElement('tr');
            tr2.innerHTML = `
                <td>${ord.date}</td>
                <td>#${ord.orderId}</td>
                <td>${ord.source}</td>
                <td><b>${ord.customerName}</b><br>${ord.phone}<br><span style="font-size:11px; color:#64748b;">${ord.address}</span></td>
                <td>${ord.productName} (x${ord.qty})</td>
                <td>${ord.supplier}</td>
                <td>Buy: ৳${bPrice}<br>Sell: ৳${revenue}</td>
                <td>Del: ৳${dCharge}<br>Cour: ৳${cCost}<br>Pack: ৳${pCost}</td>
                <td>Paid: ৳${ord.customerPaid}<br><b style="color:${finalProfit >= 0 ? '#10b981' : '#ef4444'};">Profit: ৳${finalProfit}</b></td>
                <td>${ord.returnStatus}</td>
                <td>${ord.courier || 'N/A'}</td>
                <td><span style="background:#f1f5f9; padding:3px 8px; border-radius:4px; font-size:11px;">${ord.status}</span></td>
                <td><button class="delete-btn" onclick="deleteOrder(${index})">Delete</button></td>
            `;
            allOrdersTableBody.appendChild(tr2);
        }
    });

    if (totalOrdersElem) totalOrdersElem.innerText = orders.length;
    if (totalSalesElem) totalSalesElem.innerText = `৳ ${totalSales}`;
    if (totalProfitElem) totalProfitElem.innerText = `৳ ${totalProfit}`;
    if (totalLossElem) totalLossElem.innerText = `৳ ${totalLoss}`;
    
    localStorage.setItem('al_furqun_orders', JSON.stringify(orders));

    // Products View
    if (productTableBody) {
        productTableBody.innerHTML = '';
        products.forEach((prod) => {
            let pRow = document.createElement('tr');
            pRow.innerHTML = `<td>${prod.name}</td><td>৳ ${prod.buyPrice}</td><td>৳ ${prod.sellPrice}</td><td>${prod.stock}</td>`;
            productTableBody.appendChild(pRow);
        });
        localStorage.setItem('al_furqun_products', JSON.stringify(products));
    }

    // Customers View
    if (customerTableBody) {
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
}

function deleteOrder(index) {
    orders.splice(index, 1);
    updateERP();
}

// Initial Call
updateERP();
