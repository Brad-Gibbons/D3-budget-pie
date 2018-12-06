const form = document.querySelector('form');
const name = document.getElementById('name');
const cost = document.getElementById('cost');
const error = document.getElementById('error');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if(name.value && cost.value) {
        const item = {
            name: name.value,
            cost: parseInt(cost.value)
        };
        // save to firestore

        db.collection('expenses').add(item).then((res) => {
            name.value = '';
            cost.value = '';
            error.textContent = '';
        })
    } else {
        error.textContent = 'Please enter values'
    }
})