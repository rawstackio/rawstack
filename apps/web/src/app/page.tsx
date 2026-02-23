import PageWrapper from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <PageWrapper>
      <section className="flex flex-col items-center justify-center px-6 py-32 text-center">
        <p className="text-muted-foreground mb-4 text-sm font-medium uppercase tracking-widest">Your starting point</p>
        <h1 className="font-heading text-5xl leading-tight tracking-tight sm:text-7xl">
          Build something <span className="text-muted-foreground/50">great.</span>
        </h1>
        <p className="text-muted-foreground mt-6 max-w-md text-lg">
          RawStack gives you a full-stack foundation so you can skip the boilerplate and focus on what matters.
        </p>
        <div className="mt-10 flex gap-3">
          <Button asChild size="lg">
            <a href="https://rawstack.io" target="_blank" rel="noopener noreferrer">
              Get started
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="https://github.com/rawstackio/rawstack" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </Button>
        </div>
      </section>
    </PageWrapper>
  );
}
