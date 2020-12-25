const {Schema, model, Types} = require('mongoose');
const schema = new Schema({
    text: {type: String, required: true},
    checked: {type: Boolean, required: true},
    id_list: {type: String, required: true}
});

module.exports = model('TodoTask', schema);