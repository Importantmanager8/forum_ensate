import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import { CheckCircle, XCircle, Loader } from "lucide-react"; // icons (optional)



const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(encodeURIComponent(token));
        setStatus("success");
        navigate("/login");
      } catch (err) {
        setStatus("error");
      }
    };

    verify();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {status === "loading" && (
        <>
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-700">Verifying your email...</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="h-8 w-8 text-green-600" />
          <p className="mt-4 text-green-700">
            Your email has been verified successfully!
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-8 w-8 text-red-600" />
          <p className="mt-4 text-red-700">
            Invalid or expired token. Please try again.
          </p>
        </>
      )}
    </div>
  );
};

export default VerifyEmailPage;
