import { apiOk } from '@/lib/sdk/api-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  return apiOk({
    status: 'ok',
    service: 'xpredict-agent-api',
    version: 'v1',
    docs: 'https://github.com/xElvolution/Xpredict/tree/main/xpredict-sdk'
  });
}
