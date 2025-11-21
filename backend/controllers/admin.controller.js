const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
const admin = require("../models/admin.model");
const GasAgencySupplier = require('../models/addTankidata.model');
const VendorSupplier = require("../models/vendordata.model");
const Stock = require("../models/stock.model");

// Generate JWT token
function generateToken(userid) {
  return jwt.sign({ id: userid }, config.secret, { expiresIn: 15552000 }); // ~180 days
}

// Create Admin
exports.createAdmin = async (req, res) => {
  try {
    const { admin_Name, admin_Email, password } = req.body;

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!admin_Email) {
      return res.status(400).send({ message: "Email is required", status: 400 });
    }
    if (!emailRegex.test(admin_Email)) {
      return res.status(400).send({ message: "Please provide a valid Email address", status: 400 });
    }
    if (!admin_Name) {
      return res.status(400).send({ message: "Admin name is required", status: 400 });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is required", status: 400 });
    }

    const existingAdmin = await admin.findOne({ admin_Email }).lean();
    if (existingAdmin) {
      return res.status(409).send({ message: "Email already exists", status: 409 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const data = await admin.create({
      admin_Name,
      admin_Email: admin_Email.toLowerCase(),
      password: hashedPassword
    });

    return res.status(200).send({
      data,
      message: "Congratulations! Your account has been created successfully!",
      status: 200
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message || "Some error occurred while creating an account",
      status: 500
    });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { admin_Email, password } = req.body;

    if (!admin_Email || !password) {
      return res.status(400).send({
        message: "Please provide both admin email and password.",
        status: 400
      });
    }

    const foundAdmin = await admin.findOne({ admin_Email: admin_Email.toLowerCase(), deleteFlag: false });
    if (!foundAdmin) {
      return res.status(404).send({ message: "Email does not exist.", status: 404 });
    }

    const passwordIsValid = bcrypt.compareSync(password, foundAdmin.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid password!", status: 401 });
    }

    const token = generateToken(foundAdmin._id);
    return res.status(200).send({ accessToken: token, data: foundAdmin, status: 200 });
  } catch (error) {
    res.status(500).send({ message: "Internal server error.", status: 500 });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { admin_Email, oldPassword, newPassword } = req.body;

    // 1️⃣ Check required fields
    if (!admin_Email || !oldPassword || !newPassword) {
      return res.status(400).send({
        message: "Please provide email, old password, and new password.",
        status: 400
      });
    }

    // 2️⃣ Find admin
    const foundAdmin = await admin.findOne({ admin_Email: admin_Email.toLowerCase(), deleteFlag: false });
    if (!foundAdmin) {
      return res.status(404).send({ message: "Admin not found.", status: 404 });
    }

    // 3️⃣ Verify old password
    const passwordIsValid = bcrypt.compareSync(oldPassword, foundAdmin.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Old password is incorrect.", status: 401 });
    }

    // 4️⃣ Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // 5️⃣ Update password in database
    foundAdmin.password = hashedPassword;
    await foundAdmin.save();

    // 6️⃣ Success response
    return res.status(200).send({
      message: "Password changed successfully.",
      status: 200
    });

  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).send({
      message: "Internal server error.",
      status: 500
    });
  }
};


// Add new gas supplier record
exports.addSupplier = async (req, res) => {
  try {
    const {
      party_name,
      remaining_tanki,
      no_of_tanki,
      empty_tanki_return,
      total_amount,
      online_payment = 0,
      cash_payment = 0,
      previos_payment = 0,   // <-- ADD THIS
      payment_date,
      cynlder_rate,
      remaining_cyliender_date,
      remarks
    } = req.body;


    // Validate required fields
    if (!party_name || !no_of_tanki || !total_amount) {
      return res.status(400).json({
        success: false,
        message: "party_name, no_of_tanki, and total_amount are required"
      });
    }

    // Calculate remaining payment (can be negative)
    const totalPaid = Number(online_payment) + Number(cash_payment) + Number(previos_payment);
    const remaining_payment = Number(total_amount) - totalPaid;
    // If totalPaid > total_amount => remaining_payment will be negative automatically

    const newSupplier = new GasAgencySupplier({
      party_name,
      remaining_tanki, 
      no_of_tanki,
      empty_tanki_return,
      total_amount,
      online_payment,
      cash_payment,
      previos_payment,   // <-- ADD THIS
      remaining_payment,
      payment_date,
      remaining_cyliender_date,
      cynlder_rate,
      remarks
    });


    const savedData = await newSupplier.save();

    res.status(201).json({
      success: true,
      message: "Gas supplier details added successfully!",
      data: savedData
    });
  } catch (error) {
    console.error("Error adding supplier:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding supplier",
      error: error.message
    });
  }
};


