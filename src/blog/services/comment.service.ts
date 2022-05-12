import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { CreateComment } from '@/blog/dto/create-comment';
import { Comment } from '@/blog/entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  create(newComment: CreateComment): Promise<Comment> {
    const comment = this.commentRepository.create(newComment);

    return this.commentRepository.save(comment);
  }
}
