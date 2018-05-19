firebase.initializeApp({
    apiKey: "AIzaSyCQVZtrLQNS3-ctGrG1A4cVj2ER2Oig0aU",
    authDomain: "shopping-list-e9330.firebaseapp.com",
    databaseURL: "https://shopping-list-e9330.firebaseio.com",
    projectId: "shopping-list-e9330",
    storageBucket: "shopping-list-e9330.appspot.com",
    messagingSenderId: "722348529589",
});

let state;
let user = firebase.auth().currentUser;
let ref;
let signUpState = false;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      document.getElementById("appLogin").style.display = "none";
      document.getElementById("appContent").style.display = "block";

      document.getElementById('inputForm').addEventListener("submit", saveToList);
      
      ref = firebase.database().ref('/users/' + user.uid + "/items");
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

    function writeNewItem(name, measurement, quantity) {
        // A post entry.
        var postData = {
            measurement: measurement,
            name: name,
            quantity: parseInt(quantity),
        };
    
        // Get a key for a new Post.
        var newPostKey = firebase.database().ref().child('/users/' + user.uid + "/items").push().key;
    
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
        //var newPostKey = firebase.database().ref().child('/users/' + user.uid + "/items").push().key;
    
        // Write the new post's data simultaneously in the posts list and the user's post list.
        //var updates = {};
        //updates['/users/' + user.uid + '/items'] = postData;
        console.log(postData);
        return firebase.database().ref('/users/' + user.uid + '/items').push(postData);
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
        console.log(user);
        var wareRef = firebase.database().ref('/users/' + user.uid + "/items").child(key).once('value').then(snapshot => {
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
        firebase.database().ref('/users/' + user.uid + "/items").child(key).update(data);
    }
    
    function deleteWareFB(key) {
        firebase.database().ref('/users/' + user.uid + "/items").child(key).remove();
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
            firebase.database().ref('/users/' + user.uid + "/items").child(key).set(data.val());
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

    } else {
      // No user is signed in.
      document.getElementById("appLogin").style.display = "block";
      document.getElementById("appContent").style.display = "none";
      document.getElementById("signUpForm").style.display = "none";
      document.getElementById("signInLink").style.display = "none";
    }
  });

function login(event) {
    event.preventDefault();
    const userEmail = document.getElementById('emailInput').value;
    const userPassword = document.getElementById('passwordInput').value;

    firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
        // ...
      });
}

function logout() {
    firebase.auth().signOut().then(function(){
        //Signed out successfully
        document.getElementById('signInLink').style.display = "none";
        document.getElementById('signUpForm').style.display = "none";
        document.getElementById('signUpLink').style.display = "block";
        document.getElementById('loginForm').style.display = "flex";
    }).catch(function(error){
        //An error occured
        console.log(error.message);
    });
}

function signUp() {

    event.preventDefault(event);
    const userEmail = document.getElementById('emailSignUpInput').value;
    const userPassword = document.getElementById('passwordSignUpInput').value;
    const userName = document.getElementById('usernameSignUpInput').value;


    firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword).then(function() {
        var loggedInUser = firebase.auth().currentUser;
    
        postData = {
            username: userName
        }
        // Get a key for a new Post.
        var newPostKey = firebase.database().ref().child('/users/' + loggedInUser.uid).push().key;
    
        // Write the new post's data simultaneously in the posts list and the user's post list.
        var updates = {};
        updates['/users/' + newPostKey] = postData;
    
        firebase.database().ref().update(updates);
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });
}

document.getElementById('signUpLink').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = "none";
    document.getElementById('signUpLink').style.display = "none";
    document.getElementById('signInLink').style.display = "block";
    document.getElementById('signUpForm').style.display = "flex";
})

document.getElementById('signInLink').addEventListener('click', function() {
    document.getElementById('signInLink').style.display = "none";
    document.getElementById('signUpForm').style.display = "none";
    document.getElementById('signUpLink').style.display = "block";
    document.getElementById('loginForm').style.display = "flex";
})
