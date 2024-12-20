import { NextFunction, Request, Response } from 'express';
import { catchAsync, response, statusCodes, containsBadWord } from '../utils';
import { Comment } from '@prisma/client';
import { db } from '../config';
import { ErrorsMessages, Panic } from '../errors';

export const createComment = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId, content }: Comment = req.body;
		const { id: authorId } = req.user as Comment;
		if (!postId || !content) {
			return next(
				new Panic(ErrorsMessages.CONTENT_REQUIRED, statusCodes.BAD_REQUEST)
			);
		}

		if (containsBadWord(content)) {
			return next(
				new Panic(ErrorsMessages.INAPROPRIATE_CONTENT, statusCodes.BAD_REQUEST)
			);
		}

		const newComment = await db.comment.create({
			data: {
				postId,
				authorId,
				content,
			},
		});
		response(
			res,
			statusCodes.CREATED,
			'comment created succesfully',
			newComment
		);
	}
);

export const updateComment = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id }: { id: string } = req.params as { id: string };
		const { content }: Comment = req.body;
		if (!content) {
			return next(new Panic(ErrorsMessages.CONTENT_REQUIRED, statusCodes.BAD_REQUEST));
		}
		const { id: authorId } = req.user as Comment;

		const updatedComment = await db.comment.update({
			where: {
				id,
				authorId,
			},
			data: {
				content,
			},
		});
		response(
			res,
			statusCodes.OK,
			'comment updated succesfully',
			updatedComment
		);
	}
);

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
	const { id }: { id: string } = req.params as { id: string };
	const { id: authorId } = req.user as Comment;

	await db.comment.delete({
		where: {
			id,
			authorId,
		},
	});
	response(res, statusCodes.OK, 'comment deleted succesfully', undefined);
});

export const getPostComments = catchAsync(
	async (req: Request, res: Response) => {
		const { id: postId }: { id: string } = req.params as {
			id: string;
		};
		const comments = await db.comment.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			where: {
				postId,
			},
			include: {
				upLikes: true,
				downLikes: true,
			},
		});
		response(res, statusCodes.OK, 'comments fetched succesfully', comments);
	}
);

export const uplikeComment = catchAsync(async (req: Request, res: Response) => {
	const { id }: { id: string } = req.params as { id: string };
	const { id: userId } = req.user as Comment;

	const [hasDownLiked, hasUpLiked] = await Promise.all([
		db.comment.findFirst({
			where: {
				id,
				downLikes: {
					some: {
						id: userId,
					},
				},
			},
		}),
		db.comment.findFirst({
			where: {
				id,
				upLikes: {
					some: {
						id: userId,
					},
				},
			},
		}),
	]);

	const data = !hasUpLiked
		? {
				upLikes: {
					connect: {
						id: userId,
					},
				},
				totalUpLikes: { increment: 1 },
				downLikes: hasDownLiked ? { disconnect: { id: userId } } : undefined,
				totalDownLikes: hasDownLiked ? { decrement: 1 } : undefined,
			}
		: {
				upLikes: {
					disconnect: {
						id: userId,
					},
				},
				totalUpLikes: { decrement: 1 },
			};

	await db.comment.update({
		where: {
			id,
		},
		data,
	});

	response(res, statusCodes.OK, 'comment liked succesfully', undefined);
});

export const downlikeComment = catchAsync(
	async (req: Request, res: Response) => {
		const { id }: { id: string } = req.params as { id: string };
		const { id: userId } = req.user as Comment;

		const [hasDownLiked, hasUpLiked] = await Promise.all([
			db.comment.findFirst({
				where: {
					id,
					downLikes: {
						some: {
							id: userId,
						},
					},
				},
			}),
			db.comment.findFirst({
				where: {
					id,
					upLikes: {
						some: {
							id: userId,
						},
					},
				},
			}),
		]);

		const data = !hasDownLiked
			? {
					downLikes: {
						connect: {
							id: userId,
						},
					},
					totalDownLikes: { increment: 1 },
					upLikes: hasUpLiked ? { disconnect: { id: userId } } : undefined,
					totalUpLikes: hasUpLiked ? { decrement: 1 } : undefined,
				}
			: {
					downLikes: {
						disconnect: {
							id: userId,
						},
					},
					totalDownLikes: { decrement: 1 },
				};

		await db.comment.update({
			where: {
				id,
			},
			data,
		});
		response(res, statusCodes.OK, 'comment disliked succesfully', undefined);
	}
);
