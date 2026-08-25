const { customAlphabet } = require('nanoid');


const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6);

const generateCode = (prefix = 'USR') => {
  return `${prefix}-${nanoid()}`;
};

module.exports = generateCode;