function LandingPage() {
    this.initDOMWrappers();
}

LandingPage.prototype.initDOMWrappers = function () {
    this.destination = new Input('.ui-autocomplete-input');
    this.checkInDate = new Input('#home-hotel-chkin');
    this.checkOutDate = new Input('#home-hotel-chkout');
    this.search = new Button('.text-right .buttons-primary');
}
