// /pages/cliente/js/client_dashboard.js
(() => {
    const $ = (id) => document.getElementById(id);

    const esc = (s) => (s ?? "").toString()
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

    const euros = (n) => Number(n || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

    const pad = (n) => String(n).padStart(2, "0");
    const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

    // --------- Refs ----------
    const catalogGrid = $("catalogGrid");
    const searchInput = $("searchInput");

    const clientLabel = $("clientLabel");
    const cartEmpty = $("cartEmpty");
    const cartWrap = $("cartWrap");
    const cartList = $("cartList");
    const totalPrice = $("totalPrice");

    const pickupDate = $("pickupDate");
    const dateError = $("dateError");

    const orderNotes = $("orderNotes");
    const btnGeneratePdf = $("btnGeneratePdf");
    const btnClearCart = $("btnClearCart");

    // --------- Auth user ----------
    const user = window.Auth?.getUser?.() || { email: "—", name: "Cliente", role: "cliente" };
    if (clientLabel) clientLabel.textContent = user.name || user.email;

    // --------- Store ----------
    // Usamos Store (employee_store.js)
    const hasStore = () => window.Store && Store.KEYS && typeof Store.list === "function";
    if (hasStore()) Store.seedIfEmpty?.();

    const readProducts = () => {
        if (hasStore()) return Store.list(Store.KEYS.products) || [];
        try { return JSON.parse(localStorage.getItem("lama_products") || "[]"); } catch { return []; }
    };

    const readOrders = () => {
        if (hasStore()) return Store.list(Store.KEYS.orders) || [];
        try { return JSON.parse(localStorage.getItem("lama_orders") || "[]"); } catch { return []; }
    };

    const writeOrders = (orders) => {
        if (hasStore() && typeof Store.write === "function") {
        Store.write(Store.KEYS.orders, orders);
        return;
        }
        localStorage.setItem("lama_orders", JSON.stringify(orders));
    };

    const uid = () => (hasStore() && typeof Store.uid === "function")
        ? Store.uid()
        : (Math.random().toString(16).slice(2) + Date.now().toString(16));

    // --------- Price helper (si el producto no tiene precio) ----------
    const priceFor = (p) => {
        if (typeof p.price === "number") return p.price;
        // precio determinista 2.50€ - 20.49€ según nombre
        let h = 0;
        const s = (p?.name || "Producto").toLowerCase();
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        const cents = 250 + (h % 1800); // 250..2049
        return Math.round(cents) / 100;
    };

    // --------- Cart persistence per user ----------
    const CART_KEY = `lama_cart_${(user.email || "anon").toLowerCase()}`;

    const readCart = () => {
        try { return JSON.parse(localStorage.getItem(CART_KEY) || "{}"); } catch { return {}; }
    };
    const writeCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

    let cart = readCart(); 

    // --------- Validacion de dia (+2 days) ----------
    const setupPickupMinDate = () => {
        const now = new Date();
        now.setHours(0,0,0,0);
        const min = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        const minStr = ymd(min);

        if (pickupDate) {
        pickupDate.min = minStr;
        if (!pickupDate.value) pickupDate.value = minStr;
        }
    };

    const isDateValid = () => {
        if (!pickupDate) return true;
        const val = pickupDate.value;
        if (!val) return false;

        const selected = new Date(val + "T00:00:00");
        const now = new Date();
        now.setHours(0,0,0,0);
        const min = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

        return selected >= min;
    };

    const showDateError = (msg) => {
        if (!dateError) return;
        if (!msg) {
        dateError.classList.add("d-none");
        dateError.textContent = "";
        return;
        }
        dateError.classList.remove("d-none");
        dateError.textContent = msg;
    };

    // --------- Render catalog ----------
    const productIcon = (name) => {
        const n = (name || "").toLowerCase();
        if (n.includes("tarta")) return "fa-cake-candles";
        if (n.includes("croissant")) return "fa-moon";
        if (n.includes("palmera")) return "fa-cookie-bite";
        if (n.includes("pan")) return "fa-bread-slice";
        if (n.includes("chocolate")) return "fa-mug-hot";
        return "fa-utensils";
    };

    const renderCatalog = () => {
        const products = readProducts();

        const q = (searchInput?.value || "").trim().toLowerCase();
        const filtered = products.filter(p => (p.name || "").toLowerCase().includes(q));

        if (!catalogGrid) return;

        if (!filtered.length) {
        catalogGrid.innerHTML = `
            <div class="text-muted">No hay productos que coincidan.</div>
        `;
        return;
        }

        catalogGrid.innerHTML = filtered.map(p => {
        const price = priceFor(p);
        const qty = cart[p.id] || 0;
        const stock = (typeof p.stock === "number") ? p.stock : null;

        return `
            <div class="cd-item">
            <div class="cd-item-top">
                <div class="cd-thumb"><i class="fa-solid ${productIcon(p.name)}"></i></div>
                <div>
                <div class="cd-name">${esc(p.name)}</div>
                <div class="cd-meta">${esc(p.recipe || "Sin receta especificada")}</div>
                </div>
            </div>

            <div class="cd-actions">
                <div>
                <div class="cd-price">${euros(price)}</div>
                <div class="cd-stock">${stock !== null ? `Stock: ${stock}` : "Stock: —"} · En carrito: <b>${qty}</b></div>
                </div>

                <button class="cd-add" data-add="${esc(p.id)}">
                <i class="fa-solid fa-plus me-1"></i> Añadir
                </button>
            </div>
            </div>
        `;
        }).join("");
    };

    // --------- Render cart ----------
    const cartItemsDetailed = () => {
        const products = readProducts();
        const map = new Map(products.map(p => [p.id, p]));

        const lines = [];
        for (const [id, qty] of Object.entries(cart)) {
        const q = Number(qty || 0);
        if (q <= 0) continue;
        const p = map.get(id);
        if (!p) continue;

        const price = priceFor(p);
        const subtotal = price * q;

        lines.push({
            id,
            name: p.name,
            qty: q,
            price,
            subtotal
        });
        }
        return lines;
    };

    const computeTotal = (lines) => lines.reduce((acc, l) => acc + l.subtotal, 0);

    const renderCart = () => {
        const lines = cartItemsDetailed();
        const total = computeTotal(lines);

        if (!cartList || !totalPrice) return;

        const empty = lines.length === 0;

        cartEmpty?.classList.toggle("d-none", !empty);
        cartWrap?.classList.toggle("d-none", empty);

        totalPrice.textContent = euros(total);

        if (empty) {
        cartList.innerHTML = "";
        return;
        }

        cartList.innerHTML = lines.map(l => `
        <li>
            <div>
            <div class="cd-line-title">${esc(l.name)}</div>
            <div class="cd-line-sub">${euros(l.price)} · Subtotal: <b>${euros(l.subtotal)}</b></div>
            </div>

            <div class="cd-qty">
            <button type="button" data-dec="${esc(l.id)}">−</button>
            <span>${l.qty}</span>
            <button type="button" data-inc="${esc(l.id)}">+</button>
            </div>
        </li>
        `).join("");
    };

    // --------- Cart actions ----------
    const addToCart = (id) => {
        const products = readProducts();
        const p = products.find(x => x.id === id);
        if (!p) return;

        const stock = (typeof p.stock === "number") ? p.stock : null;
        const current = Number(cart[id] || 0);

        // Si hay stock definido, no dejamos superar
        if (stock !== null && current + 1 > stock) {
        alert("No hay suficiente stock para añadir más de este producto.");
        return;
        }

        cart[id] = current + 1;
        writeCart(cart);
        renderCatalog();
        renderCart();
    };

    const inc = (id) => addToCart(id);

    const dec = (id) => {
        const current = Number(cart[id] || 0);
        if (current <= 1) delete cart[id];
        else cart[id] = current - 1;

        writeCart(cart);
        renderCatalog();
        renderCart();
    };

    const clearCart = () => {
        cart = {};
        writeCart(cart);
        renderCatalog();
        renderCart();
    };

    // --------- Create order + "PDF" ----------
    const itemsToText = (lines) => lines.map(l => `${l.qty}x ${l.name}`).join(", ");

    const openReceiptWindow = (order) => {
        const w = window.open("", "_blank", "width=900,height=700");
        if (!w) return alert("El navegador ha bloqueado la ventana emergente. Permite popups para generar el PDF.");

        const rows = order.itemsDetailed.map(l => `
        <tr>
            <td style="padding:8px 0;">${esc(l.name)}</td>
            <td style="text-align:center;">${l.qty}</td>
            <td style="text-align:right;">${euros(l.price)}</td>
            <td style="text-align:right;"><b>${euros(l.subtotal)}</b></td>
        </tr>
        `).join("");

        w.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Pedido - Pastelería Lama</title>
            <style>
            body{ font-family: Arial, sans-serif; padding: 28px; color:#222; }
            .box{ border:1px solid #ddd; border-radius: 14px; padding: 18px; }
            h1{ margin:0; }
            .muted{ color:#666; }
            table{ width:100%; border-collapse: collapse; margin-top: 14px; }
            thead th{ text-align:left; border-bottom: 1px solid #ddd; padding: 8px 0; }
            tfoot td{ border-top: 1px solid #ddd; padding-top: 10px; }
            .right{ text-align:right; }
            .btn{ margin-top: 14px; padding: 10px 14px; border-radius: 10px; border: 1px solid #bbb; background:#f7f7f7; cursor:pointer; }
            @media print { .btn { display:none; } }
            </style>
        </head>
        <body>
            <div class="box">
            <h1>Pastelería Lama</h1>
            <div class="muted">Pedido (simulación PDF)</div>

            <div style="margin-top:14px;">
                <div><b>Cliente:</b> ${esc(order.customer)}</div>
                <div><b>Email:</b> ${esc(order.customerEmail)}</div>
                <div><b>Fecha de recogida:</b> ${esc(order.pickupDate)}</div>
                <div class="muted" style="margin-top:6px;"><b>Estado:</b> ${esc(order.status)}</div>
            </div>

            <table>
                <thead>
                <tr>
                    <th>Producto</th>
                    <th style="text-align:center;">Qty</th>
                    <th class="right">Precio</th>
                    <th class="right">Subtotal</th>
                </tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                <tr>
                    <td colspan="3" class="right"><b>Total</b></td>
                    <td class="right"><b>${euros(order.total)}</b></td>
                </tr>
                </tfoot>
            </table>

            ${order.notes ? `<div style="margin-top:10px;"><b>Notas:</b> ${esc(order.notes)}</div>` : ""}

            <button class="btn" onclick="window.print()">Imprimir / Guardar como PDF</button>
            </div>
        </body>
        </html>
        `);
        w.document.close();
    };

    const createOrder = () => {
        const lines = cartItemsDetailed();
        if (lines.length === 0) return;

        if (!isDateValid()) {
        showDateError("La fecha debe ser mínimo dentro de 2 días.");
        pickupDate?.focus();
        return;
        }
        showDateError("");

        const total = computeTotal(lines);

        const order = {
        id: uid(),
        dateISO: new Date().toISOString(),
        customer: user.name || user.email,
        customerEmail: user.email || "—",
        pickupDate: pickupDate.value,
        items: itemsToText(lines),
        itemsDetailed: lines,
        total,
        amount: total,
        status: "Pendiente",
        notes: (orderNotes?.value || "").trim()
        };

        const orders = readOrders();
        orders.unshift(order);
        writeOrders(orders);

        openReceiptWindow(order);

        clearCart();
        if (orderNotes) orderNotes.value = "";
        alert("Pedido creado (demo). Puedes verlo en Gestión de Pedidos del trabajador/admin.");
    };

    // --------- Events ----------
    searchInput?.addEventListener("input", renderCatalog);

    document.addEventListener("click", (e) => {
        const addBtn = e.target.closest("[data-add]");
        if (addBtn) return addToCart(addBtn.getAttribute("data-add"));

        const incBtn = e.target.closest("[data-inc]");
        if (incBtn) return inc(incBtn.getAttribute("data-inc"));

        const decBtn = e.target.closest("[data-dec]");
        if (decBtn) return dec(decBtn.getAttribute("data-dec"));
    });

    btnClearCart?.addEventListener("click", () => {
        const ok = confirm("¿Vaciar el carrito?");
        if (!ok) return;
        clearCart();
    });

    pickupDate?.addEventListener("change", () => {
        if (isDateValid()) showDateError("");
        else showDateError("La fecha debe ser mínimo dentro de 2 días.");
    });

    btnGeneratePdf?.addEventListener("click", createOrder);

    // Init
    setupPickupMinDate();
    renderCatalog();
    renderCart();
})();
