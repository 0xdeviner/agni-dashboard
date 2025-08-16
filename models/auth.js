module.exports = function makeUserModel(db) {
    const col = db.collection('users');
  
    return {
      findByUsername: async (username) => col.findOne({ username }),
      createUser: async (username, password_hash) => col.insertOne({ username, password_hash })
    };
  };