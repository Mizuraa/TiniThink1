import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      alert("LOGGED OUT SUCCESSFULLY");
      navigate("/login", { replace: true });
    }, 800);

    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4"
      style={{
        background: "linear-gradient(to bottom, #3a2d71 0%, #243b55 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font { font-family: 'Press Start 2P', cursive; }
        .pixel-box { border-radius: 0; }
        .pixel-shadow { box-shadow: 8px 8px 0 rgba(139, 92, 246, 0.6), 12px 12px 0 rgba(88, 28, 135, 0.4); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>

      <div className="pixel-box pixel-shadow bg-purple-950/90 border-4 border-purple-500 px-8 py-10 text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-purple-400 border-t-transparent pixel-box spin" />
        <h1 className="pixel-font text-purple-300 text-xs sm:text-sm">
          LOGGING OUT...
        </h1>
        <p className="pixel-font text-[8px] sm:text-[9px] text-purple-200">
          PLEASE WAIT WHILE WE REDIRECT YOU
        </p>
      </div>
    </div>
  );
}

export default Logout;
