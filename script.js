const KEY="alFurqunERP_v1";
const suppliersDefault=["AmarSell","Greenish","iUddokta","Dropshipper","Shopbase","Asia Express"];
const couriersDefault=["Pathao","Steadfast"];
const seed={
  settings:{business:"AL FURQUN",phone:"",address:"",dhakaDelivery:80,outsideDelivery:130},
  products:[
    {id:1,name:"Rechargeable Mini Fan",sku:"AF-001",category:"Electronics",cost:450,sell:650,stock:45,min:5,type:"Own Stock"},
    {id:2,name:"Chicco Baby Carrier",sku:"AF-002",category:"Baby",cost:1100,sell:1650,stock:18,min:3,type:"Own Stock"},
    {id:3,name:"Stretch Mark Cream",sku:"AF-003",category:"Beauty",cost:350,sell:850,stock:30,min:5,type:"Own Stock"},
    {id:4,name:"Meniscus Pain Relief Ointment",sku:"AF-004",category:"Health",cost:200,sell:550,stock:25,min:5,type:"Dropshipping"},
    {id:5,name:"Ayatul Qursi Bracelet",sku:"AF-005",category:"Accessories",cost:250,sell:750,stock:15,min:5,type:"Own Stock"}
  ],
  orders:[
    {id:"AF24051601",date:"2026-08-16",customer:"বিকাশ হাসান",phone:"01712-345678",address:"Mirpur, Dhaka",product:"Rechargeable Mini Fan",qty:1,sell:650,cost:450,courier:"Pathao",tracking:"PTH001",supplier:"Own Stock",payment:"COD",status:"Delivered",courierCost:80},
    {id:"AF24051602",date:"2026-08-16",customer:"সুমাইয়া আক্তার",phone:"01823-456789",address:"Uttara, Dhaka",product:"Chicco Baby Carrier",qty:1,sell:1650,cost:1100,courier:"Steadfast",tracking:"STF002",supplier:"Own Stock",payment:"COD",status:"Shipped",courierCost:80},
    {id:"AF24051603",date:"2026-08-16",customer:"মোঃ আরিফুল ইসলাম",phone:"01678-901234",address:"Savar, Dhaka",product:"Stretch Mark Cream",qty:1,sell:850,cost:350,courier:"Pathao",tracking:"PTH003",supplier:"Own Stock",payment:"bKash",status:"Processing",courierCost:80},
    {id:"AF24051604",date:"2026-08-16",customer:"নাদিয়া সুমন",phone:"01987-654321",address:"Chattogram",product:"Ayatul Qursi Bracelet",qty:1,sell:750,cost:250,courier:"Steadfast",tracking:"STF004",supplier:"Own Stock",payment:"COD",status:"Confirmed",courierCost:130},
    {id:"AF24051605",date:"2026-08-16",customer:"ইমরান শেখ",phone:"01345-678901",address:"Gazipur",product:"Meniscus Pain Relief Ointment",qty:1,sell:550,cost:200,courier:"Pathao",tracking:"PTH005",supplier:"AmarSell",payment:"COD",status:"Pending",courierCost:80}
  ],
  suppliers:suppliersDefault.map((name,i)=>({id:i+1,name,phone:"",due:0})),
  purchases:[],returns:[],expenses:[
    {id:1,date:"2026-08-16",category:"Facebook Boost",amount:500,note:"Sample"},
    {id:2,date:"2026-08-16",category:"Packaging",amount:250,note:"Sample"}
  ],
  payments:[]
};
let db=JSON.parse(localStorage.getItem(KEY)||"null")||seed;
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function money(n){return "৳ "+Number(n||0).toLocaleString("en-BD")}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.style.opacity=1;t.style.transform="translateY(0)";setTimeout(()=>{t.style.opacity=0;t.style.transform="translateY(10px)"},2200)}
function sum(a,fn){return a.reduce((x,y)=>x+Number(fn(y)||0),0)}
function delivered(o){return o.status==="Delivered"}
function sales(){return sum(db.orders.filter(o=>!["Cancelled","Returned"].includes(o.status)),o=>o.sell*o.qty)}
function productCost(){return sum(db.orders.filter(o=>!["Cancelled","Returned"].includes(o.status)),o=>o.cost*o.qty)}
function courierCost(){return sum(db.orders.filter(o=>o.status!=="Cancelled"),o=>o.courierCost)}
function expenseTotal(){return sum(db.expenses,e=>e.amount)}
function returnLoss(){return sum(db.returns,r=>r.loss)}
function netProfit(){return sales()-productCost()-courierCost()-expenseTotal()-returnLoss()}
function pending(){return db.orders.filter(o=>["Pending","Confirmed","Processing","Shipped"].includes(o.status)).length}

const pages={
dashboard:"Dashboard",orders:"Orders", "add-order":"Add Order",returns:"Returns",products:"Products",stock:"Stock / Inventory",
suppliers:"Suppliers",purchases:"Purchases",couriers:"Couriers",tracking:"Tracking",expenses:"Expenses",payments:"Payments",
profit:"Profit & Loss",reports:"Reports",settings:"Settings"
};
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>{location.hash=b.dataset.page;document.getElementById("sidebar").classList.remove("open")}));
document.getElementById("menuBtn").onclick=()=>document.getElementById("sidebar").classList.toggle("open");
window.addEventListener("hashchange",render); render();

