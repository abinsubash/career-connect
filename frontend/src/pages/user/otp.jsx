import React, { useState, useRef, useEffect } from "react";

const OTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^[0-9]{6}$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

const handleVerify = async () => {
  const otpValue = otp.join("");
  if (otpValue.length !== 6) {
    setError("Please enter all 6 digits");
    return;
  }
  setLoading(true);
  try {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: props.email, otp: otpValue }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setSuccess(true);
    setError("");
  } catch (err) {
    setError(err.message);
  }
  setLoading(false);
};
const handleResend = async () => {
  setCanResend(false);
  setTimer(60);
  setOtp(["", "", "", "", "", ""]);
  setError("");
  setSuccess(false);
  await fetch("/api/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: props.email }),
  });
  inputRefs.current[0]?.focus();
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-white p-5">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            We've sent a 6-digit code to your email
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="grid grid-cols-6 gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={success}
              className={`
                h-14 text-center text-xl font-semibold rounded-xl border-2 
                transition-all duration-300
                ${error 
                  ? "border-red-500 bg-red-50" 
                  : digit 
                    ? "border-indigo-500 bg-indigo-50 text-indigo-600" 
                    : "border-gray-300 bg-gray-100"
                }
                focus:outline-none focus:border-indigo-500 focus:bg-white
              `}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        {/* Success */}
        {success && (
          <p className="text-green-600 font-semibold text-sm text-center mb-4">
            ✓ Email verified successfully!
          </p>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || success}
          className={`
            w-full h-12 rounded-xl font-semibold text-white 
            transition-all duration-300 flex items-center justify-center gap-2
            ${success
              ? "bg-green-600"
              : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105"
            }
            ${loading && "opacity-70 cursor-not-allowed"}
          `}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Verifying...
            </>
          ) : success ? (
            "✓ Verified"
          ) : (
            "Verify OTP"
          )}
        </button>

        {/* Resend Section */}
        <div className="text-center bg-gray-100 rounded-xl p-4 mt-6">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          {canResend ? (
            <button
              onClick={handleResend}
              className="px-5 py-2 border-2 border-indigo-500 text-indigo-500 rounded-lg font-semibold hover:bg-indigo-500 hover:text-white transition-all duration-300"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Resend in{" "}
              <span className="text-indigo-600 font-bold">
                {timer}s
              </span>
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Check your spam folder if you don't see the email
        </p>
      </div>
    </div>
  );
};

export default OTP;