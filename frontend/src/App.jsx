import { useState } from "react";
import TaskManager from "./TaskManager";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Password strength
  const getPasswordStrength = () => {
    if (password.length === 0) {
      return "";
    }

    if (password.length < 6) {
      return "Weak";
    }

    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      return "Strong";
    }

    return "Medium";
  };

  const passwordStrength = getPasswordStrength();

  // Email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Login
  const handleLogin = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    setMessage("Please fill in all fields.");
    return;
  }

  if (!isValidEmail(email)) {
    setMessage("Please enter a valid email address.");
    return;
  }

  try {
    const response = await fetch("https://react-login-project-jy61.vercel.app/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Invalid email or password");
      return;
    }

    setMessage(data.message);
    // Save logged-in user
setLoggedInUser(data.user);

    // Login successful
    setIsLoggedIn(true);

  } catch (error) {
    console.log("Login error:", error);
    setMessage("Unable to connect to the server.");
  }
};

  // Signup
  const handleSignUp = async (e) => {
  e.preventDefault();

  if (!name || !email || !password || !confirmPassword) {
    setMessage("Please fill in all fields.");
    return;
  }

  if (!isValidEmail(email)) {
    setMessage("Please enter a valid email address.");
    return;
  }

  if (password !== confirmPassword) {
    setMessage("Passwords do not match.");
    return;
  }

  try {
    const response = await fetch("https://react-login-project-jy61.vercel.app/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    setMessage(data.message);
  } catch (error) {
    setMessage("Unable to connect to the server.");
  }
};

  // Switch Login / Signup
  const switchMode = () => {
    setIsLogin(!isLogin);

    setMessage("");
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
  };
  if (isLoggedIn) {
  return <TaskManager user={loggedInUser} />;
}

  return (
    <div className="app">

      <div className="auth-container">

        {/* LEFT SIDE */}
<div className="illustration-section">
  <img
    src="/login-illustration.png"
    alt="Login illustration"
    className="login-illustration"
  />
</div>

        {/* RIGHT SIDE */}
        <div className="form-section">

          <div className="form-content">

            {/* Logo */}
            <div className="logo">
              ✦
            </div>

            {isLogin ? (

              /* ================= LOGIN ================= */
              <>
                <h1>Welcome Back</h1>

                <p className="subtitle">
                  Login to continue your journey
                </p>

                <form onSubmit={handleLogin}>

                  {/* Email */}
                  <div className="input-group">

                    <label>Email Address</label>

                    <div className="input-box">
                      <span className="input-icon">✉</span>

                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                      />
                    </div>

                    {email && (
                      <span
                        className={
                          isValidEmail(email)
                            ? "validation success"
                            : "validation error"
                        }
                      >
                        {isValidEmail(email)
                          ? "✓ Valid email"
                          : "✕ Invalid email"}
                      </span>
                    )}

                  </div>


                  {/* Password */}
                  <div className="input-group">

                    <label>Password</label>

                    <div className="input-box">
                      <span className="input-icon">🔒</span>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                      />

                      <button
                        type="button"
                        className="eye-button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>

                    {password && (
                      <div className="strength">
                        <span>
                          Password strength
                        </span>

                        <strong
                          className={passwordStrength.toLowerCase()}
                        >
                          {passwordStrength}
                        </strong>
                      </div>
                    )}

                  </div>


                  {/* Remember + Forgot */}
                  <div className="remember-row">

                    <label>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) =>
                          setRememberMe(
                            e.target.checked
                          )
                        }
                      />

                      <span>
                        Remember me
                      </span>
                    </label>

                    <button
                      type="button"
                      className="forgot-button"
                      onClick={() =>
                        setMessage(
                          "Password reset feature coming soon."
                        )
                      }
                    >
                      Forgot password?
                    </button>

                  </div>


                  {/* Login Button */}
                  <button
                    type="submit"
                    className="main-button"
                  >
                    LOGIN →
                  </button>


                  {/* Message */}
                  {message && (
                    <p className="message">
                      {message}
                    </p>
                  )}

                </form>


                {/* Signup */}
                <p className="switch-text">
                  Don't have an account?{" "}

                  <button
                    className="link-button"
                    onClick={switchMode}
                  >
                    Sign Up
                  </button>
                </p>
              </>

            ) : (

              /* ================= SIGNUP ================= */
              <>
                <h1>Create Account</h1>

                <p className="subtitle">
                  Join us and get started today
                </p>

                <form onSubmit={handleSignUp}>

                  {/* Name */}
                  <div className="input-group">

                    <label>Full Name</label>

                    <div className="input-box">
                      <span className="input-icon">
                        👤
                      </span>

                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                      />
                    </div>

                  </div>


                  {/* Email */}
                  <div className="input-group">

                    <label>Email Address</label>

                    <div className="input-box">
                      <span className="input-icon">
                        ✉
                      </span>

                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                      />
                    </div>

                    {email && (
                      <span
                        className={
                          isValidEmail(email)
                            ? "validation success"
                            : "validation error"
                        }
                      >
                        {isValidEmail(email)
                          ? "✓ Valid email"
                          : "✕ Invalid email"}
                      </span>
                    )}

                  </div>


                  {/* Password */}
                  <div className="input-group">

                    <label>Password</label>

                    <div className="input-box">
                      <span className="input-icon">
                        🔒
                      </span>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                      />

                      <button
                        type="button"
                        className="eye-button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword
                          ? "🙈"
                          : "👁️"}
                      </button>
                    </div>

                    {password && (
                      <div className="strength">
                        <span>
                          Password strength
                        </span>

                        <strong
                          className={passwordStrength.toLowerCase()}
                        >
                          {passwordStrength}
                        </strong>
                      </div>
                    )}

                  </div>


                  {/* Confirm Password */}
                  <div className="input-group">

                    <label>
                      Confirm Password
                    </label>

                    <div className="input-box">
                      <span className="input-icon">
                        🔒
                      </span>

                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="eye-button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                      >
                        {showConfirmPassword
                          ? "🙈"
                          : "👁️"}
                      </button>
                    </div>

                    {confirmPassword && (
                      <span
                        className={
                          password === confirmPassword
                            ? "validation success"
                            : "validation error"
                        }
                      >
                        {password === confirmPassword
                          ? "✓ Passwords match"
                          : "✕ Passwords do not match"}
                      </span>
                    )}

                  </div>


                  {/* Signup Button */}
                  <button
                    type="submit"
                    className="main-button"
                  >
                    CREATE ACCOUNT →
                  </button>


                  {/* Message */}
                  {message && (
                    <p className="message">
                      {message}
                    </p>
                  )}

                </form>


                {/* Login */}
                <p className="switch-text">
                  Already have an account?{" "}

                  <button
                    className="link-button"
                    onClick={switchMode}
                  >
                    Login
                  </button>
                </p>
              </>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;