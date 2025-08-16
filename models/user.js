// module.exports = function makeDomainModel(db) {
//     const col = db.collection('domains');
  
//     return {
//       countAll: () => col.countDocuments(),
//       listPaginated: async (page = 1, limit = 20) => {
//         const skip = (page - 1) * limit;
//         const [items, total] = await Promise.all([
//           col.find({}).sort({ domain: 1 }).skip(skip).limit(limit).toArray(),
//           col.countDocuments()
//         ]);
//         return { items, total, page, limit };
//       }
//     };
//   };

const { ObjectId } = require('mongodb');

module.exports = (db) => {
  const collection = db.collection('users');

  return {
    async create(user) {
      const result = await collection.insertOne(user);
      return result.insertedId;
    },

    async findByUsername(username) {
      return await collection.findOne({ username });
    },

    async findByEmail(email) {
      return await collection.findOne({ email });
    },

    async findById(id) {
      return await collection.findOne({ _id: new ObjectId(id) });
    },

    async all() {
      return await collection.find({}).toArray();
    }
  };
};