function render(){const p=location.hash.slice(1)||"dashboard";document.getElementById("pageTitle").textContent=pages[p]||"Dashboard";document.getElementById("pendingBadge").textContent=pending();document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.page===p));(views[p]||views.dashboard)()}
const views={
dashboard(){
 const s=sales(), pc=productCost(), cc=courierCost(), ex=expenseTotal(), rp=returnLoss(), np=netProfit();
 const max=Math.max(...db.orders.map(o=>o.sell*o.qty),1000);
 document.getElementById("content").innerHTML=`
 <div class="page-head"><div><h1>Dashboard</h1><p>Al Furqun business-এর গুরুত্বপূর্ণ হিসাব এক নজরে</p></div><button class="btn btn-primary" onclick="location.hash='add-order'">＋ New Order</button></div>
 <div class="kpis">
 ${kpi("🛒","আজকের Sales",money(s),"Live হিসাব")}
 ${kpi("↗","আজকের Profit",money(np),"Net calculation")}
 ${kpi("▣","Total Orders",db.orders.length,"এই মাস")}
 ${kpi("🚚","Pending Delivery",pending(),"ডেলিভারির অপেক্ষায়")}
 ${kpi("↩","Returns",db.returns.length,"এই মাস")}
 ${kpi("৳","Expenses",money(ex),"এই মাস")}
 ${kpi("▤","Stock Value",money(sum(db.products,p=>p.cost*p.stock)),"মোট stock value")}
 ${kpi("💰","Net Profit",money(np),"সব খরচ বাদে")}
 </div>
 <div class="grid-3">
  <div class="card"><div class="card-head"><h3>Sales & Profit Overview</h3><span class="muted">এই মাস</span></div>
   <div class="chart">${db.orders.slice(-8).map((o,i)=>{let h=Math.max(10,(o.sell*o.qty/max)*100);let ph=Math.max(6,((o.sell-o.cost-o.courierCost)*o.qty/max)*100);return `<div class="bar"><div class="bar-fill" style="height:${h}%"></div><div class="bar-fill bar-profit" style="height:${ph}%"></div><span>${i+1}তম</span></div>`}).join("")}</div>
   <div class="muted">নীল = Sales &nbsp; • &nbsp; সবুজ = Order-level profit</div>
  </div>
  <div class="card"><div class="card-head"><h3>Order Status</h3><span class="muted">${db.orders.length} orders</span></div><div class="donut-wrap"><div class="donut"></div><div class="muted">Pending ${db.orders.filter(o=>o.status==="Pending").length}<br><br>Confirmed ${db.orders.filter(o=>o.status==="Confirmed").length}<br><br>Processing ${db.orders.filter(o=>o.status==="Processing").length}<br><br>Shipped ${db.orders.filter(o=>o.status==="Shipped").length}<br><br>Delivered ${db.orders.filter(o=>o.status==="Delivered").length}</div></div></div>
  <div class="card"><div class="card-head"><h3>Top Selling Products</h3><span class="muted">All time</span></div><ul class="top-list">${topProducts().map((x,i)=>`<li><span class="rank">${i+1}.</span><span class="prod-thumb">📦</span><div><strong>${esc(x.name)}</strong><small>${x.qty} pcs</small></div><span class="price">${money(x.amount)}</span></li>`).join("")||'<li class="empty">কোনো sales নেই</li>'}</ul></div>
 </div>
 <div class="grid-2">
  <div class="card"><div class="card-head"><h3>সাম্প্রতিক Orders</h3><button class="btn btn-light" onclick="location.hash='orders'">সবগুলো দেখুন</button></div>${orderTable(db.orders.slice(-6).reverse())}</div>
  <div class="card"><div class="card-head"><h3>স্টক সংক্ষিপ্ত বিবরণ</h3><button class="btn btn-light" onclick="location.hash='stock'">সবগুলো দেখুন</button></div>${stockTable(db.products.slice(0,6))}</div>
 </div>
 <div class="card" style="margin-top:14px"><div class="card-head"><h3>আর্থিক সংক্ষিপ্ত বিবরণ</h3><span class="muted">এই মাস</span></div><div class="fin-grid">
  ${fin("মোট Sales",s)}${fin("মোট Product Cost",pc)}${fin("মোট Courier Cost",cc)}${fin("মোট Expenses",ex)}${fin("মোট Return Loss",rp)}${fin("Net Profit",np)}
 </div></div>`;
},
orders(){
 document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Orders</h1><p>সব customer order manage করুন</p></div><button class="btn btn-primary" onclick="location.hash='add-order'">＋ Add New Order</button></div>
 <div class="card"><div class="toolbar"><input class="search" id="orderSearch" placeholder="Order ID, customer, phone বা product search..." oninput="filterOrders()"><select class="search" style="max-width:180px" id="orderStatus" onchange="filterOrders()"><option value="">সব Status</option>${["Pending","Confirmed","Processing","Shipped","Delivered","Cancelled","Returned"].map(s=>`<option>${s}</option>`).join("")}</select></div><div id="ordersTable">${orderTable(db.orders.slice().reverse(),true)}</div></div>`;
},
"add-order"(){showOrderForm()},
products(){document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Products</h1><p>Product catalogue ও pricing manage করুন</p></div><button class="btn btn-primary" onclick="showProductForm()">＋ Add Product</button></div><div class="card"><div class="toolbar"><input class="search" placeholder="Product search..." oninput="filterTable(this,'productTable')"></div><div id="productTable">${productTable()}</div></div>`},
stock(){document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Stock / Inventory</h1><p>নিজের stock-এর movement ও value</p></div><button class="btn btn-primary" onclick="showStockAdjust()">＋ Stock Adjustment</button></div><div class="grid-3"><div class="card"><h3>Current Stock</h3><strong style="font-size:28px">${sum(db.products,p=>p.stock)}</strong><p class="muted">Total units</p></div><div class="card"><h3>Stock Value</h3><strong style="font-size:28px">${money(sum(db.products,p=>p.cost*p.stock))}</strong><p class="muted">Cost-based value</p></div><div class="card"><h3>Low Stock</h3><strong style="font-size:28px;color:#dc2626">${db.products.filter(p=>p.stock<=p.min).length}</strong><p class="muted">Need attention</p></div></div><div class="card" style="margin-top:14px">${stockTable(db.products,true)}</div>`},
suppliers(){document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Suppliers</h1><p>Supplier list ও due tracking</p></div><button class="btn btn-primary" onclick="showSupplierForm()">＋ Add Supplier</button></div><div class="card">${supplierTable()}</div>`},
purchases(){document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Purchases</h1><p>নিজে product এনে stock-এ যোগ করুন</p></div><button class="btn btn-primary" onclick="showPurchaseForm()">＋ Add Purchase</button></div><div class="card">${purchaseTable()}</div>`},
couriers(){document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Couriers</h1><p>Pathao ও Steadfast performance</p></div></div><div class="report-grid">${couriersDefault.map(c=>{let os=db.orders.filter(o=>o.courier===c);return `<div class="report-card"><h3>${c}</h3><strong>${os.length}</strong><p class="muted">Total parcels</p><p>Delivered: ${os.filter(o=>o.status==="Delivered").length}<br>Pending: ${os.filter(o=>["Pending","Confirmed","Processing","Shipped"].includes(o.status)).length}<br>Returned: ${os.filter(o=>o.status==="Returned").length}<br>Courier Cost: ${money(sum(os,o=>o.courierCost))}</p></div>`}).join("")}</div>`},
tracking(){let os=db.orders.filter(o=>o.tracking);document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Tracking</h1><p>Courier tracking ID ও delivery status</p></div></div><div class="card"><div class="toolbar"><input class="search" placeholder="Tracking ID search..." oninput="filterTable(this,'trackingTable')"></div><div id="trackingTable">${trackingTable(os)}</div></div>`},
returns(){document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Returns</h1><p>Customer return ও loss tracking</p></div></div><div class="card">${returnTable()}</div>`},
expenses(){document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Expenses</h1><p>Business-এর সব extra খরচ</p></div><button class="btn btn-primary" onclick="showExpenseForm()">＋ Add Expense</button></div><div class="card"><div class="notice">Facebook Boost, packaging, transport, internet, courier এবং অন্যান্য business expense এখানে রাখুন।</div>${expenseTable()}</div>`},
payments(){document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Payments</h1><p>Customer, supplier ও courier money movement</p></div><button class="btn btn-primary" onclick="showPaymentForm()">＋ Add Payment</button></div><div class="grid-3"><div class="card"><h3>Customer Collected</h3><strong style="font-size:25px">${money(sum(db.orders.filter(o=>o.payment!=="Unpaid"),o=>o.sell*o.qty))}</strong></div><div class="card"><h3>Supplier Due</h3><strong style="font-size:25px">${money(sum(db.suppliers,s=>s.due))}</strong></div><div class="card"><h3>Courier Receivable</h3><strong style="font-size:25px">${money(0)}</strong></div></div><div class="card" style="margin-top:14px">${paymentTable()}</div>`},
profit(){const s=sales(),pc=productCost(),cc=courierCost(),ex=expenseTotal(),rp=returnLoss();document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Profit & Loss</h1><p>Real business profit calculation</p></div></div><div class="card"><div class="fin-grid">${fin("Sales",s)}${fin("Product Cost",pc)}${fin("Courier Cost",cc)}${fin("Expenses",ex)}${fin("Return Loss",rp)}${fin("Net Profit",s-pc-cc-ex-rp)}</div></div><div class="grid-2"><div class="card"><h3>Calculation</h3><p>Sales <b>${money(s)}</b></p><p>− Product Cost <b>${money(pc)}</b></p><p>− Courier Cost <b>${money(cc)}</b></p><p>− Business Expenses <b>${money(ex)}</b></p><p>− Return Loss <b>${money(rp)}</b></p><hr><p><strong>Net Profit = ${money(netProfit())}</strong></p></div><div class="card"><h3>Profit Margin</h3><strong style="font-size:34px">${s?((netProfit()/s)*100).toFixed(1):0}%</strong><p class="muted">Net profit as percentage of sales</p></div></div>`},
reports(){document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Reports</h1><p>Business performance overview</p></div></div><div class="report-grid">${reportCard("Total Sales",sales(),"Sales volume")}${reportCard("Total Profit",netProfit(),"After all tracked costs")}${reportCard("Total Orders",db.orders.length,"All order records")}${reportCard("Delivered",db.orders.filter(o=>o.status==="Delivered").length,"Successful delivery")}${reportCard("Returned",db.orders.filter(o=>o.status==="Returned").length,"Return records")}${reportCard("Expenses",expenseTotal(),"Tracked business costs")}${reportCard("Products",db.products.length,"Product catalogue")}${reportCard("Stock Units",sum(db.products,p=>p.stock),"Own stock only")}${reportCard("Stock Value",sum(db.products,p=>p.stock*p.cost),"At cost price")}</div>`},
settings(){document.getElementById("content").innerHTML=`<div class="page-head"><div><h1>Settings</h1><p>Al Furqun ERP configuration</p></div></div><div class="settings-grid"><div class="form-card"><h3>Business Information</h3><div class="form-grid" style="margin-top:14px"><div class="field span-2"><label>Business Name</label><input id="setBusiness" value="${esc(db.settings.business)}"></div><div class="field"><label>Phone</label><input id="setPhone" value="${esc(db.settings.phone)}"></div><div class="field span-3"><label>Address</label><textarea id="setAddress">${esc(db.settings.address)}</textarea></div><div class="field"><label>Dhaka Delivery Charge</label><input id="setDhaka" type="number" value="${db.settings.dhakaDelivery}"></div><div class="field"><label>Outside Dhaka Charge</label><input id="setOutside" type="number" value="${db.settings.outsideDelivery}"></div></div><div class="form-actions"><button class="btn btn-primary" onclick="saveSettings()">Save Settings</button></div></div><div class="form-card"><h3>Data Management</h3><p class="muted">এই version-এর data browser-এর Local Storage-এ save হয়।</p><div class="form-actions" style="justify-content:flex-start"><button class="btn btn-light" onclick="exportData()">Export Backup</button><button class="btn btn-danger" onclick="resetData()">Reset Demo Data</button></div><div class="notice" style="margin-top:14px">Production use-এর আগে cloud database/login/online backup যোগ করা উচিত।</div></div></div>`}
};

