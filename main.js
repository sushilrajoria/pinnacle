var model = {
      getAllPassages : function(){
                  var passagesQuery = firebase.database().ref('Passages');
                  passagesQuery.on('value',function(snapshot){

                   snapshot.forEach(function(childSnapshot)
                   {
                       console.log('Passage : '+childSnapshot.val().Code);
                       presenter.appendPassage(childSnapshot.val());
                   })
                 },function(error){
                      console.log("error while fetching passages "+error);
                      presenter.fetchPassagesError(error);
                 });
            }
};
var presenter = {

    fetchPassages : function(){
                    console.log("Passages requested");
                    view.showLoading();
                    model.getAllPassages();
    },
    fetchPassagesError : function(error){
                    view.showError(error);
    },
    appendPassage : function(passage){
                    console.log("Passage is being appended : "+passage.Code);
                    view.showPassages();
                    view.appendPassage(passage);
    },
    passageClicked : function(passageString){
                    sessionStorage.currentPassage = passageString;
                    window.location = "typing.html";
    },
    logout : function(){
                    logout();
    },
    getCurrentUser : function(){
                     console.log('Current user is : '+getCurrentUser());
                     view.setHeaderEmail(getCurrentUser());
    }
};
var view = {
    init : function(){
            passagesElement = document.getElementById('passages');
            passageLoaderElem = document.getElementById('loaderPassage');
            headerUserElem = document.getElementById('user_email');
            logOutButton = document.getElementById('signout');
            logOutButton.addEventListener('click',function(){
                          presenter.logout();
            });
            presenter.getCurrentUser();
            presenter.fetchPassages();
    },
    appendPassage : function(passage){
                    console.log('Passage : '+passage.Code);
                    var div = document.createElement('div');
                    div.className = 'row passage';
                    var passageString = passage.PassageString;
                    div.onclick = view.createClickHandler(passageString);
                    var passageCode = passage.Code;
                    div.innerHTML='<div style="background-color:#00BFA5;color:white">'+passageCode+'<span style="float:right;">Start Typing</div>'+'</div>'+passageString;
                    passagesElement.append(div);
    },
    showLoading : function(){
                  passageLoaderElem.style.display = "block";
                  passagesElement.style.display = 'none';

    },
    showPassages : function(){
                  passageLoaderElem.style.display = "none";
                  passagesElement.style.display = 'block';
    },
    showError : function(error){
            console.log("Error while fetching passages "+error);
    },
    createClickHandler : function(arg)
    {
      return function()
      {
        console.log('Passage clicked'+arg);
        presenter.passageClicked(arg);
        //redirect to typing page
        //document.getElementById('a').innerHTML = arg;
        //showTest();
      } ;
    },
    setHeaderEmail : function(email){
          headerUserElem.innerText = email;
    }
};

view.init();
