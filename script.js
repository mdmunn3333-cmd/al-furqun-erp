/* =========================================================
   AL FURQUN ERP
   SUPABASE VERSION — CLEAN
   ========================================================= */

const SUPABASE_URL =
  "https://gzlytivdijfotclkicfe.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_WiFXeoHUlPgvaZGbj42B2Q_B8ubHffk";

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
   SUPABASE
   ========================================================= */

function loadSupabase() {

  try {

    if (
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {
      throw new Error(
        "Supabase library is not loaded."
      );
    }

    sb = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    console.log("Supabase connected.");

    return true;

  } catch (error) {

    console.error(
      "Supabase connection error:",
      error
    );

    return false;
  }
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
    function (x) {

      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[x];

    }
  );
}


function money(value) {

  return (
    db.settings.currency || "৳"
  ) +
  " " +
  Number(value || 0).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}


function today() {

  return new Date()
    .toISOString()
    .slice(0, 10);
}


function sales(order) {

  return (
    Number(order.salePrice || 0) *
    Number(order.quantity || 0)
  );
}


function cost(order) {

  return (
    Number(order.buyPrice || 0) *
      Number(order.quantity || 0) +

    Number(order.shipping || 0) +

    Number(order.advanced || 0) +

    Number(order.packingCharge || 0) +

    Number(order.courierCharge || 0) +

    Number(order.codReturn || 0)
  );
}


function profit(order) {

  return sales(order) - cost(order);
}


function toast(message, ok = true) {

  const box =
    document.getElementById("toast");

  if (!box) return;

  const item =
    document.createElement("div");

  item.className = "toast";

  item.innerHTML = `
    <i>${ok ? "✓" : "!"}</i>

    <div>
      <b>
        ${ok ? "Successful" : "Notice"}
      </b>

      <div class="muted">
        ${esc(message)}
      </div>
    </div>
  `;

  box.appendChild(item);

  setTimeout(
    () => item.remove(),
    3000
  );
}


function badge(status) {

  let color = "blue";

  if (
    status === "Delivered" ||
    status === "Completed"
  ) {
    color = "green";
  }

  if (
    status === "Returned" ||
    status === "Cancelled"
  ) {
    color = "red";
  }

  if (status === "Pending") {
    color = "yellow";
  }

  return `
    <span class="badge ${color}">
      ${esc(status || "Pending")}
    </span>
  `;
}


function empty(text) {

  return `
    <div class="empty">
      ${esc(text)}
    </div>
  `;
}


/* =========================================================
   DATABASE
   ========================================================= */

async function loadTable(table) {

  try {

    const {
      data,
      error
    } = await sb
      .from(table)
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );

    if (error) {

      console.error(
        table +
        " load error:",
        error
      );

      return [];
    }

    return data || [];

  } catch (error) {

    console.error(
      table +
      " error:",
      error
    );

    return [];
  }
}


async function loadAllData() {

  if (!sb) return;

  db.orders =
    await loadTable("orders");

  db.customers =
    await loadTable("customers");

  db.products =
    await loadTable("products");

  db.suppliers =
    await loadTable("suppliers");

  db.expenses =
    await loadTable("expenses");

  db.payments =
    await loadTable("payments");

  db.accounts =
    await loadTable("accounts");


  try {

    const {
      data,
      error
    } = await sb
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!error && data) {

      db.settings = {
        ...db.settings,
        ...data
      };

    }

  } catch (error) {

    console.warn(
      "Settings could not be loaded."
    );
  }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function nav() {

  document
    .querySelectorAll("nav button")
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.page === page
        );

      }
    );
}


