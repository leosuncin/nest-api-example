import { jane, john } from '@/auth/fixtures/users';
import { Comment } from '@/blog/entities/comment.entity';
import { articleByJane, articleByJohn } from '@/blog/fixtures/articles';

export const commentByJaneOnArticleByJohn = Comment.fromPartial({
  article: articleByJohn,
  author: jane,
  body: `Talking to strangers is fantastic.

Just last night a homeless drug addict in the subway told me I should do my positive feedback.

So I did!!!

I literally did my positive feedback 5 minutes later.
It felt great!

Next time I see this guy we'll do my positive feedback together for sure.

P.S. Pro tip: If you see a stranger and want to break the ice, tell them that kudos. Always working for me (with homeless people).`,
  id: '9395e782-367b-4487-a048-242e37169109',
});

export const commentByJohnOnArticleByJane = Comment.fromPartial({
  article: articleByJane,
  author: john,
  body: `I did my positive feedback today.

As dreadful as it may sound, I actually feel pretty good about it.

You need courage todo my positive feedback.
You need resilience to do.

And I managed to do it easily.

How?

Because of my motto: kudos.

DM me if you struggle with your career. The solution is to do my positive feedback. I can help you do that.`,
  id: '2cce7079-b434-42fb-85e3-8d1aadd7bb8a',
});
