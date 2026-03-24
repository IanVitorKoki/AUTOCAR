function Card({ className = '', children }) {
  return <div className={`panel ${className}`}>{children}</div>;
}

export default Card;

