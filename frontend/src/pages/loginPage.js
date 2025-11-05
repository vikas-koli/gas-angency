
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!adminEmail || !password) {
      Swal.fire("Please fill all fields", "", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://gas-angency-bakcend.onrender.com/api/adminLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_Email: adminEmail,
          password: password,
        }),
      });

      const data = await res.json();

      if (res.status === 200) {
        Swal.fire("Login Successful!", "", "success");
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        Swal.fire(data.message || "Invalid credentials", "", "error");
      }
    } catch (err) {
      Swal.fire("Server Error", err.message || "Try again later", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 5,
          borderRadius: 4,
          backdropFilter: "blur(16px)",
          background: "rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            mb: 4,
            color: "#fff",
            fontWeight: "700",
            letterSpacing: 1,
          }}
        >
          Admin Login
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            label="Admin Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            InputLabelProps={{ style: { color: "#e0e0e0" } }}
            InputProps={{
              style: { color: "#fff" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                "&:hover fieldset": { borderColor: "#fff" },
                "&.Mui-focused fieldset": { borderColor: "#00e5ff" },
              },
            }}
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ style: { color: "#e0e0e0" } }}
            InputProps={{
              style: { color: "#fff" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                "&:hover fieldset": { borderColor: "#fff" },
                "&.Mui-focused fieldset": { borderColor: "#00e5ff" },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 4,
              py: 1.3,
              borderRadius: 3,
              background: "linear-gradient(90deg, #00c6ff, #0072ff)",
              fontWeight: 600,
              letterSpacing: 1,
              fontSize: "1rem",
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(90deg, #0072ff, #00c6ff)",
                boxShadow: "0 0 15px rgba(0, 114, 255, 0.6)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={26} sx={{ color: "#fff" }} />
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3, color: "#d0d0d0" }}
        >
          © 2025 Admin Panel | Secure Access
        </Typography>
      </Paper>
    </Box>
  );
}
