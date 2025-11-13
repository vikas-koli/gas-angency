import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";
import AdminLayout from "../layout/admin-layout";
import {
  deleteApihandler,
  getApihandler,
  postApihandler,
  putApihandler, // 👈 make sure this exists in your api-handler
} from "../api-handler";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";




// ---------- Modal styling ----------
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

export default function ClientData() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);



  const [formData, setFormData] = useState({
    party_name: "",
    no_of_tanki: "",
    empty_tanki_return: "",
    total_amount: "",
    online_payment: "",
    cash_payment: "",
    cynlder_rate: "",
    remaining_tanki: "",
    remaining_cylinder_date: "",
    payment_date: "",
    remarks: "",
  });


  // Fetch Data
  const getData = useCallback(async () => {
    const res = await getApihandler("/getGasSuppliers");
    console.log("res", res);

    if (res.data) {
      setData(res.data);
    }
  }, []);



  useEffect(() => {
    getData();
  }, [getData]);

  const handleSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        getData(); // if search is cleared, show all
        return;
      }
      try {
        const res = await getApihandler(`/searchGasSuppliers?query=${query}`);
        console.log("res search==>", res);

        if (res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      }
    },
    [getData]
  );




  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500); // wait 0.5s before searching
    return () => clearTimeout(delay);
  }, [searchQuery, handleSearch]);


  // Input change handler
  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    const updated = { ...prev, [name]: value };

    // Total Amount
    const rate = parseFloat(name === "cynlder_rate" ? value : updated.cynlder_rate);
    const qty = parseFloat(name === "no_of_tanki" ? value : updated.no_of_tanki);
    if (!isNaN(rate) && !isNaN(qty)) updated.total_amount = rate * qty;

    // Remaining Cylinder
    const empty = parseFloat(name === "empty_tanki_return" ? value : updated.empty_tanki_return);
    if (!isNaN(qty) && !isNaN(empty)) updated.remaining_tanki = qty - empty;

    // Remaining Payment
    const total = parseFloat(updated.total_amount) || 0;
    const cash = parseFloat(updated.cash_payment) || 0;
    const online = parseFloat(updated.online_payment) || 0;
    updated.remaining_payment = total - (cash + online);

    return updated;
  });
};



  // ---------- ADD / UPDATE SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;

      if (isEditMode) {
        // ✅ Update existing record
        res = await putApihandler(`/updateGasSupplier/${editId}`, formData);
      } else {
        // ✅ Add new record
        res = await postApihandler("/addGasSupplier", formData);
      }

      if (res.success === true || res.status === 200) {
        Swal.fire({
          title: "Success!",
          text: isEditMode
            ? "Client data has been updated successfully."
            : "Client data has been added successfully.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });

        // Close modal & reset form
        setOpen(false);
        setIsEditMode(false);
        setEditId(null);
        setFormData({
          party_name: "",
          no_of_tanki: "",
          empty_tanki_return: "",
          total_amount: "",
          online_payment: "",
          cash_payment: "",
          payment_date: "",
          remarks: "",
        });

        // ✅ Refresh table instantly (no reload)
        getData();
      }
    } catch (error) {
      console.error("Error saving client:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to save client data. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    try {
      const res = await deleteApihandler(`/deleteGasSupplier/${id}`);
      console.log("res", res);

      if (res.success === true) {
        Swal.fire({
          title: "Data deleted successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        getData(); // ✅ Refresh after delete
      } else {
        Swal.fire({
          title: "Failed to delete data",
          icon: "error",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Server error",
        text: err.message || "Something went wrong",
        icon: "error",
      });
    }
  };

  // ---------- EDIT ----------
const handleEdit = (item) => {
  const totalAmount = parseFloat(item.total_amount) || 0;
  const onlinePayment = parseFloat(item.online_payment) || 0;
  const cashPayment = parseFloat(item.cash_payment) || 0;

  setFormData({
    party_name: item.party_name || "",
    no_of_tanki: item.no_of_tanki || "",
    empty_tanki_return: item.empty_tanki_return || "",
    cynlder_rate: item.cynlder_rate || "",
    total_amount: totalAmount,
    online_payment: onlinePayment,
    cash_payment: cashPayment,
    remaining_tanki: item.remaining_tanki || 0,
    remaining_payment: totalAmount - (onlinePayment + cashPayment), // ✅ Fix remaining payment
    remaining_cylinder_date: item.remaining_cylinder_date
      ? new Date(item.remaining_cylinder_date).toISOString().split("T")[0]
      : "",
    payment_date: item.payment_date
      ? new Date(item.payment_date).toISOString().split("T")[0]
      : "",
    remarks: item.remarks || "",
  });

  setEditId(item._id);
  setIsEditMode(true);
  setOpen(true);
};


  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Client Data Report", 14, 15);

    const columns = [
      "Client Name",
      "Cylinder Rate (₹)",
      "Filled Cylinders",
      "Empty Cylinders",
      "Total Amount (₹)",
      "Online Payment (₹)",
      "Cash Payment (₹)",
      "Remaining Cylinders",
      "Remaining Cylinder Date",
      "Remaining Amount (₹)",
      "Payment Date",
      "Remarks",
    ];

    const rows = data.map((item) => [
      item.party_name || "",
      item.cynlder_rate || "",
      item.no_of_tanki || "",
      item.empty_tanki_return || "",
      item.total_amount || "",
      item.online_payment || "",
      item.cash_payment || "",
      item.remaining_tanki || "",
      item.remaining_cylinder_date
        ? new Date(item.remaining_cylinder_date).toLocaleDateString()
        : "--",
      item.remaining_payment || "",
      item.payment_date
        ? new Date(item.payment_date).toLocaleDateString()
        : "--",
      item.remarks || "—",
    ]);

    // ✅ Correct way to call the function
    autoTable(doc, {
      startY: 25,
      head: [columns],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 2, 97], textColor: 255 },
    });

    doc.text("Summary Totals:", 14, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Cylinders: ${totalNoOfTanki}`, 14, doc.lastAutoTable.finalY + 18);
    doc.text(`Empty Cylinders: ${totalEmptyTanki}`, 14, doc.lastAutoTable.finalY + 26);
    doc.text(`Total Amount: ₹${totalAmount}`, 14, doc.lastAutoTable.finalY + 34);
    doc.text(`Online Payment: ₹${totalOnlinePayment}`, 14, doc.lastAutoTable.finalY + 42);
    doc.text(`Cash Payment: ₹${totalCashPayment}`, 14, doc.lastAutoTable.finalY + 50);
    doc.text(`Remaining Amount: ₹${totalRemainingAmount}`, 14, doc.lastAutoTable.finalY + 58);

    doc.save("ClientDataReport.pdf");
  };



  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  // ✅ Calculate totals
  const totalEmptyTanki = data.reduce((sum, item) => sum + (Number(item.empty_tanki_return) || 0), 0);
  const totalNoOfTanki = data.reduce((sum, item) => sum + (Number(item.no_of_tanki) || 0), 0);
  const totalRemainingAmount = data.reduce(
    (sum, item) => sum + Math.abs(Number(item.remaining_payment) || 0),
    0
  );
  const totalAmount = data.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
  const totalOnlinePayment = data.reduce((sum, item) => sum + (Number(item.online_payment) || 0), 0);
  const totalCashPayment = data.reduce((sum, item) => sum + (Number(item.cash_payment) || 0), 0);


  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Client Data
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <TextField
            label="Search by Party Name"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              handleSearch(value);
            }}
            sx={{ width: "300px" }}
          />

          <Button
            variant="contained"
            style={{ background: "#000261" }}
            onClick={() => {
              setOpen(true);
              setIsEditMode(false);
              setFormData({
                party_name: "",
                no_of_tanki: "",
                empty_tanki_return: "",
                total_amount: "",
                online_payment: "",
                cash_payment: "",
                payment_date: "",
                remarks: "",
              });
            }}
          >
            Add Client Data
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>

        </Box>


        {/* ---------- Modal ---------- */}
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" mb={2}>
              {isEditMode ? "Edit Client Record" : "Add Client Record"}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Party Name"
                  name="party_name"
                  value={formData.party_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Cylinder Rate"
                  name="cynlder_rate"
                  type="number"
                  value={formData.cynlder_rate}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="No. of Cylinder"
                  name="no_of_tanki"
                  type="number"
                  value={formData.no_of_tanki}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Empty Cylinder Return"
                  name="empty_tanki_return"
                  type="number"
                  value={formData.empty_tanki_return}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Remaining Cylinder"
                  name="remaining_tanki"
                  type="number"
                  value={formData.remaining_tanki}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Total Amount"
                  name="total_amount"
                  type="number"
                  value={formData.total_amount}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Online Payment"
                  name="online_payment"
                  type="number"
                  value={formData.online_payment}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Cash Payment"
                  name="cash_payment"
                  type="number"
                  value={formData.cash_payment}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Remaining Amount"
                  name="remaining_payment"
                  type="number"
                  value={formData.remaining_payment}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }} // ✅ this fixes overlapping label
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Payment Date"
                  name="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Remaining Cylinder Date"
                  name="remaining_cylinder_date"
                  type="date"
                  value={formData.remaining_cylinder_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Remarks"
                  name="remarks"
                  multiline
                  rows={4}
                  value={formData.remarks}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <Button
                onClick={() => setOpen(false)}
                color="secondary"
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                style={{ background: "#000261" }}
                type="submit"
              >
                {isEditMode ? "Update" : "Save"}
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* ---------- Table ---------- */}
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table sx={{ minWidth: 1200 }} aria-label="client table">
            <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
              <TableRow>
                <TableCell><strong>Client Name</strong></TableCell>
                <TableCell><strong>Cylinder Rate (₹)</strong></TableCell>
                <TableCell><strong>19kg Filled Cylinders</strong></TableCell>
                <TableCell><strong>19kg Empty Cylinders</strong></TableCell>
                <TableCell><strong>Total Amount (₹)</strong></TableCell>
                <TableCell><strong>Online Payment (₹)</strong></TableCell>
                <TableCell><strong>Cash Payment (₹)</strong></TableCell>
                <TableCell><strong>Remaining Cylinders</strong></TableCell>
                <TableCell><strong>Remaining Cylinder Date</strong></TableCell>
                <TableCell><strong>Remaining Amount (₹)</strong></TableCell>
                <TableCell><strong>Payment Date</strong></TableCell>
                <TableCell><strong>Remarks</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data?.length > 0 ? (
                <>
                  {data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, index) => (
                      <TableRow key={item._id || index}>
                        <TableCell>{item.party_name}</TableCell>
                        <TableCell>{item.cynlder_rate}/-</TableCell>
                        <TableCell>{item.no_of_tanki}</TableCell>
                        <TableCell>{item.empty_tanki_return}</TableCell>
                        <TableCell>{item.total_amount}/-</TableCell>
                        <TableCell>{item.online_payment}/-</TableCell>
                        <TableCell>{item.cash_payment}/-</TableCell>
                        <TableCell>{item.remaining_tanki}</TableCell>
                        <TableCell>
                          {item.remaining_cyliender_date
                            ? new Date(item.remaining_cyliender_date).toLocaleDateString()
                            : "--"}
                        </TableCell>

                        <TableCell>{item.remaining_payment}/-</TableCell>
                        <TableCell>
                          {item.payment_date
                            ? new Date(item.payment_date).toLocaleDateString()
                            : "--"}
                        </TableCell>
                        <TableCell style={{ width: '1200px' }}>
                          <div style={{
                            maxHeight: '100px',
                            overflowY: 'auto',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                          }}>
                            {item.remarks || "—"}
                          </div>
                        </TableCell>

                        {/* Edit / Delete Buttons */}
                        <TableCell>
                          <EditIcon
                            color="primary"
                            style={{ cursor: "pointer", marginRight: 10 }}
                            onClick={() => handleEdit(item)}
                          />
                          <DeleteIcon
                            color="error"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              Swal.fire({
                                title: "Are you sure?",
                                text: "This action cannot be undone!",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#d33",
                                cancelButtonColor: "#3085d6",
                                confirmButtonText: "Yes, delete it!",
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  handleDelete(item._id);
                                }
                              });
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* ✅ Total Summary Row */}
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell colSpan={2} align="right">
                      <strong>Totals:</strong>
                    </TableCell>
                    <TableCell><strong>{totalNoOfTanki}</strong></TableCell>
                    <TableCell><strong>{totalEmptyTanki}</strong></TableCell>
                    <TableCell><strong>{totalAmount}/-</strong></TableCell>
                    <TableCell><strong>{totalOnlinePayment}/-</strong></TableCell>
                    <TableCell><strong>{totalCashPayment}/-</strong></TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell><strong>{totalRemainingAmount}/-</strong></TableCell>
                    <TableCell colSpan={3}></TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    No client data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* ✅ Pagination */}
          <TablePagination
            component="div"
            count={data.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>


      </Box>
    </AdminLayout>
  );
}