async function render() {

  const login =
    document.getElementById("login");

  const app =
    document.getElementById("app");

  if (login) {
    login.classList.add("hidden");
  }

  if (app) {
    app.classList.remove("hidden");
  }

  nav();

  const content =
    document.getElementById("content");

  if (!content) return;


  const pages = {

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


  const fn =
    pages[page];


  if (!fn) {

    content.innerHTML =
      empty("Page not found.");

    return;
  }


  try {

    content.innerHTML =
      fn();

    bind();

  } catch (error) {

    console.error(
      "Render error:",
      error
    );

    content.innerHTML = `
      <div class="page">
        <div class="card">
          <h3>Something went wrong</h3>
          <p class="muted">
            ${esc(error.message)}
          </p>
        </div>
      </div>
    `;
  }
}


/* =========================================================
   HEADER
   ========================================================= */

function head(
  title,
  subtitle,
  actions = ""
) {

  return `
    <div class="title">

      <div>

        <h2>
          ${esc(title)}
        </h2>

        <div class="muted">
          ${esc(subtitle)}
        </div>

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
      (total, order) =>
        total + sales(order),
      0
    );


  const totalProfit =
    db.orders
      .filter(
        order =>
          ![
            "Returned",
            "Cancelled"
          ].includes(order.status)
      )
      .reduce(
        (total, order) =>
          total + profit(order),
        0
      );


  const totalLoss =
    db.orders
      .filter(
        order =>
          [
            "Returned",
            "Cancelled"
          ].includes(order.status)
      )
      .reduce(
        (total, order) =>
          total +
          Math.abs(
            profit(order)
          ),
        0
      );


  const recent =
    [...db.orders]
      .sort(
        (a, b) =>
          String(b.date || "")
            .localeCompare(
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

        <div
          class="stat"
          onclick="page='orders';render()"
        >

          <label>
            Total Sales
          </label>

          <strong>
            ${money(totalSales)}
          </strong>

          <span class="green">
            ↗ ${db.orders.length} orders
          </span>

        </div>


        <div class="stat">

          <label>
            Total Amount
          </label>

          <strong>
            ${money(totalSales)}
          </strong>

          <span class="blue">
            All order value
          </span>

        </div>


        <div
          class="stat"
          onclick="page='reports';render()"
        >

          <label>
            Total Profit
          </label>

          <strong>
            ${money(totalProfit)}
          </strong>

          <span class="green">
            Calculated profit
          </span>

        </div>


        <div
          class="stat"
          onclick="page='reports';render()"
        >

          <label>
            Total Loss
          </label>

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

            <h3>
              Business Overview
            </h3>

          </div>


          <div class="summary">

            <div>
              <small>Customers</small>
              <strong>
                ${db.customers.length}
              </strong>
            </div>

            <div>
              <small>Products</small>
              <strong>
                ${db.products.length}
              </strong>
            </div>

            <div>
              <small>Suppliers</small>
              <strong>
                ${db.suppliers.length}
              </strong>
            </div>

            <div>

              <small>
                Expenses
              </small>

              <strong>
                ${money(
                  db.expenses.reduce(
                    (a, x) =>
                      a +
                      Number(
                        x.amount || 0
                      ),
                    0
                  )
                )}
              </strong>

            </div>

          </div>

        </div>


        <div class="card">

          <div class="card-head">

            <h3>
              Recent Orders
            </h3>

            <button
              class="btn"
              onclick="page='orders';render()"
            >
              View All
            </button>

          </div>

          ${
            recent.length
              ? orderTable(recent)
              : empty(
                  "No orders yet."
                )
          }

        </div>

      </div>

    </div>
  `;
}


/* =========================================================
   ORDERS TABLE
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

          ${rows.map(
            order => `

            <tr>

              <td>
                ${esc(order.id)}
              </td>

              <td>
                ${esc(
                  order.customerName
                )}
              </td>

              <td>
                ${esc(
                  order.productName
                )}
              </td>

              <td>
                ${esc(order.date)}
              </td>

              <td>
                ${money(
                  sales(order)
                )}
              </td>

              <td>
                ${money(
                  profit(order)
                )}
              </td>

              <td>
                ${badge(
                  order.status
                )}
              </td>

              <td>

                <button
                  class="btn"
                  onclick="viewOrder('${esc(
                    order.id
                  )}')"
                >
                  View
                </button>

              </td>

            </tr>
          `
          ).join("")}

        </tbody>

      </table>

    </div>
  `;
}


/* =========================================================
   ORDERS
   ========================================================= */

function orders() {

  const rows =
    [...db.orders].sort(
      (a, b) =>
        String(b.date || "")
          .localeCompare(
            String(a.date || "")
          )
    );


  return `
    <div class="page">

      ${head(
        "Orders",
        "Create, edit and track every customer order.",
        `
        <button
          class="btn primary"
          onclick="orderModal()"
        >
          + Add New Customer
        </button>
        `
      )}


      <div class="card">

        ${
          rows.length
            ? orderTable(rows)
            : empty(
                "No orders yet."
              )
        }

      </div>

    </div>
  `;
}


/* =========================================================
   CUSTOMERS
   ========================================================= */

function customers() {

  const search =
    document.getElementById(
      "customerSearch"
    )?.value
      ?.toLowerCase()
      .trim() || "";


  const list =
    db.customers.filter(
      customer => {

        if (!search) {
          return true;
        }

        return [
          customer.name,
          customer.phone,
          customer.address
        ].some(
          value =>
            String(
              value || ""
            )
              .toLowerCase()
              .includes(search)
        );
      }
    );


  return `
    <div class="page">

      ${head(
        "Customers",
        "Customer history, contact details and order totals.",
        `
        <button
          class="btn primary"
          onclick="orderModal()"
        >
          + Add Customer
        </button>
        `
      )}


      <div class="card">

        <div class="field search-local">

          <label>
            Search Customer
          </label>

          <input
            id="customerSearch"
            placeholder="Name or phone..."
            value="${esc(search)}"
          >

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

                    ${list.map(
                      customer => {

                        const customerOrders =
                          db.orders.filter(
                            order =>
                              order.customerId ===
                              customer.id
                          );


                        const lastOrder =
                          [...customerOrders]
                            .sort(
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
                              <b>
                                ${esc(
                                  customer.name
                                )}
                              </b>
                            </td>

                            <td>
                              ${esc(
                                customer.phone
                              )}
                            </td>

                            <td>
                              ${customerOrders.length}
                            </td>

                            <td>
                              ${money(
                                customerOrders.reduce(
                                  (a, o) =>
                                    a +
                                    sales(o),
                                  0
                                )
                              )}
                            </td>

                            <td>
                              ${
                                lastOrder?.date ||
                                "-"
                              }
                            </td>

                            <td>

                              <button
                                class="btn"
                                onclick="customerView('${esc(
                                  customer.id
                                )}')"
                              >
                                History
                              </button>

                              <button
                                class="btn"
                                onclick="customerEdit('${esc(
                                  customer.id
                                )}')"
                              >
                                Edit
                              </button>

                              <button
                                class="btn danger"
                                onclick="customerDelete('${esc(
                                  customer.id
                                )}')"
                              >
                                Delete
                              </button>

                            </td>

                          </tr>
                        `;
                      }
                    ).join("")}

                  </tbody>

                </table>

              </div>
            `
            : empty(
                "No matching customers."
              )
        }

      </div>

    </div>
  `;
}


/* =========================================================
   PRODUCTS
   ========================================================= */

function products() {

  const search =
    document.getElementById(
      "productSearch"
    )?.value
      ?.toLowerCase()
      .trim() || "";


  const list =
    db.products.filter(
      product => {

        if (!search) {
          return true;
        }

        const supplier =
          db.suppliers.find(
            s =>
              s.id ===
              product.supplierId
          );


        return [
          product.name,
          supplier?.name
        ].some(
          value =>
            String(
              value || ""
            )
              .toLowerCase()
              .includes(search)
        );
      }
    );


  return `
    <div class="page">

      ${head(
        "Products",
        "Products, supplier, price and stock.",
        `
        <button
          class="btn primary"
          onclick="productModal()"
        >
          + Add Product
        </button>
        `
      )}


      <div class="card">

        <div class="field search-local">

          <label>
            Search Product
          </label>

          <input
            id="productSearch"
            placeholder="Product or supplier..."
            value="${esc(search)}"
          >

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

                    ${list.map(
                      product => `

                      <tr>

                        <td>
                          <b>
                            ${esc(
                              product.name
                            )}
                          </b>
                        </td>

                        <td>
                          ${money(
                            product.buyPrice
                          )}
                        </td>

                        <td>
                          ${esc(
                            db.suppliers.find(
                              s =>
                                s.id ===
                                product.supplierId
                            )?.name ||
                              "-"
                          )}
                        </td>

                        <td>
                          ${Number(
                            product.stock || 0
                          )}
                        </td>

                        <td>
                          ${Number(
                            product.reorder || 0
                          )}
                        </td>

                        <td>

                          <button
                            class="btn"
                            onclick="productModal('${esc(
                              product.id
                            )}')"
                          >
                            Edit
                          </button>

                          <button
                            class="btn danger"
                            onclick="productDelete('${esc(
                              product.id
                            )}')"
                          >
                            Delete
                          </button>

                        </td>

                      </tr>
                    `
                    ).join("")}

                  </tbody>

                </table>

              </div>
            `
            : empty(
                "No matching products."
              )
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
        "Supplier contacts, links and products.",
        `
        <button
          class="btn primary"
          onclick="supplierModal()"
        >
          + Add Supplier
        </button>
        `
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

                    ${db.suppliers.map(
                      supplier => `

                      <tr>

                        <td>
                          <b>
                            ${esc(
                              supplier.name
                            )}
                          </b>
                        </td>

                        <td>
                          ${esc(
                            supplier.whatsapp ||
                            "-"
                          )}
                        </td>

                        <td>

                          ${
                            supplier.link
                              ? `
                                <a
                                  href="${esc(
                                    supplier.link
                                  )}"
                                  target="_blank"
                                  rel="noopener"
                                >
                                  Open
                                </a>
                              `
                              : "-"
                          }

                        </td>

                        <td>
                          ${
                            db.products.filter(
                              product =>
                                product.supplierId ===
                                supplier.id
                            ).length
                          }
                        </td>

                        <td>

                          <button
                            class="btn"
                            onclick="supplierModal('${esc(
                              supplier.id
                            )}')"
                          >
                            Edit
                          </button>

                          <button
                            class="btn danger"
                            onclick="supplierDelete('${esc(
                              supplier.id
                            )}')"
                          >
                            Delete
                          </button>

                        </td>

                      </tr>
                    `
                    ).join("")}

                  </tbody>

                </table>

              </div>
            `
            : empty(
                "No suppliers yet."
              )
        }

      </div>

    </div>
  `;
}


