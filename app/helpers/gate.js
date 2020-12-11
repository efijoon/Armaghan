let ConnectRoles = require('connect-roles');
const Permission = require('app/models/permission');

let gate = new ConnectRoles({
  failureHandler: function (req, res, action) {
    // optional function to customise code that runs when
    // user fails authorisation
    var accept = req.headers.accept || '';

    const layouts = {
        layout: '403Page/master',
        extractScripts: true,
        extractStyles: true
    }
    
    res.status(403);
    if (accept.indexOf('html')) {
      res.render('403Page/403', { ...layouts });
    } else {
      res.json('Access Denied - You don\'t have permission to: ' + action);
    }
  }
});

const permissions = async () => {
    return await Permission.find({}).populate('roles').exec();
}


permissions()
    .then(permissions => {
        permissions.forEach(permission => {
            let roles = permission.roles.map(item => item._id);
            gate.use(permission.name , (req) => {
                return (req.isAuthenticated())
                        ? req.user.hasRole(roles)
                        : false;
            });
        })
    });

module.exports = gate;