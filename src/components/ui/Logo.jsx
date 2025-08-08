import React from "react";

const Logo = ({ size = "md", className = "", animated = true }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${
          sizeClasses[size]
        } relative flex items-center justify-center ${
          animated ? "logo-container" : ""
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring representing transformation */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-orange-500 outer-ring"
            strokeDasharray="10 5"
          />

          {/* Inner morphing shape - represents trend morphing */}
          <path
            d="M30 35 Q50 20 70 35 Q80 50 70 65 Q50 80 30 65 Q20 50 30 35"
            fill="currentColor"
            className="text-orange-600 morph-shape"
          />

          {/* Trend arrows indicating growth and movement */}
          <path
            d="M25 25 L35 20 L30 30 Z"
            fill="currentColor"
            className="text-orange-400 trend-arrow"
          />
          <path
            d="M75 75 L65 80 L70 70 Z"
            fill="currentColor"
            className="text-orange-400 trend-arrow"
          />

          {/* Central AI core */}
          <circle
            cx="50"
            cy="50"
            r="8"
            fill="currentColor"
            className="text-white ai-core"
          />
          <circle
            cx="50"
            cy="50"
            r="4"
            fill="currentColor"
            className="text-orange-500 ai-center"
          />

          {/* Data points representing AI analysis */}
          <circle
            cx="45"
            cy="40"
            r="2"
            fill="currentColor"
            className="text-orange-300 data-point"
          />
          <circle
            cx="55"
            cy="40"
            r="2"
            fill="currentColor"
            className="text-orange-300 data-point"
          />
          <circle
            cx="60"
            cy="55"
            r="2"
            fill="currentColor"
            className="text-orange-300 data-point"
          />
          <circle
            cx="40"
            cy="55"
            r="2"
            fill="currentColor"
            className="text-orange-300 data-point"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes rotate-ring {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes morph-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes data-blink {
          0%,
          50%,
          100% {
            opacity: 0.6;
          }
          25%,
          75% {
            opacity: 1;
          }
        }

        .logo-container {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .logo-container .outer-ring {
          animation: rotate-ring 10s linear infinite;
          transform-origin: center;
        }

        .logo-container .morph-shape {
          animation: morph-pulse 2s ease-in-out infinite;
          transform-origin: center;
        }

        .logo-container .ai-center {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }

        .logo-container .data-point {
          animation: data-blink 2s ease-in-out infinite;
        }

        .logo-container .data-point:nth-child(7) {
          animation-delay: 0.2s;
        }
        .logo-container .data-point:nth-child(8) {
          animation-delay: 0.4s;
        }
        .logo-container .data-point:nth-child(9) {
          animation-delay: 0.6s;
        }
        .logo-container .data-point:nth-child(10) {
          animation-delay: 0.8s;
        }
      `}</style>
    </div>
  );
};

export default Logo;
