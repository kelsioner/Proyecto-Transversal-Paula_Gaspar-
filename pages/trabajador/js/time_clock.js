// /pages/trabajador/js/time_clock.js
(() => {
    const $ = (id) => document.getElementById(id);

    const pad = (n) => String(n).padStart(2, "0");
    const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const hms = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const hm = (t) => (t || "").slice(0, 5);

    const esc = (s) =>
        (s ?? "")
        .toString()
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

    // ---------- Storage ----------
    // Preferimos Store si existe; si no, fallback a localStorage
    const LS_KEY = "lama_timeclock";

    const hasStore = () =>
        window.Store &&
        (typeof Store.read === "function" || typeof Store.list === "function") &&
        Store.KEYS?.timeclock;

    const readAll = () => {
        if (hasStore() && typeof Store.read === "function") {
        return Store.read(Store.KEYS.timeclock, []);
        }
        try {
        return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
        } catch {
        return [];
        }
    };

    const writeAll = (data) => {
        if (hasStore() && typeof Store.write === "function") {
        Store.write(Store.KEYS.timeclock, data);
        return;
        }
        localStorage.setItem(LS_KEY, JSON.stringify(data));
    };

    // ---------- Auth user ----------
    const getCurrentEmployee = () => {
        const u = window.Auth?.getUser?.();
        const email = u?.email || "—";
        const name = u?.name || email;
        return { employeeEmail: email, employeeName: name };
    };

    // ---------- UI ----------
    const clockBtn = $("clockBtn");
    const todayList = $("todayList");
    const btnClear = $("btnClear");

    const today = ymd(new Date());

    const ensureDay = (all) => {
        let day = all.find((x) => x.date === today);
        if (!day) {
        day = { date: today, entries: [] };
        all.unshift(day);
        }
        if (!Array.isArray(day.entries)) day.entries = [];
        return day;
    };

    const getTodayEntries = () => {
        const all = readAll();
        const day = ensureDay(all);
        return { all, day, entries: day.entries };
    };

    const lastTypeToday = (entries) => {
        if (!entries.length) return null;
        // Orden por hora (por si hay algo raro)
        const sorted = entries
        .slice()
        .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
        return sorted[sorted.length - 1]?.type || null;
    };

    const setButtonState = () => {
        const { entries } = getTodayEntries();
        const last = lastTypeToday(entries);

        if (!clockBtn) return;

        if (last === "in") {
        clockBtn.textContent = "Registrar Salida";
        clockBtn.classList.remove("in");
        clockBtn.classList.add("out");
        } else {
        clockBtn.textContent = "Registrar Entrada";
        clockBtn.classList.remove("out");
        clockBtn.classList.add("in");
        }
    };

    const renderToday = () => {
        const { entries } = getTodayEntries();
        if (!todayList) return;

        const sorted = entries
        .slice()
        .sort((a, b) => (b.time || "").localeCompare(a.time || "")); // más nuevo arriba

        if (!sorted.length) {
        todayList.innerHTML = `<li><span class="emp-muted">No hay fichajes hoy.</span></li>`;
        return;
        }

        todayList.innerHTML = sorted
        .map((e) => {
            const badgeClass = e.type === "in" ? "ok" : "warn";
            const icon = e.type === "in" ? "fa-right-to-bracket" : "fa-right-from-bracket";
            const label = e.type === "in" ? "Entrada" : "Salida";
            const who = e.employeeName ? ` · ${esc(e.employeeName)}` : "";

            return `
            <li>
                <span class="emp-badge ${badgeClass}">
                <i class="fa-solid ${icon}"></i> ${label}
                </span>
                <span><b>${esc(hm(e.time))}</b><span class="emp-muted">${who}</span></span>
            </li>
            `;
        })
        .join("");
    };

    const addEntry = () => {
        const { all, day, entries } = getTodayEntries();

        const last = lastTypeToday(entries);
        const nextType = last === "in" ? "out" : "in";

        const now = new Date();
        const entry = {
        type: nextType,
        time: hms(now),
        ...getCurrentEmployee(),
        };

        entries.push(entry);
        day.entries = entries;
        writeAll(all);

        setButtonState();
        renderToday();
    };

    const clearToday = () => {
        const all = readAll();
        const day = all.find((x) => x.date === today);
        if (day) day.entries = [];
        writeAll(all);

        setButtonState();
        renderToday();
    };

    // ---------- Events ----------
    clockBtn?.addEventListener("click", addEntry);
    btnClear?.addEventListener("click", () => {
        const ok = confirm("¿Borrar todos los fichajes de hoy?");
        if (!ok) return;
        clearToday();
    });

    // Init
    setButtonState();
    renderToday();
})();
