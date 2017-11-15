describe("Orbitz Functional Test Suite - landing page hotel search", function () {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

    var landingPage = new LandingPage();
    var dataset = DelhiHotelInJan;

    beforeAll(function (done) {
        waitUntilDOMReady()
            .then(function () {
                done();
            });
    });

    it("Scenario 1 - Search for hotel", function (done) {
        // Assert starting state
        // landing

        fill(landingPage, dataset);
        landingPage.search.click();

        //expect(dealPopup.dealTab.DealStatus.val()).toBe('Pre-IBDC');
    });

});