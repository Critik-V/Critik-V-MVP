import { NextFunction, Request, Response } from 'express';
import { catchAsync, response, statusCodes } from '../utils';
import { ExprerienceLevel, JobType, Post } from '@prisma/client';
import { db, env } from '../config';
import fs from 'node:fs';
import { ErrorsMessages, Panic } from '../errors';

const PageLimit: number = 12;

// GET NEWEST POSTS
export const getNewestPosts = catchAsync(
	async (req: Request, res: Response) => {
		const {
			jobType,
			experienceLevel,
			search,
			page,
		}: {
			jobType: JobType;
			experienceLevel: ExprerienceLevel;
			search: string;
			page: string;
		} = req.query as {
			page: string;
			jobType: JobType;
			experienceLevel: ExprerienceLevel;
			search: string;
		};
		const posts = await db.post.findMany({
			take: PageLimit,
			skip: (page ? +page - 1 : 0) * PageLimit,
			orderBy: {
				createdAt: 'desc',
			},
			where: {
				title: search
					? {
							contains: search,
							mode: 'insensitive',
						}
					: undefined,
				archived: false,
				jobType: jobType ? jobType : undefined,
				experienceLevel: experienceLevel ? experienceLevel : undefined,
			},
			include: {
				comments: { select: { id: true } },
			},
		});
		// pagination data
		const totalPosts = await db.post.count({
			where: {
				title: search
					? {
							contains: search,
							mode: 'insensitive',
						}
					: undefined,
				archived: false,
				jobType: jobType ? jobType : undefined,
				experienceLevel: experienceLevel ? experienceLevel : undefined,
			},
		});
		const totalPages = Math.ceil(+totalPosts / PageLimit);

		response(
			res,
			statusCodes.OK,
			'newest posts fetched successfully',
			posts,
			totalPages
		);
	}
);

// MAKE POST
export const makePost = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { file } = req;
		if (!file)
			return next(
				new Panic(ErrorsMessages.FILE_REQUIRED, statusCodes.BAD_REQUEST)
			);
		const { title, description, jobType, experienceLevel }: Post = req.body;
		if (!title || !description || !jobType || !experienceLevel) {
			fs.unlinkSync(file.path);
			return next(
				new Panic(ErrorsMessages.ALL_REQUIRED, statusCodes.BAD_REQUEST)
			);
		}
		const { id: authorId } = req.user as Post;
		const newPost = await db.post.create({
			data: {
				title,
				description,
				jobType,
				experienceLevel,
				authorId,
			},
		});

		const filename: string = `${newPost.id}.pdf`;
		let destinationDirectory: string = `${env.PDF_STORAGE_PATH}`;
		if (destinationDirectory[destinationDirectory.length - 1] !== '/') {
			destinationDirectory += '/';
		}

		if (!fs.existsSync(destinationDirectory)) {
			fs.mkdirSync(destinationDirectory);
		}

		if (file) {
			fs.writeFileSync(
				destinationDirectory + filename,
				new Uint8Array(file.buffer),
				{
					mode: 0o755,
				}
			);
		}

		const pdfService = await fetch(`${env.PDF_CONVERTER_URL}`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				filename: newPost.id,
			}),
		});

		if (pdfService.status === 400) {
			await db.post.delete({
				where: {
					id: newPost.id,
				},
			});
			// fs.unlinkSync(destinationDirectory + filename);
			throw new Panic(
				ErrorsMessages.PDF_CONVERT_FAILED,
				statusCodes.BAD_REQUEST
			);
		}

		response(res, statusCodes.CREATED, 'post created succesfully', newPost);
	}
);

// MODIFY POST
export const updatePost = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id }: { id: string } = req.params as { id: string };
		const { title, description, jobType, experienceLevel }: Post = req.body;
		if (!title || !description || !jobType || !experienceLevel) {
			return next(
				new Panic(ErrorsMessages.ALL_REQUIRED, statusCodes.BAD_REQUEST)
			);
		}
		const { id: authorId } = req.user as Post;
		const post = await db.post.update({
			where: {
				id,
				authorId,
			},
			data: {
				title,
				description,
				jobType,
				experienceLevel,
			},
		});

		response(res, statusCodes.OK, 'post modified succesfully', post);
	}
);

// DELETE POST
export const deletePost = catchAsync(async (req: Request, res: Response) => {
	const { id }: { id: string } = req.params as {
		id: string;
	};
	const { id: authorId } = req.user as Post;
	await db.post.delete({
		where: {
			id,
			authorId,
		},
	});
	res.status(statusCodes.OK).json({
		status: 'success',
		message: 'post deleted succesfully',
	});
});

// GET USER POSTS
export const getMyPosts = catchAsync(async (req: Request, res: Response) => {
	const { id: authorId } = req.user as Post;
	const { page }: { page: string } = req.query as { page: string };
	const posts = await db.post.findMany({
		take: PageLimit,
		skip: (page ? +page - 1 : 0) * PageLimit,
		orderBy: {
			createdAt: 'desc',
		},
		where: {
			authorId,
			archived: false,
		},
		include: {
			comments: { select: { id: true } },
		},
	});
	// pagination data
	const totalPosts = await db.post.count({
		where: { authorId, archived: false },
	});
	const totalPages = Math.ceil(totalPosts / PageLimit);
	response(
		res,
		statusCodes.OK,
		'my posts fetched succesfully',
		posts,
		totalPages
	);
});