function kpi(icon,title,val,sub){return `<div class="kpi"><div class="kpi-icon">${icon}</div><div><small>${title}</small><strong>${val}</strong><em>${sub}</em></div></div>`}
function fin(t,v){return `<div class="fin"><small>${t}</small><strong>${money(v)}</strong></div>`}
function reportCard(t,v,s){return `<div class="report-card"><h3>${t}</h3><strong>${typeof v==="number"&&t!=="Total Orders"&&t!=="Delivered"&&t!=="Returned"&&t!=="Products"&&t!=="Stock Units"?money(v):Number(v).toLocaleString("en-BD")}</strong><p class="muted">${s}</p></div>`}
function statusClass(s){return s.toLowerCase().replaceAll(" ","")}
function orderTable(rows,actions=false){return `<div class="table-wrap"><table class="table"><thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Product</th><th>Amount</th><th>Courier</th><th>Status</th>${actions?"<th>Action</th>":""}</tr></thead><tbody>${rows.length?rows.map(o=>`<tr><td>#${esc(o.id)}</td><td>${esc(o.customer)}</td><td>${esc(o.phone)}</td><td>${esc(o.product)}</td><td>${money(o.sell*o.qty)}</td><td>${esc(o.courier)}</td><td><span class="status ${statusClass(o.status)}">${esc(o.status)}</span></td>${actions?`<td><div class="action-row"><button class="mini" onclick="viewOrder('${o.id}')">View</button><button class="mini" onclick="editOrder('${o.id}')">Edit</button><button class="mini" onclick="deleteOrder('${o.id}')">Delete</button></div></td>`:""}</tr>`).join(""):`<tr><td colspan="${actions?8:7}" class="empty">কোনো order পাওয়া যায়নি</td></tr>`}</tbody></table></div>`}
function stockTable(rows,actions=false){return `<div class="table-wrap"><table class="table"><thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Cost Price</th><th>Stock Value</th><th>Status</th>${actions?"<th>Action</th>":""}</tr></thead><tbody>${rows.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.sku)}</td><td>${p.stock}</td><td>${money(p.cost)}</td><td>${money(p.stock*p.cost)}</td><td><span class="status ${p.stock<=p.min?"returned":"delivered"}">${p.stock<=p.min?"Low Stock":"In Stock"}</span></td>${actions?`<td><button class="mini" onclick="showStockAdjust(${p.id})">Adjust</button></td>`:""}</tr>`).join("")}</tbody></table></div>`}
function productTable(){return `<div class="table-wrap"><table class="table"><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Cost</th><th>Sell</th><th>Stock</th><th>Type</th><th>Action</th></tr></thead><tbody>${db.products.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.sku)}</td><td>${esc(p.category)}</td><td>${money(p.cost)}</td><td>${money(p.sell)}</td><td>${p.stock}</td><td>${esc(p.type)}</td><td><div class="action-row"><button class="mini" onclick="showProductForm(${p.id})">Edit</button><button class="mini" onclick="deleteProduct(${p.id})">Delete</button></div></td></tr>`).join("")}</tbody></table></div>`}
function supplierTable(){return `<div class="table-wrap"><table class="table"><thead><tr><th>Supplier</th><th>Phone</th><th>Orders</th><th>Due</th><th>Action</th></tr></thead><tbody>${db.suppliers.map(s=>`<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.phone||"-")}</td><td>${db.orders.filter(o=>o.supplier===s.name).length}</td><td>${money(s.due)}</td><td><button class="mini" onclick="showSupplierForm(${s.id})">Edit</button></td></tr>`).join("")}</tbody></table></div>`}
function purchaseTable(){return `<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Product</th><th>Supplier</th><th>Qty</th><th>Unit Cost</th><th>Total</th></tr></thead><tbody>${db.purchases.length?db.purchases.slice().reverse().map(p=>`<tr><td>${p.date}</td><td>${esc(p.product)}</td><td>${esc(p.supplier)}</td><td>${p.qty}</td><td>${money(p.cost)}</td><td>${money(p.qty*p.cost)}</td></tr>`).join(""):`<tr><td colspan="6" class="empty">এখনও purchase entry নেই</td></tr>`}</tbody></table></div>`}
function trackingTable(rows){return `<div class="table-wrap"><table class="table"><thead><tr><th>Order ID</th><th>Customer</th><th>Courier</th><th>Tracking</th><th>Status</th></tr></thead><tbody>${rows.map(o=>`<tr><td>#${o.id}</td><td>${esc(o.customer)}</td><td>${o.courier}</td><td><b>${esc(o.tracking)}</b></td><td><span class="status ${statusClass(o.status)}">${o.status}</span></td></tr>`).join("")}</tbody></table></div>`}
function returnTable(){return `<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Order</th><th>Product</th><th>Reason</th><th>Loss</th></tr></thead><tbody>${db.returns.length?db.returns.map(r=>`<tr><td>${r.date}</td><td>#${r.orderId}</td><td>${esc(r.product)}</td><td>${esc(r.reason)}</td><td>${money(r.loss)}</td></tr>`).join(""):`<tr><td colspan="5" class="empty">কোনো return record নেই</td></tr>`}</tbody></table></div>`}
function expenseTable(){return `<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th><th>Action</th></tr></thead><tbody>${db.expenses.slice().reverse().map(e=>`<tr><td>${e.date}</td><td>${esc(e.category)}</td><td>${money(e.amount)}</td><td>${esc(e.note||"-")}</td><td><button class="mini" onclick="deleteExpense(${e.id})">Delete</button></td></tr>`).join("")}</tbody></table></div>`}
function paymentTable(){return `<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Type</th><th>Party</th><th>Method</th><th>Amount</th><th>Note</th></tr></thead><tbody>${db.payments.length?db.payments.slice().reverse().map(p=>`<tr><td>${p.date}</td><td>${p.type}</td><td>${esc(p.party)}</td><td>${p.method}</td><td>${money(p.amount)}</td><td>${esc(p.note||"-")}</td></tr>`).join(""):`<tr><td colspan="6" class="empty">কোনো payment record নেই</td></tr>`}</tbody></table></div>`}
function topProducts(){let m={};db.orders.forEach(o=>{if(["Cancelled","Returned"].includes(o.status))return;m[o.product]??={name:o.product,qty:0,amount:0};m[o.product].qty+=o.qty;m[o.product].amount+=o.sell*o.qty});return Object.values(m).sort((a,b)=>b.amount-a.amount).slice(0,5)}
function filterTable(input,id){let q=input.value.toLowerCase();document.querySelectorAll(`#${id} tbody tr`).forEach(r=>r.style.display=r.textContent.toLowerCase().includes(q)?"":"none")}
function filterOrders(){let q=(document.getElementById("orderSearch")?.value||"").toLowerCase(),s=document.getElementById("orderStatus")?.value||"";let rows=db.orders.slice().reverse().filter(o=>(!q||JSON.stringify(o).toLowerCase().includes(q))&&(!s||o.status===s));document.getElementById("ordersTable").innerHTML=orderTable(rows,true)}

function modal(title,body){document.getElementById("modalRoot").innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="modal-box"><div class="modal-head"><h3>${title}</h3><button class="close" onclick="closeModal()">×</button></div><div class="modal-body">${body}</div></div></div>`}
function closeModal(){document.getElementById("modalRoot").innerHTML=""}
function showOrderForm(id=null){
 let o=id?db.orders.find(x=>x.id===id):null;
 modal(id?"Edit Order":"Add New Order",`<form onsubmit="saveOrder(event,'${id||""}')"><div class="form-grid">
 <div class="field"><label>Customer Name *</label><input id="oCustomer" required value="${esc(o?.customer||"")}"></div>
 <div class="field"><label>Phone *</label><input id="oPhone" required value="${esc(o?.phone||"")}"></div>
 <div class="field"><label>Product *</label><select id="oProduct" required>${db.products.map(p=>`<option ${o?.product===p.name?"selected":""} value="${esc(p.name)}">${esc(p.name)} — ${money(p.sell)}</option>`).join("")}</select></div>
 <div class="field span-2"><label>Address *</label><input id="oAddress" required value="${esc(o?.address||"")}"></div>
 <div class="field"><label>Quantity</label><input id="oQty" type="number" min="1" value="${o?.qty||1}"></div>
 <div class="field"><label>Fulfillment</label><select id="oSupplier">${["Own Stock",...suppliersDefault].map(s=>`<option ${o?.supplier===s?"selected":""}>${s}</option>`).join("")}</select></div>
 <div class="field"><label>Courier</label><select id="oCourier">${couriersDefault.map(c=>`<option ${o?.courier===c?"selected":""}>${c}</option>`).join("")}</select></div>
 <div class="field"><label>Selling Price</label><input id="oSell" type="number" value="${o?.sell||""}" placeholder="Product default"></div>
 <div class="field"><label>Delivery Cost</label><input id="oCourierCost" type="number" value="${o?.courierCost??db.settings.dhakaDelivery}"></div>
 <div class="field"><label>Payment</label><select id="oPayment">${["COD","bKash","Nagad","Bank","Paid","Unpaid"].map(s=>`<option ${o?.payment===s?"selected":""}>${s}</option>`).join("")}</select></div>
 <div class="field"><label>Status</label><select id="oStatus">${["Pending","Confirmed","Processing","Shipped","Delivered","Cancelled","Returned"].map(s=>`<option ${o?.status===s?"selected":""}>${s}</option>`).join("")}</select></div>
 <div class="field"><label>Tracking ID</label><input id="oTracking" value="${esc(o?.tracking||"")}"></div>
 </div><div class="form-actions"><button type="button" class="btn btn-light" onclick="closeModal()">Cancel</button><button class="btn btn-primary">${id?"Update":"Save Order"}</button></div></form>`);
}
function saveOrder(e,id){e.preventDefault();let product=db.products.find(p=>p.name===document.getElementById("oProduct").value);let qty=Number(document.getElementById("oQty").value)||1;let old=id?db.orders.find(o=>o.id===id):null;
 let obj={id:id||("AF"+Date.now().toString().slice(-8)),date:new Date().toISOString().slice(0,10),customer:document.getElementById("oCustomer").value,phone:document.getElementById("oPhone").value,address:document.getElementById("oAddress").value,product:product.name,qty,sell:Number(document.getElementById("oSell").value)||product.sell,cost:product.cost,courier:document.getElementById("oCourier").value,tracking:document.getElementById("oTracking").value,supplier:document.getElementById("oSupplier").value,payment:document.getElementById("oPayment").value,status:document.getElementById("oStatus").value,courierCost:Number(document.getElementById("oCourierCost").value)||0};
 if(!id && obj.supplier==="Own Stock")product.stock=Math.max(0,product.stock-qty);
 if(old && old.supplier==="Own Stock" && old.product===obj.product) product.stock+=old.qty-qty;
 if(id){let i=db.orders.findIndex(x=>x.id===id);db.orders[i]=obj}else db.orders.push(obj);save();closeModal();toast(id?"Order updated":"Order created");render()}
function viewOrder(id){let o=db.orders.find(x=>x.id===id);modal("Order Details",`<div class="grid-2"><div><p><b>Order ID:</b> #${o.id}</p><p><b>Customer:</b> ${esc(o.customer)}</p><p><b>Phone:</b> ${esc(o.phone)}</p><p><b>Address:</b> ${esc(o.address)}</p></div><div><p><b>Product:</b> ${esc(o.product)} × ${o.qty}</p><p><b>Amount:</b> ${money(o.sell*o.qty)}</p><p><b>Courier:</b> ${o.courier}</p><p><b>Tracking:</b> ${esc(o.tracking||"-")}</p><p><b>Status:</b> ${o.status}</p></div></div>`)}
function editOrder(id){showOrderForm(id)}
function deleteOrder(id){if(confirm("এই order delete করবেন?")){db.orders=db.orders.filter(o=>o.id!==id);save();toast("Order deleted");render()}}
function showProductForm(id=null){let p=id?db.products.find(x=>x.id===id):null;modal(id?"Edit Product":"Add Product",`<form onsubmit="saveProduct(event,'${id||""}')"><div class="form-grid"><div class="field span-2"><label>Product Name *</label><input id="pName" required value="${esc(p?.name||"")}"></div><div class="field"><label>SKU</label><input id="pSku" value="${esc(p?.sku||"")}"></div><div class="field"><label>Category</label><input id="pCat" value="${esc(p?.category||"")}"></div><div class="field"><label>Cost Price</label><input id="pCost" type="number" required value="${p?.cost||""}"></div><div class="field"><label>Selling Price</label><input id="pSell" type="number" required value="${p?.sell||""}"></div><div class="field"><label>Stock</label><input id="pStock" type="number" value="${p?.stock||0}"></div><div class="field"><label>Minimum Stock</label><input id="pMin" type="number" value="${p?.min||5}"></div><div class="field"><label>Type</label><select id="pType"><option ${p?.type==="Own Stock"?"selected":""}>Own Stock</option><option ${p?.type==="Dropshipping"?"selected":""}>Dropshipping</option></select></div></div><div class="form-actions"><button type="button" class="btn btn-light" onclick="closeModal()">Cancel</button><button class="btn btn-primary">Save Product</button></div></form>`)}
function saveProduct(e,id){e.preventDefault();let o={id:id?Number(id):Date.now(),name:document.getElementById("pName").value,sku:document.getElementById("pSku").value,category:document.getElementById("pCat").value,cost:Number(document.getElementById("pCost").value)||0,sell:Number(document.getElementById("pSell").value)||0,stock:Number(document.getElementById("pStock").value)||0,min:Number(document.getElementById("pMin").value)||0,type:document.getElementById("pType").value};if(id)db.products[db.products.findIndex(x=>x.id===Number(id))]=o;else db.products.push(o);save();closeModal();toast("Product saved");render()}
function deleteProduct(id){if(confirm("Product delete করবেন?")){db.products=db.products.filter(p=>p.id!==id);save();toast("Product deleted");render()}}
function showSupplierForm(id=null){let s=id?db.suppliers.find(x=>x.id===id):null;modal(id?"Edit Supplier":"Add Supplier",`<form onsubmit="saveSupplier(event,'${id||""}')"><div class="form-grid"><div class="field span-2"><label>Supplier Name *</label><input id="sName" required value="${esc(s?.name||"")}"></div><div class="field"><label>Phone</label><input id="sPhone" value="${esc(s?.phone||"")}"></div><div class="field"><label>Due</label><input id="sDue" type="number" value="${s?.due||0}"></div></div><div class="form-actions"><button type="button" class="btn btn-light" onclick="closeModal()">Cancel</button><button class="btn btn-primary">Save</button></div></form>`)}
function saveSupplier(e,id){e.preventDefault();let o={id:id?Number(id):Date.now(),name:document.getElementById("sName").value,phone:document.getElementById("sPhone").value,due:Number(document.getElementById("sDue").value)||0};if(id)db.suppliers[db.suppliers.findIndex(x=>x.id===Number(id))]=o;else db.suppliers.push(o);save();closeModal();toast("Supplier saved");render()}
function showPurchaseForm(){modal("Add Purchase",`<form onsubmit="savePurchase(event)"><div class="form-grid"><div class="field span-2"><label>Product *</label><select id="buyProduct">${db.products.map(p=>`<option>${esc(p.name)}</option>`).join("")}</select></div><div class="field"><label>Supplier</label><select id="buySupplier">${suppliersDefault.map(s=>`<option>${s}</option>`).join("")}</select></div><div class="field"><label>Quantity</label><input id="buyQty" type="number" min="1" value="1"></div><div class="field"><label>Unit Cost</label><input id="buyCost" type="number" value="0"></div><div class="field span-3"><label>Note</label><input id="buyNote"></div></div><div class="form-actions"><button type="button" class="btn btn-light" onclick="closeModal()">Cancel</button><button class="btn btn-primary">Save Purchase</button></div></form>`)}
function savePurchase(e){e.preventDefault();let name=document.getElementById("buyProduct").value,p=db.products.find(x=>x.name===name),q=Number(document.getElementById("buyQty").value)||1,c=Number(document.getElementById("buyCost").value)||p.cost;p.stock+=q;db.purchases.push({id:Date.now(),date:new Date().toISOString().slice(0,10),product:name,supplier:document.getElementById("buySupplier").value,qty:q,cost:c,note:document.getElementById("buyNote").value});save();closeModal();toast("Purchase added & stock updated");render()}
function showExpenseForm(){modal("Add Expense",`<form onsubmit="saveExpense(event)"><div class="form-grid"><div class="field"><label>Category</label><select id="eCat">${["Facebook Boost","Packaging","Transport","Courier","Internet","Mobile","Office","Other"].map(x=>`<option>${x}</option>`).join("")}</select></div><div class="field"><label>Amount</label><input id="eAmount" type="number" required></div><div class="field"><label>Date</label><input id="eDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field span-3"><label>Note</label><textarea id="eNote"></textarea></div></div><div class="form-actions"><button type="button" class="btn btn-light" onclick="closeModal()">Cancel</button><button class="btn btn-primary">Save Expense</button></div></form>`)}
function saveExpense(e){e.preventDefault();db.expenses.push({id:Date.now(),date:document.getElementById("eDate").value,category:document.getElementById("eCat").value,amount:Number(document.getElementById("eAmount").value)||0,note:document.getElementById("eNote").value});save();closeModal();toast("Expense saved");render()}
function deleteExpense(id){if(confirm("Expense delete করবেন?")){db.expenses=db.expenses.filter(x=>x.id!==id);save();render()}}
function showPaymentForm(){modal("Add Payment",`<form onsubmit="savePayment(event)"><div class="form-grid"><div class="field"><label>Type</label><select id="payType"><option>Customer Collection</option><option>Supplier Payment</option><option>Courier Collection</option><option>Other</option></select></div><div class="field"><label>Party</label><input id="payParty"></div><div class="field"><label>Method</label><select id="payMethod"><option>Cash</option><option>bKash</option><option>Nagad</option><option>Bank</option></select></div><div class="field"><label>Amount</label><input id="payAmount" type="number" required></div><div class="field"><label>Date</label><input id="payDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field span-2"><label>Note</label><input id="payNote"></div></div><div class="form-actions"><button type="button" class="btn btn-light" onclick="closeModal()">Cancel</button><button class="btn btn-primary">Save Payment</button></div></form>`)}
function savePayment(e){e.preventDefault();db.payments.push({id:Date.now(),date:document.getElementById("payDate").value,type:document.getElementById("payType").value,party:document.getElementById("payParty").value,method:document.getElementById("payMethod").value,amount:Number(document.getElementById("payAmount").value)||0,note:document.getElementById("payNote").value});save();closeModal();toast("Payment saved");render()}
function showStockAdjust(id=null){let p=id?db.products.find(x=>x.id===id):db.products[0];modal("Stock Adjustment",`<form onsubmit="saveStockAdjust(event)"><div class="form-grid"><div class="field span-2"><label>Product</label><select id="adjProduct">${db.products.map(x=>`<option value="${x.id}" ${x.id===p.id?"selected":""}>${esc(x.name)} — Current ${x.stock}</option>`).join("")}</select></div><div class="field"><label>Change (+/-)</label><input id="adjQty" type="number" required placeholder="+10 or -5"></div><div class="field span-3"><label>Reason</label><input id="adjReason" placeholder="Damaged, lost, manual correction..."></div></div><div class="form-actions"><button type="button" class="btn btn-light" onclick="closeModal()">Cancel</button><button class="btn btn-primary">Update Stock</button></div></form>`)}
function saveStockAdjust(e){e.preventDefault();let p=db.products.find(x=>x.id===Number(document.getElementById("adjProduct").value));p.stock=Math.max(0,p.stock+(Number(document.getElementById("adjQty").value)||0));save();closeModal();toast("Stock updated");render()}
function saveSettings(){db.settings.business=document.getElementById("setBusiness").value;db.settings.phone=document.getElementById("setPhone").value;db.settings.address=document.getElementById("setAddress").value;db.settings.dhakaDelivery=Number(document.getElementById("setDhaka").value)||0;db.settings.outsideDelivery=Number(document.getElementById("setOutside").value)||0;save();toast("Settings saved")}
function exportData(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:"application/json"}));a.download="al-furqun-erp-backup.json";a.click();URL.revokeObjectURL(a.href)}
function resetData(){if(confirm("Demo data reset হবে। Continue?")){localStorage.removeItem(KEY);location.reload()}}


