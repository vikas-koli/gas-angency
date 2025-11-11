import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Modal,
} from "@mui/material";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Change Password Modal States
  const [openModal, setOpenModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);

  // ------------------ LOGIN FUNCTION ------------------
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

  // ------------------ CHANGE PASSWORD FUNCTION ------------------
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!adminEmail || !oldPassword || !newPassword) {
      Swal.fire("Please fill all fields", "", "warning");
      return;
    }

    setChanging(true);
    try {
      const res = await fetch("https://gas-angency-bakcend.onrender.com/api/adminLoginPasswordChange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_Email: adminEmail,
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      const data = await res.json();

      if (res.status === 200) {
        Swal.fire("Password changed successfully!", "", "success");
        setOpenModal(false);
        setOldPassword("");
        setNewPassword("");
      } else {
        Swal.fire(data.message || "Failed to change password", "", "error");
      }
    } catch (err) {
      Swal.fire("Server Error", err.message || "Try again later", "error");
    } finally {
      setChanging(false);
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

        {/* ---------- LOGIN FORM ---------- */}
        <form onSubmit={handleLogin}>
          <TextField
            label="Admin Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            InputLabelProps={{ style: { color: "#e0e0e0" } }}
            InputProps={{ style: { color: "#fff" } }}
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
            InputProps={{ style: { color: "#fff" } }}
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

        {/* ---------- CHANGE PASSWORD BUTTON ---------- */}
        <Button
          onClick={() => setOpenModal(true)}
          fullWidth
          sx={{
            mt: 2,
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              color: "#00e5ff",
            },
          }}
        >
          Change Password
        </Button>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3, color: "#d0d0d0" }}
        >
          © 2025 Admin Panel | Secure Access
        </Typography>
      </Paper>

      {/* ---------- CHANGE PASSWORD MODAL ---------- */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Change Password
          </Typography>

          <form onSubmit={handleChangePassword}>
            <TextField
              label="Admin Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <TextField
              label="Old Password"
              variant="outlined"
              fullWidth
              margin="normal"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <TextField
              label="New Password"
              variant="outlined"
              fullWidth
              margin="normal"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={changing}
              sx={{
                mt: 2,
                py: 1.2,
                borderRadius: 3,
                background: "linear-gradient(90deg, #00c6ff, #0072ff)",
                fontWeight: 600,
                letterSpacing: 1,
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(90deg, #0072ff, #00c6ff)",
                  boxShadow: "0 0 10px rgba(0, 114, 255, 0.5)",
                },
              }}
            >
              {changing ? (
                <CircularProgress size={26} sx={{ color: "#fff" }} />
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </Box>
      </Modal>
    </Box>
  );
}
