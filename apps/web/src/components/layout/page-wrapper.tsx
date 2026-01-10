'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={'bg-background min-h-svh pt-[66px]'}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default PageWrapper;
