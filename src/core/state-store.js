'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { migrateState } = require('./default-state');

class StateStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.writeChain = Promise.resolve();
  }

  async load() {
    try {
      return migrateState(JSON.parse(await fs.readFile(this.filePath, 'utf8')));
    } catch (error) {
      if (error.code === 'ENOENT' || error instanceof SyntaxError) return migrateState(null);
      throw error;
    }
  }

  save(state) {
    const snapshot = JSON.stringify(state, null, 2) + '\n';
    this.writeChain = this.writeChain.then(async () => {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const temp = `${this.filePath}.tmp-${process.pid}-${Date.now()}`;
      await fs.writeFile(temp, snapshot, 'utf8');
      await fs.rename(temp, this.filePath);
    });
    return this.writeChain;
  }
}

module.exports = { StateStore };
