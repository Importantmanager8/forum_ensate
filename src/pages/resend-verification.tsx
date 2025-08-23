import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const ResendVerification = () => {
  // Get location state passed from navigate()
  const location = useLocation();
  const passedEmail = location.state?.email || "";

  // Initialize state with the passed email
  const [email, setEmail] = useState(passedEmail);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // Show success message from server
        setMessage(
          data.message || "Verification email resent! Please check your inbox."
        );
      } else {
        // Show error message from server
        setMessage(data.message || "Failed to resend verification email.");
      }
    } catch (error) {
      // Network or parsing error
      setMessage("Something went wrong. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded mt-10">
      <h1 className="text-3xl mb-4 font-bold text-red-500">
        Check your email
      </h1>
      <h2 className="text-2xl mb-4 font-bold">Resend Verification Email</h2>
      <input
        type="email"
        value={email}
        disabled={!!passedEmail} // disable if email passed
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full px-3 py-2 mb-4 border rounded"
      />
      <button
        disabled={!email || isSending}
        onClick={handleResend}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSending ? "Sending..." : "Resend Email"}
      </button>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default ResendVerification;
