import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Entities, ENTITY_METADATA_KEY } from '~blog/constants/entity.enum';
import { Article } from '~blog/entities/article.entity';
import { ArticleService } from '~blog/services/article.service';
import { CommentService } from '~blog/services/comment.service';
import { type Request } from 'express';
import invariant from 'tiny-invariant';

@Injectable()
export class IsAuthorGuard implements CanActivate {
  constructor(
    private readonly module: ModuleRef,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request<{ id: string }>>();
    const kindOf = this.reflector.get<Entities>(
      ENTITY_METADATA_KEY,
      context.getHandler(),
    );
    const service = this.module.get<ArticleService | CommentService>(
      kindOf === Entities.COMMENT ? CommentService : ArticleService,
    );
    const entity = await service.getById(Article.extractId(request.params.id));

    if (!entity) {
      return true;
    }

    // The request.user is defined and checked by JWTAuthGuard
    invariant(request.user, 'Must be logged in');

    if (entity.author.id !== request.user.id) {
      throw new ForbiddenException(`You are not the author of the ${kindOf}`);
    }

    return true;
  }
}
