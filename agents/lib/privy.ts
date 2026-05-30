import { PrivyClient } from '@privy-io/server-auth';
import { createWalletClient, http, parseEther } from 'viem';
import { xLayerTestnet } from '../../lib/chains';

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function getAgentWallet(walletId: string) {
  return privy.walletApi.getWallet({ id: walletId });
}

export async function sendTransaction(walletId: string, tx: {
  to: `0x${string}`;
  data: `0x${string}`;
  value?: bigint;
}) {
  const { hash } = await privy.walletApi.ethereum.sendTransaction({
    walletId,
    caip2: `eip155:${xLayerTestnet.id}`,
    transaction: {
      to: tx.to,
      data: tx.data,
      value: tx.value ? `0x${tx.value.toString(16)}` : '0x0',
      chainId: xLayerTestnet.id
    }
  });
  return hash as `0x${string}`;
}
