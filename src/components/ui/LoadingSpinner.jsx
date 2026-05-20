function LoadingSpinner({ size = 24 }) {
  const dim = `${size}px`;
  return (
    <div
      className="inline-flex items-center justify-center"
      style={{ width: dim, height: dim }}
    >
      <div className="h-full w-full animate-spin rounded-full border-2 border-accent-gold/30 border-t-accent-gold" />
    </div>
  );
}

export default LoadingSpinner;

