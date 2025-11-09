module.exports = (app) => {
    const admin = require('../controllers/admin.controller');


    app.post('/api/createAdmin', admin.createAdmin);

    // Admin login
    app.post('/api/adminLogin', admin.adminLogin);

    // Add new supplier
    app.post('/api/addGasSupplier', admin.addSupplier);

    // GET: Fetch all suppliers
    app.get("/api/getGasSuppliers", admin.getSuppliers);

    // Update supplier
    app.put("/api/updateGasSupplier/:id", admin.updateSupplier);

    // Delete supplier
    app.delete("/api/deleteGasSupplier/:id", admin.deleteSupplier);

    // ✅ New search route
    app.get("/api/searchGasSuppliers", admin.searchSuppliers);

    // GET: Fetch all count suppliers
    app.get("/api/getGasSuppliersCount", admin.getCountSuppliers);


    // ----------------  Vendore Route ----------------------------------

    app.post("/api/addVendorSupplier", admin.addVendorSupplier);
    app.get("/api/getVendorSuppliers", admin.getVendorSuppliers);
    app.put("/api/updateVendorSupplier/:id", admin.updateVendorSupplier);
    app.delete("/api/deleteVendorSupplier/:id", admin.deleteVendorSupplier);
    app.get("/api/searchGasVendorSuppliers", admin.searchVendorSuppliers);
    app.get("/api/getCountVendors", admin.getCountVendors);

    // -----------------Stock route----------------------------

    // Add one stock record
app.post("/api/addStock", admin.addStock);

// Get the only stock record
app.get("/api/getStock", admin.getStock);

// Update the only stock record
app.put("/api/updateStock", admin.updateStock);

// Delete the only stock record
app.delete("/api/deleteStock", admin.deleteStock);
}