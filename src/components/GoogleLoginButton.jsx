import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function GoogleLoginButton() {
  const { googleLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const access_token = credentialResponse.credential;
    const success = await googleLogin(access_token);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <div style={{ width: 300 }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.error("Google Sign In was unsuccessful");
            alert("Google login failed. Please try again.");
          }}
          width={300}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
        />
      </div>
    </div>
  );
}
