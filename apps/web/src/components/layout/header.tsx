import { ThemeSelector } from '@/components/theme-selector';
import Logo from '@/components/logo';
import { LoginLogoutButton } from '@/components/login-logout-button';

type Props = {
  hideLogin?: boolean;
};

const Header = ({ hideLogin }: Props) => (
  <header className="fixed top-0 flex w-full items-center justify-between p-2 px-6 border-b-1">
    <Logo />
    <div className={'flex items-center gap-2'}>
      {!hideLogin && <LoginLogoutButton />}
      <ThemeSelector />
    </div>
  </header>
);

export default Header;
