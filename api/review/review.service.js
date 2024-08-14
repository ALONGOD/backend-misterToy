import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

import { ObjectId } from 'mongodb'

export const reviewService = {
	query,
	getById,
	add,
}

async function query(filterBy = {}) {
    console.log(filterBy)
	const criteria = {}

	if (filterBy.byUserId) {
		criteria.byUserId = ObjectId.createFromHexString(filterBy.byUserId)
	}
	if (filterBy.toyId) {
		criteria.toyId = ObjectId.createFromHexString(filterBy.toyId)
	}

	try {
		const collection = await dbService.getCollection('review')
		var reviews = await collection
			.aggregate([
				{ $match: criteria },
				{
					$lookup: {
						localField: 'byUserId',
						from: 'user',
						foreignField: '_id',
						as: 'byUser',
					},
				},
                {
                    $unwind: '$byUser',
                },
				{
					$lookup: {
						localField: 'toyId',
						from: 'toy',
						foreignField: '_id',
						as: 'toy',
					},
				},
                {
                    $unwind: '$toy',
                },
            ]).toArray()

        reviews = reviews.map(review => {
            delete review.byUser.password
            return review
        })
		return reviews
	} catch (err) {
		logger.error('cannot find reviews', err)
		throw err
	}
}

async function getById(reviewId) {
	try {
		const collection = await dbService.getCollection('review')
		const review = await collection.findOne({ _id: ObjectId.createFromHexString(reviewId) })
		return review
	} catch (err) {
		logger.error(`while finding review ${reviewId}`, err)
		throw err
	}
}

async function add(review, byUser) {
	try {
		const reviewToAdd = {
			byUserId: ObjectId.createFromHexString(byUser._id),
			toyId: ObjectId.createFromHexString(review.toyId),
			txt: review.txt,
		}
		const collection = await dbService.getCollection('review')
		await collection.insertOne(reviewToAdd)
		return reviewToAdd
	} catch (err) {
		logger.error('cannot insert review', err)
		throw err
	}
}
