function showIndexPasswordSignIn() {
  let passwordSignIn = document.getElementById("passwordSignIn");
  if (passwordSignIn.type === "password") {
    passwordSignIn.type = "text";
  } else {
    passwordSignIn.type = "password";
  }
}
function showIndexPasswordSignUp() {
  let passwordSignUp = document.getElementById("password");
  if (passwordSignUp.type === "password") {
    passwordSignUp.type = "text";
  } else {
    passwordSignUp.type = "password";
  }
}
function showIndexPasswordConfirmSignUp() {
  let passwordConfirmSignUp = document.getElementById("password2");
  if (passwordConfirmSignUp.type === "password") {
    passwordConfirmSignUp.type = "text";
  } else {
    passwordConfirmSignUp.type = "password";
  }
}
//function to sign up
async function signUp() {
  //data collect from the form
  let firstName = document.getElementById("firstName");
  let lastName = document.getElementById("lastName");
  let email0 = document.getElementById("email");
  let email = email0.value;
  email = email.toLowerCase();
  email = email.trim();
  let password = document.getElementById("password");
  let password2 = document.getElementById("password2");
  let signUpError = document.getElementById("signUpError");
  //check if the fields are empty and display the error message
  if (
    email.value == "" ||
    password.value == "" ||
    firstName.value == "" ||
    lastName.value == ""
  ) {
    setTimeout(() => {
      signUpError.style.display = "block";
    }, 10);
    setTimeout(() => {
      signUpError.style.display = "none";
    }, 6000);
    signUpError.innerHTML = "Please fill all the fields";
    return;
  }
  //check if the passwords match and display the error message
  if (password.value !== password2.value) {
    alert("Passwords do not match");
  } else {
    //check if the password is at least 6 characters
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
    } else {
      //make a body object
      let user = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email,
        password: password.value,
        password2: password2.value,
      };
      //interact with the server
      let response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      let result = await response.json();
      setTimeout(() => {
        //display the msg div
        signUpError.style.display = "block";
        //if the account has been created with success display the success message
        if (result.msg === "User added successfully, you can now sign in !") {
          signUpError.className = "alert alert-success";
          // if the account has been created with success empty the form
          firstName.value = "";
          lastName.value = "";
          email0.value = "";
          password.value = "";
          password2.value = "";
        } else {
          //if the account has not been created with success display the error message
          signUpError.className = "alert alert-danger";
        }
      }, 10);
      //hide the msg div after 6 seconds
      setTimeout(() => {
        signUpError.style.display = "none";
      }, 6000);
      //filling the msg div with the returned message or frontend errors
      signUpError.innerHTML = result.msg;
    }
  }
}

