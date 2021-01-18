const {Schema, model, Types} = require('mongoose');
const schema = new Schema({
    userId: {type: String},
    title: {type: String},
});

module.exports = model('TodoList', schema);