import { Expose } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';
import slugify from 'slugify';

export class GenerateRoomDto {
  @IsDefined()
  @IsString()
  owner: string;

  @Expose()
  get slug(): string {
    return this.owner.replace(/ /g, '-').toLowerCase();
  }
}