// Get all gas supplier records
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await GasAgencySupplier.find().sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      message: "Gas supplier list fetched successfully!",
      data: suppliers,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching supplier list",
      error: error.message,
    });
  }
};

// Update gas supplier record
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params; // supplier ID from URL
    const updateData = req.body;

    // Check if supplier exists
    const supplier = await GasAgencySupplier.findById(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // Calculate remaining payment if payment fields or total_amount are updated
    const total_amount = updateData.total_amount ?? supplier.total_amount;
    const online_payment = updateData.online_payment ?? supplier.online_payment ?? 0;
    const cash_payment = updateData.cash_payment ?? supplier.cash_payment ?? 0;
    const previos_payment = updateData.previos_payment ?? supplier.previos_payment ?? 0;

    // Calculate new remaining payment (can be negative)
    const totalPaid = Number(online_payment) + Number(cash_payment) + Number(previos_payment);
    const remaining_payment = Number(total_amount) - totalPaid;

    // Include the calculated remaining_payment in the update data
    updateData.remaining_payment = remaining_payment;

    // Update the supplier
    const updatedSupplier = await GasAgencySupplier.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: updatedSupplier,
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating supplier",
      error: error.message,
    });
  }
};


// Delete gas supplier record
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await GasAgencySupplier.findById(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    await GasAgencySupplier.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting supplier",
      error: error.message,
    });
  }
};

// Search gas suppliers
exports.searchSuppliers = async (req, res) => {
  try {
    const { query } = req.query; // e.g., /searchGasSuppliers?query=abc

    // If no query, return all
    if (!query || query.trim() === "") {
      const allSuppliers = await GasAgencySupplier.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "All suppliers fetched successfully!",
        data: allSuppliers,
      });
    }

    // Detect if the query looks numeric
    const isNumeric = !isNaN(query);

    // Build search filter dynamically
    const searchFilter = isNumeric
      ? {
        $or: [
          { total_amount: Number(query) },
          { cash_payment: Number(query) },
          { online_payment: Number(query) },
        ],
      }
      : {
        $or: [
          { party_name: { $regex: query, $options: "i" } },
          { remarks: { $regex: query, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $dateToString: { format: "%Y-%m-%d", date: "$payment_date" } },
                regex: query,
                options: "i",
              },
            },
          },
        ],
      };

    const suppliers = await GasAgencySupplier.find(searchFilter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: `Found ${suppliers.length} supplier(s) matching "${query}"`,
      data: suppliers,
    });
  } catch (error) {
    console.error("Error searching suppliers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching suppliers",
      error: error.message,
    });
  }
};



// Get all gas supplier records with stats
exports.getCountSuppliers = async (req, res) => {
  try {
    const suppliers = await GasAgencySupplier.find().sort({ createdAt: -1 }); // latest first

    // --- Date boundaries ---
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date();
    startOfMonth.setMonth(startOfMonth.getMonth() - 1); // last 1 month from now

    // --- Calculate Counts ---
    const totalCount = suppliers.length;
    const todayCount = suppliers.filter(
      (s) => new Date(s.createdAt) >= startOfToday
    ).length;
    const lastMonthCount = suppliers.filter(
      (s) => new Date(s.createdAt) >= startOfMonth
    ).length;

    // --- Calculate Amounts ---
    const totalAmount = suppliers.reduce(
      (sum, s) => sum + (Number(s.total_amount) || 0),
      0
    );
    const todayAmount = suppliers.reduce((sum, s) => {
      return new Date(s.createdAt) >= startOfToday
        ? sum + (Number(s.total_amount) || 0)
        : sum;
    }, 0);
    const lastMonthAmount = suppliers.reduce((sum, s) => {
      return new Date(s.createdAt) >= startOfMonth
        ? sum + (Number(s.total_amount) || 0)
        : sum;
    }, 0);

    // --- Send response ---
    res.status(200).json({
      success: true,
      message: "Gas supplier list fetched successfully!",
      stats: {
        todayCount,
        lastMonthCount,
        totalCount,
        todayAmount,
        lastMonthAmount,
        totalAmount,
      },
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching supplier list",
      error: error.message,
    });
  }
};



