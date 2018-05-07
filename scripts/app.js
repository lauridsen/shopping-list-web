function writeNewItem(name, measurement, quantity) {
    // A post entry.
    var postData = {
        measurement: measurement,
        name: name,
        quantity: quantity,
    };

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('items').push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/items/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
}

function saveToList(event) {
    var name = event.target[0].value.trim();
    var quantity = parseInt(event.target[1].value, 10);
    var measurement = event.target[2].value.trim();

    if (name.length > 0 && measurement.length > 0 && quantity) {
        saveToFB(name, measurement, quantity);
    }

    document.getElementById('name').value = '';
    document.getElementById('measurement').value = '';
    document.getElementById('quantity').value = '';
};

function saveToFB(name, measurement, quantity) {
    var postData = {
        name: name,
        measurement: measurement,
        quantity: quantity
    }
    // this will save data to Firebase
    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('items').push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/items/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
};

function refreshUI(list) {
    var lis = '';
    for (var i = 0; i < list.length; i++) {
        lis += '<li data-key="' + list[i].key + '">' + list[i].name + '</li>';
    };
    //document.getElementById('favMovies').innerHTML = lis;
    console.log(lis);
};

var ref = firebase.database().ref("items");

ref.on("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        var id = childData.id;
        console.log(childData);
    })
})