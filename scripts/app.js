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
    event.preventDefault();

    var name = document.getElementById("inputForm").elements["name"].value;
    var measurement = document.getElementById("inputForm").elements["measurement"].value;
    var quantity = document.getElementById("inputForm").elements["quantity"].value;

    if (name.length > 0 && measurement.length > 0 && quantity) {
        saveToFB(name.trim(), measurement.trim(), quantity.trim());
        document.getElementById("inputForm").reset();
    }

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
        lis += '<li>' + list[i].name + '</li>';
    };
    document.getElementById('shoppingList').innerHTML = lis;
};

var ref = firebase.database().ref("items");

ref.on("value", function (snapshot) {
    let items = [];
    snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        var id = childData.id;
        items.push(childData);
    })
    refreshUI(items)
})