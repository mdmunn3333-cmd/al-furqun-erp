/* =========================================================
   AL FURQUN ERP — SUPABASE VERSION
   ========================================================= */

const sbClient = window.supabase.createClient(
  "https://gzlytivdijfotclkicfe.supabase.co",
  "sb_publishable_WiFXeoHUlPgvaZGbj42B2Q_B8ubHffk"
);
let sb = null;
let db = {
  orders: [],
  customers: [],
  products: [],
  suppliers: [],
  expenses: [],
  payments: [],
  accounts: [],
  settings: {
    name: "Al Furqun",
    currency: "৳",
    notify: true
  }
};

let page = "dashboard";

/* =========================================================
   LOAD SUPABASE
   ========================================================= */

function loadSupabase() {
  return new Promise((resolve, reject) => {
    try {
      if (window.supabase && window.supabase.createClient) {
        sb = sbClient;
        resolve();
      } else {
        reject(new Error("Supabase library failed to load."));
      }
    } catch (error) {
      reject(error);
    }
  });
}

    script.onerror = () => {
      reject(new Error("Could not load Supabase."));
    };

    document.head.appendChild(script);
  });
}

/* =========================================================
   HELPERS
   ========================================================= */

function id(prefix) {
  return (
    prefix +
    "-" +
    Date.now().toString(36).toUpperCase()
  );
}

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    x => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[x])
  );
}

