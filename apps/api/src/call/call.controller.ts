import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

@Controller('call')
export class CallController {
  constructor(private readonly configService: ConfigService) {}

  @Get('ice-servers')
  async getIceServers(): Promise<RTCIceServer[]> {
    const apiKey = this.configService.get<string>('METERED_API_KEY');
    const domain = this.configService.get<string>('METERED_DOMAIN');

    if (!apiKey || !domain) {
      console.warn(
        'METERED_API_KEY or METERED_DOMAIN not configured. Using public STUN servers only.',
      );
      return this.getFallbackIceServers();
    }

    try {
      const response = await fetch(
        `https://${domain}/api/v1/turn/credentials?apiKey=${apiKey}`,
      );

      if (!response.ok) {
        console.error(
          'Metered API error:',
          response.status,
          await response.text(),
        );
        return this.getFallbackIceServers();
      }

      const servers = (await response.json()) as RTCIceServer[];
      return servers;
    } catch (error) {
      console.error('Failed to fetch TURN credentials:', error);
      return this.getFallbackIceServers();
    }
  }

  private getFallbackIceServers(): RTCIceServer[] {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];
  }
}
