const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: [String], required: true },
    description: { type: String, required: true },
    type : { type: String, default: 'padrão' },
});

module.exports = mongoose.model('Client', ClientSchema);