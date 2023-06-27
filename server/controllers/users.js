const { admin, db } = require('../db/conn.js');
const {createUserProfile, updateUserProfile, deleteUserProfile} = require('../models/users.js');

const registerUser = (req, res) => {
    var email = req.body.email;
    var phone = req.body.phone;
    var displayName = req.body.displayName;
    var password = req.body.password;

    if(email == undefined && phone == undefined) {
        res.status(400).json({
            message: 'User email or phone number is required'
        });
    }

    if(password == undefined) {
        res.status(400).json({
            message: 'Password is undefined'
        });
    }

    plainPassword = Buffer.from(password, 'base64').toString('utf8');
    var encodedPassword = Buffer.from('username:password', 'utf8').toString('base64'); 

    getAuth()
        .createUser({
            email: email,
            emailVerified: false,
            phoneNumber: phone,
            password: password,
            displayName: displayName,
        })
        .then((userRecord) => {
            console.log('Successfully created new user:', userRecord.uid);
            createUserProfile(userRecord.uid, userRecord.displayName, userRecord.email, userRecord.phoneNumber, userRecord.disabled).then((value) => {
                if(value){
                    res.status(201).json({
                        message: `Successfully created new user: ${userRecord.uid}`
                    });
                }else{
                    res.status(201).json({
                        message: `User profile not created: ${userRecord.uid}`
                    });
                }
            })
            
        })
        .catch((error) => {
            console.log('Error creating new user:', error);
            res.status(400).json({
                message: `Error creating new user: ${error}`
            });
        });
}

const updateUser = async (req, res) => {
    var uid = req.body.uid;
    var email = req.body.email;
    var phone = req.body.phone;
    var displayName = req.body.displayName;

    var currUserRecord;
    try {
        if (uid != undefined) {
            currUserRecord = await getUserByUID(uid);
        } else if (email != undefined) {
            currUserRecord = await getUserByEmail(email);
        } else if (phone != undefined) {
            currUserRecord = await getUserByPhone(phone);
        } else {
            res.status(400).json({
                error: error,
                message: 'Error fetching user data'
            });
        }
    } catch (error) {
        res.status(400).json({
            error: error,
            message: 'Error fetching user data'
        });
    }


    getAuth()
        .updateUser(currUserRecord.uid, {
            email: email != undefined ? email : currUserRecord.email,
            phoneNumber: phone != undefined ? phone : currUserRecord.phoneNumber,
            displayName: displayName != undefined ? displayName : currUserRecord.displayName,
        })
        .then((userRecord) => {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully updated user', userRecord.toJSON());
            updateUserProfile(currUserRecord.uid, userRecord.displayName, userRecord.email, userRecord.phoneNumber);
            res.status(201).json({
                user: userRecord.toJSON(),
                message: 'Successfully update user'
            });
        })
        .catch((error) => {
            console.log('Error updating user:', error);
            res.status(400).json({
                error: error,
                message: 'Error updating user'
            });
        });
}

const deleteUser = (req, res) => {
    var uid = req.body.uid;
    if (uid == undefined) {
        return res.status(400).json({
            message: 'uid undefined'
        });
    }
    getAuth()
        .deleteUser(uid)
        .then(() => {
            console.log('Successfully deleted user');
            deleteUserProfile(uid).then((value) => {
                res.status(201).json({
                    user: userRecord.toJSON(),
                    message: 'Successfully update user'
                });
            }).catch((error) => {
                res.status(400).json({
                    error: error,
                    message: 'Error deleting user'
                });
            });
        })
        .catch((error) => {
            console.log('Error deleting user:', error);
        });
}

async function getUserByUID(uid) {
    return await getAuth().getUser(uid);
}

async function getUserByEmail(email) {
    return await getAuth().getUserByEmail(email);
}

async function getUserByPhone(phone) {
    return await getAuth().getUserByPhoneNumber(phone);
}

function getAuth() {
    return admin.auth();
}

module.exports = { registerUser, updateUser, deleteUser, getUserByUID };
