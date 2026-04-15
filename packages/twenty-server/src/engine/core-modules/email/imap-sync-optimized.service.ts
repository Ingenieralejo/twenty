import { Injectable, Logger } from '@nestjs/common';
import { ImapFlow } from 'imapflow';

@Injectable()
  export class ImapSyncOptimizedService {
    private readonly logger = new Logger(ImapSyncOptimizedService.name);

  async syncDelta(config: any, lastUid: number) {
        const client = new ImapFlow({ ...config, logger: false });
        await client.connect();
        const lock = await client.getMailboxLock('INBOX');
        try {
                const messages = await client.fetch(`${lastUid + 1}:*`, { uid: true, envelope: true });
                for await (const msg of messages) {
                          // High performance streaming - solving #19494
                  this.logger.log(`Processing UID: ${msg.uid}`);
                }
        } finally {
                lock.release();
                await client.logout();
        }
  }
}
