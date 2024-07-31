import fs from 'fs/promises'; // Use the promises API of fs
import { utilService } from './util.service.js';

const PAGE_SIZE = 5;
const toys = utilService.readJsonFile('data/toy.json');

export const toyService = {
  query,
  get,
  remove,
  save,
};

async function query(filterBy = {}, sortBy = {}, pageIdx) {
  console.log('filterBy:', filterBy);
  console.log('sortBy:', sortBy);

  let filteredToys = toys;
  if (filterBy.txt) {
    const regExp = new RegExp(filterBy.txt, 'i');
    filteredToys = filteredToys.filter(toy => regExp.test(toy.name));
  }
  if (filterBy.inStock) {
    filteredToys = filteredToys.filter(
      toy => toy.inStock === JSON.parse(filterBy.inStock)
    );
  }
  if (filterBy.labels && filterBy.labels.length) {
    filteredToys = filteredToys.filter(toy =>
      filterBy.labels.every(label => toy.labels.includes(label))
    );
  }
  if (sortBy.type) {
    filteredToys.sort((t1, t2) => {
      const sortDirection = +sortBy.desc;
      if (sortBy.type === 'name') {
        return t1.name.localeCompare(t2.name) * sortDirection;
      } else if (sortBy.type === 'price' || sortBy.type === 'createdAt') {
        return (t1[sortBy.type] - t2[sortBy.type]) * sortDirection;
      }
    });
  }
  if (pageIdx !== undefined) {
    const startIdx = pageIdx * PAGE_SIZE;
    filteredToys = filteredToys.slice(startIdx, startIdx + PAGE_SIZE);
  }
  return filteredToys;
}

async function get(toyId) {
  const toy = toys.find(toy => toy._id === toyId);
  if (!toy) {
    throw new Error('Toy not found');
  }
  return toy;
}

async function remove(toyId) {
  const idx = toys.findIndex(toy => toy._id === toyId);
  if (idx === -1) {
    throw new Error('No such toy');
  }
  toys.splice(idx, 1);
  await _saveToysToFile();
}

async function save(toy) {
  if (toy._id) {
    const idx = toys.findIndex(currToy => currToy._id === toy._id);
    if (idx !== -1) {
      toys[idx] = { ...toys[idx], ...toy };
    }
  } else {
    toy._id = _makeId();
    toy.createdAt = Date.now();
    toy.inStock = true;
    toys.unshift(toy);
  }
  await _saveToysToFile();
  return toy;
}

function _makeId(length = 5) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function _saveToysToFile() {
  try {
    const toysStr = JSON.stringify(toys, null, 4);
    await fs.writeFile('data/toy.json', toysStr);
  } catch (err) {
    console.error(err);
    throw new Error('Failed to save toys to file');
  }
}
