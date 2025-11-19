const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Configure multer storage for avatars
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname) || '.png';
		cb(null, `user_${Date.now()}${ext}`);
	}
});
const upload = multer({ storage });

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.me);
router.put('/me', auth, authController.updateMe);
router.post('/avatar', auth, upload.single('avatar'), authController.updateAvatar);

module.exports = router;
