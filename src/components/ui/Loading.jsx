import React from "react";

const LoadingSpinner = ({ size = "medium", color = "orange" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
    xlarge: "w-16 h-16",
  };

  const colorClasses = {
    orange: "border-orange-500",
    gray: "border-gray-500",
    white: "border-white",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin`}
    ></div>
  );
};

export const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-wheat">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export const ComponentLoader = ({ message = "Loading...", className = "" }) => {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <LoadingSpinner size="medium" />
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export const InlineLoader = ({
  size = "small",
  color = "orange",
  className = "",
}) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <LoadingSpinner size={size} color={color} />
    </div>
  );
};

export default LoadingSpinner;