/* Motion helper for future page refreshes */
function replayMotion(){
  requestAnimationFrame(()=>{
    document.querySelectorAll('.kpi,.card,.form-card,.report-card,.fin,.page-head h1,.notice').forEach((el)=>{
      el.classList.remove('motion-replay');
      void el.offsetWidth;
      el.classList.add('motion-replay');
    });
  });
}


/* =========================================================
   AL FURQUN ERP V3 — PREMIUM MOTION JS
   ========================================================= */

(function(){
  // Smooth startup loader
  const loader = document.getElementById('appLoader');
  const finishLoader = () => {
    if(loader) setTimeout(() => loader.classList.add('hide'), 650);
  };
  if(document.readyState === 'complete') finishLoader();
  else window.addEventListener('load', finishLoader);

  // Premium toast API
  window.afToast = function(message, type='success'){
    const box = document.getElementById('afToast');
    if(!box) return;
    const msg = box.querySelector('.toast-message');
    if(msg) msg.textContent = message;
    box.classList.remove('error','warning','show');
    if(type === 'error' || type === 'warning') box.classList.add(type);
    void box.offsetWidth;
    box.classList.add('show');
    clearTimeout(window.__afToastTimer);
    window.__afToastTimer = setTimeout(()=>box.classList.remove('show'), 2600);
  };

  // Count-up animation for money/stat values when they contain numbers.
  window.afCountUp = function(el, end, duration=750){
    if(!el || isNaN(end)) return;
    const start = 0;
    const startTime = performance.now();
    const step = (now)=>{
      const p = Math.min((now-startTime)/duration,1);
      const eased = 1-Math.pow(1-p,3);
      const value = start+(end-start)*eased;
      el.textContent = Math.round(value).toLocaleString();
      if(p<1) requestAnimationFrame(step);
      else el.classList.add('count-pop');
    };
    requestAnimationFrame(step);
  };

  // Re-trigger page/card entrance animations.
  window.replayPremiumMotion = function(){
    requestAnimationFrame(()=>{
      document.querySelectorAll('.page,.kpi,.card,.form-card,.report-card,.fin,.page-head h1').forEach(el=>{
        el.classList.remove('motion-replay');
        void el.offsetWidth;
        el.classList.add('motion-replay');
      });
    });
  };

  // Gentle hover tilt for dashboard KPI cards on pointer devices.
  if(window.matchMedia && window.matchMedia('(hover:hover)').matches){
    document.addEventListener('pointermove', (e)=>{
      const card = e.target.closest('.kpi');
      if(!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      card.style.transform = `perspective(700px) rotateX(${(-y*1.8).toFixed(2)}deg) rotateY(${(x*1.8).toFixed(2)}deg) translateY(-4px)`;
    });
    document.addEventListener('pointerout', (e)=>{
      const card = e.target.closest('.kpi');
      if(card && !card.contains(e.relatedTarget)) card.style.transform='';
    });
  }
})();

/* =========================================================
   AL FURQUN ERP V4 — SUPABASE CLOUD SYNC + AUTH
   ========================================================= */
(function(){
  const SUPABASE_URL = "https://dcqivblrijcyrawfjkuh.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_V9ywPrDbXTZoTcbJfJKJoA_UFoa8zLj";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  window.afSupabase = client;

  let syncTimer = null;
  let syncing = false;
  let cloudReady = false;

  const loginScreen = document.getElementById('loginScreen');
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');
  const syncStatus = document.getElementById('syncStatus');
  const profileName = document.getElementById('profileName');
  const profileRole = document.getElementById('profileRole');
  const profileAvatar = document.getElementById('profileAvatar');
  const logoutBtn = document.getElementById('logoutBtn');

  function setStatus(text, mode='ok'){
    if(!syncStatus) return;
    syncStatus.textContent = '● ' + text;
    syncStatus.classList.toggle('cloud-pulse', mode==='busy');
    syncStatus.style.color = mode==='error' ? '#ef4444' : mode==='busy' ? '#f59e0b' : '#22c55e';
  }

  function showLogin(message=''){
    loginError.textContent = message;
    loginScreen.classList.remove('hide');
    setTimeout(()=>loginEmail?.focus(),150);
  }

  function hideLogin(){ loginScreen.classList.add('hide'); }

  function updateProfile(user){
    const email = user?.email || 'Admin';
    const initial = email.charAt(0).toUpperCase();
    if(profileName) profileName.textContent = email.split('@')[0] || 'Admin';
    if(profileRole) profileRole.textContent = 'Owner';
    if(profileAvatar) profileAvatar.textContent = initial;
  }

  function localState(){
    try{return JSON.parse(localStorage.getItem(KEY)||'null') || db;}catch{return db;}
  }

  async function loadCloud(user){
    setStatus('Loading cloud data...', 'busy');
    const {data,error} = await client.from('erp_state').select('state').eq('user_id',user.id).maybeSingle();
    if(error){
      console.error(error); setStatus('Cloud error','error');
      toast('Cloud database error');
      return false;
    }
    if(data?.state && typeof data.state === 'object' && Object.keys(data.state).length){
      db = data.state;
      localStorage.setItem(KEY, JSON.stringify(db));
      cloudReady = true;
      setStatus('Cloud synced');
      render();
      return true;
    }
    // First login: preserve the current local/demo data and upload it as the user's cloud state.
    db = localState();
    localStorage.setItem(KEY, JSON.stringify(db));
    const {error:insertError} = await client.from('erp_state').upsert({user_id:user.id,state:db,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(insertError){console.error(insertError);setStatus('Sync failed','error');return false;}
    cloudReady = true;
    setStatus('Cloud synced');
    render();
    return true;
  }

  async function syncCloud(){
    if(!cloudReady || syncing) return;
    const {data:{user}} = await client.auth.getUser();
    if(!user) return;
    syncing = true;
    setStatus('Saving...', 'busy');
    try{
      const {error} = await client.from('erp_state').upsert({
        user_id:user.id,
        state:db,
        updated_at:new Date().toISOString()
      },{onConflict:'user_id'});
      if(error) throw error;
      setStatus('Cloud synced');
    }catch(err){
      console.error(err); setStatus('Sync failed','error'); toast('Cloud sync failed');
    }finally{syncing=false;}
  }

  // Keep local backup and debounce cloud writes. Existing ERP code can keep calling save().
  window.save = function(){
    localStorage.setItem(KEY,JSON.stringify(db));
    clearTimeout(syncTimer);
    syncTimer=setTimeout(syncCloud,500);
  };

  window.afSyncNow = syncCloud;

  let authInitialized = false;
  let currentSession = null;
  let signingIn = false;

  loginForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(signingIn) return;
    signingIn = true;
    loginError.textContent='';
    loginBtn.disabled=true;
    loginBtn.textContent='Signing in...';

    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    const {data,error} = await client.auth.signInWithPassword({email,password});

    if(error){
      console.error('Sign-in error:', error);
      loginError.textContent = error.message.includes('Invalid login credentials')
        ? 'Email অথবা password ভুল।' : error.message;
      loginBtn.disabled=false;
      loginBtn.textContent='Sign In';
      signingIn=false;
      return;
    }

    // signInWithPassword returning a session is authoritative. Keep the
    // login screen hidden even if the initial getSession() call is still
    // finishing in the background.
    currentSession = data.session || null;
    if(currentSession){
      updateProfile(currentSession.user);
      hideLogin();
      setStatus('Loading cloud data...', 'busy');
      loadCloud(currentSession.user).then(ok=>{
        if(!ok) setStatus('Offline / cloud read failed','error');
      });
    }

    loginBtn.disabled=false;
    loginBtn.textContent='Sign In';
    signingIn=false;
  });

  logoutBtn?.addEventListener('click',async()=>{
    await syncCloud();
    await client.auth.signOut();
  });

  // Auth events update the UI, but the initial anonymous event must not
  // overwrite a successful sign-in that happens while getSession() starts.
  client.auth.onAuthStateChange((event,session)=>{
    if(event === 'SIGNED_IN' && session){
      currentSession = session;
      updateProfile(session.user);
      hideLogin();
      if(authInitialized){
        setStatus('Loading cloud data...', 'busy');
        setTimeout(()=>loadCloud(session.user).then(ok=>{
          if(!ok) setStatus('Offline / cloud read failed','error');
        }),0);
      }
      return;
    }

    

    if(session){
      currentSession=session;
      updateProfile(session.user);
      hideLogin();
    }
  });

  // Perform exactly one initial session check. A successful sign-in can race
  // this call, so a null result is only used to show login when there is still
  // no current session.
  (async()=>{
    try{
      const {data,error} = await client.auth.getSession();
      if(error) throw error;

      if(data?.session){
        currentSession=data.session;
        updateProfile(data.session.user);
        hideLogin();
        setTimeout(()=>loadCloud(data.session.user).then(ok=>{
          if(!ok) setStatus('Offline / cloud read failed','error');
        }),0);
      }else if(!currentSession){
        showLogin('');
      }
    }catch(err){
      console.error(err);
      if(!currentSession) showLogin('Authentication connection failed.');
    }finally{
      authInitialized=true;
    }
  })();
})();