function money(n) {
  return `${db.settings.currency || "৳"} ${Number(
    n || 0
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function sales(o) {
  return (
    Number(o.salePrice || 0) *
    Number(o.quantity || 0)
  );
}

function cost(o) {
  return (
    Number(o.buyPrice || 0) *
      Number(o.quantity || 0) +
    Number(o.shipping || 0) +
    Number(o.advanced || 0) +
    Number(o.packingCharge || 0) +
    Number(o.courierCharge || 0) +
    Number(o.codReturn || 0)
  );
}

function profit(o) {
  return sales(o) - cost(o);
}

function toast(message, ok = true) {
  const box = document.getElementById("toast");

  if (!box) return;

  const e = document.createElement("div");

  e.className = "toast";

  e.innerHTML = `
    <i>${ok ? "✓" : "!"}</i>
    <div>
      <b>${ok ? "Successful" : "Notice"}</b>
      <div class="muted">${esc(message)}</div>
    </div>
  `;

  box.appendChild(e);

  setTimeout(() => e.remove(), 2700);
}

function badge(status) {
  let c = "blue";

  if (
    status === "Delivered" ||
    status === "Completed"
  ) {
    c = "green";
  }

  if (
    status === "Returned" ||
    status === "Cancelled"
  ) {
    c = "red";
  }

  if (status === "Pending") {
    c = "yellow";
  }

  return `
    <span class="badge ${c}">
      ${esc(status || "Pending")}
    </span>
  `;
}

/* =========================================================
   SUPABASE TABLE LOADER
   ========================================================= */

async function loadTable(table) {
  try {

    const { data, error } = await sb
      .from(table)
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.warn(
        `Could not load ${table}:`,
        error.message
      );

      return [];
    }

    return data || [];

  } catch (err) {

    console.error(err);

    return [];
  }
}

async function loadAllData() {

  db.orders = await loadTable("orders");

  db.customers = await loadTable("customers");

  db.products = await loadTable("products");

  db.suppliers = await loadTable("suppliers");

  db.expenses = await loadTable("expenses");

  db.payments = await loadTable("payments");

  db.accounts = await loadTable("accounts");

  try {

    const { data } = await sb
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (data) {
      db.settings = {
        ...db.settings,
        ...data
      };
    }

  } catch (e) {
    console.warn("Settings load skipped.");
  }
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function nav() {

  document
    .querySelectorAll("nav button")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page === page
      );

    });
}

async function render() {

  document
    .getElementById("login")
    ?.classList.add("hidden");

  document
    .getElementById("app")
    ?.classList.remove("hidden");

  nav();

  const functions = {
    dashboard,
    orders,
    customers,
    products,
    suppliers,
    expenses,
    accounts,
    reports,
    settings
  };

  const fn = functions[page];

  if (!fn) return;

  document.getElementById("content").innerHTML =
    fn();

  bind();
}

/* =========================================================
   PAGE HEADER
   ========================================================= */

function head(title, subtitle, actions = "") {

  return `
    <div class="title">
      <div>
        <h2>${title}</h2>
        <div class="muted">${subtitle}</div>
      </div>

      <div class="actions">
        ${actions}
      </div>
    </div>
  `;
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function dashboard() {

  const totalSales =
    db.orders.reduce(
      (a, o) => a + sales(o),
      0
    );

  const totalProfit =
    db.orders
      .filter(
        o =>
          !["Returned", "Cancelled"].includes(
            o.status
          )
      )
      .reduce(
        (a, o) => a + profit(o),
        0
      );

  const totalLoss =
    db.orders
      .filter(
        o =>
          ["Returned", "Cancelled"].includes(
            o.status
          )
      )
      .reduce(
        (a, o) =>
          a + Math.abs(profit(o)),
        0
      );

  const recent = [...db.orders]
    .sort((a, b) =>
      String(b.date || "").localeCompare(
        String(a.date || "")
      )
    )
    .slice(0, 7);

  return `
    <div class="page">

      ${head(
        "Dashboard",
        "Everything important about Al Furqun in one place."
      )}

      <div class="stats">

        <div class="stat"
          onclick="page='orders';render()">

          <label>Total Sales</label>

          <strong>
            ${money(totalSales)}
          </strong>

          <span class="green">
            ↗ ${db.orders.length} orders
          </span>

        </div>

        <div class="stat">

          <label>Total Amount</label>

          <strong>
            ${money(totalSales)}
          </strong>

          <span class="blue">
            All order value
          </span>

        </div>

        <div class="stat"
          onclick="page='reports';render()">

          <label>Total Profit</label>

          <strong>
            ${money(totalProfit)}
          </strong>

          <span class="green">
            Calculated profit
          </span>

        </div>

        <div class="stat"
          onclick="page='reports';render()">

          <label>Total Loss</label>

          <strong>
            ${money(totalLoss)}
          </strong>

          <span class="red">
            Returns / cancellations
          </span>

        </div>

      </div>

      <div class="grid2">

        <div class="card">

          <div class="card-head">
            <h3>Business Overview</h3>
          </div>

          <div class="summary">

            <div>
              <small>Customers</small>
              <strong>${db.customers.length}</strong>
            </div>

            <div>
              <small>Products</small>
              <strong>${db.products.length}</strong>
            </div>

            <div>
              <small>Suppliers</small>
              <strong>${db.suppliers.length}</strong>
            </div>

            <div>
              <small>Expenses</small>
              <strong>
                ${money(
                  db.expenses.reduce(
                    (a, x) =>
                      a + Number(x.amount || 0),
                    0
                  )
                )}
              </strong>
            </div>

          </div>

        </div>

        <div class="card">

          <div class="card-head">
            <h3>Recent Orders</h3>

            <button
              class="btn"
              onclick="page='orders';render()">
              View All
            </button>

          </div>

          ${
            recent.length
              ? orderTable(recent)
              : empty(
                  "No orders yet. Add your first order."
                )
          }

        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   EMPTY
   ========================================================= */

function empty(text) {
  return `
    <div class="empty">
      ${esc(text)}
    </div>
  `;
}

/* =========================================================
   ORDERS
   ========================================================= */

function orderTable(rows) {

  return `
    <div class="table-wrap">

      <table class="table">

        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Date</th>
            <th>Total</th>
            <th>Profit</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>

          ${rows.map(o => `

            <tr>

              <td>${esc(o.id)}</td>

              <td>
                ${esc(o.customerName)}
              </td>

              <td>
                ${esc(o.productName)}
              </td>

              <td>
                ${esc(o.date)}
              </td>

              <td>
                ${money(sales(o))}
              </td>

              <td>
                ${money(profit(o))}
              </td>

              <td>
                ${badge(o.status)}
              </td>

              <td>
                <button
                  class="btn"
                  onclick="viewOrder('${esc(o.id)}')">
                  View
                </button>
              </td>

            </tr>

          `).join("")}

        </tbody>

      </table>

    </div>
  `;
}

function orders() {

  const rows = [...db.orders].sort(
    (a, b) =>
      String(b.date || "").localeCompare(
        String(a.date || "")
      )
  );

  return `
    <div class="page">

      ${head(
        "Orders",
        "Create, edit and track every customer order.",
        `<button
          class="btn primary"
          onclick="orderModal()">
          + Add New Customer
        </button>`
      )}

      <div class="card">

        ${
          rows.length
            ? orderTable(rows)
            : empty("No orders yet.")
        }

      </div>

    </div>
  `;
}

/* =========================================================
   CUSTOMERS
   ========================================================= */

function customers() {

  const q =
    (
      document.getElementById(
        "customerSearch"
      )?.value || ""
    )
      .toLowerCase()
      .trim();

  const list =
    db.customers.filter(c =>
      !q ||
      [
        c.name,
        c.phone,
        c.address
      ].some(v =>
        String(v || "")
          .toLowerCase()
          .includes(q)
      )
    );

  return `
    <div class="page">

      ${head(
        "Customers",
        "Search customer history, contact details and order totals.",
        `<button
          class="btn primary"
          onclick="orderModal()">
          + Add Customer
        </button>`
      )}

      <div class="card">

        <div class="field search-local">

          <label>Search Customer</label>

          <input
            id="customerSearch"
            placeholder="Name or phone..."
            value="${esc(q)}">

        </div>

        ${
          list.length
            ? `
              <div class="table-wrap">

                <table class="table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Orders</th>
                      <th>Sales</th>
                      <th>Last Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    ${list.map(c => {

                      const os =
                        db.orders.filter(
                          o =>
                            o.customerId === c.id
                        );

                      const last =
                        [...os].sort(
                          (a, b) =>
                            String(
                              b.date || ""
                            ).localeCompare(
                              String(
                                a.date || ""
                              )
                            )
                        )[0];

                      return `
                        <tr>

                          <td>
                            <b>${esc(c.name)}</b>
                          </td>

                          <td>
                            ${esc(c.phone)}
                          </td>

                          <td>
                            ${os.length}
                          </td>

                          <td>
                            ${money(
                              os.reduce(
                                (a, o) =>
                                  a + sales(o),
                                0
                              )
                            )}
                          </td>

                          <td>
                            ${last?.date || "-"}
                          </td>

                          <td>

                            <button
                              class="btn"
                              onclick="customerView('${c.id}')">
                              History
                            </button>

                            <button
                              class="btn"
                              onclick="customerEdit('${c.id}')">
                              Edit
                            </button>

                            <button
                              class="btn danger"
                              onclick="customerDelete('${c.id}')">
                              Delete
                            </button>

                          </td>

                        </tr>
                      `;

                    }).join("")}

                  </tbody>

                </table>

              </div>
            `
            : empty("No matching customers.")
        }

      </div>

    </div>
  `;
}

/* =========================================================
   PRODUCTS
   ========================================================= */

function products() {

  const q =
    (
      document.getElementById(
        "productSearch"
      )?.value || ""
    )
      .toLowerCase()
      .trim();

  const list =
    db.products.filter(p =>
      !q ||
      [
        p.name,
        db.suppliers.find(
          s =>
            s.id === p.supplierId
        )?.name
      ].some(v =>
        String(v || "")
          .toLowerCase()
          .includes(q)
      )
    );

  return `
    <div class="page">

      ${head(
        "Products",
        "Search products, buy price, supplier and stock.",
        `<button
          class="btn primary"
          onclick="productModal()">
          + Add Product
        </button>`
      )}

      <div class="card">

        <div class="field search-local">

          <label>Search Product</label>

          <input
            id="productSearch"
            placeholder="Product or supplier..."
            value="${esc(q)}">

        </div>

        ${
          list.length
            ? `
              <div class="table-wrap">

                <table class="table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Buy Price</th>
                      <th>Supplier</th>
                      <th>Stock</th>
                      <th>Reorder</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    ${list.map(p => `

                      <tr>

                        <td>
                          <b>${esc(p.name)}</b>
                        </td>

                        <td>
                          ${money(p.buyPrice)}
                        </td>

                        <td>
                          ${esc(
                            db.suppliers.find(
                              s =>
                                s.id ===
                                p.supplierId
                            )?.name || "-"
                          )}
                        </td>

                        <td>${p.stock}</td>

                        <td>${p.reorder}</td>

                        <td>

                          <button
                            class="btn"
                            onclick="productModal('${p.id}')">
                            Edit
                          </button>

                          <button
                            class="btn danger"
                            onclick="productDelete('${p.id}')">
                            Delete
                          </button>

                        </td>

                      </tr>

                    `).join("")}

                  </tbody>

                </table>

              </div>
            `
            : empty("No matching products.")
        }

      </div>

    </div>
  `;
}

/* =========================================================
   SUPPLIERS
   ========================================================= */

function suppliers() {

  return `
    <div class="page">

      ${head(
        "Suppliers",
        "Supplier contacts, links and payment records.",
        `<button
          class="btn primary"
          onclick="supplierModal()">
          + Add Supplier
        </button>`
      )}

      <div class="card">

        ${
          db.suppliers.length
            ? `
              <div class="table-wrap">

                <table class="table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>WhatsApp</th>
                      <th>Link</th>
                      <th>Products</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    ${db.suppliers.map(s => `

                      <tr>

                        <td>
                          <b>${esc(s.name)}</b>
                        </td>

                        <td>
                          ${esc(
                            s.whatsapp || "-"
                          )}
                        </td>

                        <td>
                          ${
                            s.link
                              ? `<a href="${esc(
                                  s.link
                                )}" target="_blank">
                                  Open
                                </a>`
                              : "-"
                          }
                        </td>

                        <td>
                          ${
                            db.products.filter(
                              p =>
                                p.supplierId ===
                                s.id
                            ).length
                          }
                        </td>

                        <td>

                          <button
                            class="btn"
                            onclick="supplierModal('${s.id}')">
                            Edit
                          </button>

                          <button
                            class="btn danger"
                            onclick="supplierDelete('${s.id}')">
                            Delete
                          </button>

                        </td>

                      </tr>

                    `).join("")}

                  </tbody>

                </table>

              </div>
            `
            : empty("No suppliers yet.")
        }

      </div>

    </div>
  `;
}

