export const Error = ({ message }: { message?: string }) => {
  return <span className={'text-sm text-[#e33] px-2'}>{message ?? 'error'}</span>;
};
