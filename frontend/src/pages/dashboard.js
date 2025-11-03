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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await getApihandler("/getGasSuppliersCount");
      if (res.stats) setStats(res.stats);
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

  // ============================
  //  PIE CHART DATA
  // ============================

  const countData = {
    labels: ["Today’s Suppliers", "Last Month Suppliers", "Total Suppliers"],
    datasets: [
      {
        label: "Supplier Count",
        data: [stats.todayCount, stats.lastMonthCount, stats.totalCount],
        backgroundColor: ["#28a745", "#007bff", "#000261"],
        borderWidth: 1,
      },
    ],
  };

  const amountData = {
    labels: ["Today’s Amount", "Last Month Amount", "Total Amount"],
    datasets: [
      {
        label: "Amount (₹)",
        data: [stats.todayAmount, stats.lastMonthAmount, stats.totalAmount],
        backgroundColor: ["#28a745", "#007bff", "#000261"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      title: {
        display: false,
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
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Dashboard Overview
        </Typography>

        {stats ? (
          <>
            {/* ======= STATS CARDS ======= */}
            <Grid container spacing={3}>
              {/* Row 1 */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={cardStyle} onClick={handleCardClick}>
                  <CardContent>
                    <Typography sx={cardTitle}>Total Suppliers</Typography>
                    <Typography sx={{ ...cardValue, color: "#000261" }}>
                      {stats.totalCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={cardStyle} onClick={handleCardClick}>
                  <CardContent>
                    <Typography sx={cardTitle}>Today’s Suppliers</Typography>
                    <Typography sx={{ ...cardValue, color: "#28a745" }}>
                      {stats.todayCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={cardStyle} onClick={handleCardClick}>
                  <CardContent>
                    <Typography sx={cardTitle}>
                      Last Month Suppliers
                    </Typography>
                    <Typography sx={{ ...cardValue, color: "#007bff" }}>
                      {stats.lastMonthCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Row 2 */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={cardStyle} onClick={handleCardClick}>
                  <CardContent>
                    <Typography sx={cardTitle}>Total Amount</Typography>
                    <Typography sx={{ ...cardValue, color: "#000261" }}>
                      ₹{stats.totalAmount.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={cardStyle} onClick={handleCardClick}>
                  <CardContent>
                    <Typography sx={cardTitle}>Today’s Amount</Typography>
                    <Typography sx={{ ...cardValue, color: "#28a745" }}>
                      ₹{stats.todayAmount.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={cardStyle} onClick={handleCardClick}>
                  <CardContent>
                    <Typography sx={cardTitle}>Last Month Amount</Typography>
                    <Typography sx={{ ...cardValue, color: "#007bff" }}>
                      ₹{stats.lastMonthAmount.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* ======= PIE CHARTS ======= */}
            <Grid container spacing={3} sx={{ mt: 4 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Supplier Count Distribution
                  </Typography>
                  <Pie data={countData} options={chartOptions} />
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Amount Distribution
                  </Typography>
                  <Pie data={amountData} options={chartOptions} />
                </Card>
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography color="error" sx={{ mt: 2 }}>
            No statistics available.
          </Typography>
        )}
      </Box>
    </AdminLayout>
  );
}