/* =========================================================
   SUPPLIER OPTIONS
   ========================================================= */

function suppliersOptions() {

  return `
    <option value="">
      Select supplier
    </option>

    ${db.suppliers.map(
      s => `
        <option value="${s.id}">
          ${esc(s.name)}
        </option>
      `
    ).join("")}
  `;
}

function productsOptions() {

  return `
    <option value="">
      Select product
    </option>

    ${db.products.map(
      p => `
        <option value="${p.id}">
          ${esc(p.name)}
        </option>
      `
    ).join("")}
  `;
}

/* =========================================================
   MODAL
   ========================================================= */

function openModal(content) {

  document.getElementById(
    "modal"
  ).innerHTML = `
    <div class="modal-bg">
      <div class="modal-box">
        ${content}
      </div>
    </div>
  `;
}

function closeModal() {
  document.getElementById(
    "modal"
  ).innerHTML = "";
}

/* =========================================================
   ORDER MODAL
   ========================================================= */

function orderModal(existing = null) {

  const o =
    existing ||
    {
      id: id("ORD"),
      date: today(),
      source: "Marketplace",
      status: "Pending",
      quantity: 1,
      shipping: 0,
      advanced: 0,
      currentPrice: 0,
      salePrice: 0,
      buyPrice: 0,
      packingCharge: 0,
      deliveryCharge: 0,
      codReturn: 0,
      courierCharge: 0
    };

  openModal(`

    <div class="modal-head">

      <div>
        <h3>
          ${
            existing
              ? "Edit Order"
              : "Add New Customer / Order"
          }
        </h3>

        <div class="muted">
          Products and suppliers added in their own sections automatically appear here.
        </div>
      </div>

      <button
        class="close"
        onclick="closeModal()">
        ×
      </button>

    </div>

    <form id="orderForm">

      <div class="form-grid three">

        <div class="field">
          <label>Date</label>
          <input
            name="date"
            type="date"
            value="${esc(o.date)}"
            required>
        </div>

        <div class="field">
          <label>Order ID</label>
          <input
            name="id"
            value="${esc(o.id)}"
            required>
        </div>

        <div class="field">
          <label>Source</label>
          <select name="source">

            ${
              [
                "Marketplace",
                "Whatsapp",
                "Messenger",
                "Tiktok",
                "Phone"
              ]
                .map(
                  x =>
                    `<option ${
                      o.source === x
                        ? "selected"
                        : ""
                    }>${x}</option>`
                )
                .join("")
            }

          </select>
        </div>

        <div class="field">
          <label>Customer Name</label>
          <input
            name="customerName"
            value="${esc(
              o.customerName || ""
            )}"
            required>
        </div>

        <div class="field">
          <label>Phone</label>
          <input
            name="phone"
            value="${esc(o.phone || "")}"
            required>
        </div>

        <div class="field fullrow">
          <label>Address</label>
          <textarea
            name="address"
            required>${esc(
              o.address || ""
            )}</textarea>
        </div>

        <div class="field">
          <label>Product</label>

          <select
            name="productId"
            id="op">

            ${productsOptions()}

          </select>
        </div>

        <div class="field">
          <label>Quantity</label>

          <input
            name="quantity"
            id="qty"
            type="number"
            min="1"
            value="${o.quantity || 1}">
        </div>

        <div class="field">
          <label>Sell* / Unit</label>

          <input
            name="salePrice"
            id="sale"
            type="number"
            step=".01"
            value="${o.salePrice || 0}">
        </div>

        <div class="field">
          <label>Buy* / Unit</label>

          <input
            name="buyPrice"
            id="buy"
            type="number"
            step=".01"
            value="${o.buyPrice || 0}">
        </div>

        <div class="field">
          <label>Shipping*</label>

          <input
            name="shipping"
            id="shipping"
            type="number"
            step=".01"
            value="${o.shipping || 0}">
        </div>

        <div class="field">
          <label>Advanced*</label>

          <input
            name="advanced"
            id="advanced"
            type="number"
            step=".01"
            value="${o.advanced || 0}">
        </div>

        <div class="field">
          <label>Current</label>

          <input
            name="currentPrice"
            id="current"
            type="number"
            step=".01"
            value="${o.currentPrice || 0}">
        </div>

        <div class="field">
          <label>Packaging</label>

          <input
            name="packingCharge"
            id="pack"
            type="number"
            step=".01"
            value="${o.packingCharge || 0}">
        </div>

        <div class="field">
          <label>Delivery Charge</label>

          <input
            name="deliveryCharge"
            id="delivery"
            type="number"
            step=".01"
            value="${o.deliveryCharge || 0}">
        </div>

        <div class="field">
          <label>COD / Return</label>

          <input
            name="codReturn"
            id="cod"
            type="number"
            step=".01"
            value="${o.codReturn || 0}">
        </div>

        <div class="field">
          <label>Courier Charge</label>

          <input
            name="courierCharge"
            id="courierCharge"
            type="number"
            step=".01"
            value="${o.courierCharge || 0}">
        </div>

        <div class="field">
          <label>Supplier</label>

          <select
            name="supplierId"
            id="osupplier">

            ${suppliersOptions()}

          </select>
        </div>

        <div class="field">
          <label>Courier</label>

          <select name="courier">

            <option>Pathao</option>
            <option>Steadfast</option>

          </select>
        </div>

        <div class="field">
          <label>Tracking Link</label>

          <input
            name="trackingLink"
            type="url"
            value="${esc(
              o.trackingLink || ""
            )}">
        </div>

        <div class="field">
          <label>Status</label>

          <select name="status">

            ${
              [
                "Pending",
                "Confirmed",
                "Shipped",
                "Delivered",
                "Completed",
                "Returned",
                "Cancelled"
              ]
                .map(
                  x =>
                    `<option ${
                      o.status === x
                        ? "selected"
                        : ""
                    }>${x}</option>`
                )
                .join("")
            }

          </select>
        </div>

      </div>

      <div class="calc-card">

        <div class="calc-title">
          Calculations
          <span>Live</span>
        </div>

        <div class="calc-grid">

          <div>
            <label>Payable</label>
            <strong id="calcPayable">
              ৳ 0.00
            </strong>
          </div>

          <div>
            <label>Profit / Loss</label>
            <strong id="calcProfit">
              ৳ 0.00
            </strong>
          </div>

          <div>
            <label>Receivable</label>
            <strong id="calcReceivable">
              ৳ 0.00
            </strong>
          </div>

        </div>

        <div class="calc-note">
          Profit/Loss = sales − product cost − shipping − advanced − packaging − courier charge − COD/return.
        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button
          class="btn primary">
          ${
            existing
              ? "Update"
              : "Save Customer & Order"
          }
        </button>

      </div>

    </form>

  `);

  document.getElementById("op").value =
    o.productId || "";

  document.getElementById(
    "osupplier"
  ).value = o.supplierId || "";

  document.querySelector(
    "[name=courier]"
  ).value =
    o.courier || "Pathao";

  const calc = () => {

    const q =
      Number(
        document.getElementById("qty").value
      ) || 0;

    const buy =
      Number(
        document.getElementById("buy").value
      ) || 0;

    const sell =
      Number(
        document.getElementById("sale").value
      ) || 0;

    const shipping =
      Number(
        document.getElementById(
          "shipping"
        ).value
      ) || 0;

    const advanced =
      Number(
        document.getElementById(
          "advanced"
        ).value
      ) || 0;

    const pack =
      Number(
        document.getElementById(
          "pack"
        ).value
      ) || 0;

    const courier =
      Number(
        document.getElementById(
          "courierCharge"
        ).value
      ) || 0;

    const cod =
      Number(
        document.getElementById(
          "cod"
        ).value
      ) || 0;

    const delivery =
      Number(
        document.getElementById(
          "delivery"
        ).value
      ) || 0;

    const totalSales =
      sell * q;

    const productCost =
      buy * q;

    const payable =
      productCost +
      shipping +
      advanced +
      pack +
      courier +
      cod;

    const pl =
      totalSales - payable;

    const receivable =
      totalSales +
      delivery +
      cod -
      advanced;

    document.getElementById(
      "calcPayable"
    ).textContent = money(payable);

    document.getElementById(
      "calcProfit"
    ).textContent = money(pl);

    document.getElementById(
      "calcProfit"
    ).className =
      pl >= 0
        ? "calc-positive"
        : "calc-negative";

    document.getElementById(
      "calcReceivable"
    ).textContent =
      money(receivable);
  };

  document.getElementById(
    "op"
  ).onchange = () => {

    const p =
      db.products.find(
        x =>
          x.id ===
          document.getElementById(
            "op"
          ).value
      );

    if (p) {

      document.getElementById(
        "buy"
      ).value =
        p.buyPrice || 0;

      document.getElementById(
        "current"
      ).value =
        p.currentPrice ||
        p.buyPrice ||
        0;

      document.getElementById(
        "sale"
      ).value =
        p.sellPrice || 0;

      document.getElementById(
        "osupplier"
      ).value =
        p.supplierId || "";

    }

    calc();
  };

  [
    "qty",
    "sale",
    "buy",
    "shipping",
    "advanced",
    "current",
    "pack",
    "delivery",
    "cod",
    "courierCharge"
  ].forEach(x => {

    document
      .getElementById(x)
      .addEventListener(
        "input",
        calc
      );

  });

  calc();

  document.getElementById(
    "orderForm"
  ).onsubmit = async e => {

    e.preventDefault();

    const d =
      Object.fromEntries(
        new FormData(e.target)
      );

    [
      "quantity",
      "salePrice",
      "buyPrice",
      "shipping",
      "advanced",
      "currentPrice",
      "deliveryCharge",
      "packingCharge",
      "codReturn",
      "courierCharge"
    ].forEach(k => {
      d[k] =
        Number(d[k]) || 0;
    });

    d.productName =
      db.products.find(
        p =>
          p.id ===
          d.productId
      )?.name ||
      "Custom Product";

    if (existing) {

      const { error } =
        await sb
          .from("orders")
          .update(d)
          .eq("id", existing.id);

      if (error) {

        console.error(error);

        toast(
          "Order update failed: " +
            error.message,
          false
        );

        return;
      }

      const { error: ce } =
        await sb
          .from("customers")
          .update({
            name: d.customerName,
            phone: d.phone,
            address: d.address
          })
          .eq(
            "id",
            existing.customerId
          );

      if (ce) {
        console.warn(ce);
      }

    } else {

      d.customerId =
        id("CUS");

      const customer = {
        id: d.customerId,
        name: d.customerName,
        phone: d.phone,
        address: d.address
      };

      const { error: customerError } =
        await sb
          .from("customers")
          .insert(customer);

      if (customerError) {

        console.error(customerError);

        toast(
          "Customer save failed: " +
            customerError.message,
          false
        );

        return;
      }

      const { error: orderError } =
        await sb
          .from("orders")
          .insert(d);

      if (orderError) {

        console.error(orderError);

        toast(
          "Order save failed: " +
            orderError.message,
          false
        );

        return;
      }

      if (d.productId) {

        const p =
          db.products.find(
            x =>
              x.id ===
              d.productId
          );

        if (p) {

          const newStock =
            Math.max(
              0,
              Number(p.stock || 0) -
                Number(
                  d.quantity || 0
                )
            );

          await sb
            .from("products")
            .update({
              stock: newStock
            })
            .eq(
              "id",
              d.productId
            );
        }
      }
    }

    closeModal();

    toast(
      existing
        ? "Order updated successfully."
        : "Customer and order added successfully."
    );

    await loadAllData();

    render();
  };
}

