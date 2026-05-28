import { Hero } from '@/components/sections/Hero';
import { LogoBar } from '@/components/sections/LogoBar';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { FeaturedMarkets } from '@/components/sections/FeaturedMarkets';
import { AgentRoster } from '@/components/sections/AgentRoster';
import { ArenaTeaser } from '@/components/sections/ArenaTeaser';
import { StatsBand } from '@/components/sections/StatsBand';
import { LiveFeed } from '@/components/sections/LiveFeed';
import { CTABand } from '@/components/sections/CTABand';

export default function Page() {
  return (
    <>
      <Hero />
      <LogoBar />
      <HowItWorks />
      <FeaturedMarkets />
      <StatsBand />
      <AgentRoster />
      <ArenaTeaser />
      <LiveFeed />
      <CTABand />
    </>
  );
}
