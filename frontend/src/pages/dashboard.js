import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import AdminLayout from "../layout/admin-layout";
import { getApihandler } from "../api-handler";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function Dashboard() {
  const [supplierStats, setSupplierStats] = useState(null);
  const [vendorStats, setVendorStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const supplierRes = await getApihandler("/getGasSuppliersCount");
      const vendorRes = await getApihandler("/getCountVendors");

      if (supplierRes.stats) setSupplierStats(supplierRes.stats);
      if (vendorRes.stats) setVendorStats(vendorRes.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCardClick = () => {
    navigate("/client-list");
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
    textAlign: "center",
    padding: "25px 10px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0px 6px 25px rgba(0,0,0,0.15)",
    },
  };

  const cardTitle = {
    fontWeight: 600,
    fontSize: "1rem",
    color: "#555",
  };

  const cardValue = {
    fontWeight: "bold",
    fontSize: "2rem",
    mt: 1,
  };

  if (loading)
    return (
      <AdminLayout>
        <Box
          sx={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </AdminLayout>
    );

  // Helper function for pie chart data
  const getPieData = (label1, label2, label3, val1, val2, val3) => ({
    labels: [label1, label2, label3],
    datasets: [
      {
        data: [val1, val2, val3],
        backgroundColor: ["#28a745", "#007bff", "#000261"],
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, boxWidth: 10 },
      },
    },
  };

  return (
    <AdminLayout>
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: "#f4f6f8",
          minHeight: "100vh",
        }}
      >
        {/* -------------------- SUPPLIER SECTION -------------------- */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Supplier Dashboard
        </Typography>

        {supplierStats ? (
          <>
            <Grid container spacing={3}>
              {[
                {
                  title: "Total Suppliers",
                  value: supplierStats.totalCount,
                  color: "#000261",
                },
                {
                  title: "Today’s Suppliers",
                  value: supplierStats.todayCount,
                  color: "#28a745",
                },
                {
                  title: "Last Month Suppliers",
                  value: supplierStats.lastMonthCount,
                  color: "#007bff",
                },
                {
                  title: "Total Amount",
                  value: "₹" + supplierStats.totalAmount.toLocaleString(),
                  color: "#000261",
                },
                {
                  title: "Today’s Amount",
                  value: "₹" + supplierStats.todayAmount.toLocaleString(),
                  color: "#28a745",
                },
                {
                  title: "Last Month Amount",
                  value: "₹" + supplierStats.lastMonthAmount.toLocaleString(),
                  color: "#007bff",
                },
              ].map((item, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={cardStyle} onClick={handleCardClick}>
                    <CardContent>
                      <Typography sx={cardTitle}>{item.title}</Typography>
                      <Typography sx={{ ...cardValue, color: item.color }}>
                        {item.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 4 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Supplier Count Distribution
                  </Typography>
                  <Pie
                    data={getPieData(
                      "Today’s Suppliers",
                      "Last Month Suppliers",
                      "Total Suppliers",
                      supplierStats.todayCount,
                      supplierStats.lastMonthCount,
                      supplierStats.totalCount
                    )}
                    options={chartOptions}
                  />
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Supplier Amount Distribution
                  </Typography>
                  <Pie
                    data={getPieData(
                      "Today’s Amount",
                      "Last Month Amount",
                      "Total Amount",
                      supplierStats.todayAmount,
                      supplierStats.lastMonthAmount,
                      supplierStats.totalAmount
                    )}
                    options={chartOptions}
                  />
                </Card>
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography color="error" sx={{ mt: 2 }}>
            No supplier statistics available.
          </Typography>
        )}

        {/* -------------------- VENDOR SECTION -------------------- */}
        <Typography
          variant="h5"
          gutterBottom
          sx={{ mt: 6, mb: 3, color: "#000261" }}
        >
          Vendor Dashboard
        </Typography>

        {vendorStats ? (
          <>
            <Grid container spacing={3}>
              {[
                {
                  title: "Total Vendors",
                  value: vendorStats.totalCount,
                  color: "#000261",
                },
                {
                  title: "Today’s Vendors",
                  value: vendorStats.todayCount,
                  color: "#28a745",
                },
                {
                  title: "Last Month Vendors",
                  value: vendorStats.lastMonthCount,
                  color: "#007bff",
                },
                {
                  title: "Total Amount",
                  value: "₹" + vendorStats.totalAmount.toLocaleString(),
                  color: "#000261",
                },
                {
                  title: "Today’s Amount",
                  value: "₹" + vendorStats.todayAmount.toLocaleString(),
                  color: "#28a745",
                },
                {
                  title: "Last Month Amount",
                  value: "₹" + vendorStats.lastMonthAmount.toLocaleString(),
                  color: "#007bff",
                },
              ].map((item, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={cardStyle}>
                    <CardContent>
                      <Typography sx={cardTitle}>{item.title}</Typography>
                      <Typography sx={{ ...cardValue, color: item.color }}>
                        {item.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 4 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Vendor Count Distribution
                  </Typography>
                  <Pie
                    data={getPieData(
                      "Today’s Vendors",
                      "Last Month Vendors",
                      "Total Vendors",
                      vendorStats.todayCount,
                      vendorStats.lastMonthCount,
                      vendorStats.totalCount
                    )}
                    options={chartOptions}
                  />
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Vendor Amount Distribution
                  </Typography>
                  <Pie
                    data={getPieData(
                      "Today’s Amount",
                      "Last Month Amount",
                      "Total Amount",
                      vendorStats.todayAmount,
                      vendorStats.lastMonthAmount,
                      vendorStats.totalAmount
                    )}
                    options={chartOptions}
                  />
                </Card>
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography color="error" sx={{ mt: 2 }}>
            No vendor statistics available.
          </Typography>
        )}
      </Box>
    </AdminLayout>
  );
}