/* =========================================================
   PRODUCT MODAL
   ========================================================= */

function productModal(pid = null) {

  const p =
    pid
      ? db.products.find(
          x => x.id === pid
        )
      : {
          name: "",
          currentPrice: 0,
          buyPrice: 0,
          sellPrice: 0,
          supplierId: "",
          stock: 0,
          reorder: 2
        };

  openModal(`

    <div class="modal-head">

      <h3>
        ${
          pid
            ? "Edit Product"
            : "Add Product"
        }
      </h3>

      <button
        class="close"
        onclick="closeModal()">
        ×
      </button>

    </div>

    <form id="productForm">

      <div class="form-grid">

        <div class="field">
          <label>Product Name</label>
          <input
            name="name"
            value="${esc(p.name)}"
            required>
        </div>

        <div class="field">
          <label>Current Price</label>
          <input
            name="currentPrice"
            type="number"
            step=".01"
            value="${p.currentPrice || 0}">
        </div>

        <div class="field">
          <label>Buy Price</label>
          <input
            name="buyPrice"
            type="number"
            step=".01"
            value="${p.buyPrice || 0}"
            required>
        </div>

        <div class="field">
          <label>Sell Price</label>
          <input
            name="sellPrice"
            type="number"
            step=".01"
            value="${p.sellPrice || 0}">
        </div>

        <div class="field">
          <label>Supplier</label>

          <select name="supplierId">
            ${suppliersOptions()}
          </select>

        </div>

        <div class="field">
          <label>Opening Stock</label>

          <input
            name="stock"
            type="number"
            value="${p.stock || 0}">
        </div>

        <div class="field">
          <label>Reorder Level</label>

          <input
            name="reorder"
            type="number"
            value="${p.reorder || 0}">
        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button class="btn primary">
          Save Product
        </button>

      </div>

    </form>
  `);

  document.querySelector(
    "#productForm [name=supplierId]"
  ).value =
    p.supplierId || "";

  document.getElementById(
    "productForm"
  ).onsubmit = async e => {

    e.preventDefault();

    const d =
      Object.fromEntries(
        new FormData(e.target)
      );

    d.currentPrice =
      Number(d.currentPrice) || 0;

    d.buyPrice =
      Number(d.buyPrice) || 0;

    d.sellPrice =
      Number(d.sellPrice) || 0;

    d.stock =
      Number(d.stock) || 0;

    d.reorder =
      Number(d.reorder) || 0;

    let result;

    if (pid) {

      result =
        await sb
          .from("products")
          .update(d)
          .eq("id", pid);

    } else {

      result =
        await sb
          .from("products")
          .insert({
            id: id("PRD"),
            ...d
          });

    }

    if (result.error) {

      console.error(result.error);

      toast(
        "Product save failed: " +
          result.error.message,
        false
      );

      return;
    }

    closeModal();

    toast(
      pid
        ? "Product updated successfully."
        : "Product added successfully."
    );

    await loadAllData();

    render();
  };
}

