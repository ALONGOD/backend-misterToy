import { reviewService } from './review.service.js'
import { logger } from '../../services/logger.service.js'

export async function getReview(req, res) {
    try {
        const review = await reviewService.getById(req.params.id)
        res.send(review)
    } catch (err) {
        logger.error('Failed to get review', err)
        res.status(500).send({ err: 'Failed to get review' })
    }
}

export async function addReview(req, res) {
    const { loggedinUser } = req
    try {
        const review = await reviewService.add(req.body, loggedinUser)
        res.send(review)
    } catch (err) {
        logger.error('Failed to get review', err)
        res.status(500).send({ err: 'Failed to get review' })
    }
}

export async function getReviews(req, res) {
    try {
        const filterBy = {
            byUserId: req.query.byUserId || '',
            toyId: req.query.toyId || '',
        }

        const reviews = await reviewService.query(filterBy)
        console.log(reviews)
        res.send(reviews)
    } catch (err) {
        logger.error('Failed to get reviews', err)
        res.status(500).send({ err: 'Failed to get reviews' })
    }
}