// /pages/admin/js/admin_dashboard.js
(() => {
  // ===== Helpers =====
    const $ = (id) => document.getElementById(id);

    const safeParse = (s, fallback) => {
        try { return JSON.parse(s); } catch { return fallback; }
    };

    const euros = (n) => {
        const v = Number(n || 0);
        return v.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
    };

    const pad = (n) => String(n).padStart(2, "0");
    const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

    const now = new Date();
    const todayKey = ymd(now);
    const monthKey = `${now.getFullYear()}-${pad(now.getMonth()+1)}`;

    // ===== Data sources =====
    // Empleados (solo admin)
    const EMP_KEY = "lama_employees";

    const readEmployees = () => safeParse(localStorage.getItem(EMP_KEY) || "[]", []);
    const writeEmployees = (arr) => localStorage.setItem(EMP_KEY, JSON.stringify(arr));

    const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : ("id_" + Math.random().toString(16).slice(2)));

    // Pedidos / fichaje (si existe Store, lo usamos)
    const hasStore = () => window.Store && (typeof Store.list === "function" || typeof Store.read === "function");

    const getOrders = () => {
        // Intentamos Store.KEYS.orders
        if (hasStore() && Store.KEYS?.orders && typeof Store.list === "function") {
        return Store.list(Store.KEYS.orders) || [];
        }
        // fallback: buscar key típica
        return safeParse(localStorage.getItem("lama_orders") || "[]", []);
    };

    const writeOrdersBackIfPossible = (orders) => {
        if (hasStore() && Store.KEYS?.orders && typeof Store.write === "function") {
        Store.write(Store.KEYS.orders, orders);
        return true;
        }
        // no hacemos nada si no sabemos dónde guardar
        return false;
    };

    const getTimeclock = () => {
        if (hasStore() && Store.KEYS?.timeclock && typeof Store.read === "function") {
        return Store.read(Store.KEYS.timeclock, []);
        }
        return safeParse(localStorage.getItem("lama_timeclock") || "[]", []);
    };

    // ===== UI refs =====
    const statDaily = $("statDaily");
    const statMonthly = $("statMonthly");
    const statPending = $("statPending");
    const statEmployees = $("statEmployees");

    const employeesTbody = $("employeesTbody");
    const hoursTbody = $("hoursTbody");

    const btnSeedDemo = $("btnSeedDemo");
    const btnCreateEmployee = $("btnCreateEmployee");

    // Modal
    const modalBackdrop = $("modalBackdrop");
    const modalTitle = $("modalTitle");
    const btnClose = $("btnClose");
    const btnCancel = $("btnCancel");

    const employeeForm = $("employeeForm");
    const empId = $("empId");
    const empName = $("empName");
    const empEmail = $("empEmail");
    const empJob = $("empJob");
    const empPass = $("empPass");

    const esc = (s) => (s ?? "").toString()
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

    // ===== Logic: profits =====
    const hashToAmount = (seed) => {
        // determinista y "realista" 8€ - 65€
        let h = 0;
        const str = String(seed || "x");
        for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
        const base = 800 + (h % 5700); // 800..6499 (centimos)
        return Math.round(base) / 100;
    };

    const normalizeOrdersAmounts = (orders) => {
        let changed = false;
        orders.forEach(o => {
        if (typeof o.amount !== "number") {
            // si no existe amount, lo inventamos determinista
            o.amount = hashToAmount(o.id || o.items || o.dateISO);
            changed = true;
        }
        if (!o.dateISO && o.date) {
            // opcional: intentar mapear campo date->dateISO si existe
            const d = new Date(o.date);
            if (!isNaN(d)) {
            o.dateISO = d.toISOString();
            changed = true;
            }
        }
        });
        if (changed) writeOrdersBackIfPossible(orders);
        return orders;
    };

    const computeProfit = () => {
        const orders = normalizeOrdersAmounts(getOrders());

        const delivered = orders.filter(o => (o.status || "").toLowerCase() === "entregado" || (o.status || "") === "Entregado");
        const pending = orders.filter(o => (o.status || "").toLowerCase() === "pendiente" || (o.status || "") === "Pendiente");

        let daySum = 0;
        let monthSum = 0;

        delivered.forEach(o => {
        if (!o.dateISO) return;
        const d = new Date(o.dateISO);
        if (isNaN(d)) return;

        const dKey = ymd(d);
        const mKey = `${d.getFullYear()}-${pad(d.getMonth()+1)}`;

        if (dKey === todayKey) daySum += Number(o.amount || 0);
        if (mKey === monthKey) monthSum += Number(o.amount || 0);
        });

        statDaily.textContent = euros(daySum);
        statMonthly.textContent = euros(monthSum);
        statPending.textContent = pending.length.toString();
    };

    // ===== Logic: employees =====
    const openModal = (mode, employee = null) => {
        modalBackdrop.classList.add("show");
        modalBackdrop.setAttribute("aria-hidden", "false");

        if (mode === "create") {
        modalTitle.textContent = "Crear empleado";
        empId.value = "";
        empName.value = "";
        empEmail.value = "trabajador@";
        empJob.value = "";
        empPass.value = "";
        return;
        }

        modalTitle.textContent = "Editar empleado";
        empId.value = employee.id;
        empName.value = employee.name || "";
        empEmail.value = employee.email || "";
        empJob.value = employee.job || "";
        empPass.value = employee.password || "";
    };

    const closeModal = () => {
        modalBackdrop.classList.remove("show");
        modalBackdrop.setAttribute("aria-hidden", "true");
        employeeForm.reset();
        empId.value = "";
    };

    const renderEmployees = () => {
        const employees = readEmployees();
        statEmployees.textContent = employees.length.toString();

        employeesTbody.innerHTML = employees.map(e => `
        <tr>
            <td><b>${esc(e.name)}</b></td>
            <td>${esc(e.email)}</td>
            <td class="emp-muted">${esc(e.job || "-")}</td>
            <td><span class="emp-badge warn"><i class="fa-solid fa-key"></i> ${esc(e.password || "—")}</span></td>
            <td>
            <div class="emp-row-actions">
                <button class="emp-btn small" data-action="edit-emp" data-id="${e.id}" title="Editar">
                <i class="fa-solid fa-pen"></i>
                </button>
                <button class="emp-btn small danger" data-action="del-emp" data-id="${e.id}" title="Borrar">
                <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            </td>
        </tr>
        `).join("");
    };

    // ===== Logic: hours table =====
    const parseTimeToDate = (dateYMD, timeStr) => {
        // dateYMD = "YYYY-MM-DD", timeStr="HH:MM:SS"
        const [y, m, d] = dateYMD.split("-").map(Number);
        const [hh, mm, ss] = (timeStr || "00:00:00").split(":").map(Number);
        return new Date(y, (m - 1), d, hh || 0, mm || 0, ss || 0);
    };

    const formatHM = (timeStr) => (timeStr || "—").slice(0,5) || "—";

    const computeHoursRows = () => {
        const tc = getTimeclock(); // [{date, entries:[{type,time, employeeEmail?, employeeName?}]}]
        const rows = [];

        tc.forEach(day => {
        const date = day.date;
        const entries = Array.isArray(day.entries) ? day.entries : [];

        // agrupar por empleado (si no existe, "—")
        const groups = new Map();
        entries.forEach(ent => {
            const email = ent.employeeEmail || ent.email || "—";
            const name = ent.employeeName || ent.name || email;
            const key = `${name}||${email}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(ent);
        });

        if (groups.size === 0) return;

        for (const [key, list] of groups.entries()) {
            const [name, email] = key.split("||");

            // ordenar cronológico
            const ordered = list
            .slice()
            .sort((a,b) => parseTimeToDate(date, a.time) - parseTimeToDate(date, b.time));

            // buscar primera entrada y primera salida posterior
            const firstIn = ordered.find(x => x.type === "in");
            let firstOut = null;
            if (firstIn) {
            const inDate = parseTimeToDate(date, firstIn.time);
            firstOut = ordered.find(x => x.type === "out" && parseTimeToDate(date, x.time) > inDate) || null;
            }

            let total = "—";
            if (firstIn && firstOut) {
            const a = parseTimeToDate(date, firstIn.time);
            const b = parseTimeToDate(date, firstOut.time);
            const diffH = (b - a) / 3600000;
            total = `${diffH.toFixed(2)} h`;
            }

            rows.push({
            employee: name === "—" ? "—" : `${name}`,
            date,
            in: firstIn?.time || null,
            out: firstOut?.time || null,
            total
            });
        }
        });

        // ordenar por fecha desc
        rows.sort((a,b) => (b.date.localeCompare(a.date)) || (a.employee.localeCompare(b.employee)));
        return rows;
    };

    const renderHours = () => {
        const rows = computeHoursRows();

        hoursTbody.innerHTML = rows.map(r => `
        <tr>
            <td><b>${esc(r.employee)}</b></td>
            <td>${esc(r.date)}</td>
            <td>${r.in ? `<span class="emp-badge ok"><i class="fa-solid fa-right-to-bracket"></i> ${esc(formatHM(r.in))}</span>` : "—"}</td>
            <td>${r.out ? `<span class="emp-badge warn"><i class="fa-solid fa-right-from-bracket"></i> ${esc(formatHM(r.out))}</span>` : "—"}</td>
            <td><b>${esc(r.total)}</b></td>
        </tr>
        `).join("");

        if (rows.length === 0) {
        hoursTbody.innerHTML = `
            <tr>
            <td colspan="5" class="emp-muted">
                No hay fichajes aún. Haz fichaje en la página de trabajador para que aparezca aquí.
            </td>
            </tr>
        `;
        }
    };

    // ===== Demo seed =====
    const seedEmployeesIfEmpty = () => {
        const list = readEmployees();
        if (list.length) return;

        writeEmployees([
        { id: uid(), name: "Marta López", email: "trabajador@marta.com", job: "Obrador", password: "1234" },
        { id: uid(), name: "Juan Pérez", email: "empleado@juan.com", job: "Atención al cliente", password: "1234" },
        ]);
    };

    const seedOrdersIfPossible = () => {
        // Si existe Store.orders, añadimos una tanda para que haya beneficios.
        if (!hasStore() || !Store.KEYS?.orders || typeof Store.write !== "function" || typeof Store.list !== "function") return;

        const base = Store.list(Store.KEYS.orders) || [];
        const now = new Date();

        const mk = (minsAgo, customer, items, status, amount) => ({
        id: uid(),
        dateISO: new Date(now.getTime() - minsAgo * 60000).toISOString(),
        customer, items, status, amount
        });

        const demo = [
        mk(60, "Lucía", "1x Tarta queso", "Entregado", 24.50),
        mk(180, "Andrés", "12x Palmeras", "Pendiente", 18.00),
        mk(1440 * 2, "Sofía", "1x Tarta chocolate", "Entregado", 29.90),
        ];

        Store.write(Store.KEYS.orders, demo.concat(base));
    };

    const seedTimeclockDemo = () => {
        // si no existe fichaje, añadimos un día demo (localStorage directo y también Store si hay)
        const tc = getTimeclock();
        const hasToday = tc.some(x => x.date === todayKey);

        if (!hasToday) {
        const demoDay = {
            date: todayKey,
            entries: [
            { type: "out", time: "14:05:00", employeeEmail: "trabajador@marta.com", employeeName: "Marta López" },
            { type: "in", time: "08:02:00", employeeEmail: "trabajador@marta.com", employeeName: "Marta López" },
            ]
        };
        tc.unshift(demoDay);

        // intentar guardar en Store o fallback
        if (hasStore() && Store.KEYS?.timeclock && typeof Store.write === "function") {
            Store.write(Store.KEYS.timeclock, tc);
        } else {
            localStorage.setItem("lama_timeclock", JSON.stringify(tc));
        }
        }
    };

    // ===== Events =====
    btnSeedDemo?.addEventListener("click", () => {
        seedEmployeesIfEmpty();
        seedOrdersIfPossible();
        seedTimeclockDemo();
        renderAll();
    });

    btnCreateEmployee?.addEventListener("click", () => openModal("create"));

    btnClose?.addEventListener("click", closeModal);
    btnCancel?.addEventListener("click", closeModal);
    modalBackdrop?.addEventListener("click", (e) => { if (e.target === modalBackdrop) closeModal(); });

    document.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        const list = readEmployees();
        const emp = list.find(x => x.id === id);

        if (action === "edit-emp" && emp) {
        openModal("edit", emp);
        return;
        }

        if (action === "del-emp" && emp) {
        const ok = confirm("¿Seguro que quieres borrar este empleado?");
        if (!ok) return;
        writeEmployees(list.filter(x => x.id !== id));
        renderEmployees();
        return;
        }
    });

    employeeForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        const id = empId.value.trim();
        const name = empName.value.trim();
        const email = empEmail.value.trim().toLowerCase();
        const job = empJob.value.trim();
        const password = empPass.value.trim();

        if (!name || !email || !password) return;

        // Recomendación fuerte por tu login:
        const okPrefix = email.startsWith("trabajador@") || email.startsWith("empleado@");
        if (!okPrefix) {
        alert("Para que el rol sea 'trabajador', el email debe empezar por trabajador@ o empleado@");
        return;
        }

        const list = readEmployees();

        // evitar duplicados por email
        const emailUsed = list.some(x => x.email === email && x.id !== id);
        if (emailUsed) {
        alert("Ya existe un empleado con ese email.");
        return;
        }

        if (!id) {
        list.unshift({ id: uid(), name, email, job, password, createdAt: Date.now() });
        writeEmployees(list);
        } else {
        const idx = list.findIndex(x => x.id === id);
        if (idx !== -1) {
            list[idx] = { ...list[idx], name, email, job, password };
            writeEmployees(list);
        }
        }

        closeModal();
        renderEmployees();
    });

    // ===== Render =====
    const renderAll = () => {
        computeProfit();
        renderEmployees();
        renderHours();
    };

    // Init
    renderAll();
})();