/* =========================================================
   OPTIONS
   ========================================================= */

function suppliersOptions(
  selected = ""
) {

  return `
    <option value="">
      Select supplier
    </option>

    ${db.suppliers.map(
      supplier => `
        <option
          value="${esc(
            supplier.id
          )}"
          ${
            supplier.id === selected
              ? "selected"
              : ""
          }
        >
          ${esc(
            supplier.name
          )}
        </option>
      `
    ).join("")}
  `;
}


function productsOptions(
  selected = ""
) {

  return `
    <option value="">
      Select product
    </option>

    ${db.products.map(
      product => `
        <option
          value="${esc(
            product.id
          )}"
          ${
            product.id === selected
              ? "selected"
              : ""
          }
        >
          ${esc(
            product.name
          )}
        </option>
      `
    ).join("")}
  `;
}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(content) {

  const modal =
    document.getElementById("modal");

  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-bg">

      <div class="modal-box">

        ${content}

      </div>

    </div>
  `;
}


function closeModal() {

  const modal =
    document.getElementById("modal");

  if (modal) {
    modal.innerHTML = "";
  }
}


/* =========================================================
   ORDER MODAL
   ========================================================= */

function orderModal(existing = null) {

  const order =
    existing || {

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

      courierCharge: 0,

      productId: "",

      supplierId: "",

      courier: "Pathao"

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
          Product and supplier lists update automatically.
        </div>

      </div>

      <button
        class="close"
        onclick="closeModal()"
        type="button"
      >
        ×
      </button>

    </div>


    <form id="orderForm">

      <div class="form-grid three">


        <div class="field">

          <label>
            Date
          </label>

          <input
            name="date"
            type="date"
            value="${esc(
              order.date || today()
            )}"
            required
          >

        </div>


        <div class="field">

          <label>
            Order ID
          </label>

          <input
            name="id"
            value="${esc(
              order.id
            )}"
            required
          >

        </div>


        <div class="field">

          <label>
            Source
          </label>

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
                  source => `
                    <option
                      value="${source}"
                      ${
                        order.source ===
                        source
                          ? "selected"
                          : ""
                      }
                    >
                      ${source}
                    </option>
                  `
                )
                .join("")
            }

          </select>

        </div>


        <div class="field">

          <label>
            Customer Name
          </label>

          <input
            name="customerName"
            value="${esc(
              order.customerName ||
              ""
            )}"
            required
          >

        </div>


        <div class="field">

          <label>
            Phone
          </label>

          <input
            name="phone"
            value="${esc(
              order.phone ||
              ""
            )}"
            required
          >

        </div>


        <div class="field fullrow">

          <label>
            Address
          </label>

          <textarea
            name="address"
            required
          >${esc(
            order.address ||
            ""
          )}</textarea>

        </div>


        <div class="field">

          <label>
            Product
          </label>

          <select
            name="productId"
            id="op"
          >
            ${productsOptions(
              order.productId
            )}
          </select>

        </div>


        <div class="field">

          <label>
            Quantity
          </label>

          <input
            name="quantity"
            id="qty"
            type="number"
            min="1"
            value="${Number(
              order.quantity || 1
            )}"
          >

        </div>


        <div class="field">

          <label>
            Sell / Unit
          </label>

          <input
            name="salePrice"
            id="sale"
            type="number"
            step=".01"
            value="${Number(
              order.salePrice || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            Buy / Unit
          </label>

          <input
            name="buyPrice"
            id="buy"
            type="number"
            step=".01"
            value="${Number(
              order.buyPrice || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            Shipping
          </label>

          <input
            name="shipping"
            id="shipping"
            type="number"
            step=".01"
            value="${Number(
              order.shipping || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            Advanced
          </label>

          <input
            name="advanced"
            id="advanced"
            type="number"
            step=".01"
            value="${Number(
              order.advanced || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            Current Price
          </label>

          <input
            name="currentPrice"
            id="current"
            type="number"
            step=".01"
            value="${Number(
              order.currentPrice || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            Packaging
          </label>

          <input
            name="packingCharge"
            id="pack"
            type="number"
            step=".01"
            value="${Number(
              order.packingCharge || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            Delivery Charge
          </label>

          <input
            name="deliveryCharge"
            id="delivery"
            type="number"
            step=".01"
            value="${Number(
              order.deliveryCharge || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            COD / Return
          </label>

          <input
            name="codReturn"
            id="cod"
            type="number"
            step=".01"
            value="${Number(
              order.codReturn || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            Courier Charge
          </label>

          <input
            name="courierCharge"
            id="courierCharge"
            type="number"
            step=".01"
            value="${Number(
              order.courierCharge || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            Supplier
          </label>

          <select
            name="supplierId"
            id="osupplier"
          >
            ${suppliersOptions(
              order.supplierId
            )}
          </select>

        </div>


        <div class="field">

          <label>
            Courier
          </label>

          <select name="courier">

            <option
              value="Pathao"
              ${
                order.courier ===
                "Pathao"
                  ? "selected"
                  : ""
              }
            >
              Pathao
            </option>

            <option
              value="Steadfast"
              ${
                order.courier ===
                "Steadfast"
                  ? "selected"
                  : ""
              }
            >
              Steadfast
            </option>

          </select>

        </div>


        <div class="field">

          <label>
            Tracking Link
          </label>

          <input
            name="trackingLink"
            type="url"
            value="${esc(
              order.trackingLink ||
              ""
            )}"
          >

        </div>


        <div class="field">

          <label>
            Status
          </label>

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
                  status => `
                    <option
                      value="${status}"
                      ${
                        order.status ===
                        status
                          ? "selected"
                          : ""
                      }
                    >
                      ${status}
                    </option>
                  `
                )
                .join("")
            }

          </select>

        </div>


      </div>


      <div class="calc-card">

        <div class="calc-title">

          Calculations

          <span>
            Live
          </span>

        </div>


        <div class="calc-grid">

          <div>

            <label>
              Payable
            </label>

            <strong id="calcPayable">
              ৳ 0.00
            </strong>

          </div>


          <div>

            <label>
              Profit / Loss
            </label>

            <strong id="calcProfit">
              ৳ 0.00
            </strong>

          </div>


          <div>

            <label>
              Receivable
            </label>

            <strong id="calcReceivable">
              ৳ 0.00
            </strong>

          </div>

        </div>


        <div class="calc-note">

          Profit/Loss =
          Sales − Product Cost − Shipping −
          Advanced − Packaging − Courier −
          COD/Return

        </div>

      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary"
        >
          ${
            existing
              ? "Update Order"
              : "Save Customer & Order"
          }
        </button>

      </div>

    </form>

  `);


  const productSelect =
    document.getElementById("op");

  const supplierSelect =
    document.getElementById(
      "osupplier"
    );


  function calculate() {

    const q =
      Number(
        document.getElementById(
          "qty"
        )?.value
      ) || 0;


    const buy =
      Number(
        document.getElementById(
          "buy"
        )?.value
      ) || 0;


    const sell =
      Number(
        document.getElementById(
          "sale"
        )?.value
      ) || 0;


    const shipping =
      Number(
        document.getElementById(
          "shipping"
        )?.value
      ) || 0;


    const advanced =
      Number(
        document.getElementById(
          "advanced"
        )?.value
      ) || 0;


    const packing =
      Number(
        document.getElementById(
          "pack"
        )?.value
      ) || 0;


    const courier =
      Number(
        document.getElementById(
          "courierCharge"
        )?.value
      ) || 0;


    const cod =
      Number(
        document.getElementById(
          "cod"
        )?.value
      ) || 0;


    const delivery =
      Number(
        document.getElementById(
          "delivery"
        )?.value
      ) || 0;


    const totalSales =
      sell * q;


    const payable =
      buy * q +
      shipping +
      advanced +
      packing +
      courier +
      cod;


    const pl =
      totalSales -
      payable;


    const receivable =
      totalSales +
      delivery +
      cod -
      advanced;


    document.getElementById(
      "calcPayable"
    ).textContent =
      money(payable);


    const profitBox =
      document.getElementById(
        "calcProfit"
      );

    profitBox.textContent =
      money(pl);


    profitBox.className =
      pl >= 0
        ? "calc-positive"
        : "calc-negative";


    document.getElementById(
      "calcReceivable"
    ).textContent =
      money(receivable);
  }


  if (productSelect) {

    productSelect.onchange =
      function () {

        const product =
          db.products.find(
            p =>
              p.id ===
              productSelect.value
          );


        if (!product) {

          calculate();

          return;
        }


        document.getElementById(
          "buy"
        ).value =
          Number(
            product.buyPrice || 0
          );


        document.getElementById(
          "current"
        ).value =
          Number(
            product.currentPrice ||
            product.buyPrice ||
            0
          );


        document.getElementById(
          "sale"
        ).value =
          Number(
            product.sellPrice || 0
          );


        supplierSelect.value =
          product.supplierId || "";


        calculate();
      };
  }


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
  ].forEach(
    fieldId => {

      const element =
        document.getElementById(
          fieldId
        );

      if (element) {

        element.addEventListener(
          "input",
          calculate
        );

      }

    }
  );


  calculate();


  const form =
    document.getElementById(
      "orderForm"
    );


  form.onsubmit =
    async function (event) {

      event.preventDefault();


      const data =
        Object.fromEntries(
          new FormData(form)
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
      ].forEach(
        key => {

          data[key] =
            Number(
              data[key]
            ) || 0;

        }
      );


      data.productName =
        db.products.find(
          product =>
            product.id ===
            data.productId
        )?.name ||
        "Custom Product";


      if (existing) {

        const {
          error
        } = await sb
          .from("orders")
          .update(data)
          .eq(
            "id",
            existing.id
          );


        if (error) {

          toast(
            "Order update failed: " +
              error.message,
            false
          );

          return;
        }


        if (existing.customerId) {

          const {
            error:
              customerError
          } = await sb
            .from("customers")
            .update({

              name:
                data.customerName,

              phone:
                data.phone,

              address:
                data.address

            })
            .eq(
              "id",
              existing.customerId
            );


          if (customerError) {

            console.warn(
              customerError
            );

          }

        }

      } else {

        data.customerId =
          id("CUS");


        const customer = {

          id:
            data.customerId,

          name:
            data.customerName,

          phone:
            data.phone,

          address:
            data.address

        };


        const {
          error:
            customerError
        } = await sb
          .from("customers")
          .insert(
            customer
          );


        if (customerError) {

          toast(
            "Customer save failed: " +
              customerError.message,
            false
          );

          return;
        }


        const {
          error:
            orderError
        } = await sb
          .from("orders")
          .insert(
            data
          );


        if (orderError) {

          toast(
            "Order save failed: " +
              orderError.message,
            false
          );

          return;
        }


        if (data.productId) {

          const product =
            db.products.find(
              p =>
                p.id ===
                data.productId
            );


          if (product) {

            const newStock =
              Math.max(
                0,
                Number(
                  product.stock || 0
                ) -
                Number(
                  data.quantity || 0
                )
              );


            await sb
              .from("products")
              .update({
                stock:
                  newStock
              })
              .eq(
                "id",
                data.productId
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

function productModal(
  productId = null
) {

  const product =
    productId
      ? db.products.find(
          p =>
            p.id ===
            productId
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


  if (!product) {

    toast(
      "Product not found.",
      false
    );

    return;
  }


  openModal(`

    <div class="modal-head">

      <h3>
        ${
          productId
            ? "Edit Product"
            : "Add Product"
        }
      </h3>

      <button
        class="close"
        onclick="closeModal()"
        type="button"
      >
        ×
      </button>

    </div>


    <form id="productForm">

      <div class="form-grid">


        <div class="field">

          <label>
            Product Name
          </label>

          <input
            name="name"
            value="${esc(
              product.name
            )}"
            required
          >

        </div>


        <div class="field">

          <label>
            Current Price
          </label>

          <input
            name="currentPrice"
            type="number"
            step=".01"
            value="${Number(
              product.currentPrice || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            Buy Price
          </label>

          <input
            name="buyPrice"
            type="number"
            step=".01"
            value="${Number(
              product.buyPrice || 0
            )}"
            required
          >

        </div>


        <div class="field">

          <label>
            Sell Price
          </label>

          <input
            name="sellPrice"
            type="number"
            step=".01"
            value="${Number(
              product.sellPrice || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            Supplier
          </label>

          <select name="supplierId">

            ${suppliersOptions(
              product.supplierId
            )}

          </select>

        </div>


        <div class="field">

          <label>
            Opening Stock
          </label>

          <input
            name="stock"
            type="number"
            value="${Number(
              product.stock || 0
            )}"
          >

        </div>


        <div class="field">

          <label>
            Reorder Level
          </label>

          <input
            name="reorder"
            type="number"
            value="${Number(
              product.reorder || 0
            )}"
          >

        </div>


      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary"
        >
          Save Product
        </button>

      </div>

    </form>

  `);


  document.getElementById(
    "productForm"
  ).onsubmit =
    async function (event) {

      event.preventDefault();


      const data =
        Object.fromEntries(
          new FormData(
            event.target
          )
        );


      data.currentPrice =
        Number(
          data.currentPrice
        ) || 0;


      data.buyPrice =
        Number(
          data.buyPrice
        ) || 0;


      data.sellPrice =
        Number(
          data.sellPrice
        ) || 0;


      data.stock =
        Number(
          data.stock
        ) || 0;


      data.reorder =
        Number(
          data.reorder
        ) || 0;


      let result;


      if (productId) {

        result =
          await sb
            .from("products")
            .update(data)
            .eq(
              "id",
              productId
            );

      } else {

        result =
          await sb
            .from("products")
            .insert({

              id:
                id("PRD"),

              ...data

            });

      }


      if (result.error) {

        toast(
          "Product save failed: " +
            result.error.message,
          false
        );

        return;
      }


      closeModal();

      toast(
        productId
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

function supplierModal(
  supplierId = null
) {

  const supplier =
    supplierId
      ? db.suppliers.find(
          s =>
            s.id ===
            supplierId
        )
      : {

          name: "",

          whatsapp: "",

          link: ""

        };


  if (!supplier) {

    toast(
      "Supplier not found.",
      false
    );

    return;
  }


  openModal(`

    <div class="modal-head">

      <h3>
        ${
          supplierId
            ? "Edit Supplier"
            : "Add Supplier"
        }
      </h3>

      <button
        class="close"
        onclick="closeModal()"
        type="button"
      >
        ×
      </button>

    </div>


    <form id="supplierForm">

      <div class="form-grid">


        <div class="field">

          <label>
            Supplier Name
          </label>

          <input
            name="name"
            value="${esc(
              supplier.name
            )}"
            required
          >

        </div>


        <div class="field">

          <label>
            WhatsApp Number
          </label>

          <input
            name="whatsapp"
            value="${esc(
              supplier.whatsapp ||
              ""
            )}"
          >

        </div>


        <div class="field fullrow">

          <label>
            Supplier Link
          </label>

          <input
            name="link"
            type="url"
            value="${esc(
              supplier.link ||
              ""
            )}"
          >

        </div>


      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary"
        >
          Save Supplier
        </button>

      </div>

    </form>

  `);


  document.getElementById(
    "supplierForm"
  ).onsubmit =
    async function (event) {

      event.preventDefault();


      const data =
        Object.fromEntries(
          new FormData(
            event.target
          )
        );


      let result;


      if (supplierId) {

        result =
          await sb
            .from("suppliers")
            .update(data)
            .eq(
              "id",
              supplierId
            );

      } else {

        result =
          await sb
            .from("suppliers")
            .insert({

              id:
                id("SUP"),

              ...data

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
        supplierId
          ? "Supplier updated successfully."
          : "Supplier added successfully."
      );


      await loadAllData();

      render();

    };

}


/* =========================================================
   EXPENSES
   ========================================================= */

function expenses() {

  const total =
    db.expenses.reduce(
      (total, expense) =>
        total +
        Number(
          expense.amount || 0
        ),
      0
    );


  return `
    <div class="page">

      ${head(
        "Expenses",
        "Record business expenses.",
        `
        <button
          class="btn primary"
          onclick="expenseModal()"
        >
          + Add Expense
        </button>
        `
      )}


      <div class="card">

        <div class="summary">

          <div>

            <small>
              Total Expenses
            </small>

            <strong>
              ${money(total)}
            </strong>

          </div>


          <div>

            <small>
              Records
            </small>

            <strong>
              ${db.expenses.length}
            </strong>

          </div>

        </div>


        ${
          db.expenses.length
            ? `

              <div class="table-wrap">

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

                    ${db.expenses.map(
                      expense => `

                      <tr>

                        <td>
                          ${esc(
                            expense.date
                          )}
                        </td>

                        <td>
                          ${esc(
                            expense.category
                          )}
                        </td>

                        <td>
                          ${money(
                            expense.amount
                          )}
                        </td>

                        <td>
                          ${esc(
                            expense.note ||
                            "-"
                          )}
                        </td>

                        <td>

                          <button
                            class="btn danger"
                            onclick="expenseDelete('${esc(
                              expense.id
                            )}')"
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    `
                    ).join("")}

                  </tbody>

                </table>

              </div>

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

      <h3>
        Add Expense
      </h3>

      <button
        class="close"
        onclick="closeModal()"
        type="button"
      >
        ×
      </button>

    </div>


    <form id="expenseForm">

      <div class="form-grid">


        <div class="field">

          <label>
            Date
          </label>

          <input
            name="date"
            type="date"
            value="${today()}"
            required
          >

        </div>


        <div class="field">

          <label>
            Category
          </label>

          <select name="category">

            <option>
              Advertising
            </option>

            <option>
              Packaging
            </option>

            <option>
              Transport
            </option>

            <option>
              Office
            </option>

            <option>
              Other
            </option>

          </select>

        </div>


        <div class="field">

          <label>
            Amount
          </label>

          <input
            name="amount"
            type="number"
            step=".01"
            required
          >

        </div>


        <div class="field">

          <label>
            Note
          </label>

          <input name="note">

        </div>


      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary"
        >
          Save Expense
        </button>

      </div>

    </form>

  `);


  document.getElementById(
    "expenseForm"
  ).onsubmit =
    async function (event) {

      event.preventDefault();


      const data =
        Object.fromEntries(
          new FormData(
            event.target
          )
        );


      data.amount =
        Number(
          data.amount
        ) || 0;


      const {
        error
      } = await sb
        .from("expenses")
        .insert({

          id:
            id("EXP"),

          ...data

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
      (total, payment) =>
        total +
        Number(
          payment.amount || 0
        ),
      0
    );


  const mobilePayments =
    db.payments
      .filter(
        payment =>
          payment.method !==
          "Bank"
      )
      .reduce(
        (total, payment) =>
          total +
          Number(
            payment.amount || 0
          ),
        0
      );


  const bankPayments =
    db.payments
      .filter(
        payment =>
          payment.method ===
          "Bank"
      )
      .reduce(
        (total, payment) =>
          total +
          Number(
            payment.amount || 0
          ),
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
          onclick="paymentModal()"
        >
          + Supplier Payment
        </button>

        <button
          class="btn"
          onclick="accountModal()"
        >
          + My Account
        </button>
        `
      )}


      <div class="grid3">

        <div class="mini">

          <h4>
            Total Supplier Payments
          </h4>

          <strong>
            ${money(total)}
          </strong>

        </div>


        <div class="mini">

          <h4>
            bKash / Nagad
          </h4>

          <strong>
            ${money(
              mobilePayments
            )}
          </strong>

        </div>


        <div class="mini">

          <h4>
            Bank
          </h4>

          <strong>
            ${money(
              bankPayments
            )}
          </strong>

        </div>

      </div>


      <div
        class="card"
        style="margin-top:14px"
      >

        <h3>
          Payment History
        </h3>


        ${
          db.payments.length
            ? `

              <div class="table-wrap">

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

                    ${db.payments.map(
                      payment => `

                      <tr>

                        <td>
                          ${esc(
                            payment.date
                          )}
                        </td>

                        <td>
                          ${esc(
                            db.suppliers.find(
                              supplier =>
                                supplier.id ===
                                payment.supplierId
                            )?.name ||
                              "-"
                          )}
                        </td>

                        <td>
                          ${esc(
                            payment.method
                          )}
                        </td>

                        <td>
                          ${money(
                            payment.amount
                          )}
                        </td>

                        <td>
                          ${esc(
                            payment.note ||
                            "-"
                          )}
                        </td>

                      </tr>

                    `
                    ).join("")}

                  </tbody>

                </table>

              </div>

            `
            : empty(
                "No supplier payments yet."
              )
        }

      </div>


      <div
        class="card"
        style="margin-top:14px"
      >

        <h3>
          My Accounts
        </h3>


        <div class="grid3">

          ${
            db.accounts.length
              ? db.accounts
                  .map(
                    account => `

                    <div class="mini">

                      <h4>
                        ${esc(
                          account.type
                        )}
                      </h4>

                      <strong>
                        ${esc(
                          account.number
                        )}
                      </strong>

                      <p class="muted">
                        ${esc(
                          account.name ||
                          ""
                        )}
                      </p>

                    </div>

                  `
                  )
                  .join("")
              : empty(
                  "Add your Bank, bKash or Nagad account."
                )
          }

        </div>

      </div>

    </div>
  `;
}


/* =========================================================
   PAYMENT MODAL
   ========================================================= */

function paymentModal() {

  openModal(`

    <div class="modal-head">

      <h3>
        Supplier Payment
      </h3>

      <button
        class="close"
        onclick="closeModal()"
        type="button"
      >
        ×
      </button>

    </div>


    <form id="paymentForm">

      <div class="form-grid">


        <div class="field">

          <label>
            Date
          </label>

          <input
            name="date"
            type="date"
            value="${today()}"
          >

        </div>


        <div class="field">

          <label>
            Supplier
          </label>

          <select name="supplierId">

            ${suppliersOptions()}

          </select>

        </div>


        <div class="field">

          <label>
            Method
          </label>

          <select name="method">

            <option>
              bKash
            </option>

            <option>
              Nagad
            </option>

            <option>
              Bank
            </option>

          </select>

        </div>


        <div class="field">

          <label>
            Amount
          </label>

          <input
            name="amount"
            type="number"
            step=".01"
            required
          >

        </div>


        <div class="field fullrow">

          <label>
            Note
          </label>

          <input name="note">

        </div>


      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary"
        >
          Save Payment
        </button>

      </div>

    </form>

  `);


  document.getElementById(
    "paymentForm"
  ).onsubmit =
    async function (event) {

      event.preventDefault();


      const data =
        Object.fromEntries(
          new FormData(
            event.target
          )
        );


      data.amount =
        Number(
          data.amount
        ) || 0;


      const {
        error
      } = await sb
        .from("payments")
        .insert({

          id:
            id("PAY"),

          ...data

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


/* =========================================================
   MY ACCOUNT MODAL
   ========================================================= */

function accountModal() {

  openModal(`

    <div class="modal-head">

      <h3>
        My Payment Account
      </h3>

      <button
        class="close"
        onclick="closeModal()"
        type="button"
      >
        ×
      </button>

    </div>


    <form id="accountForm">

      <div class="form-grid">


        <div class="field">

          <label>
            Type
          </label>

          <select name="type">

            <option>
              Bank
            </option>

            <option>
              bKash
            </option>

            <option>
              Nagad
            </option>

          </select>

        </div>


        <div class="field">

          <label>
            Number / Account
          </label>

          <input
            name="number"
            required
          >

        </div>


        <div class="field fullrow">

          <label>
            Account Name
          </label>

          <input name="name">

        </div>


      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary"
        >
          Save Account
        </button>

      </div>

    </form>

  `);


  document.getElementById(
    "accountForm"
  ).onsubmit =
    async function (event) {

      event.preventDefault();


      const data =
        Object.fromEntries(
          new FormData(
            event.target
          )
        );


      const {
        error
      } = await sb
        .from("accounts")
        .insert({

          id:
            id("ACC"),

          ...data

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
          onclick="report('stock',this)"
        >
          Stock Report
        </button>

        <button
          class="tab"
          onclick="report('sales',this)"
        >
          Sales Report
        </button>

        <button
          class="tab"
          onclick="report('profit',this)"
        >
          Profit & Loss
        </button>

        <button
          class="tab"
          onclick="report('customers',this)"
        >
          Customer Report
        </button>

        <button
          class="tab"
          onclick="report('products',this)"
        >
          Product Report
        </button>

        <button
          class="tab"
          onclick="report('expenses',this)"
        >
          Expense Report
        </button>

      </div>


      <div
        id="reportBox"
        class="card"
      >

        ${stockReport()}

      </div>

    </div>
  `;
}


function stockReport() {

  return `
    <h3>
      Stock Report
    </h3>

    <div class="table-wrap">

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

          ${db.products.map(
            product => `

            <tr>

              <td>
                ${esc(
                  product.name
                )}
              </td>

              <td>
                ${esc(
                  db.suppliers.find(
                    supplier =>
                      supplier.id ===
                      product.supplierId
                  )?.name ||
                    "-"
                )}
              </td>

              <td>
                ${Number(
                  product.stock || 0
                )}
              </td>

              <td>
                ${money(
                  product.buyPrice
                )}
              </td>

              <td>
                ${money(
                  Number(
                    product.stock || 0
                  ) *
                  Number(
                    product.buyPrice || 0
                  )
                )}
              </td>

              <td>
                ${
                  Number(
                    product.stock || 0
                  ) <=
                  Number(
                    product.reorder || 0
                  )
                    ? "Low Stock"
                    : "In Stock"
                }
              </td>

            </tr>
          `
          ).join("")}

        </tbody>

      </table>

    </div>
  `;
}


function salesReport() {

  return `
    <h3>
      Sales Report
    </h3>

    ${
      db.orders.length
        ? orderTable(db.orders)
        : empty(
            "No sales data."
          )
    }
  `;
}


function profitReport() {

  const gross =
    db.orders.reduce(
      (total, order) =>
        total + profit(order),
      0
    );


  const expenseTotal =
    db.expenses.reduce(
      (total, expense) =>
        total +
        Number(
          expense.amount || 0
        ),
      0
    );


  const net =
    gross -
    expenseTotal;


  return `
    <h3>
      Profit & Loss Report
    </h3>


    <div class="summary">

      <div>

        <small>
          Sales
        </small>

        <strong>
          ${money(
            db.orders.reduce(
              (total, order) =>
                total +
                sales(order),
              0
            )
          )}
        </strong>

      </div>


      <div>

        <small>
          Gross Profit
        </small>

        <strong>
          ${money(gross)}
        </strong>

      </div>


      <div>

        <small>
          Expenses
        </small>

        <strong>
          ${money(
            expenseTotal
          )}
        </strong>

      </div>


      <div>

        <small>
          Net Profit / Loss
        </small>

        <strong>
          ${money(net)}
        </strong>

      </div>

    </div>
  `;
}


function customerReport() {

  return `
    <h3>
      Customer Report
    </h3>

    <div class="table-wrap">

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

          ${db.customers.map(
            customer => {

              const orders =
                db.orders.filter(
                  order =>
                    order.customerId ===
                    customer.id
                );


              return `

                <tr>

                  <td>
                    ${esc(
                      customer.name
                    )}
                  </td>

                  <td>
                    ${esc(
                      customer.phone
                    )}
                  </td>

                  <td>
                    ${orders.length}
                  </td>

                  <td>
                    ${money(
                      orders.reduce(
                        (total, order) =>
                          total +
                          sales(order),
                        0
                      )
                    )}
                  </td>

                  <td>
                    ${money(
                      orders.reduce(
                        (total, order) =>
                          total +
                          profit(order),
                        0
                      )
                    )}
                  </td>

                </tr>

              `;

            }
          ).join("")}

        </tbody>

      </table>

    </div>
  `;
}


function productReport() {

  return `
    <h3>
      Product Report
    </h3>

    <div class="table-wrap">

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

          ${db.products.map(
            product => {

              const orders =
                db.orders.filter(
                  order =>
                    order.productId ===
                    product.id
                );


              return `

                <tr>

                  <td>
                    ${esc(
                      product.name
                    )}
                  </td>

                  <td>
                    ${orders.reduce(
                      (total, order) =>
                        total +
                        Number(
                          order.quantity ||
                          0
                        ),
                      0
                    )}
                  </td>

                  <td>
                    ${money(
                      orders.reduce(
                        (total, order) =>
                          total +
                          sales(order),
                        0
                      )
                    )}
                  </td>

                  <td>
                    ${money(
                      orders.reduce(
                        (total, order) =>
                          total +
                          profit(order),
                        0
                      )
                    )}
                  </td>

                </tr>

              `;

            }
          ).join("")}

        </tbody>

      </table>

    </div>
  `;
}


function expenseReport() {

  return `
    <h3>
      Expense Report
    </h3>

    <div class="table-wrap">

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

          ${db.expenses.map(
            expense => `

            <tr>

              <td>
                ${esc(
                  expense.date
                )}
              </td>

              <td>
                ${esc(
                  expense.category
                )}
              </td>

              <td>
                ${money(
                  expense.amount
                )}
              </td>

              <td>
                ${esc(
                  expense.note ||
                  "-"
                )}
              </td>

            </tr>

          `
          ).join("")}

        </tbody>

      </table>

    </div>
  `;
}


function report(
  type,
  button
) {

  document
    .querySelectorAll(
      ".tab"
    )
    .forEach(
      tab =>
        tab.classList.remove(
          "active"
        )
    );


  if (button) {
    button.classList.add(
      "active"
    );
  }


  const box =
    document.getElementById(
      "reportBox"
    );


  if (!box) return;


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
        `
        <button
          class="btn primary"
          onclick="saveSettings()"
        >
          Save
        </button>
        `
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
              )}"
            >

          </div>


          <div class="field">

            <label>
              Currency
            </label>

            <input
              id="scurrency"
              value="${esc(
                db.settings.currency
              )}"
            >

          </div>


        </div>


        <div class="setting">

          <div>

            <b>
              Success notifications
            </b>

            <div class="muted">
              Show success notifications.
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
            "
          ></div>

        </div>


        <div class="setting">

          <div>

            <b>
              Export Backup
            </b>

            <div class="muted">
              Download ERP data.
            </div>

          </div>


          <button
            class="btn"
            onclick="backup()"
            type="button"
          >
            Export Backup
          </button>

        </div>


      </div>

    </div>
  `;
}


async function saveSettings() {

  const name =
    document.getElementById(
      "sname"
    )?.value ||
    "Al Furqun";


  const currency =
    document.getElementById(
      "scurrency"
    )?.value ||
    "৳";


  const notify =
    document
      .getElementById(
        "toggle"
      )
      ?.classList.contains(
        "on"
      ) ??
    true;


  const data = {

    name,

    currency,

    notify

  };


  const {
    error
  } = await sb
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

function viewOrder(
  orderId
) {

  const order =
    db.orders.find(
      item =>
        item.id ===
        orderId
    );


  if (!order) {

    toast(
      "Order not found.",
      false
    );

    return;
  }


  openModal(`

    <div class="modal-head">

      <div>

        <h3>
          Order ${esc(
            order.id
          )}
        </h3>

        <div class="muted">
          ${esc(
            order.date
          )}
          •
          ${esc(
            order.source
          )}
        </div>

      </div>


      <button
        class="close"
        onclick="closeModal()"
        type="button"
      >
        ×
      </button>

    </div>


    <div class="summary">

      <div>

        <small>
          Customer
        </small>

        <strong>
          ${esc(
            order.customerName
          )}
        </strong>

      </div>


      <div>

        <small>
          Sales
        </small>

        <strong>
          ${money(
            sales(order)
          )}
        </strong>

      </div>


      <div>

        <small>
          Profit
        </small>

        <strong>
          ${money(
            profit(order)
          )}
        </strong>

      </div>


      <div>

        <small>
          Status
        </small>

        <strong>
          ${badge(
            order.status
          )}
        </strong>

      </div>

    </div>


    <p>

      <b>
        Phone:
      </b>

      ${esc(
        order.phone
      )}

      <br>

      <b>
        Address:
      </b>

      ${esc(
        order.address
      )}

      <br>

      <b>
        Product:
      </b>

      ${esc(
        order.productName
      )}

      ×
      ${Number(
        order.quantity || 0
      )}

      <br>

      <b>
        Courier:
      </b>

      ${esc(
        order.courier
      )}

      <br>

      <b>
        Tracking:
      </b>

      ${
        order.trackingLink
          ? `
            <a
              href="${esc(
                order.trackingLink
              )}"
              target="_blank"
              rel="noopener"
            >
              Open
            </a>
          `
          : "-"
      }

    </p>


    <div class="modal-actions">

      <button
        class="btn"
        onclick="closeModal()"
        type="button"
      >
        Close
      </button>


      <button
        class="btn"
        onclick="orderEdit('${esc(
          order.id
        )}')"
        type="button"
      >
        Edit
      </button>

    </div>

  `);
}


function orderEdit(
  orderId
) {

  const order =
    db.orders.find(
      item =>
        item.id ===
        orderId
    );


  closeModal();


  if (order) {

    orderModal(
      order
    );

  }

}


/* =========================================================
   CUSTOMER
   ========================================================= */

function customerView(
  customerId
) {

  const customer =
    db.customers.find(
      item =>
        item.id ===
        customerId
    );


  if (!customer) return;


  const orders =
    db.orders.filter(
      order =>
        order.customerId ===
        customerId
    );


  openModal(`

    <div class="modal-head">

      <div>

        <h3>
          ${esc(
            customer.name
          )}
        </h3>

        <div class="muted">
          ${esc(
            customer.phone
          )}
        </div>

      </div>


      <button
        class="close"
        onclick="closeModal()"
        type="button"
      >
        ×
      </button>

    </div>


    <p>
      ${esc(
        customer.address ||
        ""
      )}
    </p>


    ${
      orders.length
        ? orderTable(orders)
        : empty(
            "No order history."
          )
    }


    <div class="modal-actions">

      <button
        class="btn"
        onclick="closeModal()"
        type="button"
      >
        Close
      </button>

    </div>

  `);
}


function customerEdit(
  customerId
) {

  const customer =
    db.customers.find(
      item =>
        item.id ===
        customerId
    );


  if (!customer) return;


  const order =
    db.orders.find(
      item =>
        item.customerId ===
        customerId
    );


  closeModal();


  if (order) {

    orderModal(
      order
    );

  } else {

    orderModal({

      id:
        id("ORD"),

      date:
        today(),

      customerId:
        customerId,

      customerName:
        customer.name,

      phone:
        customer.phone,

      address:
        customer.address,

      source:
        "Marketplace",

      status:
        "Pending",

      quantity:
        1

    });

  }
}


/* =========================================================
   DELETE
   ========================================================= */

async function customerDelete(
  customerId
) {

  if (
    !confirm(
      "Delete customer and all their orders?"
    )
  ) {
    return;
  }


  const {
    error:
      orderError
  } = await sb
    .from("orders")
    .delete()
    .eq(
      "customerId",
      customerId
    );


  if (orderError) {

    toast(
      "Orders could not be deleted: " +
        orderError.message,
      false
    );

    return;
  }


  const {
    error
  } = await sb
    .from("customers")
    .delete()
    .eq(
      "id",
      customerId
    );


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


async function productDelete(
  productId
) {

  if (
    !confirm(
      "Delete this product?"
    )
  ) {
    return;
  }


  const {
    error
  } = await sb
    .from("products")
    .delete()
    .eq(
      "id",
      productId
    );


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


async function supplierDelete(
  supplierId
) {

  if (
    !confirm(
      "Delete this supplier?"
    )
  ) {
    return;
  }


  const {
    error
  } = await sb
    .from("suppliers")
    .delete()
    .eq(
      "id",
      supplierId
    );


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


async function expenseDelete(
  expenseId
) {

  if (
    !confirm(
      "Delete this expense?"
    )
  ) {
    return;
  }


  const {
    error
  } = await sb
    .from("expenses")
    .delete()
    .eq(
      "id",
      expenseId
    );


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

  const json =
    JSON.stringify(
      db,
      null,
      2
    );


  const blob =
    new Blob(
      [json],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    "al-furqun-erp-backup.json";


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );
}


/* =========================================================
   SEARCH
   ========================================================= */

function globalSearch() {

  const input =
    document.getElementById(
      "search"
    );


  if (!input) return;


  const value =
    input.value
      .toLowerCase()
      .trim();


  if (!value) return;


  const order =
    db.orders.find(
      item =>
        [
          item.id,
          item.customerName,
          item.phone,
          item.productName
        ].some(
          field =>
            String(
              field || ""
            )
              .toLowerCase()
              .includes(value)
        )
    );


  if (order) {

    page = "orders";

    render();

    setTimeout(
      () =>
        viewOrder(
          order.id
        ),
      100
    );

    return;
  }


  const product =
    db.products.find(
      item =>
        String(
          item.name || ""
        )
          .toLowerCase()
          .includes(value)
    );


  if (product) {

    page = "products";

    render();

    return;
  }


  const customer =
    db.customers.find(
      item =>
        [
          item.name,
          item.phone
        ].some(
          field =>
            String(
              field || ""
            )
              .toLowerCase()
              .includes(value)
        )
    );


  if (customer) {

    page = "customers";

    render();

    return;
  }


  toast(
    "Nothing found."
  );
}


/* =========================================================
   BIND
   ========================================================= */

function bind() {

  const customerSearch =
    document.getElementById(
      "customerSearch"
    );


  if (customerSearch) {

    customerSearch.oninput =
      function () {

        render();

      };

  }


  const productSearch =
    document.getElementById(
      "productSearch"
    );


  if (productSearch) {

    productSearch.oninput =
      function () {

        render();

      };

  }

}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser() {

  const username =
    document.getElementById(
      "username"
    )?.value
      ?.trim();


  const password =
    document.getElementById(
      "password"
    )?.value;


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

  console.log(
    "Al Furqun ERP starting..."
  );


  const connected =
    loadSupabase();


  if (!connected) {

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

    loginForm.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        await loginUser();

      }
    );

  }


  const logout =
    document.getElementById(
      "logout"
    );


  if (logout) {

    logout.onclick =
      function () {

        sessionStorage.removeItem(
          "af"
        );


        document
          .getElementById(
            "app"
          )
          ?.classList.add(
            "hidden"
          );


        document
          .getElementById(
            "login"
          )
          ?.classList.remove(
            "hidden"
          );

      };

  }


  const menu =
    document.getElementById(
      "menu"
    );


  if (menu) {

    menu.onclick =
      function () {

        document
          .getElementById(
            "sidebar"
          )
          ?.classList.toggle(
            "open"
          );

      };

  }


  document
    .querySelectorAll(
      "nav button"
    )
    .forEach(
      button => {

        button.onclick =
          function () {

            page =
              button.dataset.page;


            render();


            document
              .getElementById(
                "sidebar"
              )
              ?.classList.remove(
                "open"
              );

          };

      }
    );


  const search =
    document.getElementById(
      "search"
    );


  if (search) {

    search.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          globalSearch();

        }

      }
    );

  }


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

document.addEventListener(
  "DOMContentLoaded",
  init
);
