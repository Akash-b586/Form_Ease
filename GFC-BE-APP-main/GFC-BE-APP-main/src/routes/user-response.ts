import express from 'express';
import { fetchUserResponseData, getUserResponseController, saveUserResponseController, getMyResponseController } from '../controllers/user-responses';
import { API_REQUEST_ROUTES } from '../common/constants';

const router = express.Router();

router.get(API_REQUEST_ROUTES.GET_USER_RESPONSE_BY_ID, getUserResponseController);
router.post(API_REQUEST_ROUTES.SAVE_USER_RESPONSE, saveUserResponseController);
router.get(API_REQUEST_ROUTES.GET_USER_RESPONSE_BY_USER_ID, fetchUserResponseData);
router.get(API_REQUEST_ROUTES.GET_MY_RESPONSE, getMyResponseController);

export default router;