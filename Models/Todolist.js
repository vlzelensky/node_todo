const {Schema, model, Types} = require('mongoose');
const schema = new Schema({
    title: {type: String},
});

module.exports = model('TodoList', schema);