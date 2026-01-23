import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, Check, X, User, Lock, Mail } from "lucide-react";

type CaptchaProps = {
  onVerify: (ok: boolean) => void;
  verified: boolean;
};

// CAPTCHA Component
function CaptchaVerification({ onVerify, verified }: CaptchaProps) {
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    generateCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setUserInput("");
    onVerify(false);
  };

  const handleVerify = () => {
    const isCorrect = userInput.toUpperCase() === captchaText;
    onVerify(isCorrect);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-purple-300 font-bold pixel-font">
        SECURITY CHECK
      </label>
      <div className="flex gap-2 items-center">
        <div className="bg-purple-950 border-4 border-purple-500 px-4 py-3 pixel-box flex items-center justify-center min-w-35">
          <span
            className="text-xl pixel-font tracking-widest text-purple-200 select-none"
            style={{ letterSpacing: "0.3em" }}
          >
            {captchaText}
          </span>
        </div>
        <button
          type="button"
          onClick={generateCaptcha}
          className="px-4 py-3 bg-purple-700 hover:bg-purple-600 border-4 border-purple-400 pixel-box pixel-font text-lg transition-all"
          title="Refresh CAPTCHA"
        >
          ↻
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="TYPE CODE"
          className="flex-1 px-3 py-2 bg-purple-950/50 border-4 border-purple-500 pixel-box text-white pixel-font text-sm focus:outline-none focus:border-purple-400"
          maxLength={6}
        />
        <button
          type="button"
          onClick={handleVerify}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 border-4 border-cyan-400 pixel-box pixel-font text-xs transition-all"
        >
          VERIFY
        </button>
      </div>
      {verified && (
        <div className="flex items-center gap-2 text-green-400 text-xs pixel-font">
          <Check className="w-4 h-4" /> VERIFIED!
        </div>
      )}
    </div>
  );
}

