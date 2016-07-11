//For the drop bar
function dropNavFunction(){
  var dropLinks = document.getElementById("dropLinks");
  var navArrow2 = document.getElementById("navArrow2");

  if(!dropLinks.classList.contains("dropLinksShow")){
    dropLinks.classList.add("dropLinksShow");
    navArrow2.classList.add("navArrow2show");
  } else {
    dropLinks.classList.remove("dropLinksShow");
    navArrow2.classList.remove("navArrow2show");
  }
}

window.onclick = function(event){
  var dropLinks = document.getElementById("dropLinks");
  var navArrow2 = document.getElementById("navArrow2");

  if(event.target.id !== "navTitle" && event.target.id !== "navArrow2" && event.target.className !== "navButton"){
    if(dropLinks.classList.contains("dropLinksShow")){
      dropLinks.classList.remove("dropLinksShow");
      navArrow2.classList.remove("navArrow2show");
    }
  }
}
