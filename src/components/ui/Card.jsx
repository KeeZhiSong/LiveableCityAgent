const Card = ({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'card-glass';

  const variants = {
    default: '',
    bordered: 'border-leaf/30',
    elevated: 'shadow-xl'
  };

  const hoverStyles = hover ? 'card-glass-hover' : '';

  return (
    <div
      className={`${hover ? hoverStyles : baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-4 border-b border-forest-light/30 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`p-4 border-t border-forest-light/30 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