//function to sign in
async function signIn() {
  //collect and treat data
  let email = document.getElementById("emailSignIn").value;
  email = email.toLowerCase();
  email = email.trim();
  let password = document.getElementById("passwordSignIn").value;
  //get the error div
  let signInError = document.getElementById("signInError");
  //check if the fields are empty
  if (email == "" || password == "") {
    setTimeout(() => {
      signInError.style.display = "block";
      signInError.innerHTML = result.msg;
    }, 10);
    setTimeout(() => {
      signInError.style.display = "none";
    }, 6000);
    signInError.innerHTML = "Please fill all the fields";
    return;
  }
  //make a body object
  let auth = {
    email: email,
    password: password,
  };
  //send the request to the server
  let response = await fetch("http://localhost:3000/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(auth),
  });
  let result = await response.json();
  //display the returned message(user not found, wrong password ...)
  if (result.msg) {
    setTimeout(() => {
      signInError.style.display = "block";
      signInError.innerHTML = result.msg;
    }, 10);
    setTimeout(() => {
      signInError.style.display = "none";
    }, 6000);
  } else {
    //if the user is an admin redirect him to the admin page
    if (result.login == 1) {
      window.location.href = "http://localhost:3000/admin";
    }
  }
}
async function goToConv(idConv) {
  try {
    let response = await fetch("http://localhost:3000/conversation/" + idConv, {
      method: "GET",
    });
    let result = await response.json();
    window.location.href = result.href;
  } catch (error) {
    console.log(error);
  }
}
//function to get the id of the user
async function getSessionIdUser() {
  try {
    //interact with the api
    let response = await fetch("http://localhost:3000/api/session", {
      method: "GET",
    });
    let result = await response.json();

    return result.idUser; //return the id of the session user
  } catch (error) {
    console.log(error);
  }
}
//function to get my conversations
async function getMyConvs() {
  try {
    //interact with the api
    let response = await fetch("http://localhost:3000/api/convs/mine", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let result = await response.json();
    return result; //return the conversations
  } catch (error) {
    console.log(error);
  }
}
//function to get the messages of a conversation
async function getMessageById(id) {
  try {
    //interact with the api
    let response = await fetch(`http://localhost:3000/api/messages/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let result = await response.json();
    return result; //return the messages
  } catch (error) {
    console.log(error);
  }
}

//function to display my conversations
async function displayMyConvs() {
  //get my conversations
  let myConvs = await getMyConvs();
  //get the section where we will display the conversations
  let convSesction = document.getElementById("convSection");
  convSesction.innerHTML = "";
  //if there is no conversations yet
  if (myConvs.length == 0) {
    convSesction.innerHTML = `<div style='margin-top:30%;text-align:center'>No conversations yet, look for some people to chat with !</div>`;
    return;
  }
  //if there is conversations we iterate through them
  myConvs.forEach((conv) => {
    //data collected from the conversation
    let photo = conv.photo;
    let name = conv.nom;
    let id = conv.id;
    let participants = conv.participants;
    let messageNonLu = conv.messageNonLu;
    let lastMessageDiv;
    let contenuDernierMessage = "say hi !";
    let hour = "";
    let minutes = "";
    lastMessageDiv = `<p class="lastMessage">${contenuDernierMessage}</p>`;
    if (conv.dernierMessage) {
      let dernierMessageID = conv.dernierMessage.id;
      contenuDernierMessage = conv.dernierMessage.contenu;
      if (contenuDernierMessage.length > 20) {
        contenuDernierMessage = contenuDernierMessage.substring(0, 20) + "...";
      }
      //hadnling the date
      {
        let dateDernierMessage = conv.dernierMessage.date;
        dateDernierMessage = dateDernierMessage.slice(0, 19).replace("T", " ");

        let dateAndTime = dateDernierMessage.split(" ");
        let date = dateAndTime[0];
        let time = dateAndTime[1];
        let TimeSplited = time.split(":");
        hour = TimeSplited[0];
        minutes = TimeSplited[1];
      }
      lastMessageDiv = `<p class="lastMessage"><span>${hour}:${minutes}</span> ${contenuDernierMessage}</p>`;
    }
    //filling the section with the conversations
    convSesction.innerHTML += `
    <div id='${id}'>
  <div  class="conv row">
  <div class='row' style='width:90%'  onclick="goToConv(${id})">
   <div>
          <img
            src="${photo}"
            alt="Conv Photo"
            style="width: 50px; height: 50px; border-radius: 50%"
          />
          </div>
          <div class="convInfo">
            <h5 class="convName">${name}</h5>
${lastMessageDiv}
            </div>
        
        </div>
        <div class="options" onclick='displayOptionsConv(${id},"${name}","${photo}")'>...</div>
      </div>
      </div>
  `;
  });
}
function displayOptionsConv(id, name, photo) {
  try {
    let cadreOptionsConv = document.getElementById("cadreOptionsConv");
    cadreOptionsConv.style.display = "block";
    let optionsConv = document.getElementById("optionsConv");
    optionsConv.style.display = "flex";
    optionsConv.innerHTML = `
      <div class="center">
        <img
          src="${photo}"
          alt=""
          style="width: 70px; border-radius: 50%"
        />
      </div>

      <input
        type="file"
        accept="image/*"
        id="imgConvToUpdate"
        style="display: none"
      />
      <button
        type="button"
        onclick="document.getElementById('imgConvToUpdate').click()"
        class="btn btn-primary"
      >
        Select a picture
      </button>
      <input
        type="text"
        id="nameConveToUpdate"
        value="${name}"
        placeholder="Rename your conversation !"
        class="form-control"
      />
      <button type="button" class="btn btn-success" onclick="updateConv(${id},'${photo}')">
        Update
      </button>
      <div id='cadreDeleteConvBtn'  style='height:37.6px.background:black;border-radius:10px' >
      <button id='deleteConvBtn' type="button" class="btn btn-danger" onclick="deleteConv(${id})" style='width:100%;height:37.6'>
        Delete
      </button>
      </div>
      <button
        type="button"
        class="btn btn-warning"
        onclick="cancelOptionsConv()"
      >
        cancel
      </button>
    `;
  } catch (error) {
    console.log(error);
  }
}
async function updateConv(id, photo) {
  try {
    let nomConv = document.getElementById("nameConveToUpdate").value;
    let imgConv = document.getElementById("imgConvToUpdate").files[0];
    let dataForm = new FormData();
    dataForm.append("nom", nomConv);
    dataForm.append("photo", imgConv);
    dataForm.append("oldPhoto", photo);
    let response = await fetch(`http://localhost:3000/api/convs/update/${id}`, {
      method: "POST",
      body: dataForm,
    });
    let result = await response.json();
    if (result) {
      cancelOptionsConv();
      displayMyConvs();
    }
  } catch (error) {
    console.log(error);
  }
}
//varaible to check if the user canceled the deleting of the conversation
let convDeleteCanceled = false;
function cancelDeletingConv(id) {
  convDeleteCanceled = true;
  let cadreDeleteConvBtn = document.getElementById("cadreDeleteConvBtn");
  cadreDeleteConvBtn.innerHTML = `<button id='deleteConvBtn' type="button" class="btn btn-danger" onclick="deleteConv(${id})" style='width:100%;height:37.6'>
Delete
</button>`;
}
async function deleteConv(id) {
  try {
    let cadreDeleteConvBtn = document.getElementById("cadreDeleteConvBtn");
    cadreDeleteConvBtn.innerHTML = ` 
    <div class='btn btn-danger ' >
    <span id='counting'> Deleting in i</span>
    <button id='cancelDeletingConvBtn'  class='btn btn-warning'
      onclick='cancelDeletingConv(${id})'>
    <ins>cancel</ins>
    </button>
    </div>`;
    let counting = document.getElementById("counting");
    //count to let a cancel possibility
    for (let countdown = 3; countdown >= 0; countdown--) {
      if (convDeleteCanceled) {
        convDeleteCanceled = false;
        return;
      }
      counting.innerHTML = `Deleting in ${countdown}`;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    cancelOptionsConv();
    let convDiv = document.getElementById(id);
    convDiv.remove();
    let response = await fetch(
      `http://localhost:3000/api/convs/deleteParticipant`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idConv: id }),
      }
    );
    let result = await response.json();
  } catch (error) {
    console.log(error);
  }
}
function cancelOptionsConv() {
  let cadreOptionsConv = document.getElementById("cadreOptionsConv");
  cadreOptionsConv.style.display = "none";
  let optionsConv = document.getElementById("optionsConv");
  optionsConv.style.display = "none";
}
async function getZajlByIdUser(id) {
  try {
    let response = await fetch(
      `http://localhost:3000/api/zajls/getZajlByIdUser/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
}
//function to get the session user friend requests
async function getFriendReqs() {
  try {
    let response = await fetch(
      `http://localhost:3000/api/zajls/getFriendReqs`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    return result; //array ofid of users who sent friend requests
  } catch (error) {
    console.log(error);
  }
}
async function settings() {
  await fillProfileInfos();

  let settings = document.getElementById("settings");
  settings.style.display = "block";
}
function cancelSettings() {
  let settings = document.getElementById("settings");
  settings.style.display = "none";
}
async function updateProfile() {
  try {
    let myId = await getSessionIdUser();
    let photo = document.getElementById("inputUpdatePhoto").files[0];
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let passwordConfirm = document.getElementById("passwordConfirm").value;
    let oldPhoto = document.getElementById("photoProfileSettings").src;

    if (password != passwordConfirm) {
      fillUpdateMsg("passwords don't match");
      return;
    }

    let dataForm = new FormData();
    dataForm.append("photo", photo);
    dataForm.append("firstName", firstName);
    dataForm.append("lastName", lastName);
    dataForm.append("email", email);
    dataForm.append("password", password);
    dataForm.append("passwordConfirm", passwordConfirm);
    dataForm.append("oldPhoto", oldPhoto);
    let response = await fetch(
      `http://localhost:3000/api/users/updateProfile/${myId}`,
      {
        method: "POST",
        body: dataForm,
      }
    );
    let result = await response.json();

    if (result) {
      if (result.msg) {
        fillUpdateMsg(result.msg);
      }
    }
  } catch (error) {
    console.log(error);
  }
}
function fillUpdateMsg(msg) {
  let updateProfileMsg = document.getElementById("updateProfileMsg");

  setInterval(() => {
    updateProfileMsg.className = "alert alert-success";
    updateProfileMsg.innerHTML = msg;

    updateProfileMsg.style.display = "block";
  }, 10);
  setTimeout(() => {
    updateProfileMsg.className = "alert alert-success";
    updateProfileMsg.innerHTML = msg;
    updateProfileMsg.style.display = "none";
  }, 3000);
}
async function getUserById(id) {
  try {
    let response = await fetch(`http://localhost:3000/api/users/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
}
function showPassword() {
  let password = document.getElementById("password");
  if (password.type == "text") {
    password.type = "password";
  } else {
    password.type = "text";
  }
}
function showPasswordConfirm() {
  let passwordConfirm = document.getElementById("passwordConfirm");
  if (passwordConfirm.type == "text") {
    passwordConfirm.type = "password";
  } else {
    passwordConfirm.type = "text";
  }
}

async function fillProfileInfos() {
  let id = await getSessionIdUser();
  let user = await getUserById(id);
  let firstName = document.getElementById("firstName");
  firstName.value = user.firstName;

  let lastName = document.getElementById("lastName");
  lastName.value = user.lastName;
  let email = document.getElementById("email");
  email.value = user.email;
  let password = document.getElementById("password");
  password.value = user.password;
  let passwordConfirm = document.getElementById("passwordConfirm");
  passwordConfirm.value = user.password;
}
async function getnumberOfNotif() {
  try {
    let response = await fetch(
      `http://localhost:3000/api/zajls/getnumberOfNotif`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    // console.log(result);
    return result.nbrNotif;
  } catch (error) {
    console.log(error);
  }
}
async function displayNotif() {
  let nbrOfNotif = await getnumberOfNotif();
  let nbrNotif = document.getElementById("nbrNotif");
  if (nbrOfNotif > 9) {
    nbrOfNotif = "9+";
  }
  nbrNotif.innerHTML = nbrOfNotif;
  if (
    nbrOfNotif == 0 ||
    nbrOfNotif == null ||
    nbrOfNotif == "" ||
    nbrOfNotif == undefined
  ) {
    nbrNotif.style.display = "none";
  } else {
    nbrNotif.style.display = "block";
  }
}

//function to diplay notifications
async function notif() {
  try {
    //interaction width the server
    let friendReqs = await getFriendReqs(); //array of users
    //iterate on the user array
    friendReqs.forEach((user) => {
      //data collect
      let id = user.id;
      let lastName = user.lastName;
      let firstName = user.firstName;
      let photo = user.photo;
      //if the user has no photo we set a default one
      if (photo == null || photo == "") {
        photo = "../imgOfConvs/profile.png";
      }
      //get the notif section
      let notifSection = document.getElementById("notifContent");
      // the notif
      notifSection.innerHTML = `
     <div class="addreq " id='${id}reqNotif'>
     <div class='row'>
     <img src="${photo}" alt="user photo" style="width: 20%; height: 50px; border-radius: 50%">
<div style='margin-left:20px;padding-top:10px;height:max-content;width:70%'>${lastName} ${firstName} sent you a friend add req</div>
</div>
<div class='row center' style='gap:5px;margin:5px'>
<button id="${id}AccepteBtn" class="btn btn-success" onclick="acceptReq(${id})" style='min-width:73px'>Add</button>
<button id="${id}RefuseBtn" class="btn btn-danger" onclick="refuseFriendReq(${id})" style='min-width:73px'>Refuse</button>
</div>
     </div>
      `;
    });
    if (friendReqs.length == 0) {
      let notifSection = document.getElementById("notifContent");
      notifSection.innerHTML = `
      <div id='noNotif' >
     No notifications
      </div>

      `;
    }
    //display the notif section
    let notif = document.getElementById("notif");
    notif.style.display = "block";
  } catch (error) {
    console.log(error);
  }
}
//function to refuse an add req
async function refuseFriendReq(id) {
  try {
    //interactipon with the server
    let operation = "refuseFriendReq"; //operation to do in the server side
    let response = await fetch("http://localhost:3000/api/zajls/friendReq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: operation, sender: id }),
    });
    let result = await response.json();

    if (result) {
      //changing the button from accepte to add
      if (document.getElementById(id + "Btn") != null) {
        let btn = document.getElementById(id + "Btn");
        btn.innerHTML = "Add";
        btn.className = "btn btn-success";
        btn.onclick = () => addFriend(id);
      }

      if (document.getElementById(id + "reqNotif") != null) {
        let reqNotif = document.getElementById(id + "reqNotif");
        reqNotif.style.display = "none";
      }
      //deleting the refuse button after refusing
      if (document.getElementById(id + "RefuseBtn") != null) {
        let refuseBtn = document.getElementById(id + "RefuseBtn");
        refuseBtn.style.display = "none";
      }
    }
  } catch (error) {
    console.log(error);
  }
}
function isAtBottom() {
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  const bodyHeight = document.body.scrollHeight;
  return scrollPosition + windowHeight >= bodyHeight - 10;
}
function scrollDown() {
  let messagesSection = document.getElementById("messagesSection");
  messagesSection.scrollTo({
    top: messagesSection.scrollHeight,
    left: 100,
    behavior: "instant",
  });
  let downBtn = document.getElementById("downBtn");
  downBtn.style.display = "none";
}
async function send() {
  try {
    let myphoto = document.getElementById("myProfilePhoto").value;
    let id_Conv = document.getElementById("idConv").value;
    let contenu = document.getElementById("textarea").value;
    let files = document.getElementById("fileInput").files;

    if (contenu == "" && files.length == 0) {
      setTimeout(() => {
        let textarea = document.getElementById("textarea");
        textarea.style.border = "2px solid red";
      }, 10);
      setTimeout(() => {
        let textarea = document.getElementById("textarea");
        textarea.style.border = "0px solid #ced4da";
      }, 2000);
      return;
    }
    //hide rep div if exists
    let div = document.getElementById("refDiv");
    div.style.display = "none";
    //emty the textarea
    document.getElementById("textarea").value = "";
    //get the ref
    let ref = document.getElementById("ref").value;
    //empty the ref for the next message
    document.getElementById("ref").value = "0";
    let refDiv = "";
    if (ref != "0") {
      let refContenu = document.getElementById("refContenu").innerHTML;
      refDiv = `<div  class='myRefMsgDiv' onclick='scrollToId(${ref})'>${refContenu}</div>`;
    }

    let message = new FormData();
    message.append("contenu", contenu);
    message.append("id_Conv", id_Conv);
    message.append("ref", ref);
    if (files.length > 0) {
      for (let file of files) {
        message.append("files", file);
      }
    }
    let response = await fetch("http://localhost:3000/api/messages/", {
      method: "POST",
      body: message,
    });
    let result = await response.json();
    let id = result.insertId;
    let date = new Date();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let media = result.media;
    console.log(media);

    //media existance case
    let mediaDiv = "";
    let contenuDiv = "";
    if (media != "") {
      let splitFiles = media.split(",");
      for (let file of splitFiles) {
        let nature = fileNature(file);
        // console.log(nature);
        if (nature == "image") {
          mediaDiv += `<div style='margin-bottom:5px'><img src=${file} style="width: 100%;  border-radius: 10px" onclick='showImage("${file}")'></div>`;
        } else {
          mediaDiv += `<div style='margin-bottom:5px'><video src=${file} style="width: 100%;  border-radius: 10px" controls></video></div>`;
        }
      }
      if (contenu != "") {
        contenuDiv = ` <p style='background:pink;border-radius:10px;padding:3px;color:black'>${contenu}</p>`;
      }
    }
    let section = document.getElementById("messagesSection");
    section.innerHTML += `${refDiv}
        <div class='myMsgs ' id=${id} >
          <div class='row'>
        <div class='col myPhotoAndDate center'>
        <div class='center' style='height:max-content'>
        <img src=${myphoto} alt="user photo" style="width: 40px;  border-radius: 50%">
        </div>
        <div class='center' style='height:max-content'>${hour}:${minutes}</div>
        </div>
        <div class='myMsgContent'>
          ${contenuDiv}
        ${mediaDiv}
                </div>
        <div class='col' style='width:10%;heigjt:max-content'>
        <div onclick='rep(${id},"${contenu}","${myphoto}")' style='margin-bottom:3px;cursor:pointer;height:max-content'>
        <img src='../icons/airowRef.png' class='myAirowRef'>
        </div>
        <div onclick='deleteMsg(${id})' style='cursor:pointer;height:max-content'>
        <img src='../icons/trash.png' class='myTrash'>
        </div>
        </div>
        </div>
        </div>`;
    //scroll down to the last message
    scrollDown();
    //empty the file input
    document.getElementById("fileInput").value = "";
    document.getElementById("fileInput").files = null;
    console.log(files.length);
  } catch (error) {
    console.log(error);
  }
}
function rep(id, contenu, photo) {
  let textarea = document.getElementById("textarea");
  textarea.focus();
  if (contenu.length > 80) {
    contenu = contenu.substr(0, 80);
    contenu += "...";
  }
  let div = document.getElementById("refDiv");
  div.style.display = "flex";
  div.className = "row";
  div.style.backgroundColor = "#e6e6e6";
  div.innerHTML = `
  <img src=${photo} alt="user photo" style="width: 40px;  border-radius: 50%">
  <div id='refContenu' style='margin-left:10px;width:70%'>${contenu}</div>
  <button onclick='cancelRef()' class='btn btn-danger' style='margin-left:10px'>X</button>
  `;
  let ref = document.getElementById("ref");
  ref.value = id;
}
function cancelRef() {
  let ref = document.getElementById("ref");
  ref.value = "";
  let div = document.getElementById("refDiv");
  div.style.display = "none";
}
async function getNewMessages() {
  try {
    let id_Conv = document.getElementById("idConv").value;
    let section = document.getElementById("messagesSection");
    // let myid = await getSessionIdUser();

    let response = await fetch(
      "http://localhost:3000/api/messages/NewofConv/" + id_Conv,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );
    let result = await response.json();
    if (result.length != 0) {
      if (result[0].updateConv == true) {
        await getMessages();
        return;
      }
    }
    for (let msg of result) {
      let id = msg.id;
      let id_User = msg.id_User;
      let contenu = msg.contenu;
      let media = msg.media;
      let date = msg.date;
      date = date.split(":");
      let hour = date[0].slice(11, 16);
      let minutes = date[1];
      // if (id_User == myid) {
      // section.innerHTML += `
      // <div class='myMsgs row' id=${id}>
      // <div class='col myPhotoAndDate center'>
      // <div class='center'><img src=${msg.photoUser} alt="user photo" style="width: 80%;  border-radius: 50%"></div>
      // <div class='center'>${hour}:${minutes}</div>

      // </div>

      // <div class='myMsgContent'>
      // ${msg.contenu}
      // </div>
      // <div class='col' style='width:10%'>
      // <div onclick='rep(${id},"${msg.contenu}","${msg.photoUser}")' style='margin-bottom:3px;cursor:pointer'><img src='../icons/airowRef.png' class='myAirowRef'></div>
      // <div onclick='deleteMsg(${id})' style='cursor:pointer'><img src='../icons/trash.png' class='myTrash'></div>

      // </div>

      // </div>`;
      // } else {
      let refMsgDiv = "";
      if (msg.refMsg) {
        let refMsg = msg.refMsg;
        let refMsgContenu = refMsg.contenu;
        let refMsgId = refMsg.id;
        if (refMsgContenu.length > 20) {
          refMsgContenu = refMsgContenu.substring(0, 20) + "...";
        }

        refMsgDiv = `<div  class='otherRefMsgDiv' onclick='scrollToId(${refMsgId})'>${refMsgContenu}</div>`;
      }
      //media existance case
      let mediaDiv = "";

      if (media != "") {
        let splitFiles = media.split(",");
        for (let file of splitFiles) {
          let nature = fileNature(file);
          // console.log(nature);
          if (nature == "image") {
            mediaDiv += `<div style='margin-bottom:5px'><img src=${file} style="width: 100%;  border-radius: 10px" onclick='showImage("${file}")'></div>`;
          } else {
            mediaDiv += `<div style='margin-bottom:5px'><video src=${file} style="width: 100%;  border-radius: 10px" controls></video></div>`;
          }
        }
        if (contenu != "") {
          contenu = ` <p style='background:pink;border-radius:10px;padding:3px;color:black'>${contenu}</p>`;
        }
      }
      section.innerHTML += `
      ${refMsgDiv}
  <div class='otherMsgs' id=${id}>
    <div class='row'>
  <div class='col otherPhotoAndDate center'>
  <div class='center'><img src=${msg.photoUser} alt="user photo" style="width: 40px;  border-radius: 50%"></div>
  <div class='center'>${hour}:${minutes}</div>
  </div>
  <div class='otherMsgContent'>
    ${contenu} 
      ${mediaDiv}
          </div>
  <div class='col' style='width:10%'>
  <div onclick='rep(${id},"${msg.contenu}","${msg.photoUser}")' style='margin-bottom:3px;cursor:pointer'><img src='../icons/airowRef.png' class='otherAirowRef'></div>
  <div onclick='deleteOthersMsg(${id})' style='cursor:pointer'><img src='../icons/trash.png' class='myTrash'></div>
  </div>
  </div>
  </div>
  `;
      // }
    }
  } catch (error) {
    console.log(error);
  }
}
async function getMessages() {
  // console.log("getting messages");
  try {
    let id_Conv = document.getElementById("idConv").value;
    let section = document.getElementById("messagesSection");
    section.innerHTML = "";
    let myid = await getSessionIdUser();

    let response = await fetch(
      "http://localhost:3000/api/messages/ofConv/" + id_Conv,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );
    let result = await response.json();
    for (let msg of result) {
      let id = msg.id;
      let id_User = msg.id_User;
      let date = msg.date;
      date = date.split(":");
      let hour = date[0].slice(11, 16);
      let minutes = date[1];
      let refMsgDiv = "";
      if (msg.refMsg) {
        let refMsg = msg.refMsg;
        let refMsgContenu = refMsg.contenu;
        let refMsgId = refMsg.id;
        if (refMsgContenu.length > 20) {
          refMsgContenu = refMsgContenu.substring(0, 20) + "...";
        }
        if (document.getElementById(refMsgId) == null) {
          await getMessages();
        }
        refMsgDiv = `<div  class='myRefMsgDiv' onclick='scrollToId(${refMsgId})'>${refMsgContenu}</div>`;
      }
      if (id_User == myid) {
        //my messages
        section.innerHTML += `
        ${refMsgDiv}
        <div class='myMsgs row' id=${id}>
        <div class='col myPhotoAndDate center'>
        <div class='center'><img src=${msg.photoUser} alt="user photo" style="width: 80%;  border-radius: 50%"></div>
        <div class='center'>${hour}:${minutes}</div>
        </div>
        <div class='myMsgContent'>
        ${msg.contenu}
        </div>
        <div class='col' style='width:10%'>
        <div onclick='rep(${id},"${msg.contenu}","${msg.photoUser}")' style='margin-bottom:3px;cursor:pointer'><img src='../icons/airowRef.png' class='myAirowRef'></div>
        <div onclick='deleteMsg(${id})' style='cursor:pointer'><img src='../icons/trash.png' class='myTrash'></div>
        </div>

        </div>`;
        //others messages
      } else {
        section.innerHTML += `
        <div class='otherMsgs row' id=${id}>
        <div class='col otherPhotoAndDate center'>
        <div class='center'><img src=${msg.photoUser} alt="user photo" style="width: 80%;  border-radius: 50%"></div>
        <div class='center'>${hour}:${minutes}</div>
        </div>
        <div class='otherMsgContent'>
        ${msg.contenu}
        </div>
        <div class='col' style='width:10%'>
        <div onclick='rep(${id},"${msg.contenu}","${msg.photoUser}")' style='margin-bottom:3px;cursor:pointer'><img src='../icons/airowRef.png' class='otherAirowRef'></div>
        <div onclick='deleteOthersMsg(${id})' style='cursor:pointer'><img src='../icons/trash.png' class='myTrash'></div>
        </div>
        </div>
        `;
      }
    }
  } catch (error) {
    console.log(error);
  }
}
let messagesLimit = 0;
let noMore = false;
function noMoreMessages() {
  return noMore;
}

function fileNature(string) {
  let split = string.split(".");
  let ext = split[split.length - 1];
  if (ext == "jpg" || ext == "png" || ext == "jpeg" || ext == "gif") {
    return "image";
  } else {
    return "video";
  }
}
let msgSearched = [];
let currentMsgSearched = 0;
async function searchMsg() {
  try {
    let keyInput = document.getElementById("searchMsgInput");
    let val = keyInput.value;
    let idConv = document.getElementById("idConv").value;
    let response = await fetch(
      `http://localhost:3000/api/messages/search/${val}/${idConv}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    result = result.reverse();
    msgSearched = result;
    scrollToId(result[0].id);
    // console.log(result);
    if (result.length != 0) {
      let ifSearch = document.getElementById("ifSearch");
      ifSearch.style.display = "block";
    } else {
      let alertSearchMsg = document.getElementById("alertSearchMsg");
      alertSearchMsg.style.display = "block";
    }
    let cancelSearchMsgBtn = document.getElementById("cancelSearchMsgBtn");
    cancelSearchMsgBtn.style.display = "block";
  } catch (error) {
    console.log(error);
  }
}
function searchUp() {
  if (currentMsgSearched == msgSearched.length - 1) {
    currentMsgSearched = 0;
    scrollToId(msgSearched[currentMsgSearched].id);
  } else {
    currentMsgSearched++;
    scrollToId(msgSearched[currentMsgSearched].id);
  }
}
function searchDown() {
  if (currentMsgSearched == 0) {
    currentMsgSearched = msgSearched.length - 1;
    scrollToId(msgSearched[currentMsgSearched].id);
  } else {
    currentMsgSearched--;
    scrollToId(msgSearched[currentMsgSearched].id);
  }
}
function cancelSearchMsg() {
  let searchMsgInput = document.getElementById("searchMsgInput");
  searchMsgInput.value = "";
  let cancelSearchMsgBtn = document.getElementById("cancelSearchMsgBtn");
  cancelSearchMsgBtn.style.display = "none";
  let ifSearch = document.getElementById("ifSearch");
  ifSearch.style.display = "none";
  let alertSearchMsg = document.getElementById("alertSearchMsg");
  alertSearchMsg.style.display = "none";
}
async function scrollToId(id) {
  if (document.getElementById(`${id}`) == null) {
    await get20Messages();
    await scrollToId(id);
  } else {
    let div = document.getElementById(`${id}`);
    let divbackcolor = div.style.backgroundColor;
    setTimeout(() => {
      div.style.backgroundColor = " red";
    }, 10);
    setTimeout(() => {
      div.style.backgroundColor = divbackcolor;
    }, 3000);
    div.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
function fillreloadIcon() {
  let get20MessageIcon = document.getElementById("get20MessageIcon");
  get20MessageIcon.innerHTML = ` <img
  src="../icons/reload.png"
  onclick="get20Messages()"
  id="reloadMessageImg"
/>
`;
}
function emptyreloadIcon() {
  let get20MessageIcon = document.getElementById("get20MessageIcon");
  get20MessageIcon.innerHTML = ``;
}

function deleteMsg(id) {
  let deleteOptions = document.getElementById("deleteOptions");
  deleteOptions.innerHTML = `
  <div class='center col' style='gap:5px' >
  <button class='btn btn-danger' onclick='deleteForMe(${id})'>Delete for me</button>
  <button class='btn btn-warning' onclick='deleteForAll(${id})'>Delete for all</button>
  <button class='btn btn-primary' onclick='cancelDeleteMsg()'>Cancel</button>
  </div>`;
  deleteOptions.style.display = "block";
}
function deleteOthersMsg(id) {
  let deleteOptions = document.getElementById("deleteOptions");
  deleteOptions.innerHTML = `
  <div class='center col' style='gap:5px' >
  <button class='btn btn-danger' onclick='deleteForMe(${id})'>Delete for me</button>
  <button class='btn btn-primary' onclick='cancelDeleteMsg()'>Cancel</button>
  </div>`;
  deleteOptions.style.display = "block";
}
async function deleteForMe(id) {
  try {
    document.getElementById(id).remove();
    let response = await fetch(
      `http://localhost:3000/api/messages/deleteForMe/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
  } catch (error) {
    console.log();
  }
}
async function deleteForAll(id) {
  try {
    document.getElementById(id).remove();
    let response = await fetch(`http://localhost:3000/api/messages/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    let result = await response.json();
  } catch (error) {
    console.log();
  }
}
async function updateToDelete() {
  let id_Conv = document.getElementById("idConv").value;
  let response = await fetch(
    `http://localhost:3000/api/convs/updateToDelete/${id_Conv}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );
  let result = await response.json();
  let deletedMsgs = result.deletedMsg;
  let tab = deletedMsgs.split(",");
  for (let element of tab) {
    if (document.getElementById(element) != null) {
      document.getElementById(element).remove();
    }
  }
}
function cancelDeleteMsg() {
  let deleteOptions = document.getElementById("deleteOptions");
  deleteOptions.style.display = "none";
  deleteOptions.innerHTML = "";
}
//function to display the notif div
function cancelNotif() {
  let notif = document.getElementById("notif");
  notif.style.display = "none";
}
//function to make a research of users and existing convs
async function searchConv() {
  try {
    let searchInput = document.getElementById("searchInput"); //input of the search
    //if the input is empty we do nothing and make the border red
    if (searchInput.value == "") {
      setTimeout(() => {
        searchInput.style.border = "3px solid red";
      }, 10);
      setTimeout(() => {
        searchInput.style.border = "0px solid red";
      }, 2000);
      return;
    }
    //interaction with the server to get the researched users
    let users = await fetch(
      "http://localhost:3000/api/users/search/" + searchInput.value,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let resultUsers = await users.json();
    //get the div where users will be displayed
    let friendResult = document.getElementById("friendsResult");
    //if there is no result we display a message
    if (resultUsers.length == 0) {
      friendResult.innerHTML += `
      <div>
      <p>No result</p>
      </div>
    `;
    } else {
      //if there is a result we display the result
      friendResult.innerHTML = "<h4><ins>Friends</ins></h4><hr />";
      resultUsers.forEach(async (user) => {
        //collect of data
        let id = user.id;
        let myid = await getSessionIdUser();
        let zajl = await getZajlByIdUser(id);
        let photo = zajl.photo;
        //if the user has no photo we display a default photo
        if (photo == null) {
          photo = "../imgOfConvs/profile.png";
        }
        let firstName = user.firstName;
        let lastName = user.lastName;
        let btn;
        //verify if i have already sent a friend req to this user and display a cancel btn
        if ((await alreadySent(myid, id)) == true) {
          btn = `<button class='btn btn-danger' onclick="cancelFriendReq(${id})" id='${id}Btn'>Cancel</button>`;
        } else {
          //verify if this user has already sent me a add req and display a accept and refuse btns

          if ((await alreadySent(id, myid)) == true) {
            btn = `<button class='btn btn-success' onclick="acceptReq(${id})" id='${id}Btn'>Accept</button>
           <button class='btn btn-danger' onclick="refuseFriendReq(${id})" id='${id}RefuseBtn'>Refuse</button>`;
          } else {
            btn = `<button class='btn btn-success' onclick="addFriend(${id})" id='${id}Btn'>Add</button>`;
          }
        }

        //verify if this user is already my friend and display a remove btn and there is a link into our conv
        if (await areFriends(myid, id)) {
          friendResult.innerHTML += `
          <div class="friend " id='${id}'>
          <div onclick='goToOurConv(${myid},${id})'>
          <div><img src='${photo}' style='width:40px'></div>
          <div style='padding:3px;background:var(--zajlFrontColor);color:var(--zajlBackColor)'>${firstName} ${lastName}</div>
          </div>
          <button class='btn btn-danger' onclick="removeFriend(${id})" id='${id}Btn'>Remove</button>
          </div>
        `;
        } else {
          //display of the result
          friendResult.innerHTML += `
 <div class="friend ">
 <div><img src='${photo}' style='width:40px'></div>
 <div style='padding:3px;background:var(--zajlFrontColor);color:var(--zajlBackColor)'>${firstName} ${lastName}</div>
   ${btn}
 </div>
`;
        }
      });
    }
    //interaction with the server to get the researched convs
    let response = await fetch(
      `http://localhost:3000/api/convs/search/${searchInput.value}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    //get the div of the result of the convs
    let convResult = document.getElementById("convResult");
    //if there is no result we display a message
    if (result.length == 0) {
      convResult.innerHTML += `
      <div>
      <p>No result</p>
      </div>
    `;
    } else {
      //if there is a result we display the result
      result.forEach((conv) => {
        //collect of data
        let id = conv.id;
        let name = conv.nom;
        let participants = conv.participants;
        let photo = conv.photo;
        //if the conv has no photo we display a default photo
        if (photo == null || photo == "") {
          photo = "../imgOfConvs/profile.png";
        }
        convResult.innerHTML += `
        <div id='${id}' class="convSearched row">
        <div class="convLinkSearched row" onclick="goToConv(${id})">
          <img
            src="${photo}"
            alt="Conv Photo"
            style="width: 50px; height: 35px; border-radius: 50%"
          />
          <div class="convInfoSearched">
            ${name}
          </div>
        </div>
        <div class="optionsSearched" onclick="displayOptionsConv(${id},'${name}','${photo}')">...</div>
      </div>
    `;
      });
    }
    //display of the result div of the users and convs
    let resultDiv = document.getElementById("result");
    resultDiv.style.display = "flex";
  } catch (error) {
    console.log(error);
  }
}
let cancelDeleteUser = false;
function cancelDeleteUserFunction() {
  let deleteUserCadre = document.getElementById("deleteUserCadre");

  cancelDeleteUser = true;
  deleteUserCadre.innerHTML = `<button class="btn btn-danger" onclick="deleteUser()">
    Delete the account</button>`;
}
async function deleteUser() {
  try {
    let deleteUserCadre = document.getElementById("deleteUserCadre");
    deleteUserCadre.innerHTML = `<button class='btn btn-warning' onclick='cancelDeleteUserFunction()'>Cancel</button>
     Deleting in <span id='countDeletUser' ></span>`;
    let countDeletUser = document.getElementById("countDeletUser");
    for (let index = 3; index >= 0; index--) {
      countDeletUser.innerHTML = `${index}`;
      if (cancelDeleteUser == true) {
        cancelDeleteUser = false;
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    let id = await getSessionIdUser();
    let response = await fetch(`http://localhost:3000/api/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    let result = await response.json();
    if (result) {
      window.location.href = "http://localhost:3000";
    }
  } catch (error) {
    console.log(error);
  }
}
async function getOurConvId(id1, id2) {
  try {
    let response = await fetch(
      `http://localhost:3000/api/convs/getOurConvId/${id1}/${id2}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    return result.idConv;
  } catch (error) {
    console.log(error);
  }
}
async function goToOurConv(id1, id2) {
  try {
    //function to get the existing conv between two users or create a new one and return the id of the conv
    let idConv = await getOurConvId(id1, id2);
    goToConv(idConv);
  } catch (error) {
    console.log(error);
  }
}
async function acceptReq(id) {
  try {
    //interaction with the server to accept a friend req
    let response = await fetch(
      `http://localhost:3000/api/zajls/acceptReq/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    //if the req is accepted we display a remove btn and we hide the accept and refuse btns
    if (result.accepted) {
      //update convs
      await displayMyConvs();
      //the accepte btn is transformed to a remove btn
      if (document.getElementById(id + "Btn") != null) {
        document.getElementById(id + "Btn").innerHTML = "Remove";
        document.getElementById(id + "Btn").className = "btn btn-danger";
        document.getElementById(id + "Btn").onclick = function () {
          removeFriend(id);
        };
      }
      //the notification is hidden in the notification div
      if (document.getElementById(id + "reqNotif") != null) {
        let reqNotif = document.getElementById(id + "reqNotif");
        reqNotif.style.display = "none";
      }
      //the refuse btn is hidden
      if (document.getElementById(id + "RefuseBtn") != null) {
        document.getElementById(id + "RefuseBtn").style.display = "none";
      }
    }
  } catch (error) {
    console.log(error);
  }
}
async function removeFriend(id) {
  try {
    //interaction with the server to remove a friend
    let response = await fetch(
      `http://localhost:3000/api/zajls/removeFriend/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    //if the friend is removed we display a add btn and we hide the remove btn
    if (result.removed) {
      //the remove btn is transformed into a add btn
      document.getElementById(id + "Btn").innerHTML = "Add";
      document.getElementById(id + "Btn").className = "btn btn-success";
      document.getElementById(id + "Btn").onclick = function () {
        addFriend(id);
      };
    }
  } catch (error) {
    console.log(error);
  }
}
//function to check if a friend req is already sent from the sender into the reciever
async function alreadySent(sender, reciever) {
  try {
    //interaction with the server to check if a friend req is already sent
    let response = await fetch(
      `http://localhost:3000/api/zajls/alreadySent/${sender}/${reciever}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    return result.alreadySent; //return the result of the check which is a boolean
  } catch (error) {
    console.log(error);
  }
}
//function to check if two users are friends
async function areFriends(id1, id2) {
  try {
    //interaction with the server to check if two users are friends
    let response = await fetch(
      `http://localhost:3000/api/zajls/areFriends/${id1}/${id2}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    return result.areFriends; //return the result of the check which is a boolean
  } catch (error) {
    console.log(error);
  }
}
//function to send a friend add req from the session user into the id user
async function addFriend(id) {
  try {
    //interaction with the server to send a friend req

    let operation = "addReq"; //the operation is addReq because the function in the back deal width 3 operations
    let response = await fetch("http://localhost:3000/api/zajls/friendReq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: operation, friend: id }),
    });
    let result = await response.json();
    if (result) {
      //add btn is transformed into a cancel btn
      let btn = document.getElementById(id + "Btn");
      btn.innerHTML = "Cancel";
      btn.className = "btn btn-danger";
      btn.onclick = () => cancelFriendReq(id);
    }
  } catch (error) {
    console.log(error);
  }
}
//function to cancel a friend req from the session user into the id user
async function cancelFriendReq(id) {
  try {
    //interaction with the server to cancel a friend req
    let operation = "cancelAddReq"; //the operation is cancelAddReq because the function in the back deal width 3 operations
    let response = await fetch("http://localhost:3000/api/zajls/friendReq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: operation, reciever: id }),
    });
    let result = await response.json();
    if (result) {
      //cancel btn is transformed into a add btn
      let btn = document.getElementById(id + "Btn");
      btn.innerHTML = "Add";
      btn.className = "btn btn-success";
      btn.onclick = () => addFriend(id);
    }
  } catch (error) {
    console.log(error);
  }
}
//function to hide the research div
function cancelSearch() {
  let result = document.getElementById("result");
  result.style.display = "none";
  let convResult = document.getElementById("convResult");
  convResult.innerHTML = "";
  let friendResult = document.getElementById("friendsResult");
  friendResult.innerHTML = "";
}
let logOutVar = false;
function logoutBool() {
  return logOutVar;
}
async function logOut() {
  try {
    let response = await fetch("http://localhost:3000/api/zajls/logOut", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let result = await response.json();
    if (result) {
      logOutVar = true;
      window.location.href = "http://localhost:3000/";
    }
  } catch (error) {
    console.log(error);
  }
}
async function getProfilePhoto() {
  try {
    let response = await fetch(
      "http://localhost:3000/api/zajls/myProfilePhoto",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    return result.photo;
  } catch (error) {
    console.log(error);
  }
}
async function fillProfilePhoto() {
  try {
    let response = await fetch(
      "http://localhost:3000/api/zajls/myProfilePhoto",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    let result = await response.json();
    let profilePhoto = document.getElementById("profilePhoto");
    profilePhoto.src = result.photo;
    let photoProfileSettings = document.getElementById("photoProfileSettings");
    photoProfileSettings.src = result.photo;
  } catch (error) {
    console.log(error);
  }
}
async function fillNameAndPhoto() {
  try {
    //interaction with the server to get the name and the photo of the session user
    let response = await fetch("http://localhost:3000/api/convs/nameAndPhoto", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let result = await response.json();
    //fill the idConv in a hidden input
    let idConv = document.getElementById("idConv");
    idConv.value = result.idConv;
    //display the name and the photo of the session user
    let header = document.getElementById("convHeader");
    header.innerHTML = `
    <div class="row">
    <img
    id="imgHeaderConv"
    src="${result.photo}"
    alt=""
    style="width: 60px; border-radius: 50%"
  />
  <h3 id="nameConv">${result.name}</h3>
  </div>`;
  } catch (error) {
    console.log(error);
  }
}
function returnToAdmin() {
  window.location.href = "http://localhost:3000/admin";
}
