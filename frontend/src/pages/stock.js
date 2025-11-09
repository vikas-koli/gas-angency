import React, { useEffect, useState } from "react";
import AdminLayout from "../layout/admin-layout";
import {
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import Swal from "sweetalert2";
import {
  getApihandler,
  postApihandler,
  putApihandler,
  deleteApihandler,
} from "../api-handler";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Stock() {
  const [stock, setStock] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    total_stock: "",
    selling_stock: "",
    pending_stock: "",
  });

  // Fetch stock data
  const fetchStock = async () => {
    const res = await getApihandler("/getStock");
    if (res && !res.error) {
      setStock(res.data);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newData = { ...formData, [name]: value };

    // Auto calculate pending stock
    if (name === "total_stock" || name === "selling_stock") {
      const total = Number(newData.total_stock || 0);
      const selling = Number(newData.selling_stock || 0);
      newData.pending_stock = total - selling;
    }

    setFormData(newData);
  };

  // Add or update stock
  const handleSubmit = async () => {
    if (!formData.total_stock || !formData.selling_stock) {
      Swal.fire("Warning", "Please fill all required fields!", "warning");
      return;
    }

    try {
      if (stock) {
        // Update stock
        const res = await putApihandler("/updateStock", formData);
        if (!res.error) {
          Swal.fire("Success", "Stock updated successfully!", "success");
          fetchStock();
          setOpen(false);
        } else {
          Swal.fire("Error", "Failed to update stock!", "error");
        }
      } else {
        // Add new stock
        const res = await postApihandler("/addStock", formData);
        if (!res.error) {
          Swal.fire("Success", "Stock added successfully!", "success");
          fetchStock();
          setOpen(false);
        } else {
          Swal.fire("Error", "Failed to add stock!", "error");
        }
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  // Delete stock
  const handleDelete = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this stock data!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1976d2",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await deleteApihandler("/deleteStock");
        if (!res.error) {
          Swal.fire("Deleted!", "Stock deleted successfully!", "success");
          setStock(null);
        } else {
          Swal.fire("Error", "Failed to delete stock!", "error");
        }
      }
    });
  };

  // Chart data
  const chartData = stock
    ? [
        { name: "Total", value: stock.total_stock },
        { name: "Selling", value: stock.selling_stock },
        { name: "Pending", value: stock.pending_stock },
      ]
    : [];

  return (
    <AdminLayout>
      <Typography variant="h5" gutterBottom>
        Stock Dashboard
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setFormData(
            stock || { total_stock: "", selling_stock: "", pending_stock: "" }
          );
          setOpen(true);
        }}
      >
        {stock ? "Update Stock" : "Add Stock"}
      </Button>

      {stock && (
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          style={{ marginLeft: "10px" }}
        >
          Delete Stock
        </Button>
      )}

      {/* Cards Section */}
      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: "#1976d2", color: "white" }}>
            <CardContent>
              <Typography variant="h6">Total Stock</Typography>
              <Typography variant="h4">{stock?.total_stock || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ background: "#2e7d32", color: "white" }}>
            <CardContent>
              <Typography variant="h6">Selling Stock</Typography>
              <Typography variant="h4">{stock?.selling_stock || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ background: "#ed6c02", color: "white" }}>
            <CardContent>
              <Typography variant="h6">Pending Stock</Typography>
              <Typography variant="h4">{stock?.pending_stock || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Card sx={{ marginTop: 3, padding: 2 }}>
        <Typography variant="h6" gutterBottom>
          Stock Overview
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{stock ? "Update Stock" : "Add Stock"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Total Stock"
            name="total_stock"
            fullWidth
            type="number"
            value={formData.total_stock}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Selling Stock"
            name="selling_stock"
            fullWidth
            type="number"
            value={formData.selling_stock}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Pending Stock"
            name="pending_stock"
            fullWidth
            type="number"
            value={formData.pending_stock}
            disabled
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {stock ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
