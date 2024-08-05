import { toyService } from './toy.service.js'
import { logger } from '../../services/logger.service.js'

export async function getToys(req, res) {
    console.log(req.query)
    try {
        const { filterBy = {}, sortBy = {}, pageIdx = '0' } = req.query;

        // Parse and default values
        const txt = filterBy.txt || '';
        const inStock = filterBy.inStock === 'true' ? true : filterBy.inStock === 'false' ? false : 'all'; // Convert to boolean or 'all'
        const labels = Array.isArray(filterBy.labels) ? filterBy.labels : [];
        const pageIndex = parseInt(pageIdx, 10) || 0;
        const sortType = sortBy.type || 'name';
        const sortOrder = sortBy.desc === '-1' ? -1 : 1;

        // Prepare filter criteria
        const filter = {
            name: { $regex: txt, $options: 'i' },
            ...(inStock !== 'all' ? { inStock } : {}), // Apply filter only if not 'all'
            ...(labels.length > 0 ? { labels: { $in: labels } } : {}),
        };

        // Prepare sorting criteria
        const sort = { [sortType]: sortOrder };

        // Prepare pagination criteria
        const pageSize = 10; // Define a page size
        const skip = pageIndex * pageSize;

        // Query toys from the service
        const toys = await toyService.query(filter, sort, skip, pageSize);
        res.json(toys);
    } catch (err) {
        logger.error('Failed to get toys', err)
        res.status(500).send({ err: 'Failed to get toys' });
    }
}

export async function getToyById(req, res) {
    try {
        const toyId = req.params.id
        const toy = await toyService.getById(toyId)
        res.json(toy)
    } catch (err) {
        logger.error('Failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy' })
    }
}

export async function addToy(req, res) {
    const { loggedinUser } = req

    try {
        const toy = req.body
        toy.owner = loggedinUser
        const addedToy = await toyService.add(toy)
        res.json(addedToy)
    } catch (err) {
        logger.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}

export async function updateToy(req, res) {
    try {
        const toy = req.body
        const updatedToy = await toyService.update(toy)
        res.json(updatedToy)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToy(req, res) {
    try {
        const toyId = req.params.id
        const deletedCount = await toyService.remove(toyId)
        res.send(`${deletedCount} toys removed`)
    } catch (err) {
        logger.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}

export async function addToyMsg(req, res) {
    const { loggedinUser } = req
    try {
        const toyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
            createdAt: Date.now(),
        }
        const savedMsg = await toyService.addToyMsg(toyId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToyMsg(req, res) {
    try {
        const { toyId, msgId } = req.params

        const removedId = await toyService.removeToyMsg(toyId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove toy msg', err)
        res.status(500).send({ err: 'Failed to remove toy msg' })
    }
}