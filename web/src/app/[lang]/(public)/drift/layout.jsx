import ResponsiveLayout from '@/components_drift/layout/ResponsiveLayout';
import './drift.css';

export default async function DriftLayout({ children, params }) {
  const { lang } = await params;
  
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <ResponsiveLayout>
        {children}
      </ResponsiveLayout>
    </div>
  );
}