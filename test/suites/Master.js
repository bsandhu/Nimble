var MasterSuite = {};

// Note: Not adding the sub-domain (intranet.barcapint.com) will trigger the auth
MasterSuite.appUrl = 'http://orbitz.com';
MasterSuite.username = '';
MasterSuite.password = '';

MasterSuite.imports = [
    'test/pages/LandingPage.js',
    'test/data/hotels.js'];

MasterSuite.run = function (done) {
    $.when()
//      TODO Runner needs a bit of work to report parallel runs properly
//        .then(
//            inParallel(
//                run('test/suites/risk/hgem/HGEMSyndicate.js')))
        .then(run('test/suites/HotelSearch.js'))
        .then(done);
}