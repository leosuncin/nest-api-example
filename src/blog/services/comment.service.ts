import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type IPaginationOptions,
  type Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import type { Repository } from 'typeorm';

import type { CreateComment } from '@/blog/dto/create-comment';
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

  findBy(
    options: IPaginationOptions,
    search: Partial<Comment>,
  ): Promise<Pagination<Comment>> {
    const query = this.commentRepository
      .createQueryBuilder('c')
      .where(search)
      .orderBy('c.createdAt', 'DESC');

    return paginate(query, options);
  }

  getById(id: Comment['id']): Promise<Comment | null> {
    return this.commentRepository.findOne({ where: { id } });
  }

  remove(id: Comment['id']) {
    return this.commentRepository.softDelete({ id });
  }
}
