import { Router } from 'express';
import multer from 'multer';
import { postHandler } from '../handlers';
import { isAuthenticated } from '../auth';

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 3 * 1024 * 1024, // no larger than 3mb
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype === 'application/pdf') {
			cb(null, true);
		} else {
			cb(new Error('File type not supported'));
		}
	},
});

const router = Router();

router.use(isAuthenticated);

router
	.route('/')
	.get(postHandler.getNewestPosts)
	.post(upload.single('file'), postHandler.makePost);

router.route('/mine').get(postHandler.getMyPosts);
router.route('/archived').get(postHandler.getArchivedPosts);
router.route('/fav').post(postHandler.favPost).get(postHandler.getFavPosts);
router.route('/isFav/:id').get(postHandler.isFavPost);

router
	.route('/:id')
	.get(postHandler.getOnePost)
	.patch(postHandler.updatePost)
	.delete(postHandler.deletePost);

router
	.route('/archive/:id')
	.patch(postHandler.archivePost)
	.get(postHandler.getOneArchivedPost);

router.route('/unarchive/:id').patch(postHandler.unarchivePost);

export default router;
