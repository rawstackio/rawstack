import Template from '@/components/layout/template.tsx';

export default function Dashboard() {
  return (
    <Template title="Dashboard">
      <div className="flex flex-1 flex-col gap-4 p-4 pl-8">
        <div className="mx-auto mt-3 mb-3 w-full max-w-6xl rounded-xl0">
          <h1 className="text-3xl">This is your dashboard...</h1>
          <p className="text-muted-foreground">fill it with widgets, graphs and all the stats about your business!</p>
        </div>
        <div className="mx-auto w-full max-w-6xl">{/* */}</div>
      </div>
    </Template>
  );
}