// GET ONE POST
export const getOnePost = catchAsync(async (req: Request, res: Response) => {
	const { id }: { id: string } = req.params as { id: string };
	const post = await db.post.findUnique({
		where: {
			id,
		},
		include: {
			author: {
				select: {
					githubLink: true,
					linkedinLink: true,
					otherLink: true,
				},
			},
		},
	});
	response(res, statusCodes.OK, 'post fetched succesfully', post || {});
});

// GET ARCHIVED POSTS
export const getArchivedPosts = catchAsync(
	async (req: Request, res: Response) => {
		const { id: authorId } = req.user as Post;
		const { page }: { page: string } = req.query as { page: string };
		const posts = await db.post.findMany({
			take: PageLimit,
			skip: (page ? +page - 1 : 0) * PageLimit,
			orderBy: {
				createdAt: 'desc',
			},
			where: {
				authorId,
				archived: true,
			},
			include: {
				comments: { select: { id: true } },
			},
		});
		// pagination data
		const totalPosts = await db.post.count({
			where: { authorId, archived: true },
		});
		const totalPages = Math.ceil(totalPosts / PageLimit);
		response(
			res,
			statusCodes.OK,
			'archived posts fetched successfully',
			posts,
			totalPages
		);
	}
);

// GET ONE ARCHIVED POST | [must be deleted]
export const getOneArchivedPost = catchAsync(
	async (req: Request, res: Response) => {
		const { id }: { id: string } = req.params as { id: string };
		const { id: authorId }: Post = req.user as Post;
		const post = await db.post.findUnique({
			where: {
				id,
				authorId,
				archived: true,
			},
		});
		res.status(statusCodes.OK).json({
			status: 'success',
			message: 'post archived fetched succesfully',
			data: post,
		});
	}
);

// ARCHIVE POST
export const archivePost = catchAsync(async (req: Request, res: Response) => {
	const { id }: { id: string } = req.params as { id: string };
	const { id: authorId }: Post = req.user as Post;
	await db.post.update({
		where: {
			id,
			authorId,
		},
		data: {
			archived: true,
		},
	});
	res.status(statusCodes.OK).json({
		status: 'success',
		message: 'post archived succesfully',
	});
});

// UNARCHIVE POST
export const unarchivePost = catchAsync(async (req: Request, res: Response) => {
	const { id }: { id: string } = req.params as { id: string };
	const { id: authorId }: Post = req.user as Post;
	await db.post.update({
		where: {
			id,
			authorId,
		},
		data: {
			archived: false,
		},
	});
	res.status(statusCodes.OK).json({
		status: 'success',
		message: 'post unarchived succesfully',
	});
});

// FAV POST
export const favPost = catchAsync(async (req: Request, res: Response) => {
	enum favPostAction {
		ADD = 'add',
		REMOVE = 'remove',
	}
	const { id }: Post = req.body;
	const { id: userId } = req.user as { id: string };
	const { action } = req.query as { action: favPostAction };

	const hasFav = await db.post.findFirst({
		where: {
			id,
			favByUsers: {
				some: {
					id: userId,
				},
			},
		},
	});

	let updatedUser: Post;

	if (!hasFav && action === favPostAction.ADD) {
		updatedUser = await db.post.update({
			where: {
				id,
			},
			data: {
				favByUsers: { connect: { id: userId } },
				totalFav: { increment: 1 },
			},
		});
	} else if (hasFav && action === favPostAction.REMOVE) {
		updatedUser = await db.post.update({
			where: {
				id,
			},
			data: {
				favByUsers: { disconnect: { id: userId } },
				totalFav: { decrement: 1 },
			},
		});
	} else {
		throw new Panic(ErrorsMessages.IMPOSSIBLE_ACTION, statusCodes.BAD_REQUEST);
	}

	response(res, statusCodes.OK, 'resume saved succesfully', updatedUser);
});

// GET FAV POSTS
export const getFavPosts = catchAsync(async (req: Request, res: Response) => {
	const { id: userId } = req.user as { id: string };
	const {
		jobType,
		experienceLevel,
		search,
		page,
	}: {
		jobType: JobType;
		experienceLevel: ExprerienceLevel;
		search: string;
		page: string;
	} = req.query as {
		page: string;
		jobType: JobType;
		experienceLevel: ExprerienceLevel;
		search: string;
	};
	const posts = await db.post.findMany({
		take: PageLimit,
		skip: (page ? +page - 1 : 0) * PageLimit,
		orderBy: {
			createdAt: 'desc',
		},
		where: {
			favByUsers: {
				some: {
					id: userId,
				},
			},
			title: search
				? {
						contains: search,
						mode: 'insensitive',
					}
				: undefined,
			archived: false,
			jobType: jobType ? jobType : undefined,
			experienceLevel: experienceLevel ? experienceLevel : undefined,
		},
		include: {
			comments: true,
			favByUsers: true,
		},
	});
	// pagination data
	const totalPosts = await db.post.count({
		where: {
			favByUsers: {
				some: {
					id: userId,
				},
			},
		},
	});
	const totalPages = Math.ceil(totalPosts / PageLimit);
	response(
		res,
		statusCodes.OK,
		'fav posts fetched succesfully',
		posts,
		totalPages
	);
});

// GET POST IS FAV BY USER
export const isFavPost = catchAsync(async (req: Request, res: Response) => {
	const { id }: { id: string } = req.params as { id: string };
	const { id: userId } = req.user as { id: string };
	const isFav = await db.post.findFirst({
		where: {
			id,
			favByUsers: {
				some: {
					id: userId,
				},
			},
		},
	});
	res.status(statusCodes.OK).json({
		status: 'success',
		message: 'is fav post fetched succesfully',
		data: isFav ? true : false,
	});
});
