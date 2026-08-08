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

        // প্রফিট এবং লস আলাদা করে হিসাব করার লজিক
        if (finalProfit >= 0) {
            totalProfit += finalProfit;
        } else {
            totalLoss += Math.abs(finalProfit);
        }

        if (orderTableBody) {
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
        }
    });

    if (totalOrdersElem) totalOrdersElem.innerText = orders.length;
    if (totalSalesElem) totalSalesElem.innerText = `৳ ${totalSales}`;
    if (totalProfitElem) totalProfitElem.innerText = `৳ ${totalProfit}`;
    if (totalLossElem) totalLossElem.innerText = `৳ ${totalLoss}`;
    
    localStorage.setItem('al_furqun_orders', JSON.stringify(orders));
}

function deleteOrder(index) {
    orders.splice(index, 1);
    updateERP();
}

// Initial Call
updateERP();
