
var getCurrentUser = function(){
      console.log('currentUser :'+localStorage.getItem('email'));
      return localStorage.getItem('email');
}
var logout = function(){
    console.log('User : '+firebase.auth().currentUser.email);
    firebase.auth().signOut();
    console.log('Successfully logged out');
}

var isRegistered = function(uid) //function to check user is registered or not only after login
{
    var database=firebase.database();
    var users = database.ref('Users').orderByKey().equalTo(uid);
    var match=false;
    users.on('value',function(snapshot){
      snapshot.forEach(function(childSnapshot)   //To fetch all user_id(key values) under users
      {
          console.log(childSnapshot.val().email+ ' is successfully registered');
          presenter.registerSuccess();
      });
    }
  );
}

firebase.auth().onAuthStateChanged(function(user){
        if(user){
            //sessionStorage.email = user.email;
            console.log(user.email+' user logged in');
            isRegistered(user.uid);
        }
        else{
            console.log('Redirect user to login page');
            localStorage.removeItem('email');
            window.location = 'index.html';
        }
});

var model = {
  register : function(name,contactNumber,rollNo,image){
                  var user = firebase.auth().currentUser;
                  var id = user.uid;
                  var user_email = user.email;
                  var storage = firebase.storage().ref(id);
                  var task=storage.child(id).put(image);

                  task.on('state_changed', function(snapshot)
                  {
                      progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      absoluteProgress = parseInt(progress)+"%";
                      presenter.updateProgress(absoluteProgress);
                  },
                  function(error) {
                      presenter.registerError(error.message);
                  },
                  function()
                  {
                        var postKey = firebase.database().ref().child('Users'+id).push().key;
                        var downloadURL = task.snapshot.downloadURL;
                        var updates = {};
                        var postData =
                        {
                            name:name ,
                            email:user_email ,
                            contact_number:contactNumber ,
                            roll_no:rollNo,
                            imager_url:downloadURL
                        };
                      updates['/Users/' + id] = postData;
                      firebase.database().ref().update(updates).then(function()
                      {
                            presenter.registerSuccess();
                      });
                      //Need to update the user if push not successful
                  });
                }

};
var presenter = {
  register  : function(name,contactNumber,rollNo,image,validContactNo){
                  if(name=="" || name==null)
                  {
                      view.showError("Please enter your name");
                      return;
                  }
                  else if(contactNumber=="")
                  {
                      view.showError("Please enter your contact number");
                      return;
                  }
                  else if(!contactNumber.match(validContactNo) || contactNumber.length!=10)
                  {
                      view.showError("Invalid contact number");
                      return;
                  }
                  else if(rollNo=="")
                  {
                      view.showError("Please enter your roll number");
                      return;
                  }
                  else if (image==undefined) {
                      view.showError("Upload your photo");
                      return;
                  }
                  else
                  {
                      console.log('Starting your registration, please fasten your seat belt');
                      view.updateProgress(0);
                      model.register(name,contactNumber,rollNo,image);
                  }
      },

      registerError    : function(error){
                  console.log('Error while Registration '+error);
                  view.showError(error);
      },

      registerSuccess  : function(){
                  console.log('Registration successful, redirecting to Main Page');
                  window.location="main.html";
      },

      updateProgress: function(progress){
                  console.log(progress);
                  view.updateProgress(progress);
      },
      getCurrentUser : function(){
                       console.log('Current user is : '+getCurrentUser());
                       view.setHeaderEmail(getCurrentUser());
      }


};
var view = {
       init  :  function(){
                registrationDiv = document.getElementById('registrationDiv');
                errorElements = document.getElementById('registrationError');
                loadingElement = document.getElementById('loading');
                progressElement = document.getElementById('progressBar');

                logoutButtonElement = document.getElementById('signout');
                userEmailElement = document.getElementById('user_email');
                nameBox = document.getElementById('name');
                contactNumberBox = document.getElementById('contactNumber');
                rollNoBox = document.getElementById('rollNo');
                imageBox = document.getElementById("image");
                registerButton = document.getElementById('registerButton');
                validContactNo = /^[0-9]+$/;

                loadingElement.style.display = 'none';
                headerUserElem = document.getElementById('user_email');
                logOutButton = document.getElementById('signout');
                logOutButton.addEventListener('click',function(){
                                  presenter.logout();
                });
                presenter.getCurrentUser();


                registerButton.addEventListener('click',function(){
                        presenter.register(nameBox.value,contactNumberBox.value,
                          rollNoBox.value,imageBox.files[0],validContactNo);
                });

                logoutButtonElement.addEventListener('click',function(){
                          logout();
                });
       },
       showError  : function(error){
                  registrationDiv.style.display = "block";
                  errorElements.innerHTML = error;
                  errorElements.style.display = "block";
                  progressElement.style.display = "none";
                  loadingElement.style.display ="none";
          },
      updateProgress : function(progress){
                    progressElement.style.display ="block";
                    progressElement.style.width = progress;
                    progressElement.innerText = progress;
                    loadingElement.style.display = "block";
                    registrationDiv.style.display ="none";
                    errorElements.style.display = "none";
          },
      setHeaderEmail : function(email){
                    headerUserElem.innerText = email;
          }

};
view.init();
