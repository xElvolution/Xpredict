import 'dotenv/config';
import { getFactoryMarkets, getMarketState } from './lib/chain';

async function main() {
  const markets = await getFactoryMarkets();
  console.log(`Total markets onchain: ${markets.length}\n`);
  for (let i = 0; i < markets.length; i++) {
    const addr = markets[i];
    try {
      const s = await getMarketState(addr);
      const yesRes = Number(s.yesReserves) / 1e6;
      const noRes = Number(s.noReserves) / 1e6;
      const needsSeed = yesRes === 0 && noRes === 0;
      console.log(
        `${i + 1}. ${addr}\n   YES:${yesRes}  NO:${noRes}  resolved:${s.resolved}${needsSeed ? '  <-- NEEDS SEED' : ''}\n   "${s.question as string}"`
      );
    } catch (e: any) {
      console.log(`${i + 1}. ${addr} | ERROR: ${e.message?.slice(0, 80)}`);
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
