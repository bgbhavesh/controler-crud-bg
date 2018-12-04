## Need to have following things in the client repo for using this package

const mongoUrl = "";

collectionsList = [];

var db = mongo(mongoUrl, collectionsList);

var bodyParser = require('body-parser');

//import package

var commonController = require('crud-controler-bg');

// get an instance of express router

const app = express();

app.use(bodyParser.json()); // handle json data

app.use(bodyParser.urlencoded({ extended: true })); // handle URL-encoded data

commonController.setDbConnection(db); // set the connection obj to package

//// common routes 

app.route('/').post(commonController.getAllItems);

app.route('/add').post(commonController.addAnItem);

app.route('/delete').post(commonController.removeAnItem);

app.route('/update').post(commonController.updateAnItem);

## It holds reqHeader as json

options:

{

    caseSensitive: false;

    data: {

    };

**   model: "";**

    redux: "";

    searchFields: [

    ];

    searchText: "";

    data: { };

    uid: null;

    match: { };

    sort: null;OR {createdBy: -1}

    limit: null;OR Numeric 

    skip: null;OR Numeric 

    project: null;OR {}

}