// ==================================
// ✅ Add Vendor Supplier
// ==================================
// Add new vendor supplier record
exports.addVendorSupplier = async (req, res) => {
  try {
    const {
      party_name,
      remaining_tanki,
      no_of_tanki,
      empty_tanki_return,
      total_amount,
      online_payment = 0,
      cash_payment = 0,
      previos_payment = 0,   // <-- ADD THIS
      payment_date,
      remaining_cyliender_date,
      remarks,
      cynlder_rate,
    } = req.body;

    // Validation
    if (!party_name || !no_of_tanki || !total_amount) {
      return res.status(400).json({
        success: false,
        message: "party_name, no_of_tanki, and total_amount are required",
      });
    }

    // ✅ Calculate remaining payment (can be negative)
    const totalPaid = Number(online_payment) + Number(cash_payment) + Number(previos_payment);
    const remaining_payment = Number(total_amount) - totalPaid;

    // Create new vendor record
    const vendor = new VendorSupplier({
      party_name,
      no_of_tanki,
      empty_tanki_return,
      total_amount,
      online_payment,
      cash_payment,
      previos_payment,   // <-- ADD THIS
      remaining_payment,
      payment_date,
      cynlder_rate,
      remarks,
      remaining_tanki,
      remaining_cyliender_date,
    });


    await vendor.save();

    res.status(201).json({
      success: true,
      message: "Vendor supplier added successfully!",
      data: vendor,
    });
  } catch (error) {
    console.error("Error adding vendor supplier:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add vendor supplier",
      error: error.message,
    });
  }
};

// ==================================
// ✅ Get All Vendor Suppliers (excluding deleted)
// ==================================
exports.getVendorSuppliers = async (req, res) => {
  try {
    const vendors = await VendorSupplier.find({ deleteFlag: false }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Vendor suppliers fetched successfully!",
      data: vendors,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching vendors",
      error: error.message,
    });
  }
};

// ==================================
// ✅ Update Vendor Supplier by ID
// ==================================
exports.updateVendorSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the vendor first
    const vendor = await VendorSupplier.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor supplier not found!",
      });
    }

    // Calculate new remaining_payment (can be negative)
    const total_amount = updateData.total_amount ?? vendor.total_amount;
    const previos_payment = updateData.previos_payment ?? vendor.previos_payment ?? 0;
    const online_payment = updateData.online_payment ?? vendor.online_payment ?? 0;
    const cash_payment = updateData.cash_payment ?? vendor.cash_payment ?? 0;
    const totalPaid = Number(online_payment) + Number(cash_payment) + Number(previos_payment);
    const remaining_payment = Number(total_amount) - totalPaid;

    // Set the new calculated value
    updateData.remaining_payment = remaining_payment;

    // Update the vendor record
    const updatedVendor = await VendorSupplier.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Vendor supplier updated successfully!",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor supplier:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update vendor supplier",
      error: error.message,
    });
  }
};


// ==================================
// ✅ Soft Delete Vendor Supplier
// ==================================
// Permanently delete vendor supplier record
exports.deleteVendorSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Permanently delete the record
    const vendor = await VendorSupplier.findByIdAndDelete(id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor supplier not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor supplier deleted permanently!",
    });
  } catch (error) {
    console.error("Error deleting vendor supplier:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete vendor supplier",
      error: error.message,
    });
  }
};



// vendor search api

// Search gas vendor suppliers
exports.searchVendorSuppliers = async (req, res) => {
  try {
    const { query } = req.query; // e.g., /searchGasSuppliers?query=abc

    // If no query, return all
    if (!query || query.trim() === "") {
      const allSuppliers = await VendorSupplier.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "All suppliers fetched successfully!",
        data: allSuppliers,
      });
    }

    // Detect if the query looks numeric
    const isNumeric = !isNaN(query);

    // Build search filter dynamically
    const searchFilter = isNumeric
      ? {
        $or: [
          { total_amount: Number(query) },
          { cash_payment: Number(query) },
          { online_payment: Number(query) },
        ],
      }
      : {
        $or: [
          { party_name: { $regex: query, $options: "i" } },
          { remarks: { $regex: query, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $dateToString: { format: "%Y-%m-%d", date: "$payment_date" } },
                regex: query,
                options: "i",
              },
            },
          },
        ],
      };

    const suppliers = await GasAgencySupplier.find(searchFilter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: `Found ${suppliers.length} supplier(s) matching "${query}"`,
      data: suppliers,
    });
  } catch (error) {
    console.error("Error searching suppliers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching suppliers",
      error: error.message,
    });
  }
};


