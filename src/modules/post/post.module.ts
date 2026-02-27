import { Module } from '@nestjs/common';

import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';
import { PostMappingService } from './services/post-mapping.service';
import { CommonModule } from '../../common/common.module';

@Module({
    imports: [CommonModule],
    controllers: [PostController],
    providers: [PostService, PostMappingService],
    exports: [PostService, PostMappingService],
})
export class PostModule {}
