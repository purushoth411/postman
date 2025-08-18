import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.jpg";
import { toast } from "react-hot-toast";
import { useAuth } from "../utils/idb";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userpass, setUserpass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (userpass !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, userpass }),
      });

      const result = await response.json();
      if (result.status) {
        toast.success("Signup successful 🎉");
        await login(result.user); // auto login after signup
        navigate("/");
      } else {
        toast.error(result.message || "Signup failed");
        setErrorMsg(result.message || "Signup failed");
      }
    } catch (error) {
      toast.error("Unable to connect to server");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" style={{ width: "370px" }} />
        </div>
        <h4 className="text-center mb-3 text-prime fw-bold">Create an account</h4>

        {errorMsg && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> {errorMsg}
            <button type="button" className="btn-close" onClick={() => setErrorMsg("")} aria-label="Close"></button>
          </div>
        )}

       
          <div className="mb-3">
            <label className="form-label fw-medium">Name</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Email</label>
            <input
              type="email"
              className="form-control"
              required
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Password</label>
            <input
              type="password"
              className="form-control"
              required
              placeholder="********"
              value={userpass}
              onChange={(e) => setUserpass(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              required
              placeholder="********"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>

          <div className="d-grid mb-3">
            <button type="button" onClick={handleSignup} className="btn btn-prime btn-block fw-semibold">
              Signup
            </button>
          </div>

          <div className="text-center">
            <span className="text-secondary">Already have an account? </span>
            <a href="/login" className="text-decoration-none text-prime fw-medium">
              Login
            </a>
          </div>
        
      </div>
    </div>
  );
}

export default Signup;
