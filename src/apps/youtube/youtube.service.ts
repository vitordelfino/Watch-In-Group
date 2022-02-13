import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

@Injectable()
export class YoutubeService {
  private readonly YOUTUBE_API_KEY: string;
  private readonly YOUTUBE_API_URL: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.YOUTUBE_API_KEY = this.configService.get<string>('YOUTUBE_API_KEY');
    this.YOUTUBE_API_URL = this.configService.get<string>('YOUTUBE_API_URL');
  }

  async getVideo(url: string): Promise<YoutubeVideo> {
    const id = this.youTubeGetID(url);
    const cache = await this.getFromCache(id);
    if (cache) {
      return cache;
    }
    const endpoint = this.YOUTUBE_API_URL + '/videos';
    const params = {
      key: this.YOUTUBE_API_KEY,
      part: 'snippet',
      id,
    };
    console.log(endpoint, params);
    const response = await this.httpService
      .get(endpoint, { params })
      .toPromise();
    const video: YoutubeVideo = {
      url,
      item: response.data.items[0],
    };
    await this.saveOnCache(id, video);
    return video;
  }

  async saveOnCache(key: string, value: YoutubeVideo): Promise<void> {
    await this.cacheManager.set(key, value, { ttl: 0 });
  }

  async getFromCache(key: string): Promise<YoutubeVideo> {
    return await this.cacheManager.get(key);
  }

  private youTubeGetID(url: string): string {
    const split = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return split[2] !== undefined
      ? split[2].split(/[^0-9a-z_\-]/i)[0]
      : split[0];
  }
}

export type YoutubeVideo = {
  item: Item;
  url: string;
};

export interface YoutubeVideoResponse {
  kind: string;
  etag: string;
  items: Item;
  pageInfo: PageInfo;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface Item {
  kind: string;
  etag: string;
  id: string;
  snippet: Snippet;
}

export interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  tags: string[];
  categoryId: string;
  liveBroadcastContent: string;
  localized: Localized;
  defaultAudioLanguage: string;
}

export interface Localized {
  title: string;
  description: string;
}

export interface Thumbnails {
  default: Default;
  medium: Default;
  high: Default;
  standard: Default;
  maxres: Default;
}

export interface Default {
  url: string;
  width: number;
  height: number;
}
