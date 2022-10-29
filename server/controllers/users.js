const {db} = require('../db/conn.js');

const setUserBio = async (req, res) => {
    const data = req.body;
    
    var member = db.collection('members').doc();
    var snapshot = await member.set(data);
    if(snapshot)
    {
        console.log(snapshot.data);
    }
    else
    {
        console.log(snapshot.result);
    }

    res.status(200).json({
        "message":"done"
    });
}

const setUserQualification = async (req, res) => {
    
}

const setUserSkills = async (req, res) => {

}

const updateUserBio = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    
    var member = db.collection('members').doc(id);
    member.update(data).then((state) => {
        console.log(state);
    }).catch((error) => {
        console.log(error);
    });

    res.status(200).json({
        "message":"done"
    });
}

const updateUserQualification = async (req, res) => {

}

const updateUserSkill = async (req, res) => {

}

module.exports = {setUserBio, setUserQualification, setUserSkills, updateUserBio, updateUserQualification, updateUserSkill}
