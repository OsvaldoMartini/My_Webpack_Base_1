module("Search Defined", {
    beforeEach: function () {
    },
    afterEach: function () {
    }
});

test("Search Defined", function () {
    var isDefined = typeof Search !== undefined;
    ok(isDefined);
});

module("Query String to Object", {
    beforeEach: function () {
        this.search = new Search();
    },
    afterEach: function () {
    }
});


module("MapDrawing Defined", {
    beforeEach: function () {
    },
    afterEach: function () {
    }
});

test("MapDrawing Defined", function () {
    var isDefined = typeof MapDrawing !== undefined;
    ok(isDefined);
});

module("Defined Area Filtered to Object", {
    beforeEach: function () {
        this.mapDrawing = new MapDrawing();
    },
    afterEach: function () {
    }
});


module("Object to Query String", {
    beforeEach: function () {
        this._url_hash = window.location.hash;
        this.search = new Search();
    },
    afterEach: function () {
        window.location.hash = this._url_hash;
    }
});

test("Query String to Object - Basic", function () {

    var expectedResult = {
        "alphaProperty": "alphaValue"
    };

    var queryString = "alphaProperty=alphaValue";
    var actualResult = this.search.queryStringToObject(queryString);

    deepEqual(actualResult, expectedResult);
});

test("Query String to Object - Advanced", function () {

    var expectedResult = {
        "alphaProperty": "alphaValue",
        "betaProperty": "betaValue",
        "gammaProperty": "gammaValue",
        "myNumber": "42",
        "myArray": "[1,2,3,4,5]"
    };

    var queryString = "alphaProperty=alphaValue&betaProperty=betaValue&gammaProperty=gammaValue&myNumber=42&myArray=[1,2,3,4,5]";
    var actualResult = this.search.queryStringToObject(queryString);

    deepEqual(actualResult, expectedResult);
});



