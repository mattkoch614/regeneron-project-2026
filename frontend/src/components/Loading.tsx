interface LoadingProps {
  title?: string;
  message: string;
  subtitle?: string;
}

function Loading({ title, message, subtitle }: LoadingProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-8 border-solid border-blue-600 border-r-transparent"></div>
          <div className="absolute top-0 left-0 h-16 w-16 animate-ping rounded-full border-4 border-blue-400 opacity-20"></div>
        </div>
        <p className="mt-6 text-lg text-gray-600 font-medium">{message}</p>
        {subtitle && <p className="mt-2 text-sm text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export default Loading;
