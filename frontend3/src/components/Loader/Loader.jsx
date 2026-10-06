import './Loader.css';

export function Spinner({ size = 22 }) {
  return <span className="cg-spinner" style={{ width: size, height: size }} />;
}

export function SkeletonBlock({ height = 16, width = '100%', radius }) {
  return <div className="skeleton" style={{ height, width, borderRadius: radius }} />;
}
