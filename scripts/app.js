let state;

function writeNewItem(name, measurement, quantity) {
    // A post entry.
    var postData = {
        measurement: measurement,
        name: name,
        quantity: parseInt(quantity),
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

    var name = document.getElementById("inputForm").elements["name"].value.trim();
    var measurement = document.getElementById("inputForm").elements["measurement"].value.trim();
    var quantity = parseInt(document.getElementById("inputForm").elements["quantity"].value.trim());

    if (name.length > 0 && measurement.length > 0 && quantity) {
        saveToFB(name, measurement, quantity);
        document.getElementById("inputForm").reset();
    }

};

function saveToFB(name, measurement, quantity) {
    var postData = {
        name: name,
        measurement: measurement,
        quantity: quantity
    }
    // this will save new data to Firebase
    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('items').push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/items/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
};

function refreshUI(list) {

    const shoppingList = document.getElementById('shoppingList');

    var wares = ``;
    for (var i = 0; i < list.length; i++) {
        wares += `
            <div data-item-key="${list[i].key}" class="shopping-list-ware">
                <div class="shopping-list-ware__content">
                    <p><strong>${list[i].name}</strong> ${list[i].quantity} ${list[i].measurement} </p>
                </div>
                <div class="shopping-list-ware__button-group">
                    <button class="btn btn-edit"> 
                        <svg class="edit__icon">
                            <use xlink:href="./sprite.svg#icon-pencil" />
                        </svg>
                     </button>
                    <button class="btn btn-delete"> 
                        <svg class="delete__icon">
                            <use xlink:href="./sprite.svg#icon-trash" />
                        </svg>
                    </button>
                </div>
            </div>
            `;
    };
    document.getElementById('shoppingList').innerHTML = wares;
    updateListeners();
    return true;
};

var ref = firebase.database().ref("items");

ref.on("value", function (snapshot) {
    let items = [];
    snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        childData.key = childSnapshot.key;
        items.push(childData);
    })
    console.log(items)
    state = items;
    refreshUI(items)
})

ref.on("child_removed", function (data) {
    console.log("Shit got removed, yo!: ", data.key, data.val());
    showToast(data.key, data);
})

function updateListeners() {
    const editButtons = document.querySelectorAll('.shopping-list-ware .shopping-list-ware__button-group .btn-edit');
    Array.from(editButtons).forEach(ware => {
        ware.addEventListener('click', (event) => {
            const wareKey = event.target.parentElement.parentElement.attributes["data-item-key"].nodeValue;
            editSingleWare(event, wareKey);
            getSingleWare(wareKey);
        })
    })
    const deleteButtons = document.querySelectorAll('.shopping-list-ware .btn-delete');
    Array.from(deleteButtons).forEach(ware => {
        ware.addEventListener('click', (event) => {
            const wareKey = event.target.parentElement.parentElement.attributes["data-item-key"].nodeValue;
            deleteWareFB(wareKey);
        })
    })
}

function getSingleWare(key) {
    var wareRef = firebase.database().ref("items").child(key).once('value').then(snapshot => {
        console.log(key, ": ", snapshot.val());
    });
}

function editSingleWare(event, key) {
    var wareRef = firebase.database().ref("items").child(key).once('value').then(snapshot => {
        const item = snapshot.val();
        let formInput = event.target.parentElement.parentElement;

        // Set current measurement as selected
        let dropdown = ``;
        var options = ['kg', 'gr', 'l', 'ml', 'pcs'];
        for (let i = 0; i < options.length; i++ ) {
            if (options[i] == item.measurement) {
                dropdown+= `<option value="${options[i]}" selected>${options[i]}</option>`
            } else {
                dropdown+= `<option value="${options[i]}">${options[i]}</option>`
            }
        }

        formInput.innerHTML = `
            <form id="editForm">
                <input type="text" id="name" placeholder="Name" value="${item.name}"/>
                <input type="number" id="quantity" placeholder="Quantity" value="${item.quantity}"/>
                <select id="measurement">
                    ${dropdown}
                </select>
                <input type="submit">
            </form>
        `

        formInput.addEventListener('submit', (event) => {
            event.preventDefault();
            item.name = event.target.elements["name"].value
            item.quantity = parseInt(event.target.elements["quantity"].value)
            item.measurement = event.target.elements["measurement"].value
            updateWareFB(key, item);
        })

    });
}

function updateWareFB(key, data) {
    firebase.database().ref("items").child(key).update(data);
}

function deleteWareFB(key) {
    firebase.database().ref("items").child(key).remove();
}

function showToast(key, data) {
    const node = document.createElement("div");
    node.classList.add('popUp')
    const para = document.createElement("P");
    const textNode = document.createTextNode(`${data.val().name} was removed from your shopping list`);
    para.appendChild(textNode);
    node.appendChild(para);
    document.querySelector('.popUpContainer').appendChild(node);
    const buttonNode = document.createElement("BUTTON");
    const buttonText = document.createTextNode("Undo");
    buttonNode.appendChild(buttonText);
    node.appendChild(buttonNode);

    // Undo / Resave data
    buttonNode.addEventListener('click', () => {
        firebase.database().ref("items").child(key).set(data.val());
        node.style.opacity = '0';
        setTimeout(() => {
            node.remove();
        }, 300)
    })

    setTimeout(() => {
        node.style.opacity = '0';
        setTimeout(() => {
            node.remove();
        }, 300)
    }, 5000)
}