// Password Strength Component
function PasswordStrength({ password }: { password: string }) {
  const requirements = [
    { met: /[_@#$%^&*!]/.test(password), text: "SPECIAL CHAR" },
    { met: /\d/.test(password), text: "ONE NUMBER" },
    { met: /^[A-Z]/.test(password), text: "CAPITAL FIRST" },
    { met: password.length >= 8, text: "MIN 8 CHARS" },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  let strength: { label: string; color: string; bgColor: string } = {
    label: "",
    color: "",
    bgColor: "",
  };

  if (password.length === 0) {
    strength = { label: "", color: "", bgColor: "" };
  } else if (metCount <= 2) {
    strength = {
      label: "WEAK",
      color: "text-red-400",
      bgColor: "bg-red-500/20 border-red-500",
    };
  } else if (metCount === 3) {
    strength = {
      label: "MEDIUM",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20 border-yellow-500",
    };
  } else {
    strength = {
      label: "STRONG",
      color: "text-green-400",
      bgColor: "bg-green-500/20 border-green-500",
    };
  }

  return (
    <div className="space-y-2 mt-2">
      {strength.label && (
        <div
          className={`flex items-center justify-between p-2 pixel-box border-4 ${strength.bgColor}`}
        >
          <span className={`pixel-font text-xs ${strength.color}`}>
            PWD: {strength.label}
          </span>
          <Shield className={`w-4 h-4 ${strength.color}`} />
        </div>
      )}
      <div className="space-y-1 bg-purple-900/30 p-3 pixel-box border-4 border-purple-600">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs pixel-font">
            {req.met ? (
              <Check className="w-3 h-3 text-green-400 shrink-0" />
            ) : (
              <X className="w-3 h-3 text-red-400 shrink-0" />
            )}
            <span className={req.met ? "text-green-400" : "text-purple-300"}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type TermsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
};

// Terms Modal
function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-purple-950 border-8 border-purple-500 pixel-box-lg max-w-3xl w-full max-h-[85vh] flex flex-col pixel-shadow-lg">
        <div className="p-6 border-b-8 border-purple-500">
          <h2 className="text-2xl pixel-font text-purple-200">
            TERMS & CONDITIONS
          </h2>
          <p className="text-xs text-purple-400 mt-1 pixel-font">
            UPDATED: JAN 20 2026
          </p>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-purple-200 leading-relaxed pixel-font">
          {/* Put your terms text here */}
          <p>
            Example terms: By using TINITHINK you agree to the processing of
            your data for educational and personalization purposes.
          </p>
        </div>
        <div className="p-6 border-t-8 border-purple-500 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-red-700 hover:bg-red-600 border-4 border-red-500 pixel-box pixel-font text-sm transition-all text-white"
          >
            DECLINE
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-600 border-4 border-green-500 pixel-box pixel-font text-sm transition-all text-white"
          >
            ACCEPT
          </button>
        </div>
      </div>
    </div>
  );
}

type SignupModalProps = {
  onClose: () => void;
};

// Signup Modal
function SignupModal({ onClose }: SignupModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = () => {
    const hasSpecial = /[_@#$%^&*!]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasCapitalFirst = /^[A-Z]/.test(password);
    const hasLength = password.length >= 8;
    return hasSpecial && hasNumber && hasCapitalFirst && hasLength;
  };

  const handleSignup = () => {
    if (!username.trim()) {
      alert("⚠️ ENTER USERNAME");
      return;
    }

    if (!email.trim()) {
      alert("⚠️ ENTER EMAIL");
      return;
    }

    if (!validatePassword()) {
      alert("⚠️ PASSWORD REQUIREMENTS NOT MET");
      return;
    }

    if (!captchaVerified) {
      alert("⚠️ COMPLETE CAPTCHA");
      return;
    }

    if (!termsAccepted) {
      alert("⚠️ ACCEPT TERMS & CONDITIONS");
      return;
    }

    setLoading(true);

    // TODO: replace with real API call or navigation
    setTimeout(() => {
      alert(
        `✅ ACCOUNT CREATED!\n\nUSER: ${username}\nEMAIL: ${email}\n2FA: ${
          enable2FA ? "ON" : "OFF"
        }`,
      );
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-purple-950 border-8 border-purple-500 pixel-box-lg max-w-lg w-full my-8 pixel-shadow-lg">
        <div className="p-6 border-b-8 border-purple-500">
          <h2 className="text-2xl pixel-font text-purple-200">
            CREATE ACCOUNT
          </h2>
          <p className="text-sm text-purple-400 mt-1 pixel-font">
            JOIN TINITHINK
          </p>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs text-purple-300 pixel-font flex items-center gap-2">
              <User className="w-4 h-4" />
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="CHOOSE USERNAME"
              className="w-full px-4 py-3 bg-purple-950/50 border-4 border-purple-500 pixel-box text-white pixel-font text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs text-purple-300 pixel-font flex items-center gap-2">
              <Mail className="w-5 h-5" />
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR@EMAIL.COM"
              className="w-full px-4 py-3 bg-purple-950/50 border-4 border-purple-500 pixel-box text-white pixel-font text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs text-purple-300 pixel-font flex items-center gap-2">
              <Lock className="w-4 h-4" />
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="STRONG PASSWORD"
                className="w-full px-4 py-3 pr-12 bg-purple-950/50 border-4 border-purple-500 pixel-box text-white pixel-font text-sm focus:outline-none focus:border-purple-400"
              />
              <button
                type="button"
                onClick={() => setShowPwd((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300"
              >
                {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && <PasswordStrength password={password} />}
          </div>

          {/* 2FA Toggle */}
          <div className="flex items-center gap-3 p-4 bg-purple-900/50 border-4 border-purple-600 pixel-box">
            <input
              type="checkbox"
              id="enable2fa"
              checked={enable2FA}
              onChange={(e) => setEnable2FA(e.target.checked)}
              className="w-5 h-5"
            />
            <label
              htmlFor="enable2fa"
              className="text-xs pixel-font text-purple-300 flex items-center gap-2"
            >
              <Shield className="w-5 h-5 text-cyan-400" />
              ENABLE 2FA
            </label>
          </div>

          {/* CAPTCHA */}
          <CaptchaVerification
            onVerify={setCaptchaVerified}
            verified={captchaVerified}
          />

          {/* Terms */}
          <div className="flex items-start gap-3 p-4 bg-purple-900/50 border-4 border-purple-600 pixel-box">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-5 h-5 mt-0.5"
            />
            <label
              htmlFor="terms"
              className="text-xs pixel-font text-purple-300 flex-1"
            >
              I ACCEPT{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-cyan-400 hover:text-cyan-300 underline font-bold"
              >
                TERMS & CONDITIONS
              </button>
            </label>
          </div>
        </div>

        <div className="p-6 border-t-8 border-purple-500 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 border-4 border-gray-500 pixel-box pixel-font text-sm transition-all"
            disabled={loading}
          >
            CANCEL
          </button>
          <button
            onClick={handleSignup}
            className="flex-1 px-6 py-3 bg-linear-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 border-4 border-cyan-400 pixel-box pixel-font text-sm transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "CREATING..." : "CREATE"}
          </button>
        </div>
      </div>

      {showTermsModal && (
        <TermsModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          onAccept={() => {
            setTermsAccepted(true);
            setShowTermsModal(false);
          }}
        />
      )}
    </div>
  );
}

// Main Login Component
export default function Login() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email.trim()) {
      alert("⚠️ ENTER EMAIL");
      return;
    }

    if (!password.trim()) {
      alert("⚠️ ENTER PASSWORD");
      return;
    }

    if (!captchaVerified) {
      alert("⚠️ COMPLETE CAPTCHA");
      return;
    }

    setLoading(true);

    // TODO: replace with navigation or real login call
    setTimeout(() => {
      alert(`✅ LOGIN SUCCESS!\n\nEMAIL: ${email}\n\nREDIRECTING...`);
      setLoading(false);
      // e.g., use navigate("/dashboard") if using react-router
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{
        background: "linear-gradient(to bottom, #3a2d71 0%, #243b55 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-font {
          font-family: 'Press Start 2P', cursive;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .pixel-box {
          border-radius: 0;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        
        .pixel-box-lg {
          border-radius: 0;
        }
        
        .pixel-shadow {
          box-shadow: 
            8px 8px 0 rgba(139, 92, 246, 0.5),
            12px 12px 0 rgba(88, 28, 135, 0.3);
        }
        
        .pixel-shadow-lg {
          box-shadow: 
            12px 12px 0 rgba(139, 92, 246, 0.6),
            16px 16px 0 rgba(88, 28, 135, 0.4),
            0 20px 40px rgba(0, 0, 0, 0.6);
        }

        input::placeholder {
          font-family: 'Press Start 2P', cursive;
          font-size: 0.6rem;
        }
      `}</style>

      {/* HERO Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-black/90 py-10 px-4">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 pixel-font">
            WELCOME TO <span style={{ color: "#c776d6" }}>TINITHINK</span>
          </h1>
          <div className="mt-2">
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 border-8 border-purple-400 px-6 py-4 pixel-box pixel-shadow">
              <span className="text-white pixel-font text-xs leading-relaxed block">
                YOUR ACADEMIC COMPANION FOR ORGANIZING, REVIEWING, AND LEARNING
                BETTER
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LOGIN Section */}
      <div className="w-full lg:w-1/2 flex">
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full px-4 sm:px-6 md:px-8 max-w-sm sm:max-w-md lg:max-w-lg">
            <div className="bg-black/85 border-8 border-purple-500 pixel-box-lg p-8 pixel-shadow-lg">
              <h2 className="text-2xl sm:text-3xl pixel-font text-purple-300 mb-6 text-center">
                LOGIN
              </h2>

              <div className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs text-purple-300 pixel-font flex items-center gap-2">
                    <Mail size={16} />
                    EMAIL
                  </label>
                  <input
                    type="email"
                    placeholder="YOUR@EMAIL.COM"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-purple-950/50 border-4 border-purple-500 pixel-box text-white pixel-font text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs text-purple-300 pixel-font flex items-center gap-2">
                    <Lock size={16} />
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      placeholder="PASSWORD"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-purple-950/50 border-4 border-purple-500 pixel-box text-white pixel-font text-sm focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300"
                    >
                      {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* CAPTCHA */}
                <CaptchaVerification
                  onVerify={setCaptchaVerified}
                  verified={captchaVerified}
                />

                {/* Login Button */}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full px-4 py-4 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-4 border-purple-400 pixel-box text-white pixel-font text-sm transition-all disabled:opacity-50"
                >
                  {loading ? "► LOGGING IN..." : "► START GAME"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="text-cyan-400 hover:text-cyan-300 pixel-font text-xs underline"
                >
                  CREATE ACCOUNT
                </button>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-purple-400 pixel-font">
                <Shield className="w-4 h-4" />
                <span>SECURED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      {showSignupModal && (
        <SignupModal onClose={() => setShowSignupModal(false)} />
      )}
    </div>
  );
}