/* =========================================================
   SUPPLIER MODAL
   ========================================================= */

function supplierModal(sid = null) {

  const s =
    sid
      ? db.suppliers.find(
          x => x.id === sid
        )
      : {
          name: "",
          whatsapp: "",
          link: ""
        };

  openModal(`

    <div class="modal-head">

      <h3>
        ${
          sid
            ? "Edit Supplier"
            : "Add Supplier"
        }
      </h3>

      <button
        class="close"
        onclick="closeModal()">
        ×
      </button>

    </div>

    <form id="supplierForm">

      <div class="form-grid">

        <div class="field">
          <label>Supplier Name</label>

          <input
            name="name"
            value="${esc(s.name)}"
            required>
        </div>

        <div class="field">
          <label>WhatsApp Number</label>

          <input
            name="whatsapp"
            value="${esc(
              s.whatsapp || ""
            )}">
        </div>

        <div class="field fullrow">
          <label>Any Link</label>

          <input
            name="link"
            type="url"
            value="${esc(
              s.link || ""
            )}">
        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button class="btn primary">
          Save Supplier
        </button>

      </div>

    </form>
  `);

  document.getElementById(
    "supplierForm"
  ).onsubmit = async e => {

    e.preventDefault();

    const d =
      Object.fromEntries(
        new FormData(e.target)
      );

    let result;

    if (sid) {

      result =
        await sb
          .from("suppliers")
          .update(d)
          .eq("id", sid);

    } else {

      result =
        await sb
          .from("suppliers")
          .insert({
            id: id("SUP"),
            ...d
          });

    }

    if (result.error) {

      toast(
        "Supplier save failed: " +
          result.error.message,
        false
      );

      return;
    }

    closeModal();

    toast(
      sid
        ? "Supplier updated successfully."
        : "Supplier added successfully."
    );

    await loadAllData();

    render();
  };
}

/* =========================================================
   EXPENSE
   ========================================================= */

function expenses() {

  const total =
    db.expenses.reduce(
      (a, x) =>
        a + Number(x.amount || 0),
      0
    );

  return `
    <div class="page">

      ${head(
        "Expenses",
        "Record business expenses.",
        `<button
          class="btn primary"
          onclick="expenseModal()">
          + Add Expense
        </button>`
      )}

      <div class="card">

        <div class="summary">

          <div>
            <small>Total Expenses</small>
            <strong>${money(total)}</strong>
          </div>

          <div>
            <small>Records</small>
            <strong>
              ${db.expenses.length}
            </strong>
          </div>

        </div>

        ${
          db.expenses.length
            ? `
              <table class="table">

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Note</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>

                  ${db.expenses.map(x => `

                    <tr>

                      <td>${esc(x.date)}</td>

                      <td>${esc(
                        x.category
                      )}</td>

                      <td>${money(
                        x.amount
                      )}</td>

                      <td>${esc(
                        x.note || "-"
                      )}</td>

                      <td>
                        <button
                          class="btn danger"
                          onclick="expenseDelete('${x.id}')">
                          Delete
                        </button>
                      </td>

                    </tr>

                  `).join("")}

                </tbody>

              </table>
            `
            : empty(
                "No expenses recorded."
              )
        }

      </div>

    </div>
  `;
}

function expenseModal() {

  openModal(`

    <div class="modal-head">

      <h3>Add Expense</h3>

      <button
        class="close"
        onclick="closeModal()">
        ×
      </button>

    </div>

    <form id="expenseForm">

      <div class="form-grid">

        <div class="field">
          <label>Date</label>
          <input
            name="date"
            type="date"
            value="${today()}"
            required>
        </div>

        <div class="field">
          <label>Category</label>

          <select name="category">
            <option>Advertising</option>
            <option>Packaging</option>
            <option>Transport</option>
            <option>Office</option>
            <option>Other</option>
          </select>
        </div>

        <div class="field">
          <label>Amount</label>

          <input
            name="amount"
            type="number"
            step=".01"
            required>
        </div>

        <div class="field">
          <label>Note</label>
          <input name="note">
        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button class="btn primary">
          Save Expense
        </button>

      </div>

    </form>
  `);

  document.getElementById(
    "expenseForm"
  ).onsubmit = async e => {

    e.preventDefault();

    const d =
      Object.fromEntries(
        new FormData(e.target)
      );

    d.amount =
      Number(d.amount) || 0;

    const { error } =
      await sb
        .from("expenses")
        .insert({
          id: id("EXP"),
          ...d
        });

    if (error) {

      toast(
        "Expense save failed: " +
          error.message,
        false
      );

      return;
    }

    closeModal();

    toast(
      "Expense added successfully."
    );

    await loadAllData();

    render();
  };
}

/* =========================================================
   ACCOUNTS
   ========================================================= */

