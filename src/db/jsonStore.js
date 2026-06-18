const fs = require('fs');
const path = require('path');
const { generateId } = require('../utils/id');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function fileFor(table) {
  return path.join(DATA_DIR, `${table}.json`);
}

function now() {
  return new Date().toISOString();
}

function read(table) {
  const file = fileFor(table);
  if (!fs.existsSync(file)) return [];
  try {
    const content = fs.readFileSync(file, 'utf8');
    return content ? JSON.parse(content) : [];
  } catch (error) {
    const backup = `${file}.corrupt-${Date.now()}`;
    fs.copyFileSync(file, backup);
    return [];
  }
}

function write(table, rows) {
  const file = fileFor(table);
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(rows, null, 2));
  fs.renameSync(temp, file);
}

function all(table) {
  return read(table);
}

function findById(table, id) {
  return read(table).find((row) => row.id === id) || null;
}

function insert(table, data, prefix) {
  const rows = read(table);
  const row = { id: generateId(prefix), createdAt: now(), updatedAt: now(), ...data };
  rows.push(row);
  write(table, rows);
  return row;
}

function update(table, id, patch) {
  const rows = read(table);
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) return null;
  rows[index] = { ...rows[index], ...patch, updatedAt: now() };
  write(table, rows);
  return rows[index];
}

function remove(table, id) {
  const rows = read(table);
  const filtered = rows.filter((row) => row.id !== id);
  write(table, filtered);
  return filtered.length !== rows.length;
}

function replace(table, rows) {
  write(table, rows);
}

module.exports = { all, findById, insert, update, remove, replace, now };
