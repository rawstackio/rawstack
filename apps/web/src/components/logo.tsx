import Stack from '@/components/icon/items/stack';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link className="flex items-center font-logo" href="/">
      <Stack className="mr-2 h-6 w-6 text-black dark:text-white md:h-6 md:w-6" />
      <p className={'mt-[1px] text-[20px] md:text-[22px] uppercase'}>
        <span className={'mr-[1px] text-black opacity-60 dark:text-white dark:opacity-70'}>Raw</span>
        <span className={'text-black opacity-70 dark:text-white dark:opacity-100'}>Stack</span>
      </p>
    </Link>
  );
};

export default Logo;