function accounts() {

  const total =
    db.payments.reduce(
      (a, p) =>
        a + Number(p.amount || 0),
      0
    );

  return `
    <div class="page">

      ${head(
        "Accounts",
        "Supplier payments and your own payment accounts.",
        `
        <button
          class="btn primary"
          onclick="paymentModal()">
          + Supplier Payment
        </button>

        <button
          class="btn"
          onclick="accountModal()">
          + My Account
        </button>
        `
      )}

      <div class="grid3">

        <div class="mini">
          <h4>Total Supplier Payments</h4>
          <strong>
            ${money(total)}
          </strong>
        </div>

        <div class="mini">
          <h4>bKash / Nagad</h4>
          <strong>
            ${money(
              db.payments
                .filter(
                  p => p.method !== "Bank"
                )
                .reduce(
                  (a, p) =>
                    a +
                    Number(
                      p.amount || 0
                    ),
                  0
                )
            )}
          </strong>
        </div>

        <div class="mini">
          <h4>Bank</h4>
          <strong>
            ${money(
              db.payments
                .filter(
                  p => p.method === "Bank"
                )
                .reduce(
                  (a, p) =>
                    a +
                    Number(
                      p.amount || 0
                    ),
                  0
                )
            )}
          </strong>
        </div>

      </div>

      <div
        class="card"
        style="margin-top:14px">

        <h3>Payment History</h3>

        ${
          db.payments.length
            ? `
              <table class="table">

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Supplier</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Note</th>
                  </tr>
                </thead>

                <tbody>

                  ${db.payments.map(p => `

                    <tr>

                      <td>${esc(
                        p.date
                      )}</td>

                      <td>
                        ${esc(
                          db.suppliers.find(
                            s =>
                              s.id ===
                              p.supplierId
                          )?.name || "-"
                        )}
                      </td>

                      <td>${esc(
                        p.method
                      )}</td>

                      <td>${money(
                        p.amount
                      )}</td>

                      <td>${esc(
                        p.note || "-"
                      )}</td>

                    </tr>

                  `).join("")}

                </tbody>

              </table>
            `
            : empty(
                "No supplier payments yet."
              )
        }

      </div>

      <div
        class="card"
        style="margin-top:14px">

        <h3>My Accounts</h3>

        <div class="grid3">

          ${
            db.accounts.map(a => `

              <div class="mini">

                <h4>
                  ${esc(a.type)}
                </h4>

                <strong>
                  ${esc(a.number)}
                </strong>

                <p class="muted">
                  ${esc(a.name || "")}
                </p>

              </div>

            `).join("") ||
            empty(
              "Add your Bank, bKash or Nagad account."
            )
          }

        </div>

      </div>

    </div>
  `;
}

function paymentModal() {

  openModal(`

    <div class="modal-head">

      <h3>Supplier Payment</h3>

      <button
        class="close"
        onclick="closeModal()">
        ×
      </button>

    </div>

    <form id="paymentForm">

      <div class="form-grid">

        <div class="field">
          <label>Date</label>

          <input
            name="date"
            type="date"
            value="${today()}">
        </div>

        <div class="field">
          <label>Supplier</label>

          <select name="supplierId">
            ${suppliersOptions()}
          </select>
        </div>

        <div class="field">
          <label>Method</label>

          <select name="method">
            <option>bKash</option>
            <option>Nagad</option>
            <option>Bank</option>
          </select>
        </div>

        <div class="field">
          <label>Amount</label>

          <input
            name="amount"
            type="number"
            step=".01"
            required>
        </div>

        <div class="field fullrow">
          <label>Note</label>
          <input name="note">
        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button class="btn primary">
          Save Payment
        </button>

      </div>

    </form>
  `);

  document.getElementById(
    "paymentForm"
  ).onsubmit = async e => {

    e.preventDefault();

    const d =
      Object.fromEntries(
        new FormData(e.target)
      );

    d.amount =
      Number(d.amount) || 0;

    const { error } =
      await sb
        .from("payments")
        .insert({
          id: id("PAY"),
          ...d
        });

    if (error) {

      toast(
        "Payment save failed: " +
          error.message,
        false
      );

      return;
    }

    closeModal();

    toast(
      "Supplier payment added successfully."
    );

    await loadAllData();

    render();
  };
}

function accountModal() {

  openModal(`

    <div class="modal-head">

      <h3>My Payment Account</h3>

      <button
        class="close"
        onclick="closeModal()">
        ×
      </button>

    </div>

    <form id="accountForm">

      <div class="form-grid">

        <div class="field">
          <label>Type</label>

          <select name="type">
            <option>Bank</option>
            <option>bKash</option>
            <option>Nagad</option>
          </select>
        </div>

        <div class="field">
          <label>Number / Account</label>

          <input
            name="number"
            required>
        </div>

        <div class="field fullrow">
          <label>Account Name</label>

          <input name="name">
        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button class="btn primary">
          Save Account
        </button>

      </div>

    </form>
  `);

  document.getElementById(
    "accountForm"
  ).onsubmit = async e => {

    e.preventDefault();

    const d =
      Object.fromEntries(
        new FormData(e.target)
      );

    const { error } =
      await sb
        .from("accounts")
        .insert({
          id: id("ACC"),
          ...d
        });

    if (error) {

      toast(
        "Account save failed: " +
          error.message,
        false
      );

      return;
    }

    closeModal();

    toast(
      "Payment account added successfully."
    );

    await loadAllData();

    render();
  };
}

/* =========================================================
   REPORTS
   ========================================================= */

function reports() {

  return `
    <div class="page">

      ${head(
        "Reports",
        "Business reports."
      )}

      <div class="tabs">

        <button
          class="tab active"
          onclick="report('stock',this)">
          Stock Report
        </button>

        <button
          class="tab"
          onclick="report('sales',this)">
          Sales Report
        </button>

        <button
          class="tab"
          onclick="report('profit',this)">
          Profit & Loss
        </button>

        <button
          class="tab"
          onclick="report('customers',this)">
          Customer Report
        </button>

        <button
          class="tab"
          onclick="report('products',this)">
          Product Report
        </button>

        <button
          class="tab"
          onclick="report('expenses',this)">
          Expense Report
        </button>

      </div>

      <div
        id="reportBox"
        class="card">

        ${stockReport()}

      </div>

    </div>
  `;
}

function stockReport() {

  return `
    <h3>Stock Report</h3>

    <table class="table">

      <thead>

        <tr>
          <th>Product</th>
          <th>Supplier</th>
          <th>Stock</th>
          <th>Buy Price</th>
          <th>Stock Value</th>
          <th>Status</th>
        </tr>

      </thead>

      <tbody>

        ${db.products.map(p => `

          <tr>

            <td>${esc(p.name)}</td>

            <td>
              ${esc(
                db.suppliers.find(
                  s =>
                    s.id ===
                    p.supplierId
                )?.name || "-"
              )}
            </td>

            <td>${p.stock}</td>

            <td>${money(
              p.buyPrice
            )}</td>

            <td>${money(
              Number(p.stock || 0) *
              Number(p.buyPrice || 0)
            )}</td>

            <td>
              ${
                Number(p.stock || 0) <=
                Number(p.reorder || 0)
                  ? "Low Stock"
                  : "In Stock"
              }
            </td>

          </tr>

        `).join("")}

      </tbody>

    </table>

  `;
}

