import { Router } from 'express'
import { getDashboard } from '../controllers/dashboard.controller'
import authenticate from '../middleware/authenticate'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.get('/', authenticate, asyncHandler(getDashboard))

export default router