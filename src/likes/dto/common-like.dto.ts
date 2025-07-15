import { IsEnum } from 'class-validator';
import { ReactionType } from '../type/reactionType';

export class CommonLikeDto {
  @IsEnum(ReactionType, {
    message: 'like or disLike',
  })
  reactionType: ReactionType;
}