function salesReport() {

  return `
    <h3>Sales Report</h3>

    ${
      db.orders.length
        ? orderTable(db.orders)
        : empty("No sales data.")
    }
  `;
}

function profitReport() {

  const gross =
    db.orders.reduce(
      (a, o) =>
        a + profit(o),
      0
    );

  const expenses =
    db.expenses.reduce(
      (a, x) =>
        a + Number(x.amount || 0),
      0
    );

  const net =
    gross - expenses;

  return `
    <h3>Profit & Loss Report</h3>

    <div class="summary">

      <div>
        <small>Sales</small>
        <strong>
          ${money(
            db.orders.reduce(
              (a, o) =>
                a + sales(o),
              0
            )
          )}
        </strong>
      </div>

      <div>
        <small>Gross Profit</small>
        <strong>
          ${money(gross)}
        </strong>
      </div>

      <div>
        <small>Expenses</small>
        <strong>
          ${money(expenses)}
        </strong>
      </div>

      <div>
        <small>Net Profit / Loss</small>
        <strong>
          ${money(net)}
        </strong>
      </div>

    </div>
  `;
}

function customerReport() {

  return `
    <h3>Customer Report</h3>

    <table class="table">

      <thead>

        <tr>
          <th>Customer</th>
          <th>Phone</th>
          <th>Orders</th>
          <th>Sales</th>
          <th>Profit</th>
        </tr>

      </thead>

      <tbody>

        ${db.customers.map(c => {

          const os =
            db.orders.filter(
              o =>
                o.customerId === c.id
            );

          return `
            <tr>

              <td>${esc(c.name)}</td>

              <td>${esc(c.phone)}</td>

              <td>${os.length}</td>

              <td>
                ${money(
                  os.reduce(
                    (a, o) =>
                      a + sales(o),
                    0
                  )
                )}
              </td>

              <td>
                ${money(
                  os.reduce(
                    (a, o) =>
                      a + profit(o),
                    0
                  )
                )}
              </td>

            </tr>
          `;

        }).join("")}

      </tbody>

    </table>
  `;
}

function productReport() {

  return `
    <h3>Product Report</h3>

    <table class="table">

      <thead>

        <tr>
          <th>Product</th>
          <th>Units Sold</th>
          <th>Sales</th>
          <th>Profit</th>
        </tr>

      </thead>

      <tbody>

        ${db.products.map(p => {

          const os =
            db.orders.filter(
              o =>
                o.productId === p.id
            );

          return `
            <tr>

              <td>
                ${esc(p.name)}
              </td>

              <td>
                ${os.reduce(
                  (a, o) =>
                    a +
                    Number(
                      o.quantity || 0
                    ),
                  0
                )}
              </td>

              <td>
                ${money(
                  os.reduce(
                    (a, o) =>
                      a + sales(o),
                    0
                  )
                )}
              </td>

              <td>
                ${money(
                  os.reduce(
                    (a, o) =>
                      a + profit(o),
                    0
                  )
                )}
              </td>

            </tr>
          `;

        }).join("")}

      </tbody>

    </table>
  `;
}

function expenseReport() {

  return `
    <h3>Expense Report</h3>

    <table class="table">

      <thead>

        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Note</th>
        </tr>

      </thead>

      <tbody>

        ${db.expenses.map(x => `

          <tr>

            <td>${esc(x.date)}</td>

            <td>${esc(
              x.category
            )}</td>

            <td>${money(
              x.amount
            )}</td>

            <td>${esc(
              x.note || "-"
            )}</td>

          </tr>

        `).join("")}

      </tbody>

    </table>
  `;
}

function report(type, button) {

  document
    .querySelectorAll(".tab")
    .forEach(
      x =>
        x.classList.remove(
          "active"
        )
    );

  button.classList.add("active");

  const box =
    document.getElementById(
      "reportBox"
    );

  if (type === "stock") {
    box.innerHTML =
      stockReport();
  }

  if (type === "sales") {
    box.innerHTML =
      salesReport();
  }

  if (type === "profit") {
    box.innerHTML =
      profitReport();
  }

  if (type === "customers") {
    box.innerHTML =
      customerReport();
  }

  if (type === "products") {
    box.innerHTML =
      productReport();
  }

  if (type === "expenses") {
    box.innerHTML =
      expenseReport();
  }
}

/* =========================================================
   SETTINGS
   ========================================================= */

function settings() {

  return `
    <div class="page">

      ${head(
        "Settings",
        "Business and data settings.",
        `<button
          class="btn primary"
          onclick="saveSettings()">
          Save
        </button>`
      )}

      <div class="card">

        <div class="form-grid">

          <div class="field">

            <label>
              Business Name
            </label>

            <input
              id="sname"
              value="${esc(
                db.settings.name
              )}">

          </div>

          <div class="field">

            <label>
              Currency
            </label>

            <input
              id="scurrency"
              value="${esc(
                db.settings.currency
              )}">

          </div>

        </div>

        <div class="setting">

          <div>
            <b>
              Success notifications
            </b>

            <div class="muted">
              Show success notification after saving.
            </div>
          </div>

          <div
            id="toggle"
            class="toggle ${
              db.settings.notify
                ? "on"
                : ""
            }"
            onclick="
              this.classList.toggle('on')
            ">
          </div>

        </div>

        <div class="setting">

          <div>
            <b>Export Backup</b>

            <div class="muted">
              Download ERP data.
            </div>
          </div>

          <button
            class="btn"
            onclick="backup()">
            Export Backup
          </button>

        </div>

      </div>

    </div>
  `;
}

async function saveSettings() {

  const data = {
    name:
      document.getElementById(
        "sname"
      ).value,

    currency:
      document.getElementById(
        "scurrency"
      ).value,

    notify:
      document
        .getElementById(
          "toggle"
        )
        .classList.contains("on")
  };

  const { error } =
    await sb
      .from("settings")
      .upsert(
        {
          id: 1,
          ...data
        },
        {
          onConflict: "id"
        }
      );

  if (error) {

    toast(
      "Settings save failed: " +
        error.message,
      false
    );

    return;
  }

  db.settings = {
    ...db.settings,
    ...data
  };

  toast(
    "Settings saved successfully."
  );

  render();
}

/* =========================================================
   VIEW ORDER
   ========================================================= */