// Get all vendor records with stats
exports.getCountVendors = async (req, res) => {
  try {
    const vendors = await VendorSupplier.find().sort({ createdAt: -1 }); // latest first

    // --- Date boundaries ---
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date();
    startOfMonth.setMonth(startOfMonth.getMonth() - 1); // last 1 month from now

    // --- Calculate Counts ---
    const totalCount = vendors.length;
    const todayCount = vendors.filter(
      (v) => new Date(v.createdAt) >= startOfToday
    ).length;
    const lastMonthCount = vendors.filter(
      (v) => new Date(v.createdAt) >= startOfMonth
    ).length;

    // --- Calculate Amounts ---
    const totalAmount = vendors.reduce(
      (sum, v) => sum + (Number(v.total_amount) || 0),
      0
    );
    const todayAmount = vendors.reduce((sum, v) => {
      return new Date(v.createdAt) >= startOfToday
        ? sum + (Number(v.total_amount) || 0)
        : sum;
    }, 0);
    const lastMonthAmount = vendors.reduce((sum, v) => {
      return new Date(v.createdAt) >= startOfMonth
        ? sum + (Number(v.total_amount) || 0)
        : sum;
    }, 0);

    // --- Send response ---
    res.status(200).json({
      success: true,
      message: "Vendor list fetched successfully!",
      stats: {
        todayCount,
        lastMonthCount,
        totalCount,
        todayAmount,
        lastMonthAmount,
        totalAmount,
      },
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching vendor list",
      error: error.message,
    });
  }
};

// Stock data api 

// ✅ Add Stock (only one allowed)
exports.addStock = async (req, res) => {
  try {
    const existing = await Stock.findOne();
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Stock record already exists. Please update instead.",
      });
    }

    const { total_stock, selling_stock, pending_stock } = req.body;

    if (!total_stock) {
      return res
        .status(400)
        .json({ success: false, message: "Total stock is required." });
    }

    const stock = new Stock({
      total_stock,
      selling_stock,
      pending_stock: pending_stock || total_stock - (selling_stock || 0),
    });

    const saved = await stock.save();

    res.status(201).json({
      success: true,
      message: "Stock record added successfully!",
      data: saved,
    });
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding stock",
      error: error.message,
    });
  }
};

// ✅ Get Stock (only one)
exports.getStock = async (req, res) => {
  try {
    const stock = await Stock.findOne();
    if (!stock) {
      return res
        .status(404)
        .json({ success: false, message: "No stock record found" });
    }

    res.status(200).json({ success: true, data: stock });
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching stock",
      error: error.message,
    });
  }
};

// ✅ Update Stock
exports.updateStock = async (req, res) => {
  try {
    const stock = await Stock.findOne();
    if (!stock) {
      return res
        .status(404)
        .json({ success: false, message: "Stock record not found" });
    }

    const { total_stock, selling_stock } = req.body;

    // Update values
    if (total_stock !== undefined) stock.total_stock = total_stock;
    if (selling_stock !== undefined) stock.selling_stock = selling_stock;

    // Auto-calculate pending stock
    stock.pending_stock =
      stock.total_stock - (stock.selling_stock || 0);

    const updated = await stock.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully!",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating stock",
      error: error.message,
    });
  }
};

// ✅ Delete Stock (optional)
exports.deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findOne();
    if (!stock) {
      return res
        .status(404)
        .json({ success: false, message: "No stock record to delete" });
    }

    await Stock.deleteOne({ _id: stock._id });

    res
      .status(200)
      .json({ success: true, message: "Stock record deleted successfully" });
  } catch (error) {
    console.error("Error deleting stock:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting stock",
      error: error.message,
    });
  }
};


