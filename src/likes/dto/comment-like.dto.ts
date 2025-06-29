import { IsEnum } from 'class-validator';
import { ReactionType } from '../type/reactionType';

export class commentLikeDto {
  @IsEnum(ReactionType, {
    message: 'like or disLike',
  })
  reactionType: ReactionType;
}
