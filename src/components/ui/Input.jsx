import { forwardRef } from 'react';

const inputStyles =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100';

const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`${inputStyles} ${className}`} {...props} />;
});

export default Input;

