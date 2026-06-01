import { Hero } from '@/components/sections/Hero';
import { LogoBar } from '@/components/sections/LogoBar';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { FeaturedMarkets } from '@/components/sections/FeaturedMarkets';
import { AgentRoster } from '@/components/sections/AgentRoster';
import { ArenaTeaser } from '@/components/sections/ArenaTeaser';
import { StatsBand } from '@/components/sections/StatsBand';
import { LiveFeed } from '@/components/sections/LiveFeed';
import { MobileAppBand } from '@/components/sections/MobileAppBand';
import { CTABand } from '@/components/sections/CTABand';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function Page() {
  return (
    <>
      <Hero />
      <ScrollReveal preset="fadeIn"><LogoBar /></ScrollReveal>
      <ScrollReveal preset="fadeUp"><HowItWorks /></ScrollReveal>
      <ScrollReveal preset="fadeUp"><FeaturedMarkets /></ScrollReveal>
      <ScrollReveal preset="scale"><StatsBand /></ScrollReveal>
      <ScrollReveal preset="fadeUp"><AgentRoster /></ScrollReveal>
      <ScrollReveal preset="slideLeft"><ArenaTeaser /></ScrollReveal>
      <ScrollReveal preset="slideRight"><MobileAppBand /></ScrollReveal>
      <ScrollReveal preset="fadeUp"><LiveFeed /></ScrollReveal>
      <ScrollReveal preset="scale"><CTABand /></ScrollReveal>
    </>
  );
}
