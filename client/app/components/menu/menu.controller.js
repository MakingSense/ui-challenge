class menuController {
  constructor() {
    
    this.init();
  }

  init() {
  	//
  }

  mobileMenu() {
    var x = document.getElementById("mobileMenu");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  }
}

export default menuController;
