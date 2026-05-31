// src/components_drift/explore/LoadingSpinner.jsx

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="mt-4 text-gray-500 text-center">Loading...</div>
      </div>
    </div>
  );
}