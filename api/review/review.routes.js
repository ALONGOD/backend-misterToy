import express from 'express'

import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { addReview, getReview, getReviews } from './review.controller.js'

export const reviewRoutes = express.Router()

// middleware that is specific to this router
// reviewRoutes.use(requireAuth)

reviewRoutes.get('/', getReviews)
reviewRoutes.get('/:id', getReview)
reviewRoutes.post('/', requireAuth, addReview)
