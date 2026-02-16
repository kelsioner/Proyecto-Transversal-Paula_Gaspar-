// employee_store.js
const Store = (() => {
    const KEYS = {
        products: "lama_products",
        ingredients: "lama_ingredients",
        orders: "lama_orders",
        timeclock: "lama_timeclock"
    };

    const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

    const read = (key, fallback = []) => {
        try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
        } catch {
        return fallback;
        }
    };

    const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

    const seedIfEmpty = () => {
        const products = read(KEYS.products, null);
        const ingredients = read(KEYS.ingredients, null);
        const orders = read(KEYS.orders, null);
        const timeclock = read(KEYS.timeclock, null);

        if (!products) {
        write(KEYS.products, [
            { id: uid(), name: "Croissant", stock: 18, recipe: "Harina, mantequilla, levadura, azúcar, sal." },
            { id: uid(), name: "Tarta de queso", stock: 6, recipe: "Queso crema, huevos, azúcar, galleta, mantequilla." },
            { id: uid(), name: "Palmera chocolate", stock: 12, recipe: "Hojaldre + cobertura de chocolate." }
        ]);
        }
        if (!ingredients) {
        write(KEYS.ingredients, [
            { id: uid(), name: "Harina", stock: 25, supplier: "Molinos La Mancha" },
            { id: uid(), name: "Mantequilla", stock: 10, supplier: "Lácteos Sierra" },
            { id: uid(), name: "Chocolate", stock: 8, supplier: "Cacao Select" }
        ]);
        }
        if (!orders) {
        const now = new Date();
        const d1 = new Date(now.getTime() - 1000 * 60 * 60 * 2);
        const d2 = new Date(now.getTime() - 1000 * 60 * 60 * 26);
        write(KEYS.orders, [
            { id: uid(), dateISO: d1.toISOString(), customer: "María", items: "2x Croissant, 1x Tarta de queso", status: "Pendiente" },
            { id: uid(), dateISO: d2.toISOString(), customer: "Carlos", items: "6x Palmera chocolate", status: "Entregado" }
        ]);
        }
        if (!timeclock) {
        write(KEYS.timeclock, []);
        }
    };

    // Generic CRUD helpers
    const list = (key) => read(key, []);
    const add = (key, obj) => {
        const data = list(key);
        data.unshift(obj);
        write(key, data);
        return obj;
    };
    const update = (key, id, patch) => {
        const data = list(key);
        const idx = data.findIndex(x => x.id === id);
        if (idx !== -1) {
        data[idx] = { ...data[idx], ...patch };
        write(key, data);
        return data[idx];
        }
        return null;
    };
    const remove = (key, id) => {
        const data = list(key).filter(x => x.id !== id);
        write(key, data);
    };

    return { KEYS, uid, seedIfEmpty, list, add, update, remove, read, write };
})();
