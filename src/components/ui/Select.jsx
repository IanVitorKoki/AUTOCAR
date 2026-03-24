import { forwardRef } from 'react';

const selectStyles =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100';

const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select ref={ref} className={`${selectStyles} ${className}`} {...props}>
      {children}
    </select>
  );
});

export default Select;

