import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    const t = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 800);

    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div
      className="
        min-h-screen flex flex-col items-center justify-center
        bg-black text-white px-4
      "
      style={{
        background: "linear-gradient(to bottom, #3a2d71 0%, #243b55 100%)",
      }}
    >
      <div
        className="
          w-full
          max-w-xs sm:max-w-sm md:max-w-md   /* card narrower on phone */
          bg-black/80 border-2 border-[#c776d6]
          rounded-xl px-4 py-5 sm:px-6 sm:py-7
          shadow-[0_0_20px_#c776d6] text-center
        "
      >
        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#c776d6] drop-shadow-[0_0_10px_#e0c3fc] mb-2 sm:mb-3">
          Logging out
        </h1>
        <p className="text-[#e0c3fc] text-xs sm:text-sm md:text-base mb-3 sm:mb-4">
          Your session is being cleared. You will be redirected to the login
          page.
        </p>
        <div className="flex justify-center mt-1 sm:mt-2">
          {/* smaller spinner on phone, larger on bigger screens */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 border-2 sm:border-2 md:border-4 border-[#e0c3fc] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

export default Logout;