function viewOrder(orderId) {

  const o =
    db.orders.find(
      x =>
        x.id === orderId
    );

  if (!o) return;

  openModal(`

    <div class="modal-head">

      <div>

        <h3>
          Order ${esc(o.id)}
        </h3>

        <div class="muted">
          ${esc(o.date)} •
          ${esc(o.source)}
        </div>

      </div>

      <button
        class="close"
        onclick="closeModal()">
        ×
      </button>

    </div>

    <div class="summary">

      <div>
        <small>Customer</small>
        <strong>
          ${esc(o.customerName)}
        </strong>
      </div>

      <div>
        <small>Sales</small>
        <strong>
          ${money(sales(o))}
        </strong>
      </div>

      <div>
        <small>Profit</small>
        <strong>
          ${money(profit(o))}
        </strong>
      </div>

      <div>
        <small>Status</small>
        <strong>
          ${badge(o.status)}
        </strong>
      </div>

    </div>

    <p>

      <b>Phone:</b>
      ${esc(o.phone)}
      <br>

      <b>Address:</b>
      ${esc(o.address)}
      <br>

      <b>Product:</b>
      ${esc(o.productName)}
      × ${o.quantity}
      <br>

      <b>Courier:</b>
      ${esc(o.courier)}
      <br>

      <b>Tracking:</b>
      ${
        o.trackingLink
          ? `<a
              href="${esc(
                o.trackingLink
              )}"
              target="_blank">
              Open
            </a>`
          : "-"
      }

    </p>

    <div class="modal-actions">

      <button
        class="btn"
        onclick="closeModal()">
        Close
      </button>

      <button
        class="btn"
        onclick="orderEdit('${o.id}')">
        Edit
      </button>

    </div>

  `);
}

function orderEdit(orderId) {

  const o =
    db.orders.find(
      x =>
        x.id === orderId
    );

  closeModal();

  if (o) {
    orderModal(o);
  }
}

/* =========================================================
   CUSTOMER
   ========================================================= */

function customerView(cid) {

  const c =
    db.customers.find(
      x =>
        x.id === cid
    );

  if (!c) return;

  const os =
    db.orders.filter(
      x =>
        x.customerId === cid
    );

  openModal(`

    <div class="modal-head">

      <div>

        <h3>
          ${esc(c.name)}
        </h3>

        <div class="muted">
          ${esc(c.phone)}
        </div>

      </div>

      <button
        class="close"
        onclick="closeModal()">
        ×
      </button>

    </div>

    <p>
      ${esc(c.address || "")}
    </p>

    ${
      os.length
        ? orderTable(os)
        : empty("No history.")
    }

    <div class="modal-actions">

      <button
        class="btn"
        onclick="closeModal()">
        Close
      </button>

    </div>

  `);
}

function customerEdit(cid) {

  const c =
    db.customers.find(
      x =>
        x.id === cid
    );

  const o =
    db.orders.find(
      x =>
        x.customerId === cid
    );

  closeModal();

  if (o) {
    orderModal(o);
  } else {

    orderModal({
      id: id("ORD"),
      date: today(),
      customerId: cid,
      customerName: c.name,
      phone: c.phone,
      address: c.address,
      source: "Marketplace",
      status: "Pending",
      quantity: 1
    });

  }
}

/* =========================================================
   DELETE
   ========================================================= */

async function customerDelete(cid) {

  if (
    !confirm(
      "Delete customer and all their orders?"
    )
  ) return;

  await sb
    .from("orders")
    .delete()
    .eq(
      "customerId",
      cid
    );

  const { error } =
    await sb
      .from("customers")
      .delete()
      .eq("id", cid);

  if (error) {

    toast(
      "Customer delete failed: " +
        error.message,
      false
    );

    return;
  }

  toast(
    "Customer deleted."
  );

  await loadAllData();

  render();
}

async function productDelete(pid) {

  if (
    !confirm(
      "Delete this product?"
    )
  ) return;

  const { error } =
    await sb
      .from("products")
      .delete()
      .eq("id", pid);

  if (error) {

    toast(
      "Product delete failed: " +
        error.message,
      false
    );

    return;
  }

  toast(
    "Product deleted."
  );

  await loadAllData();

  render();
}

async function supplierDelete(sid) {

  if (
    !confirm(
      "Delete this supplier?"
    )
  ) return;

  const { error } =
    await sb
      .from("suppliers")
      .delete()
      .eq("id", sid);

  if (error) {

    toast(
      "Supplier delete failed: " +
        error.message,
      false
    );

    return;
  }

  toast(
    "Supplier deleted."
  );

  await loadAllData();

  render();
}

async function expenseDelete(eid) {

  const { error } =
    await sb
      .from("expenses")
      .delete()
      .eq("id", eid);

  if (error) {

    toast(
      "Expense delete failed: " +
        error.message,
      false
    );

    return;
  }

  toast(
    "Expense deleted."
  );

  await loadAllData();

  render();
}

/* =========================================================
   BACKUP
   ========================================================= */

function backup() {

  const data =
    JSON.stringify(
      db,
      null,
      2
    );

  const blob =
    new Blob(
      [data],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const a =
    document.createElement(
      "a"
    );

  a.href = url;

  a.download =
    "al-furqun-erp-backup.json";

  a.click();

  URL.revokeObjectURL(url);
}

/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser() {

  const username =
    document.getElementById(
      "username"
    ).value.trim();

  const password =
    document.getElementById(
      "password"
    ).value;

  /*
     IMPORTANT:
     এই login এখন local admin login.
     Supabase database আলাদা ভাবে কাজ করবে.
  */

  if (
    username === "admin" &&
    password === "1234"
  ) {

    sessionStorage.setItem(
      "af",
      "1"
    );

    await loadAllData();

    render();

  } else {

    toast(
      "Wrong username or password.",
      false
    );

  }
}

/* =========================================================
   INIT
   ========================================================= */

async function init() {

  try {

    await loadSupabase();

    console.log(
      "Supabase connected."
    );

  } catch (error) {

    console.error(
      "Supabase connection failed:",
      error
    );

    toast(
      "Supabase connection failed.",
      false
    );

    return;
  }

  const loginForm =
    document.getElementById(
      "loginForm"
    );

  if (loginForm) {

    loginForm.onsubmit =
      async e => {

        e.preventDefault();

        await loginUser();

      };
  }

  const logout =
    document.getElementById(
      "logout"
    );

  if (logout) {

    logout.onclick = () => {

      sessionStorage.removeItem(
        "af"
      );

      document
        .getElementById(
          "app"
        )
        .classList.add(
          "hidden"
        );

      document
        .getElementById(
          "login"
        )
        .classList.remove(
          "hidden"
        );

    };

  }

  const menu =
    document.getElementById(
      "menu"
    );

  if (menu) {

    menu.onclick = () => {

      document
        .getElementById(
          "sidebar"
        )
        .classList.toggle(
          "open"
        );

    };

  }

  document
    .querySelectorAll(
      "nav button"
    )
    .forEach(button => {

      button.onclick = () => {

        page =
          button.dataset.page;

        render();

        document
          .getElementById(
            "sidebar"
          )
          .classList.remove(
            "open"
          );

      };

    });

  if (
    sessionStorage.getItem(
      "af"
    ) === "1"
  ) {

    await loadAllData();

    render();

  }

}

/* =========================================================
   START
   ========================================================= */

init();
