type ErrorMessageProps = {
  message?: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <p className="text-xs font-medium text-red-500 mt-1">* {message}</p>
  );
}